import React, { useEffect, useRef, useState } from 'react';
import { geminiAI } from '../services/geminiAI';
import { speechManager } from '../utils/speechSynthesis';

interface ChatbotFabProps {
  accessibility?: {
    speechEnabled?: boolean;
    speechSpeed?: number;
    speechVolume?: number;
  };
  currentPage?: string;
  pageContext?: string;
}

export function ChatbotFab({ accessibility, currentPage, pageContext }: ChatbotFabProps) {
  const [open, setOpen] = useState<boolean>(() => {
    try { return !!JSON.parse(localStorage.getItem('chatbot_open') || 'false'); } catch { return false; }
  });
  // Backend proxy is used, API key is not collected from users any more
  const [apiKey] = useState<string>('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{x:number;y:number}>(() => {
    try { return JSON.parse(localStorage.getItem('chatbot_pos') || '{"x":16,"y":16}'); } catch { return { x: 16, y: 16 }; }
  });
  const [size, setSize] = useState<{w:number;h:number}>(() => {
    try { return JSON.parse(localStorage.getItem('chatbot_size') || '{"w":320,"h":420}'); } catch { return { w: 320, h: 420 }; }
  });

  useEffect(() => { localStorage.setItem('chatbot_open', JSON.stringify(open)); }, [open]);
  // no user API key; use backend proxy
  useEffect(() => { scrollRef.current?.scrollTo({ top: 999999, behavior: 'smooth' }); }, [messages, sending]);

  const quickPrompts = [
    'Explain this step by step',
    'Give me a hint',
    'What should I try next?',
    'Use kid-friendly words',
  ];

  const speakIfOn = (text: string) => {
    if (accessibility?.speechEnabled) {
      speechManager.speakAuditoryExplanation(text);
    }
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setSending(true);
    setMessages(prev => [...prev, { role: 'user', text: content }]);
    setInput('');
    try {
      // Build contextual message with app and page information
      const appContext = `You are an AI learning assistant for Learnonauts, an educational platform teaching kids about artificial intelligence through interactive games and activities.

App Overview:
- Learnonauts helps children learn AI concepts like classification, regression, clustering, and neural networks
- Features include interactive games, placement tests, practice modes, and hands-on AI training labs
- The platform is designed to be accessible and neurodivergent-friendly with features like speech synthesis, break reminders, and customizable UI

Current Page: ${currentPage || 'Main Dashboard'}
${pageContext ? `Page Context: ${pageContext}` : ''}

User Question: ${content}

Please provide a helpful, kid-friendly response that relates to their current activity and the Learnonauts platform.`;

      const res = await geminiAI.sendMessage(appContext);
      const reply = res.text || 'I am here to help!';
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      speakIfOn(reply);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Hmm, I had trouble answering. Try rephrasing your question.' }]);
    } finally {
      setSending(false);
    }
  };

  const containerStyle: React.CSSProperties = { position: 'fixed', right: 16, bottom: 16, zIndex: 60 };
  const fabStyle: React.CSSProperties = {
    width: 56, height: 56, borderRadius: 28, background: '#7c3aed', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(0,0,0,0.18)', border: 'none', fontSize: 24,
  };
  const panelStyle: React.CSSProperties = {
    width: size.w, height: size.h, background: 'white', borderRadius: 12,
    boxShadow: '0 18px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column',
    overflow: 'hidden', border: '1px solid #e5e7eb', position: 'absolute',
    right: pos.x, bottom: pos.y
  };

  // Dragging by header
  const onDragStart = (e: React.MouseEvent) => {
    const startX = e.clientX; const startY = e.clientY;
    const startPos = { ...pos };
    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - startX; const dy = ev.clientY - startY;
      const nx = Math.max(0, startPos.x - dx); // moving panel by adjusting right/bottom
      const ny = Math.max(0, startPos.y - dy);
      setPos({ x: nx, y: ny });
    };
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); localStorage.setItem('chatbot_pos', JSON.stringify({ x: pos.x, y: pos.y })); };
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
  };

  // Resizing by bottom-left corner handle
  const onResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX; const startY = e.clientY;
    const startSize = { ...size };
    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - startX; const dy = ev.clientY - startY;
      const nw = Math.max(280, startSize.w + dx);
      const nh = Math.max(300, startSize.h + dy);
      setSize({ w: nw, h: nh });
    };
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); localStorage.setItem('chatbot_size', JSON.stringify({ w: size.w, h: size.h })); };
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
  };

  return (
    <div style={containerStyle} aria-live="polite">
      {open && (
        <div ref={dragRef} style={panelStyle}>
          {/* Header (drag handle) */}
          <div onMouseDown={onDragStart} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, background: '#f9fafb', borderBottom: '1px solid #e5e7eb', cursor: 'move' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 20 }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, color: '#111827' }}>AI Helper</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Friendly guide for learning AI</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Minimize" style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: 18, cursor: 'pointer' }}>▾</button>
          </div>

          {/* Scroll area */}
          <div ref={scrollRef} style={{ padding: 10, overflowY: 'auto', flex: 1, background: '#ffffff' }}>
            {messages.length === 0 && (
              <div style={{ color: '#6b7280', fontSize: 14 }}>Try a quick prompt below or ask a question about the current activity.</div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                <div style={{ maxWidth: '80%', padding: '8px 10px', borderRadius: 10, background: m.role === 'user' ? '#eef2ff' : '#f1f5f9', border: '1px solid #e5e7eb', color: '#111827' }}>
                  {m.text}
                </div>
              </div>
            ))}
            {sending && <div style={{ fontSize: 12, color: '#6b7280' }}>Thinking…</div>}
          </div>

          {/* Quick prompts */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '8px 10px', borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
            {quickPrompts.map((p, idx) => (
              <button key={idx} onClick={() => send(p)} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 9999, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>{p}</button>
            ))}
          </div>

          {/* Input row */}
          <div style={{ display: 'flex', gap: 6, padding: 10, borderTop: '1px solid #e5e7eb', background: 'white' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} placeholder="Ask for a hint…" aria-label="Chat input" style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px' }} />
            <button onClick={() => send()} disabled={sending || !input.trim()} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: sending || !input.trim() ? 'not-allowed' : 'pointer' }}>Send</button>
          </div>

          {/* Resize handle */}
          <div onMouseDown={onResizeStart} aria-hidden style={{ position: 'absolute', right: 0, bottom: 0, width: 16, height: 16, cursor: 'nwse-resize', background: 'linear-gradient(135deg, transparent 50%, #e5e7eb 50%)' }} />
        </div>
      )}

      {/* FAB */}
      {!open && (
        <button aria-label="Open AI Helper" onClick={() => setOpen(true)} style={fabStyle}>💬</button>
      )}
    </div>
  );
}

export default ChatbotFab;
