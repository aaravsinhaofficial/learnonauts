import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface PracticeModeProps {
  onComplete: (score: number) => void;
}

type Q = { q: string; options: string[]; correct: number; hint?: string };

const BANK: Q[] = [
  { q: 'Classification picks:', options: ['Categories', 'Numbers'], correct: 0, hint: 'Think cat vs dog.' },
  { q: 'Clustering uses:', options: ['Labels', 'Similarity'], correct: 1, hint: 'No labels given.' },
  { q: 'Regression output is:', options: ['Continuous', 'Binary'], correct: 0, hint: 'A number/amount.' },
  { q: 'Neural activation example:', options: ['Sigmoid', 'Subway'], correct: 0 },
  { q: 'Feature is:', options: ['Input attribute', 'Random guess'], correct: 0 },
];

export function PracticeMode({ onComplete }: PracticeModeProps) {
  const { isAuthenticated, updateProgress } = useAuth();
  const QUESTIONS = BANK.sort(() => 0.5 - Math.random()).slice(0, 5);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);

  const q = QUESTIONS[i];
  const isLast = i === QUESTIONS.length - 1;

  const submit = async () => {
    if (selected === null) return;
    const ok = selected === q.correct;
    setShowFeedback(ok ? 'correct' : 'wrong');
    if (ok) setScore(s => s + 1);
    setTimeout(async () => {
      setShowFeedback(null);
      setSelected(null);
      if (isLast) {
        const pct = Math.round((score + (ok ? 1 : 0)) / QUESTIONS.length * 100);
        if (isAuthenticated) await updateProgress('practice', pct, 3);
        onComplete(pct);
      } else {
        setI(v => v + 1);
      }
    }, 600);
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Practice</h2>
      <p style={{ color: '#4b5563', marginBottom: 12 }}>Quick review of recent concepts.</p>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ marginBottom: 8, color: '#6b7280', fontSize: 14 }}>Question {i + 1} of {QUESTIONS.length}</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{q.q}</div>
        {q.hint && <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Hint: {q.hint}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q.options.map((opt, idx) => (
            <button key={idx} onClick={() => setSelected(idx)} style={{
              textAlign: 'left', padding: '12px 14px', borderRadius: 8,
              border: '2px solid', borderColor: selected === idx ? '#22c55e' : '#e5e7eb',
              background: selected === idx ? '#ecfdf5' : '#fff', cursor: 'pointer'
            }}>{opt}</button>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={submit} disabled={selected === null} style={{
            background: selected === null ? '#e5e7eb' : '#22c55e', color: selected === null ? '#9ca3af' : '#fff',
            border: 'none', padding: '10px 16px', borderRadius: 8, cursor: selected === null ? 'not-allowed' : 'pointer'
          }}>Submit</button>
        </div>
        {showFeedback && (
          <div style={{ marginTop: 10, fontWeight: 600, color: showFeedback === 'correct' ? '#065f46' : '#991b1b' }}>
            {showFeedback === 'correct' ? '✅ Correct!' : '❌ Try the next one!'}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default PracticeMode;

