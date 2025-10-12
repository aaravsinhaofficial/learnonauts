import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface PlacementTestProps {
  onComplete: (score: number) => void;
}

type Q = { q: string; options: string[]; correct: number };

const QUESTIONS: Q[] = [
  { q: 'Which task best fits classification?', options: ['Sort similar items without labels', 'Predict a continuous value', 'Assign labels like cat vs dog', 'Draw a picture'], correct: 2 },
  { q: 'Clustering is mainly used for:', options: ['Grouping similar items with no labels', 'Maximizing speed', 'Counting words', 'Finding exact answers'], correct: 0 },
  { q: 'Regression predicts:', options: ['A category', 'A group', 'A number/amount', 'A color'], correct: 2 },
  { q: 'Neurons in a neural network:', options: ['Are real brain cells', 'Process inputs with weights and activation', 'Store files', 'Sort alphabetically'], correct: 1 },
];

export function PlacementTest({ onComplete }: PlacementTestProps) {
  const { isAuthenticated, updateProgress } = useAuth();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const q = QUESTIONS[i];
  const isLast = i === QUESTIONS.length - 1;

  const submit = async () => {
    if (selected === null) return;
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    setSelected(null);
    if (isLast) {
      const correctCount = nextAnswers.reduce((sum, a, idx) => sum + (a === QUESTIONS[idx].correct ? 1 : 0), 0);
      const score = Math.round((correctCount / QUESTIONS.length) * 100);
      setDone(true);
      if (isAuthenticated) {
        await updateProgress('placement', score, 3);
      }
      onComplete(score);
    } else {
      setI(v => v + 1);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Placement Test</h2>
      <p style={{ color: '#4b5563', marginBottom: '1rem' }}>Answer a few questions to tailor your journey.</p>
      {!done && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
          <div style={{ marginBottom: 8, color: '#6b7280', fontSize: 14 }}>Question {i + 1} of {QUESTIONS.length}</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{q.q}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.options.map((opt, idx) => (
              <button key={idx} onClick={() => setSelected(idx)} style={{
                textAlign: 'left',
                padding: '12px 14px',
                borderRadius: 8,
                border: '2px solid',
                borderColor: selected === idx ? '#6366f1' : '#e5e7eb',
                background: selected === idx ? '#eef2ff' : '#fff',
                cursor: 'pointer'
              }}>{opt}</button>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={submit} disabled={selected === null} style={{
              background: selected === null ? '#e5e7eb' : '#6366f1',
              color: selected === null ? '#9ca3af' : '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 8,
              cursor: selected === null ? 'not-allowed' : 'pointer'
            }}>{isLast ? 'Finish' : 'Next'}</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default PlacementTest;

