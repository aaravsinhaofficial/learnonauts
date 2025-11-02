import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, X, Check, AlertCircle, Camera, Sparkles, Trash2, Download } from 'lucide-react';
import type { AccessibilitySettings } from '../AccessibilityPanel';

interface ImageClassifierProps {
  onComplete: (score: number) => void;
  accessibilitySettings?: AccessibilitySettings;
}

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  prediction?: {
    label: string;
    confidence: number;
    description: string;
  };
  status: 'uploading' | 'ready' | 'analyzing' | 'complete';
}

export function ImageClassifier({ onComplete, accessibilitySettings }: ImageClassifierProps) {
  const base = (import.meta as any).env?.BASE_URL || '/';
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [totalAnalyzed, setTotalAnalyzed] = useState(0);
  const [useRealModel, setUseRealModel] = useState(true);
  const [modelReady, setModelReady] = useState(false);
  const modelRef = useRef<any>(null);
  const [oceanBg, setOceanBg] = useState(false);

  const ensureModel = useCallback(async () => {
    if (modelRef.current) return true;
    try {
      const [{ default: mobilenet }, tf] = await Promise.all([
        import('@tensorflow-models/mobilenet'),
        import('@tensorflow/tfjs')
      ]);
      modelRef.current = await mobilenet.load({ version: 2, alpha: 0.5 });
      setModelReady(true);
      return true;
    } catch (e) {
      console.warn('Failed to load MobileNet. Falling back to simulated.', e);
      setUseRealModel(false);
      return false;
    }
  }, []);

  const classifyImage = async (imageId: string): Promise<void> => {
    const img = images.find(i => i.id === imageId);
    if (!img) return;
    if (useRealModel) {
      const ok = await ensureModel();
      if (!ok) {
        // fallthrough to simulated
      }
    }
    try {
      if (useRealModel && modelRef.current) {
        const el = new Image();
        el.crossOrigin = 'anonymous';
        el.src = img.preview;
        await new Promise((res, rej) => { el.onload = () => res(true); el.onerror = rej; });
        const results = await modelRef.current.classify(el, 3);
        const best = results?.[0];
        const label = best?.className || 'Object';
        const confidence = Math.max(0.01, Math.min(0.99, best?.probability ?? 0.8));
        const description = `AI thinks this is: ${label}.`;
        setImages(prev => prev.map(im => im.id === imageId ? ({ ...im, prediction: { label, confidence, description }, status: 'complete' as const }) : im));
      } else {
        await new Promise(r => setTimeout(r, 1000));
        const categories = [
          { label: 'Fish', confidence: 0.93, description: 'Looks like a fish!' },
          { label: 'Garbage', confidence: 0.88, description: 'Might be trash.' },
          { label: 'Object', confidence: 0.83, description: 'An everyday object.' }
        ];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        setImages(prev => prev.map(im => im.id === imageId ? ({ ...im, prediction: randomCategory, status: 'complete' as const }) : im));
      }
      setTotalAnalyzed(prev => prev + 1);
    } catch (e) {
      console.warn('Classification failed', e);
      setImages(prev => prev.map(im => im.id === imageId ? ({ ...im, prediction: { label: 'Unknown', confidence: 0.5, description: 'Could not classify' }, status: 'complete' as const }) : im));
      setTotalAnalyzed(prev => prev + 1);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (fileList: FileList) => {
    const files = Array.from(fileList);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      alert('Please upload image files only (JPG, PNG, GIF, etc.)');
      return;
    }
    
    validFiles.forEach(file => {
      const id = `img-${Date.now()}-${Math.random()}`;
      const preview = URL.createObjectURL(file);
      
      const newImage: UploadedImage = {
        id,
        file,
        preview,
        status: 'uploading'
      };
      
      setImages(prev => [...prev, newImage]);
      
      // Simulate upload completion
      setTimeout(() => {
        setImages(prev => prev.map(img => 
          img.id === id ? { ...img, status: 'ready' as const } : img
        ));
      }, 500);
    });
  };

  const handleAnalyze = async (imageId: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, status: 'analyzing' as const } : img
    ));
    await classifyImage(imageId);
  };

  const handleAnalyzeAll = async () => {
    const readyImages = images.filter(img => img.status === 'ready');
    for (const img of readyImages) {
      await handleAnalyze(img.id);
    }
  };

  const handleRemove = (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (image) {
      try {
        if (image.preview.startsWith('blob:')) {
          URL.revokeObjectURL(image.preview);
        }
      } catch {}
    }
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleLoadSamples = async () => {
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
        const newImages: UploadedImage[] = list.map((path, idx) => {
          const u = path.startsWith('http') ? path : (path.startsWith('/') ? base.replace(/\/$/, '') + path : base + path);
          return { id: `sample-${now}-${idx}`, file: new File([], u), preview: u, status: 'ready' };
        });
        setImages(prev => [...prev, ...newImages]);
      } else {
        const path = base + 'Images/ocean.webp';
        setImages(prev => [...prev, { id: `sample-${Date.now()}`, file: new File([], path), preview: path, status: 'ready' }]);
      }
    } catch (e) {
      const path = base + 'Images/ocean.webp';
      setImages(prev => [...prev, { id: `sample-${Date.now()}`, file: new File([], path), preview: path, status: 'ready' }]);
    }
  };

  const handleClear = () => {
    images.forEach(img => { try { if (img.preview.startsWith('blob:')) URL.revokeObjectURL(img.preview); } catch {} });
    setImages([]);
    setTotalAnalyzed(0);
  };

  const handleExport = () => {
    const results = images
      .filter(img => img.prediction)
      .map(img => ({
        filename: img.file.name,
        prediction: img.prediction?.label,
        confidence: img.prediction?.confidence,
        description: img.prediction?.description
      }));
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `image-analysis-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        
        {/* Guide Section */}
        {showGuide && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
              border: '3px solid #f59e0b'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '3rem' }}>📸</div>
                  <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                      AI Image Classifier
                    </h2>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
                      Upload photos and watch AI identify what's in them!
                    </p>
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: '#fffbeb',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  border: '2px solid #fde68a',
                  marginTop: '1rem'
                }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b' }} />
                    How to use this tool:
                  </h3>
                  <ol style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.8', paddingLeft: '1.5rem', margin: 0 }}>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <strong>Upload photos:</strong> Click the upload area below or drag & drop your images
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <strong>Analyze:</strong> Click "Analyze This" on each photo to see what AI thinks it is
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <strong>Review results:</strong> See the AI's prediction with confidence percentage
                    </li>
                    <li>
                      <strong>Export (optional):</strong> Download your results as a file to keep
                    </li>
                  </ol>
                </div>
              </div>
              
              <button
                onClick={() => setShowGuide(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#64748b',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  lineHeight: '1'
                }}
                aria-label="Close guide"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div style={{ backgroundColor: oceanBg ? 'rgba(255,255,255,0.85)' : 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)', position: 'relative', overflow: 'hidden' }}>
          {oceanBg && (
            <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: `url(${base}Images/ocean.webp)`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(2px)', opacity: 0.25, animation: 'float 12s ease-in-out infinite', pointerEvents: 'none' }} />
          )}
          <div style={{ position: 'relative' }}>
          {/* Header with Stats */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                Your Images
              </h1>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <button onClick={() => setOceanBg(v => !v)} style={{ background: oceanBg ? '#14b8a6' : '#e5e7eb', color: oceanBg ? '#fff' : '#111827', padding: '0.5rem 0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer' }}>🌊 Ocean Background</button>
                <button onClick={handleLoadSamples} style={{ background: '#f59e0b', color: 'white', padding: '0.5rem 0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Load Sample Images</button>
                <button onClick={() => setUseRealModel(v => !v)} style={{ background: useRealModel ? '#3b82f6' : '#e5e7eb', color: useRealModel ? '#fff' : '#111827', padding: '0.5rem 0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer' }}>{useRealModel ? 'AI Model: On' : 'AI Model: Off'}</button>
              </div>
              {images.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {images.filter(img => img.status === 'ready').length > 0 && (
                    <button
                      onClick={async () => { if (useRealModel) await ensureModel(); handleAnalyzeAll(); }}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Sparkles style={{ width: '1.25rem', height: '1.25rem' }} />
                      {useRealModel ? (modelReady ? 'Analyze All (AI)' : 'Load & Analyze (AI)') : 'Analyze All'}
                    </button>
                  )}
                  {totalAnalyzed > 0 && (
                    <button
                      onClick={handleExport}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Download style={{ width: '1.25rem', height: '1.25rem' }} />
                      Export Results
                    </button>
                  )}
                  <button
                    onClick={handleClear}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Trash2 style={{ width: '1.25rem', height: '1.25rem' }} />
                    Clear All
                  </button>
                </div>
              )}
            </div>
            
            {/* Stats Bar */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{
                backgroundColor: '#eff6ff',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                border: '2px solid #bfdbfe'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Total Images</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>{images.length}</div>
              </div>
              
              <div style={{
                backgroundColor: '#f0fdf4',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                border: '2px solid #bbf7d0'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Analyzed</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#166534' }}>{totalAnalyzed}</div>
              </div>
              
              <div style={{
                backgroundColor: '#fef3c7',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                border: '2px solid #fde68a'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Ready to Analyze</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#92400e' }}>
                  {images.filter(img => img.status === 'ready').length}
                </div>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <motion.div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            animate={{
              scale: dragActive ? 1.02 : 1,
              borderColor: dragActive ? '#3b82f6' : '#d1d5db'
            }}
            style={{
              border: '3px dashed',
              borderRadius: '1rem',
              padding: '3rem',
              textAlign: 'center',
              backgroundColor: dragActive ? '#eff6ff' : '#f9fafb',
              cursor: 'pointer',
              marginBottom: '2rem',
              transition: 'all 0.3s'
            }}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              style={{ display: 'none' }}
              aria-label="Upload image files"
            />
            
            <motion.div
              animate={{ y: dragActive ? -5 : 0 }}
              style={{ marginBottom: '1rem' }}
            >
              {dragActive ? (
                <Camera style={{ width: '4rem', height: '4rem', color: '#3b82f6', margin: '0 auto' }} />
              ) : (
                <Upload style={{ width: '4rem', height: '4rem', color: '#9ca3af', margin: '0 auto' }} />
              )}
            </motion.div>
            
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
              {dragActive ? 'Drop your images here!' : 'Upload Your Photos'}
            </h3>
            
            <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '1rem' }}>
              {dragActive ? 'Release to upload' : 'Drag & drop images here, or click to select files'}
            </p>
            
            <div style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              <ImageIcon style={{ width: '1.25rem', height: '1.25rem', display: 'inline', marginRight: '0.5rem' }} />
              Choose Files
            </div>
            
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '1rem' }}>
              Supported formats: JPG, PNG, GIF, WebP
            </p>
          </motion.div>

          {/* Images Grid */}
          {images.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              <AnimatePresence>
                {images.map((image) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '1rem',
                      overflow: 'hidden',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      border: '2px solid #e5e7eb'
                    }}
                  >
                    {/* Image Preview */}
                    <div style={{
                      position: 'relative',
                      paddingTop: '75%',
                      backgroundColor: '#1f2937'
                    }}>
                      <img
                        src={image.preview}
                        alt="Uploaded preview"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      
                      {/* Status Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        display: 'flex',
                        gap: '0.5rem'
                      }}>
                        {image.status === 'uploading' && (
                          <div style={{
                            backgroundColor: '#fbbf24',
                            color: 'white',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <div className="spinner" style={{ width: '0.875rem', height: '0.875rem' }}></div>
                            Uploading...
                          </div>
                        )}
                        
                        {image.status === 'analyzing' && (
                          <div style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <Sparkles style={{ width: '0.875rem', height: '0.875rem' }} />
                            Analyzing...
                          </div>
                        )}
                        
                        {image.status === 'complete' && (
                          <div style={{
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <Check style={{ width: '0.875rem', height: '0.875rem' }} />
                            Complete
                          </div>
                        )}
                        
                        <button
                          onClick={() => handleRemove(image.id)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '0.375rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          aria-label="Remove image"
                        >
                          <X style={{ width: '0.875rem', height: '0.875rem' }} />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1rem' }}>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginBottom: '0.75rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {image.file.name}
                      </div>

                      {/* Prediction Result */}
                      {image.prediction && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{
                            backgroundColor: '#eff6ff',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            marginBottom: '0.75rem',
                            border: '2px solid #bfdbfe'
                          }}
                        >
                          <div style={{
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            color: '#1e40af',
                            marginBottom: '0.5rem'
                          }}>
                            {image.prediction.label}
                          </div>
                          
                          {/* Confidence Bar */}
                          <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '0.75rem',
                              color: '#64748b',
                              marginBottom: '0.25rem'
                            }}>
                              <span>Confidence</span>
                              <span>{Math.round(image.prediction.confidence * 100)}%</span>
                            </div>
                            <div style={{
                              width: '100%',
                              height: '0.5rem',
                              backgroundColor: '#e0e7ff',
                              borderRadius: '0.25rem',
                              overflow: 'hidden'
                            }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${image.prediction.confidence * 100}%` }}
                                transition={{ duration: 0.5 }}
                                style={{
                                  height: '100%',
                                  backgroundColor: '#3b82f6',
                                  borderRadius: '0.25rem'
                                }}
                              />
                            </div>
                          </div>
                          
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#475569',
                            margin: 0,
                            lineHeight: '1.5'
                          }}>
                            {image.prediction.description}
                          </p>
                        </motion.div>
                      )}

                      {/* Action Button */}
                      {image.status === 'ready' && (
                        <button
                          onClick={async () => { if (useRealModel) await ensureModel(); await handleAnalyze(image.id); }}
                          style={{
                            width: '100%',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <Sparkles style={{ width: '1.25rem', height: '1.25rem' }} />
                          {useRealModel ? (modelReady ? 'Analyze (AI)' : 'Load & Analyze (AI)') : 'Analyze This Photo'}
                        </button>
                      )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

          {/* Empty State */}
          {images.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#9ca3af'
            }}>
              <ImageIcon style={{ width: '5rem', height: '5rem', margin: '0 auto 1rem' }} />
              <p style={{ fontSize: '1.125rem', fontWeight: '500' }}>
                No images uploaded yet
              </p>
              <p style={{ fontSize: '0.95rem' }}>
                Upload some photos above to get started!
              </p>
            </div>
          )}
        </div>

        {/* Completion Button */}
        {totalAnalyzed > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '2rem',
              textAlign: 'center'
            }}
          >
            <button
              onClick={() => onComplete(100)}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '1rem 3rem',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.125rem',
                fontWeight: '700',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <Check style={{ width: '1.5rem', height: '1.5rem' }} />
              Complete Activity
            </button>
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
      `}</style>
          </div>
        </div>
  );
}
