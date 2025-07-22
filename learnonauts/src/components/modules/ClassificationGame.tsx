import React, { useState } from 'react';
import { DndContext, closestCenter, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Apple, Car, Cat, TreePine, Flower, Fish, CheckCircle, RotateCcw } from 'lucide-react';

interface ClassificationItem {
  id: string;
  content: string;
  category: 'living' | 'non-living';
  icon: React.ComponentType<any>;
  color: string;
}

interface ClassificationGameProps {
  onComplete: (score: number) => void;
}

const items: ClassificationItem[] = [
  { id: '1', content: 'Apple', category: 'living', icon: Apple, color: 'text-red-500' },
  { id: '2', content: 'Car', category: 'non-living', icon: Car, color: 'text-blue-500' },
  { id: '3', content: 'Cat', category: 'living', icon: Cat, color: 'text-orange-500' },
  { id: '4', content: 'Tree', category: 'living', icon: TreePine, color: 'text-green-500' },
  { id: '5', content: 'Flower', category: 'living', icon: Flower, color: 'text-pink-500' },
  { id: '6', content: 'Fish', category: 'living', icon: Fish, color: 'text-blue-400' }
];

function DraggableItem({ item }: { item: ClassificationItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = item.icon;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '0.75rem',
        boxShadow: isDragging ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.2s',
        border: '1px solid #e5e7eb'
      }}
      {...attributes}
      {...listeners}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'scale(1.03)';
          e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Icon style={{ width: '2rem', height: '2rem' }} className={item.color} />
        <span style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>
          {item.content}
        </span>
      </div>
    </div>
  );
}

