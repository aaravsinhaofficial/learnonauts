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
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [loss, setLoss] = useState(0);
  const [acc, setAcc] = useState(0);
  const [lr, setLr] = useState(0.3);
  const [gridOpacity, setGridOpacity] = useState(0.35);
  const [activeLabel, setActiveLabel] = useState<Label>(1); // for draw mode
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // model weights [w1, w2, b]
  const [w, setW] = useState<[number, number, number]>([Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1, 0]);

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
    setEpoch(0);
    setW([Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1, 0]);
    if (datasetKind === 'ocean') setPoints(builtin.ocean);
    else if (datasetKind === 'fruitveg') setPoints(builtin.fruitveg);
    else if (datasetKind === 'draw') setPoints([]);
    // uploaded stays as-is
  }, [datasetKind, builtin, mode]);

  // Training step (logistic regression)
  const step = useCallback((X: Point[]) => {
    if (X.length === 0) return { w, loss: 0, acc: 0 };
    const n = X.length;
    let [w1, w2, b] = w;
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
  }, [w, lr]);

  // Animation loop for real-time training
  useEffect(() => {
    if (!isTraining || mode !== 'numeric') return;
    let raf = 0;
    const loop = () => {
      // multiple epochs per frame for responsiveness
      let state = { w, loss, acc };
      const epochsPerFrame = 5;
      for (let k = 0; k < epochsPerFrame; k++) {
        state = step(points);
        setW(state.w);
        setLoss(state.loss);
        setAcc(state.acc);
        setEpoch(prev => prev + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isTraining, points, step, w, loss, acc, mode]);

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
          setDatasetKind('uploaded');
          setEpoch(0);
          setW([Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1, 0]);
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

  const readFiles = async (files: FileList | null) => {
    if (!files) return;
    const newItems: UserImage[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('image/')) continue;
      const url = URL.createObjectURL(f);
      newItems.push({ id: Math.random().toString(36).slice(2), url });
    }
    setImages(prev => [...prev, ...newItems]);
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
          const u = p.startsWith('http') ? p : (p.startsWith('/') ? base.replace(/\/$/, '') + p : base + p);
          const lower = p.toLowerCase();
          let label: Label | undefined = undefined;
          if (lower.includes('fish')) label = 1; // fish
          if (lower.includes('garbage') || lower.includes('trash') || lower.includes('waste')) label = 0; // garbage
          return { id: `sample-${now}-${i}`, url: u, label };
        });
        setImages(prev => [...prev, ...items]);
      } else {
        setImages(prev => [...prev, { id: `sample-${Date.now()}`, url: base + 'Images/ocean.webp' }]);
      }
    } catch (e) {
      setImages(prev => [...prev, { id: `sample-${Date.now()}`, url: base + 'Images/ocean.webp' }]);
    }
  };

  const extractVector = async (url: string, size = 16): Promise<Float32Array> => {
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
          const vec = new Float32Array(size * size);
          for (let i = 0, j = 0; i < data.length; i += 4, j++) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            vec[j] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          }
          resolve(vec);
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

  const classifyVector = (vec: Float32Array, labeled: { vec: Float32Array; label: Label }[], k = 3): { label: Label; confidence: number } => {
    if (labeled.length === 0) return { label: 0, confidence: 0 };
    const sorted = labeled
      .map(sample => ({ sample, dist: distance(vec, sample.vec) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, Math.min(k, labeled.length));
    const ones = sorted.filter(s => s.sample.label === 1).length;
    const conf = ones / sorted.length;
    return { label: ones >= sorted.length - ones ? 1 : 0, confidence: conf };
  };

  const labelImage = async (id: string, label: Label) => {
    setImages(prev => prev.map(item => item.id === id ? { ...item, label } : item));
    const item = images.find(i => i.id === id);
    if (item) {
      const vec = item.vector || await extractVector(item.url);
      setImages(prev => prev.map(p => p.id === id ? { ...p, vector: vec, label } : p));
    }
  };

  const classifyAll = async () => {
    const labeled: { vec: Float32Array; label: Label }[] = [];
    for (const item of images) {
      if (item.label !== undefined) {
        const vec = item.vector || await extractVector(item.url);
        labeled.push({ vec, label: item.label });
      }
    }
    const updated: typeof images = [];
    for (const item of images) {
      const vec = item.vector || await extractVector(item.url);
      if (item.label === undefined && labeled.length > 0) {
        const pred = classifyVector(vec, labeled, 3);
        updated.push({ ...item, vector: vec, predicted: pred.label, confidence: pred.confidence });
      } else {
        updated.push({ ...item, vector: vec });
      }
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
    const trainSamples = await Promise.all(train.map(async (i) => ({ vec: i.vector || await extractVector(i.url), label: i.label as Label })));
    let correct = 0;
    for (const t of test) {
      const vec = t.vector || await extractVector(t.url);
      const pred = classifyVector(vec, trainSamples, 3);
      if (pred.label === t.label) correct++;
    }
    return Math.round((correct / test.length) * 100);
  };

  const finishImages = async () => {
    const score = await estimateAccuracy();
    onComplete(score);
  };

  const labeledCount = images.filter(i => i.label !== undefined).length;

  const speak = async (text: string) => {
    if (!voiceHints) return;
    try {
      const { speechManager } = await import('../../utils/speechSynthesis');
      speechManager.speak(text);
    } catch {}
  };

  return (
    <div style={{ padding: '1rem', maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
      {oceanBg && (
        <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: `url(${base}Images/ocean.webp)`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, zIndex: 0, animation: 'float 14s ease-in-out infinite', pointerEvents: 'none', borderRadius: 12 }} />
      )}
      {/* Mode + Quick toggles */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
              <span style={{ color: '#0c4a6e' }}>{wizardStep === 1 ? 'Step 1 of 3: Pick images' : wizardStep === 2 ? 'Step 2 of 3: Label 5' : 'Step 3 of 3: Auto‑classify'}</span>
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
              <input type="file" multiple accept="image/*" onChange={(e) => readFiles(e.target.files)} aria-label="Upload images" />
              <button onClick={classifyAll} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Auto Classify Unlabeled</button>
              <button onClick={finishImages} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Finish</button>
              <button onClick={() => { loadSamples(); speak('Loaded sample ocean images.'); }} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Load Sample Images</button>
            </div>
            <div style={{ color: '#6b7280', fontSize: 14 }}>Tip: Label a few examples (“Fish” and “Garbage”) to teach the model.</div>
          </div>

          <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', alignItems: 'start' }}>
            {images.map(img => (
              <div key={img.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ position: 'relative', width: '100%', paddingBottom: '70%', overflow: 'hidden' }}>
                  <img src={img.url} alt="uploaded" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: 8, display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => labelImage(img.id, 1)} style={{ padding: '6px 8px', borderRadius: 6, border: '2px solid', borderColor: img.label === 1 ? '#10b981' : '#d1d5db', background: img.label === 1 ? '#ecfdf5' : 'white', color: '#065f46', cursor: 'pointer' }}>🐟 Fish</button>
                    <button onClick={() => labelImage(img.id, 0)} style={{ padding: '6px 8px', borderRadius: 6, border: '2px solid', borderColor: img.label === 0 ? '#ef4444' : '#d1d5db', background: img.label === 0 ? '#fee2e2' : 'white', color: '#7f1d1d', cursor: 'pointer' }}>🗑️ Garbage</button>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {img.predicted !== undefined && (
                      <span>
                        Pred: {img.predicted === 1 ? 'Fish' : 'Garbage'} ({Math.round((img.confidence || 0) * 100)}%)
                      </span>
                    )}
                    {img.label !== undefined && img.predicted !== undefined && (
                      <span style={{ marginLeft: 6, color: img.predicted === img.label ? '#059669' : '#b91c1c', fontWeight: 600 }}>
                        {img.predicted === img.label ? '✓' : '✗'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <canvas ref={hiddenCanvasRef} width={16} height={16} style={{ display: 'none' }} />
          <style>{`@keyframes float { 0%{transform:translateY(0)} 50%{transform:translateY(-6px)} 100%{transform:translateY(0)} }`}</style>
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
              <button onClick={() => { setEpoch(0); setW([Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1, 0]); }} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Reset</button>
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
