import { useMemo, useState } from 'react';
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
  const questionSet = useMemo(() => [...QUESTIONS], []);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const q = questionSet[i];
  const isLast = i === questionSet.length - 1;

  const submit = async () => {
    if (selected === null) return;
    const nextAnswers = [...answers.slice(0, i), selected];
    setAnswers(nextAnswers);
    setSelected(null);
    if (isLast) {
      const correctCount = nextAnswers.reduce((sum, a, idx) => sum + (a === questionSet[idx].correct ? 1 : 0), 0);
      const score = Math.round((correctCount / questionSet.length) * 100);
      setDone(true);
      setFinalScore(score);
      if (isAuthenticated) {
        await updateProgress('placement', score, 3);
      }
      onComplete(score);
    } else {
      setI(v => v + 1);
    }
  };

  const restart = () => {
    setI(0);
    setAnswers([]);
    setSelected(null);
    setDone(false);
    setFinalScore(null);
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Placement Test</h2>
      <p style={{ color: '#4b5563', marginBottom: '1rem' }}>Answer a few questions to tailor your journey.</p>
      {!done ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
          <div style={{ marginBottom: 8, color: '#6b7280', fontSize: 14 }}>Question {i + 1} of {questionSet.length}</div>
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
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 20px 35px rgba(15,23,42,0.15)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>You’re all set!</div>
          <div style={{ fontSize: 54, fontWeight: 800, color: finalScore && finalScore >= 75 ? '#22c55e' : '#6366f1', margin: '12px 0' }}>
            {finalScore}%
          </div>
          <p style={{ color: '#475569', marginBottom: 16 }}>
            Here’s how you did on each concept. Review the hints if you missed one, then retake whenever you’d like.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {questionSet.map((item, idx) => {
              const userAnswer = answers[idx];
              const correct = userAnswer === item.correct;
              return (
                <div key={idx} style={{
                  borderRadius: 12,
                  border: `1px solid ${correct ? '#bbf7d0' : '#fecaca'}`,
                  background: correct ? '#ecfdf5' : '#fef2f2',
                  padding: '12px 16px'
                }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.q}</div>
                  <div style={{ marginTop: 6, fontSize: 14, color: '#475569' }}>
                    Your answer: <strong>{typeof userAnswer === 'number' ? item.options[userAnswer] : '—'}</strong>
                    <span style={{ marginLeft: 12, color: correct ? '#047857' : '#b91c1c', fontWeight: 600 }}>
                      {correct ? 'Correct' : `Correct answer: ${item.options[item.correct]}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={restart} style={{ marginTop: 20, border: 'none', background: '#6366f1', color: 'white', padding: '10px 18px', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>
            Retake Placement Test
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default PlacementTest;