function DropZone({ 
  title, 
  items, 
  isCorrect,
  id 
}: { 
  title: string; 
  items: ClassificationItem[];
  isCorrect: boolean | null;
  id: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const getBorderColor = () => {
    if (isOver) return '#3b82f6'; // blue when hovering
    if (isCorrect === true) return '#10b981'; // green
    if (isCorrect === false) return '#ef4444'; // red
    return '#9ca3af'; // gray
  };

  const getBackgroundColor = () => {
    if (isOver) return '#eff6ff'; // blue-50 when hovering
    if (isCorrect === true) return '#f0fdf4'; // green-50
    if (isCorrect === false) return '#fef2f2'; // red-50
    return '#f9fafb'; // gray-50
  };

  return (
    <div 
      ref={setNodeRef}
      style={{
        padding: '1.5rem',
        borderRadius: '0.75rem',
        minHeight: '200px',
        border: `2px dashed ${getBorderColor()}`,
        backgroundColor: getBackgroundColor(),
        transition: 'all 0.2s'
      }}
    >
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
          {items.map(item => (
            <DraggableItem key={item.id} item={item} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function ClassificationGame({ onComplete }: ClassificationGameProps) {
  const [livingItems, setLivingItems] = useState<ClassificationItem[]>([]);
  const [nonLivingItems, setNonLivingItems] = useState<ClassificationItem[]>([]);
  const [availableItems, setAvailableItems] = useState<ClassificationItem[]>(items);
  const [feedback, setFeedback] = useState<string>('');
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!over) return;

    const draggedItem = [...availableItems, ...livingItems, ...nonLivingItems]
      .find(item => item.id === active.id);
    
    if (!draggedItem) return;

    // Remove from current location
    setAvailableItems(items => items.filter(item => item.id !== draggedItem.id));
    setLivingItems(items => items.filter(item => item.id !== draggedItem.id));
    setNonLivingItems(items => items.filter(item => item.id !== draggedItem.id));

    // Add to new location based on drop zone
    if (over.id === 'living-zone' || livingItems.some(item => item.id === over.id)) {
      setLivingItems(items => [...items, draggedItem]);
    } else if (over.id === 'non-living-zone' || nonLivingItems.some(item => item.id === over.id)) {
      setNonLivingItems(items => [...items, draggedItem]);
    } else {
      setAvailableItems(items => [...items, draggedItem]);
    }

    setFeedback('');
    setIsChecked(false);
  }

  function checkAnswers() {
    const livingCorrect = livingItems.every(item => item.category === 'living');
    const nonLivingCorrect = nonLivingItems.every(item => item.category === 'non-living');
    
    const correctCount = livingItems.filter(item => item.category === 'living').length +
                        nonLivingItems.filter(item => item.category === 'non-living').length;
    
    const totalItems = livingItems.length + nonLivingItems.length;
    const newScore = totalItems > 0 ? Math.round((correctCount / totalItems) * 100) : 0;
    
    setScore(newScore);
    setIsChecked(true);

    if (livingCorrect && nonLivingCorrect && totalItems === items.length) {
      setFeedback('🎉 Perfect! You correctly classified all items! Living things grow and breathe, while non-living things do not.');
      onComplete(100);
    } else if (correctCount > totalItems / 2) {
      setFeedback(`Good job! You got ${correctCount} out of ${totalItems} correct. Try moving the remaining items!`);
    } else {
      setFeedback('Keep trying! Remember: living things can grow, breathe, and move on their own.');
    }
  }

  function resetGame() {
    setLivingItems([]);
    setNonLivingItems([]);
    setAvailableItems(items);
    setFeedback('');
    setIsChecked(false);
    setScore(0);
  }

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>
          Classification: Living vs Non-Living
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: '1.5rem' }}>
          Drag the items below into the correct categories. Think about whether each item can grow, breathe, or move on its own!
        </p>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {/* Available Items */}
        <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.75rem', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>Items to Sort</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '1rem' 
          }}>
            <SortableContext items={availableItems.map(item => item.id)} strategy={rectSortingStrategy}>
              {availableItems.map(item => (
                <DraggableItem key={item.id} item={item} />
              ))}
            </SortableContext>
          </div>
        </div>

        {/* Drop Zones */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          <div>
            <DropZone
              id="living-zone"
              title="🌱 Living Things"
              items={livingItems}
              isCorrect={isChecked ? livingItems.every(item => item.category === 'living') : null}
            />
          </div>
          
          <div>
            <DropZone
              id="non-living-zone"
              title="🏠 Non-Living Things"
              items={nonLivingItems}
              isCorrect={isChecked ? nonLivingItems.every(item => item.category === 'non-living') : null}
            />
          </div>
        </div>
      </DndContext>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button
          onClick={checkAnswers}
          disabled={livingItems.length === 0 && nonLivingItems.length === 0}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            fontWeight: '500',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: livingItems.length === 0 && nonLivingItems.length === 0 ? 'not-allowed' : 'pointer',
            opacity: livingItems.length === 0 && nonLivingItems.length === 0 ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!(livingItems.length === 0 && nonLivingItems.length === 0)) {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} />
          <span>Check Answers</span>
        </button>

        <button
          onClick={resetGame}
          style={{
            backgroundColor: 'transparent',
            color: '#3b82f6',
            fontWeight: '500',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: '2px solid #3b82f6',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#3b82f6';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <RotateCcw style={{ width: '1.25rem', height: '1.25rem' }} />
          <span>Reset</span>
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          style={{
            backgroundColor: score === 100 ? '#f0fdf4' : '#eff6ff',
            border: `1px solid ${score === 100 ? '#10b981' : '#3b82f6'}`,
            borderRadius: '0.75rem',
            padding: '1.5rem',
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <p style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: score < 100 ? '1rem' : '0' }}>
            {feedback}
          </p>
          {isChecked && score < 100 && (
            <div>
              <div style={{
                width: '100%',
                backgroundColor: '#e5e7eb',
                borderRadius: '9999px',
                height: '0.75rem',
                marginBottom: '0.5rem'
              }}>
                <div 
                  style={{
                    backgroundColor: '#3b82f6',
                    height: '0.75rem',
                    borderRadius: '9999px',
                    transition: 'width 0.5s',
                    width: `${score}%`
                  }}
                />
              </div>
              <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Score: {score}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
