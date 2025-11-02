// Utility to format markdown-style text in chatbot messages
import React from 'react';

export function formatMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  lines.forEach((line, lineIndex) => {
    // Check for headings
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`line-${lineIndex}`} style={{ fontSize: '1rem', fontWeight: '600', margin: '0.5rem 0 0.25rem 0', color: '#111827' }}>
          {line.substring(4)}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`line-${lineIndex}`} style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0.5rem 0 0.25rem 0', color: '#111827' }}>
          {line.substring(3)}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`line-${lineIndex}`} style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0.5rem 0 0.25rem 0', color: '#111827' }}>
          {line.substring(2)}
        </h1>
      );
    } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      // Bullet points
      elements.push(
        <div key={`line-${lineIndex}`} style={{ paddingLeft: '1rem', margin: '0.25rem 0' }}>
          <span style={{ marginRight: '0.5rem' }}>•</span>
          {formatInlineMarkdown(line.trim().substring(2))}
        </div>
      );
    } else if (line.trim().match(/^\d+\. /)) {
      // Numbered lists
      const match = line.trim().match(/^(\d+)\. (.+)$/);
      if (match) {
        elements.push(
          <div key={`line-${lineIndex}`} style={{ paddingLeft: '1rem', margin: '0.25rem 0' }}>
            <span style={{ marginRight: '0.5rem' }}>{match[1]}.</span>
            {formatInlineMarkdown(match[2])}
          </div>
        );
      }
    } else if (line.trim() === '') {
      // Empty line - add spacing
      elements.push(<div key={`line-${lineIndex}`} style={{ height: '0.5rem' }} />);
    } else {
      // Regular paragraph
      elements.push(
        <p key={`line-${lineIndex}`} style={{ margin: '0.25rem 0', lineHeight: '1.5' }}>
          {formatInlineMarkdown(line)}
        </p>
      );
    }
  });
  
  return elements;
}

// Format inline markdown (bold, italic, code)
function formatInlineMarkdown(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let currentIndex = 0;
  let key = 0;
  
  // Regular expressions for inline formatting
  const patterns = [
    { regex: /\*\*(.+?)\*\*/g, style: { fontWeight: 'bold' } },  // **bold**
    { regex: /\*(.+?)\*/g, style: { fontStyle: 'italic' } },     // *italic*
    { regex: /__(.+?)__/g, style: { fontWeight: 'bold' } },      // __bold__
    { regex: /_(.+?)_/g, style: { fontStyle: 'italic' } },       // _italic_
    { regex: /`(.+?)`/g, style: { 
      fontFamily: 'monospace', 
      backgroundColor: '#f3f4f6', 
      padding: '0.125rem 0.25rem', 
      borderRadius: '0.25rem',
      fontSize: '0.875em'
    } },  // `code`
  ];
  
  // Find all matches
  const matches: Array<{ start: number; end: number; content: string; style: React.CSSProperties }> = [];
  
  patterns.forEach(pattern => {
    const regex = new RegExp(pattern.regex);
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
        style: pattern.style
      });
    }
  });
  
  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start);
  
  // Remove overlapping matches (keep first)
  const filteredMatches: typeof matches = [];
  let lastEnd = 0;
  matches.forEach(match => {
    if (match.start >= lastEnd) {
      filteredMatches.push(match);
      lastEnd = match.end;
    }
  });
  
  // Build elements with formatted text
  filteredMatches.forEach(match => {
    // Add text before match
    if (currentIndex < match.start) {
      elements.push(
        <React.Fragment key={`text-${key++}`}>
          {text.substring(currentIndex, match.start)}
        </React.Fragment>
      );
    }
    
    // Add formatted match
    elements.push(
      <span key={`formatted-${key++}`} style={match.style}>
        {match.content}
      </span>
    );
    
    currentIndex = match.end;
  });
  
  // Add remaining text
  if (currentIndex < text.length) {
    elements.push(
      <React.Fragment key={`text-${key++}`}>
        {text.substring(currentIndex)}
      </React.Fragment>
    );
  }
  
  return elements.length > 0 ? elements : [text];
}
