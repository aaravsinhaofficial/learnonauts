import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AccessibilitySettings } from '../AccessibilityPanel';

interface AITrainingLabProps {
  onComplete: (score: number) => void;
  accessibilitySettings?: AccessibilitySettings;
}

type Label = 0 | 1;
type Point = { x: number; y: number; label: Label };

type DatasetKind = 'ocean' | 'fruitveg' | 'uploaded' | 'draw';

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

type Mode = 'numeric' | 'images';
type UserImage = { id: string; url: string; label?: Label; vector?: Float32Array; predicted?: Label; confidence?: number };

export function AITrainingLab({ onComplete }: AITrainingLabProps) {
  const base = (import.meta as any).env?.BASE_URL || '/';
  const [mode, setMode] = useState<Mode>('images');
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [voiceHints, setVoiceHints] = useState(false);
  const [oceanBg, setOceanBg] = useState(false);
  const [datasetKind, setDatasetKind] = useState<DatasetKind>('ocean');
  const [points, setPoints] = useState<Point[]>([]);
  const [images, setImages] = useState<UserImage[]>([]);
  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const [classifying, setClassifying] = useState<Set<string>>(new Set());
  const [instructionsOk, setInstructionsOk] = useState<boolean>(() => {
    try { return !!JSON.parse(localStorage.getItem('ai_lab_instructions_ok') || 'false'); } catch { return false; }
  });
  const [uploadBlocked, setUploadBlocked] = useState(false);
  const imgInputRef = useRef<HTMLInputElement | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [loss, setLoss] = useState(0);
  const [acc, setAcc] = useState(0);
  const [lr, setLr] = useState(0.25);
  const [gridOpacity, setGridOpacity] = useState(0.35);
  const [activeLabel, setActiveLabel] = useState<Label>(1); // for draw mode
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // model weights [w1, w2, b]
  const [w, setW] = useState<[number, number, number]>([Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1, 0]);
  const weightsRef = useRef<[number, number, number]>(w);
  const lossRef = useRef(loss);
  const accRef = useRef(acc);

  const resetNumericTraining = useCallback(() => {
    setIsTraining(false);
    setEpoch(0);
    setLoss(0);
    setAcc(0);
    lossRef.current = 0;
    accRef.current = 0;
    const next: [number, number, number] = [Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1, 0];
    weightsRef.current = next;
    setW(next);
  }, [setAcc, setEpoch, setIsTraining, setLoss, setW]);

  // Canvas for visualization
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate built-in datasets
  const builtin = useMemo(() => {
    function jitter(n = 0.06) {
      return (Math.random() - 0.5) * n * 2;
    }

    const ocean: Point[] = [];
    // Fish near (0.75, 0.7)
    for (let i = 0; i < 60; i++) {
      ocean.push({ x: clamp01(0.75 + jitter()), y: clamp01(0.70 + jitter()), label: 1 }); // fish
    }
    // Garbage near (0.25, 0.3)
    for (let i = 0; i < 60; i++) {
      ocean.push({ x: clamp01(0.25 + jitter()), y: clamp01(0.30 + jitter()), label: 0 }); // garbage
    }

    const fruitveg: Point[] = [];
    // Fruit near (0.7, 0.3)
    for (let i = 0; i < 50; i++) fruitveg.push({ x: clamp01(0.7 + jitter()), y: clamp01(0.3 + jitter()), label: 1 });
    // Veg near (0.3, 0.7)
    for (let i = 0; i < 50; i++) fruitveg.push({ x: clamp01(0.3 + jitter()), y: clamp01(0.7 + jitter()), label: 0 });

    return { ocean, fruitveg };
  }, []);

  // Load dataset on change
  useEffect(() => {
    if (mode !== 'numeric') return;
    resetNumericTraining();
    if (datasetKind === 'ocean') setPoints(builtin.ocean);
    else if (datasetKind === 'fruitveg') setPoints(builtin.fruitveg);
    else if (datasetKind === 'draw') setPoints([]);
    // uploaded stays as-is
  }, [datasetKind, builtin, mode, resetNumericTraining]);

  // Training step (logistic regression)
  const step = useCallback((X: Point[], weights: [number, number, number]) => {
    if (X.length === 0) return { w: weights, loss: 0, acc: 0 };
    const n = X.length;
    let [w1, w2, b] = weights;
    let gradW1 = 0, gradW2 = 0, gradB = 0;
    let totalLoss = 0;
    let correct = 0;
    for (let i = 0; i < n; i++) {
      const { x, y, label } = X[i];
      const z = w1 * x + w2 * y + b;
      const p = sigmoid(z);
      // cross-entropy loss
      const l = -(label * Math.log(p + 1e-8) + (1 - label) * Math.log(1 - p + 1e-8));
      totalLoss += l;
      const diff = p - label; // derivative
      gradW1 += diff * x;
      gradW2 += diff * y;
      gradB += diff;
      // accuracy
      const pred = p >= 0.5 ? 1 : 0;
      if (pred === label) correct++;
    }
    gradW1 /= n; gradW2 /= n; gradB /= n;
    const newW: [number, number, number] = [w1 - lr * gradW1, w2 - lr * gradW2, b - lr * gradB];
    const avgLoss = totalLoss / n;
    const accuracy = correct / n;
    return { w: newW, loss: avgLoss, acc: accuracy };
  }, [lr]);

  // Animation loop for real-time training
  useEffect(() => {
    weightsRef.current = w;
    lossRef.current = loss;
    accRef.current = acc;
  }, [w, loss, acc]);

  useEffect(() => {
    if (!isTraining || mode !== 'numeric') return;
    let raf = 0;
    const loop = () => {
      const perFrame = points.length === 0 ? 0 : Math.min(12, Math.max(3, Math.ceil(points.length / 12)));
      if (perFrame === 0) {
        raf = requestAnimationFrame(loop);
        return;
      }
      // multiple epochs per frame for responsiveness
      let state = {
        w: weightsRef.current,
        loss: lossRef.current,
        acc: accRef.current
      };
      let epochsRan = 0;
      for (let k = 0; k < perFrame; k++) {
        state = step(points, state.w);
        epochsRan++;
      }
      weightsRef.current = state.w;
      lossRef.current = state.loss;
      accRef.current = state.acc;
      setW(state.w);
      setLoss(state.loss);
      setAcc(state.acc);
      setEpoch(prev => prev + epochsRan);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isTraining, mode, points, step]);

  // Draw visualization
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width, height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    if (mode === 'numeric') {
      // Background probability grid
      const grid = 30;
      for (let gx = 0; gx <= grid; gx++) {
        for (let gy = 0; gy <= grid; gy++) {
          const px = gx / grid;
          const py = gy / grid;
          const p = sigmoid(w[0] * px + w[1] * py + w[2]);
          const col = Math.floor(255 * p);
          ctx.fillStyle = `rgba(${col}, ${255 - col}, 160, ${gridOpacity})`;
          ctx.fillRect(px * width, height - py * height, width / grid + 1, height / grid + 1);
        }
      }

      // Points
      for (const pt of points) {
        const cx = pt.x * width;
        const cy = height - pt.y * height;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = pt.label === 1 ? '#10b981' : '#ef4444';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'white';
        ctx.stroke();
      }

      // Decision boundary (w1*x + w2*y + b = 0)
      if (Math.abs(w[1]) > 1e-6) {
        const yAt0 = -w[2] / w[1];
        const yAt1 = -(w[0] * 1 + w[2]) / w[1];
        ctx.beginPath();
        ctx.moveTo(0, height - clamp01(yAt0) * height);
        ctx.lineTo(width, height - clamp01(yAt1) * height);
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }, [points, w, gridOpacity, mode]);

  useEffect(() => { draw(); }, [draw, points, w, gridOpacity]);

  // Upload CSV (x1,x2,label) with header
  const normalizePoints = (arr: Point[]): Point[] => {
    if (arr.length === 0) return arr;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    arr.forEach(p => { if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y; });
    const dx = Math.max(1e-6, maxX - minX);
    const dy = Math.max(1e-6, maxY - minY);
    return arr.map(p => ({ x: (p.x - minX) / dx, y: (p.y - minY) / dy, label: p.label }));
  };

  const onUploadCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const lines = text.split(/\r?\n/).filter(Boolean);
        if (lines.length < 2) return;
        // assume header
        const out: Point[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          if (cols.length < 3) continue;
          const x = clamp01(parseFloat(cols[0]));
          const y = clamp01(parseFloat(cols[1]));
          const raw = cols[2].trim().toLowerCase();
          const label: Label = (raw === '1' || raw === 'true' || raw === 'fish' || raw === 'fruit') ? 1 : 0;
          if (Number.isFinite(x) && Number.isFinite(y)) out.push({ x, y, label });
        }
        if (out.length > 0) {
          const norm = normalizePoints(out);
          setPoints(norm);
          if (datasetKind !== 'uploaded') setDatasetKind('uploaded');
          else resetNumericTraining();
        }
      } catch (e) {
        console.warn('Failed to parse CSV', e);
      }
    };
    reader.readAsText(file);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'numeric' || datasetKind !== 'draw') return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = clamp01((e.clientX - rect.left) / rect.width);
    const y = clamp01(1 - (e.clientY - rect.top) / rect.height);
    setPoints(prev => [...prev, { x, y, label: activeLabel }]);
  };

  const accuracyPct = Math.round(acc * 100);

  // ===== Image mode helpers =====
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (instructionsOk) setUploadBlocked(false);
  }, [instructionsOk]);

  const readFiles = async (files: FileList | null) => {
    if (!instructionsOk) {
      setUploadBlocked(true);
      return;
    }
    if (!files) return;
    const newItems: UserImage[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('image/')) continue;
      const url = URL.createObjectURL(f);
      newItems.push({ id: Math.random().toString(36).slice(2), url });
    }
    if (newItems.length) {
      setImages(prev => [...prev, ...newItems]);
      setUploadBlocked(false);
    }
    if (imgInputRef.current) {
      imgInputRef.current.value = '';
    }
  };

  const versionedUrl = (raw: string, version: number) => {
    return raw.includes('?') ? `${raw}&v=${version}` : `${raw}?v=${version}`;
  };

  const loadSamples = async () => {
    try {
      const loadFrom = async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error('not found');
        return res.json();
      };
      let list: string[] | null = null;
      try { list = await loadFrom(base + 'samples/ocean/manifest.json'); } catch {}
      if (!list) { try { list = await loadFrom(base + 'samples/manifest.json'); } catch {} }
      if (list && Array.isArray(list) && list.length > 0) {
        const now = Date.now();
        const items: UserImage[] = list.map((p, i) => {
          const raw = p.startsWith('http') ? p : (p.startsWith('/') ? base.replace(/\/$/, '') + p : base + p);
          const url = versionedUrl(raw, now);
          return { id: `sample-${now}-${i}`, url };
        });
        setImages(prev => {
          const userGenerated = prev.filter(i => !i.id.startsWith('sample-'));
          return [...userGenerated, ...items];
        });
      } else {
        const fallbackBase = base + 'Images/ocean.webp';
        const fallbackUrl = versionedUrl(fallbackBase, Date.now());
        setImages(prev => {
          const userGenerated = prev.filter(i => !i.id.startsWith('sample-'));
          return [...userGenerated, { id: `sample-${Date.now()}`, url: fallbackUrl }];
        });
      }
    } catch (e) {
      const fallbackBase = base + 'Images/ocean.webp';
      const fallbackUrl = versionedUrl(fallbackBase, Date.now());
      setImages(prev => {
        const userGenerated = prev.filter(i => !i.id.startsWith('sample-'));
        return [...userGenerated, { id: `sample-${Date.now()}`, url: fallbackUrl }];
      });
    }
    setSamplesLoaded(true);
  };

  // Preload samples on first mount for Images mode
  useEffect(() => {
    if (mode === 'images' && !samplesLoaded) {
      loadSamples();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, samplesLoaded]);

  const computeVector = async (url: string, size = 32): Promise<Float32Array> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = hiddenCanvasRef.current || document.createElement('canvas');
          hiddenCanvasRef.current = canvas;
          canvas.width = size; canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('no ctx');
          ctx.clearRect(0, 0, size, size);
          ctx.drawImage(img, 0, 0, size, size);
          const data = ctx.getImageData(0, 0, size, size).data;
          const len = size * size;
          const gray = new Float32Array(len);
          const reds = new Float32Array(len);
          const greens = new Float32Array(len);
          const blues = new Float32Array(len);
          const histBins = 6;
          const histR = new Float32Array(histBins);
          const histG = new Float32Array(histBins);
          const histB = new Float32Array(histBins);
          let satSum = 0;
          let valSum = 0;
          for (let i = 0, j = 0; i < data.length; i += 4, j++) {
            const r = data[i] / 255;
            const g = data[i + 1] / 255;
            const b = data[i + 2] / 255;
            reds[j] = r;
            greens[j] = g;
            blues[j] = b;
            gray[j] = 0.299 * r + 0.587 * g + 0.114 * b;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const sat = max === 0 ? 0 : (max - min) / max;
            satSum += sat;
            valSum += max;
            const binR = Math.min(histBins - 1, Math.floor(r * histBins));
            const binG = Math.min(histBins - 1, Math.floor(g * histBins));
            const binB = Math.min(histBins - 1, Math.floor(b * histBins));
            histR[binR] += 1;
            histG[binG] += 1;
            histB[binB] += 1;
          }
          // simple gradient magnitude
          const grad = new Float32Array(len);
          for (let y = 1; y < size - 1; y++) {
            for (let x = 1; x < size - 1; x++) {
              const idx = y * size + x;
              const gx = gray[y * size + (x + 1)] - gray[y * size + (x - 1)];
              const gy = gray[(y + 1) * size + x] - gray[(y - 1) * size + x];
              grad[idx] = Math.min(1, Math.hypot(gx, gy));
            }
          }
          const mean = (arr: Float32Array) => {
            let sum = 0;
            for (let i = 0; i < arr.length; i++) sum += arr[i];
            return sum / arr.length;
          };
          const std = (arr: Float32Array, m: number) => {
            let sum = 0;
            for (let i = 0; i < arr.length; i++) {
              const d = arr[i] - m;
              sum += d * d;
            }
            return Math.sqrt(sum / arr.length);
          };
          const meanR = mean(reds);
          const meanG = mean(greens);
          const meanB = mean(blues);
          const stdR = std(reds, meanR);
          const stdG = std(greens, meanG);
          const stdB = std(blues, meanB);
          const featureLength = len * 2 + 3 * 2 + histBins * 3 + 2 + 1;
          const feat = new Float32Array(featureLength);
          let offset = 0;
          feat.set(gray, offset); offset += len;
          feat.set(grad, offset); offset += len;
          feat[offset++] = meanR;
          feat[offset++] = meanG;
          feat[offset++] = meanB;
          feat[offset++] = stdR;
          feat[offset++] = stdG;
          feat[offset++] = stdB;
          for (let i = 0; i < histBins; i++) histR[i] = histR[i] / len;
          for (let i = 0; i < histBins; i++) histG[i] = histG[i] / len;
          for (let i = 0; i < histBins; i++) histB[i] = histB[i] / len;
          feat.set(histR, offset); offset += histBins;
          feat.set(histG, offset); offset += histBins;
          feat.set(histB, offset); offset += histBins;
          feat[offset++] = satSum / len;
          feat[offset++] = valSum / len;
          feat[offset++] = meanB - (meanR + meanG) / 2;
          let norm = 0;
          for (let i = 0; i < feat.length; i++) norm += feat[i] * feat[i];
          norm = Math.sqrt(norm) || 1;
          for (let i = 0; i < feat.length; i++) feat[i] /= norm;
          resolve(feat);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const distance = (a: Float32Array, b: Float32Array) => {
    let s = 0;
    for (let i = 0; i < a.length; i++) {
      const d = a[i] - b[i];
      s += d * d;
    }
    return Math.sqrt(s);
  };

  const classifyVector = (vec: Float32Array, labeled: { vec: Float32Array; label: Label }[]): { label: Label; confidence: number } => {
    if (labeled.length === 0) return { label: 0, confidence: 0 };
    const k = Math.max(3, Math.min(7, (Math.floor(Math.sqrt(labeled.length)) | 1))); // odd between 3..7
    const eps = 1e-6;
    const sorted = labeled
      .map(sample => ({ sample, dist: distance(vec, sample.vec) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, Math.min(k, labeled.length));
    let w1 = 0, w0 = 0;
    for (const { sample, dist } of sorted) {
      const w = 1 / (eps + dist);
      if (sample.label === 1) w1 += w; else w0 += w;
    }
    const label = w1 >= w0 ? 1 : 0;
    const confidence = (label === 1 ? w1 : w0) / (w1 + w0);
    return { label, confidence };
  };

  const labelImage = async (id: string, label: Label) => {
    setImages(prev => prev.map(item => item.id === id ? { ...item, label } : item));
    const item = images.find(i => i.id === id);
    if (item) {
      const vec = item.vector || await computeVector(item.url);
      setImages(prev => prev.map(p => p.id === id ? { ...p, vector: vec, label } : p));
    }
  };

  const classifyAll = async () => {
    const labeled: { vec: Float32Array; label: Label }[] = [];
    for (const item of images) {
      if (item.label !== undefined) {
        const vec = item.vector || await computeVector(item.url);
        labeled.push({ vec, label: item.label });
      }
    }
    if (labeled.length === 0) return; // need examples first
    const newSet = new Set<string>();
    setClassifying(newSet);
    const updated: UserImage[] = [];
    for (const item of images) {
      const id = item.id;
      // set classifying visual
      newSet.add(id);
      setClassifying(new Set(newSet));
      const vec = item.vector || await computeVector(item.url);
      let out: UserImage = { ...item, vector: vec };
      if (item.label === undefined) {
        const pred = classifyVector(vec, labeled);
        out = { ...out, predicted: pred.label, confidence: pred.confidence };
      }
      updated.push(out);
      // small delay for animation pacing
      await new Promise(r => setTimeout(r, 180));
      newSet.delete(id);
      setClassifying(new Set(newSet));
    }
    setImages(updated);
  };

  const estimateAccuracy = async () => {
    const labeledImgs = images.filter(i => i.label !== undefined);
    if (labeledImgs.length < 4) return 0;
    const shuffled = [...labeledImgs].sort(() => Math.random() - 0.5);
    const split = Math.max(1, Math.floor(shuffled.length * 0.8));
    const train = shuffled.slice(0, split);
    const test = shuffled.slice(split);
    const trainSamples = await Promise.all(train.map(async (i) => ({ vec: i.vector || await computeVector(i.url), label: i.label as Label })));
    let correct = 0;
    for (const t of test) {
      const vec = t.vector || await computeVector(t.url);
      const pred = classifyVector(vec, trainSamples);
      if (pred.label === t.label) correct++;
    }
    return Math.round((correct / test.length) * 100);
  };

  const finishImages = async () => {
    const score = await estimateAccuracy();
    // Save a small showcase of high-confidence predictions to localStorage
    try {
      const best = images
        .filter(i => i.predicted !== undefined && typeof i.confidence === 'number')
        .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
        .slice(0, 6)
        .map(i => ({ url: i.url, predicted: i.predicted, confidence: i.confidence }));
      localStorage.setItem('ai_showcase', JSON.stringify({ ts: Date.now(), items: best }));
    } catch {}
    onComplete(score);
  };

  const labeledCount = images.filter(i => i.label !== undefined).length;

  const speak = useCallback(async (text: string) => {
    if (!voiceHints) return;
    try {
      const { speechManager } = await import('../../utils/speechSynthesis');
      speechManager.speak(text);
    } catch {}
  }, [voiceHints]);

  const handleInstructionsAck = useCallback(() => {
    setInstructionsOk(true);
    setUploadBlocked(false);
    try {
      localStorage.setItem('ai_lab_instructions_ok', 'true');
    } catch {}
    speak('Great! Upload your images to begin teaching the AI.');
  }, [speak]);

  function Showcase({ base }: { base: string }) {
    try {
      const data = JSON.parse(localStorage.getItem('ai_showcase') || 'null');
      const items: { url: string; predicted: Label; confidence: number }[] = data?.items || [];
      if (!items.length) return null as any;
      return (
        <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, marginBottom: 10 }}>
          <div style={{ fontWeight: 700, color: '#111827', marginBottom: 8 }}>Previous Results</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {items.map((it, idx) => (
              <div key={idx} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ position: 'relative', width: '100%', paddingBottom: '62%' }}>
                  <img src={it.url} alt="result" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: 6, fontSize: 12, color: '#374151' }}>
                  Pred: {it.predicted === 1 ? 'Fish' : 'Garbage'} ({Math.round((it.confidence || 0) * 100)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } catch { return null as any; }
  }

  return (
    <div style={{ padding: '1rem', maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
      {oceanBg && (
        <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: `url(${base}Images/ocean.webp)`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, zIndex: 0, animation: 'float 14s ease-in-out infinite', pointerEvents: 'none', borderRadius: 12 }} />
      )}
      <header style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.75rem 1rem', marginBottom: '0.75rem', background: 'linear-gradient(135deg, rgba(20,184,166,0.12), rgba(99,102,241,0.12))', borderRadius: 16, border: '1px solid rgba(14,165,233,0.12)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', lineHeight: 1.2, color: '#0f172a', fontWeight: 700 }}>AI Training Lab</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#334155', maxWidth: 540 }}>
            Switch between image and numeric datasets, teach the AI with your own examples, and watch learning happen in real time.
          </p>
        </div>
        <div style={{ padding: '0.35rem 0.75rem', background: '#0ea5e9', color: 'white', borderRadius: 9999, fontSize: 14, fontWeight: 600 }}>
          Mode: {mode === 'images' ? 'Image Classifier' : 'Numeric Sandbox'}
        </div>
      </header>

      <section style={{ position: 'relative', zIndex: 1, background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: '0.9rem 1rem', marginBottom: '0.75rem', boxShadow: '0 8px 16px -12px rgba(15,23,42,0.32)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Before you start</div>
            <p style={{ margin: 0, color: '#475569', maxWidth: 620 }}>
              Upload only classroom-friendly images. We store nothing on our servers—everything stays in your browser. Confirm to unlock uploads and remember this choice on this device.
            </p>
          </div>
          {instructionsOk ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ecfdf5', border: '1px solid #bbf7d0', padding: '0.5rem 0.75rem', borderRadius: 12, color: '#047857', fontWeight: 600 }}>
              <span>✅ Ready for uploads</span>
            </div>
          ) : (
            <button onClick={handleInstructionsAck} style={{ border: 'none', background: '#22c55e', color: 'white', padding: '0.6rem 1rem', borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}>
              I understand, unlock uploads
            </button>
          )}
        </div>
      </section>

      {/* Showcase (previous results) */}
      <Showcase base={base} />

      {/* Instruction banner */}
      <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 12, padding: 12, marginBottom: 10 }}>
        <div style={{ color: '#1e3a8a', fontWeight: 700, marginBottom: 6 }}>How this works</div>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#1e3a8a' }}>
          <li>Step 1: Pick images (preloaded samples appear automatically, you can add your own)</li>
          <li>Step 2: Tap Fish or Garbage on a few images to teach the AI</li>
          <li>Step 3: Press Auto‑classify to let the AI label the rest</li>
        </ul>
      </div>

      {/* Mode + Quick toggles */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center', flexWrap: 'wrap', background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.75rem 1rem', boxShadow: '0 6px 14px -10px rgba(15,23,42,0.25)' }}>
        <button onClick={() => setMode('numeric')} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: mode === 'numeric' ? '2px solid #6366f1' : '1px solid #d1d5db', background: mode === 'numeric' ? '#eef2ff' : 'white', cursor: 'pointer' }}>Numbers</button>
        <button onClick={() => setMode('images')} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: mode === 'images' ? '2px solid #14b8a6' : '1px solid #d1d5db', background: mode === 'images' ? '#ecfeff' : 'white', cursor: 'pointer' }}>Images</button>
        <button onClick={() => setOceanBg(v => !v)} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', background: oceanBg ? '#14b8a6' : 'white', color: oceanBg ? 'white' : '#111827', cursor: 'pointer' }}>🌊 Ocean Background</button>
        <button onClick={() => setVoiceHints(v => !v)} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', background: voiceHints ? '#6366f1' : 'white', color: voiceHints ? 'white' : '#111827', cursor: 'pointer' }}>🔊 Voice Hints</button>
      </div>

      {mode === 'images' ? (
        <>
          {/* Wizard */}
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: 12, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, color: '#075985' }}>Wizard:</span>
              <span style={{ color: '#0c4a6e' }} aria-live="polite">{wizardStep === 1 ? 'Step 1 of 3: Pick images' : wizardStep === 2 ? 'Step 2 of 3: Label 5' : 'Step 3 of 3: Auto‑classify'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {wizardStep === 1 && (
                <button onClick={() => { setWizardStep(2); speak('Great! Now tap Fish or Garbage on five pictures.'); }} disabled={images.length < 5} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #0ea5e9', background: images.length < 5 ? '#e5e7eb' : '#0ea5e9', color: 'white', cursor: images.length < 5 ? 'not-allowed' : 'pointer' }}>Next</button>
              )}
              {wizardStep === 2 && (
                <button onClick={() => { setWizardStep(3); speak('Awesome! Press Auto Classify to let AI help.'); }} disabled={labeledCount < 5} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #0ea5e9', background: labeledCount < 5 ? '#e5e7eb' : '#0ea5e9', color: 'white', cursor: labeledCount < 5 ? 'not-allowed' : 'pointer' }}>Next</button>
              )}
              {wizardStep === 3 && (
                <button onClick={() => { classifyAll(); speak('Classifying all images now.'); }} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: 'white', cursor: 'pointer' }}>Auto‑classify</button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  if (!instructionsOk) {
                    setUploadBlocked(true);
                    return;
                  }
                  imgInputRef.current?.click();
                }}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: 10,
                  border: '1px solid #0ea5e9',
                  background: instructionsOk ? '#0ea5e9' : '#e2e8f0',
                  color: instructionsOk ? 'white' : '#475569',
                  cursor: instructionsOk ? 'pointer' : 'not-allowed',
                  fontWeight: 600
                }}
                title={instructionsOk ? 'Upload your own training images' : 'Confirm the safety notice first'}
              >
                {instructionsOk ? 'Upload images…' : 'Unlock uploads to add files'}
              </button>
              <input
                ref={imgInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => readFiles(e.target.files)}
                aria-label="Upload images"
                style={{ display: 'none' }}
              />
              <button onClick={classifyAll} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: labeledCount === 0 ? 'not-allowed' : 'pointer', opacity: labeledCount === 0 ? 0.6 : 1 }} title={labeledCount === 0 ? 'Label a few images first' : 'Classify all unlabeled images'}>Auto Classify Unlabeled</button>
              <button onClick={finishImages} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Finish</button>
              <button onClick={() => { setImages(prev => prev.map(i => ({ ...i, predicted: undefined, confidence: undefined }))); setClassifying(new Set()); }} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>Clear Predictions</button>
              <button onClick={() => { loadSamples(); speak('Sample images refreshed'); }} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Reload Samples</button>
            </div>
            <div style={{ color: '#6b7280', fontSize: 14 }}>
              Labeled: <strong>{labeledCount}</strong> • Unlabeled: <strong>{images.length - labeledCount}</strong> • Predicted: <strong>{images.filter(i => i.predicted !== undefined).length}</strong>
            </div>
          </div>
          {uploadBlocked && (
            <div style={{ marginTop: -8, marginBottom: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.5rem 0.75rem', borderRadius: 10, fontSize: 13 }}>
              Please confirm the safety notice above before uploading your own files.
            </div>
          )}

          {images.filter(i => i.predicted !== undefined).length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <div style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#065f46', padding: '6px 10px', borderRadius: 9999 }}>Correct {images.filter(i => i.label !== undefined && i.predicted === i.label).length}</div>
              <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#7f1d1d', padding: '6px 10px', borderRadius: 9999 }}>Incorrect {images.filter(i => i.label !== undefined && i.predicted !== undefined && i.predicted !== i.label).length}</div>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a', padding: '6px 10px', borderRadius: 9999 }}>Predicted {images.filter(i => i.predicted !== undefined).length}</div>
            </div>
          )}

          <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', alignItems: 'start' }}>
            {images.map(img => (
              <div key={img.id} style={{ background: 'white', border: `2px solid ${img.predicted !== undefined && img.label !== undefined ? (img.predicted === img.label ? '#10b981' : '#ef4444') : '#e5e7eb'}`, borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ position: 'relative', width: '100%', paddingBottom: '70%', overflow: 'hidden' }}>
                  <img src={img.url} alt="uploaded" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  {classifying.has(img.id) && (
                    <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(59,130,246,0.12)' }}>
                      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 8, height: 6, background: '#e5e7eb' }}>
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #60a5fa, #3b82f6)', animation: 'sweep 0.9s linear infinite' }} />
                      </div>
                    </div>
                  )}
                  {img.predicted !== undefined && (
                    <div style={{ position: 'absolute', top: 6, left: 6, background: img.predicted === 1 ? '#10b981' : '#ef4444', color: 'white', fontWeight: 700, fontSize: 12, padding: '2px 6px', borderRadius: 6 }}>
                      {img.predicted === 1 ? 'Fish' : 'Garbage'} {typeof img.confidence === 'number' ? `· ${Math.round((img.confidence || 0) * 100)}%` : ''}
                    </div>
                  )}
                </div>
                <div style={{ padding: 8, display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => labelImage(img.id, 1)} style={{ padding: '6px 8px', borderRadius: 6, border: '2px solid', borderColor: img.label === 1 ? '#10b981' : '#d1d5db', background: img.label === 1 ? '#ecfdf5' : 'white', color: '#065f46', cursor: 'pointer' }}>🐟 Fish</button>
                    <button onClick={() => labelImage(img.id, 0)} style={{ padding: '6px 8px', borderRadius: 6, border: '2px solid', borderColor: img.label === 0 ? '#ef4444' : '#d1d5db', background: img.label === 0 ? '#fee2e2' : 'white', color: '#7f1d1d', cursor: 'pointer' }}>🗑️ Garbage</button>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', minHeight: 16 }}>
                    {img.label !== undefined && img.predicted !== undefined && (
                      <span style={{ color: img.predicted === img.label ? '#059669' : '#b91c1c', fontWeight: 600 }}>
                        {img.predicted === img.label ? 'Match ✓' : 'Needs review ✗'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <canvas ref={hiddenCanvasRef} width={32} height={32} style={{ display: 'none' }} />
          <style>{`
            @keyframes float { 0%{transform:translateY(0)} 50%{transform:translateY(-6px)} 100%{transform:translateY(0)} }
            @keyframes sweep { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
          `}</style>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select value={datasetKind} onChange={(e) => setDatasetKind(e.target.value as DatasetKind)} style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid #d1d5db' }} aria-label="Dataset">
                <option value="ocean">Built-in: Ocean Cleanup (Garbage vs Fish)</option>
                <option value="fruitveg">Built-in: Fruit vs Veg</option>
                <option value="uploaded">Upload CSV (x1,x2,label)</option>
                <option value="draw">Draw Your Own</option>
              </select>
              {datasetKind === 'uploaded' && (
                <>
                  <button onClick={() => fileInputRef.current?.click()} style={{ padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, background: 'white', cursor: 'pointer' }}>Choose CSV…</button>
                  <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadCSV(f); }} />
                </>
              )}
              {datasetKind === 'draw' && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: '#4b5563' }}>Add label:</span>
                  <button onClick={() => setActiveLabel(1)} style={{ padding: '0.25rem 0.5rem', borderRadius: 6, border: '2px solid', borderColor: activeLabel === 1 ? '#10b981' : '#d1d5db', background: activeLabel === 1 ? '#ecfdf5' : 'white', color: '#065f46', cursor: 'pointer' }}>🐟 Fish</button>
                  <button onClick={() => setActiveLabel(0)} style={{ padding: '0.25rem 0.5rem', borderRadius: 6, border: '2px solid', borderColor: activeLabel === 0 ? '#ef4444' : '#d1d5db', background: activeLabel === 0 ? '#fee2e2' : 'white', color: '#7f1d1d', cursor: 'pointer' }}>🗑️ Garbage</button>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <label style={{ color: '#374151', fontSize: 14 }}>LR</label>
              <input type="range" min={0.05} max={1} step={0.05} value={lr} onChange={(e) => setLr(parseFloat(e.target.value))} aria-label="Learning rate" />
              <label style={{ color: '#374151', fontSize: 14 }}>Background</label>
              <input type="range" min={0} max={0.6} step={0.05} value={gridOpacity} onChange={(e) => setGridOpacity(parseFloat(e.target.value))} aria-label="Background opacity" />
              <button onClick={() => setIsTraining(t => !t)} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: 'none', background: isTraining ? '#ef4444' : '#22c55e', color: 'white', cursor: 'pointer' }}>{isTraining ? 'Pause' : 'Train'}</button>
              <button onClick={resetNumericTraining} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Reset</button>
              <button onClick={() => onComplete(accuracyPct)} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Finish</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem', alignItems: 'start' }}>
            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: 12 }}>
              <canvas ref={canvasRef} width={700} height={500} onClick={handleCanvasClick} style={{ width: '100%', height: 'auto', borderRadius: 8, border: '1px solid #e5e7eb', background: '#ffffff' }} />
              <div style={{ color: '#6b7280', fontSize: 13, marginTop: 6 }}>{datasetKind === 'draw' ? 'Click on the canvas to add points for the selected label.' : 'Watch the decision boundary learn in real time.'}</div>
            </div>
            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: 16 }}>
              <h3 style={{ fontWeight: 700, color: '#111827', marginTop: 0, marginBottom: 8 }}>Training Metrics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Metric label="Epochs" value={epoch} />
                <Metric label="Accuracy" value={`${accuracyPct}%`} />
                <Metric label="Loss" value={loss.toFixed(3)} />
                <Metric label="Points" value={points.length} />
              </div>
              <div style={{ marginTop: 12, color: '#374151', fontSize: 14 }}>
                Tips:
                <ul style={{ marginTop: 6, paddingLeft: 16 }}>
                  <li>Use Draw mode to create your own dataset</li>
                  <li>Upload CSV with columns: x1,x2,label (0/1 or words like fish/garbage)</li>
                  <li>Adjust LR if training is too slow or unstable</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, textAlign: 'center' }}>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
      <div style={{ fontWeight: 700, color: '#111827' }}>{value}</div>
    </div>
  );
}

export default AITrainingLab;
