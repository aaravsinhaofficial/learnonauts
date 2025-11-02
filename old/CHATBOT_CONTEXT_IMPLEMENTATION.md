# Chatbot Context Implementation

## Overview
The AI Helper chatbot now has full awareness of the Learnonauts app context and the user's current page, providing more relevant and helpful responses.

## Implementation Details

### 1. Enhanced ChatbotFab Component
**File:** `src/components/ChatbotFab.tsx`

#### New Props:
```typescript
interface ChatbotFabProps {
  accessibility?: {
    speechEnabled?: boolean;
    speechSpeed?: number;
    speechVolume?: number;
  };
  currentPage?: string;      // NEW: Current page name
  pageContext?: string;       // NEW: Detailed context about the page
}
```

#### Context Injection:
The chatbot now builds a comprehensive context message before sending to Gemini AI:

```typescript
const appContext = `You are an AI learning assistant for Learnonauts, an educational platform teaching kids about artificial intelligence through interactive games and activities.

App Overview:
- Learnonauts helps children learn AI concepts like classification, regression, clustering, and neural networks
- Features include interactive games, placement tests, practice modes, and hands-on AI training labs
- The platform is designed to be accessible and neurodivergent-friendly with features like speech synthesis, break reminders, and customizable UI

Current Page: ${currentPage || 'Main Dashboard'}
${pageContext ? `Page Context: ${pageContext}` : ''}

User Question: ${content}

Please provide a helpful, kid-friendly response that relates to their current activity and the Learnonauts platform.`;
```

### 2. Page Context Provider in App.tsx
**File:** `src/App.tsx`

#### New Helper Function:
Added `getPageContext()` function that maps each view to detailed contextual information:

```typescript
const getPageContext = (): { page: string; context: string } => {
  const contexts: Record<typeof currentView, { page: string; context: string }> = {
    welcome: { /* ... */ },
    modules: { /* ... */ },
    classification: { /* ... */ },
    regression: { /* ... */ },
    clustering: { /* ... */ },
    'neural-network': { /* ... */ },
    introduction: { /* ... */ },
    'training-lab': { /* ... */ },
    'accessibility-demo': { /* ... */ },
    placement: { /* ... */ },
    practice: { /* ... */ }
  };
  
  return contexts[currentView] || { 
    page: 'Learnonauts', 
    context: 'The user is exploring the Learnonauts AI learning platform.' 
  };
};
```

### 3. Context Information by Page

| Page | Context Provided |
|------|------------------|
| **Welcome Screen** | Introduction to the platform, starting the learning journey |
| **Module Selection** | Overview of all available modules and activities |
| **Classification Game** | Learning about sorting and categorizing (cats vs dogs, spam detection) |
| **Regression Game** | Predicting numbers and continuous values (house prices, temperatures) |
| **Clustering Game** | Finding hidden patterns and grouping similar items (unsupervised learning) |
| **Neural Network Simulation** | Brain-inspired architecture, neurons, layers, weights |
| **Introduction Lesson** | AI fundamentals and basic concepts |
| **AI Training Lab** | Hands-on training with real-time visualization |
| **Accessibility Demo** | Neurodivergent-friendly features and customization options |
| **Placement Test** | Knowledge assessment for personalized learning |
| **Practice Mode** | Review and reinforcement exercises |

### 4. Updated ChatbotFab Instances
All `<ChatbotFab>` instances throughout the app now receive contextual props:

```tsx
<ChatbotFab 
  accessibility={accessibilitySettings} 
  currentPage={getPageContext().page}
  pageContext={getPageContext().context}
/>
```

## Benefits

### 1. **Context-Aware Responses**
The chatbot now knows:
- What page the user is on
- What learning activity they're doing
- The specific AI concept being taught
- Available features and capabilities

### 2. **Better User Experience**
- More relevant answers to user questions
- Specific hints related to the current activity
- Platform-aware guidance
- Kid-friendly explanations tailored to the current lesson

### 3. **Educational Enhancement**
- Explanations tie back to Learnonauts concepts
- References specific modules and features
- Contextual learning support
- Seamless integration with the curriculum

## Example Interactions

### On Classification Game:
**User:** "What am I supposed to do?"

**AI Helper (with context):** "You're learning about classification! In this game, you'll help the AI sort things into different categories - like deciding if something is a cat or a dog. Classification is how computers learn to put things in the right groups. Try dragging items to see how the AI makes its decisions!"

### On Neural Network Simulation:
**User:** "What's a neuron?"

**AI Helper (with context):** "Great question! In the Neural Network module you're exploring, neurons are like tiny decision-makers inspired by brain cells. Each neuron takes in information, processes it using 'weights' (which tell it what's important), and then passes a signal to the next layer. Together, lots of neurons work as a team to help AI learn patterns!"

### On AI Training Lab:
**User:** "How do I train my AI?"

**AI Helper (with context):** "In the AI Training Lab, you can train your own model! You have two options: use the built-in ocean animal dataset, or upload your own images. The AI will learn from your examples and you'll see it getting smarter in real-time. Try starting with the sample data first to see how it works!"

## Technical Notes

### API Key Configuration
- The app uses `VITE_GEMINI_API_KEY` from `.env.local`
- Direct API calls are made to Google Gemini (no proxy needed)
- Context is prepended to every user message for better responses

### Error Handling
- Graceful fallback if context is not available
- Default friendly responses if API fails
- User-friendly error messages

### Performance
- Context is computed on-demand (only when user opens chatbot)
- Minimal overhead - just string concatenation
- No impact on page load times

## Future Enhancements

Potential improvements:
1. **Activity-Specific Context**: Include current score, progress, or specific challenge details
2. **User Profile Context**: Include user's learning level and completed modules
3. **Dynamic Hints**: Generate targeted hints based on where user is stuck
4. **Progress Tracking**: Reference user's achievements and badge progress
5. **Accessibility Context**: Include active accessibility settings in context

## Testing

### Manual Testing Steps:
1. Navigate to different pages (Classification, Clustering, etc.)
2. Open the AI Helper chatbot (💬 button)
3. Ask questions like:
   - "What is this?"
   - "Help me understand this concept"
   - "What should I do next?"
4. Verify responses are page-specific and relevant

### Expected Behavior:
- ✅ Chatbot knows what page you're on
- ✅ Responses reference the current learning activity
- ✅ Explanations are kid-friendly and educational
- ✅ Answers tie back to Learnonauts platform features

## Conclusion

The AI Helper chatbot is now a fully context-aware learning companion that understands where users are in their learning journey and provides relevant, helpful guidance tailored to their current activity. This creates a more integrated and supportive learning experience throughout the Learnonauts platform.
