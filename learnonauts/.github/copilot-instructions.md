<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Learnonauts - AI/ML Learning Platform for Neurodivergent Students

## Project Overview
Learnonauts is a drag-and-drop, gamified learning platform designed to teach AI/ML fundamentals without coding. The platform is specifically designed for neurodivergent learners and focuses on accessibility, visual learning, and inclusive design.

## Key Principles
- **Accessibility First**: All components should support screen readers, keyboard navigation, and various sensory preferences
- **Visual Learning**: Prefer visual representations over text-heavy explanations
- **Neurodivergent-Friendly**: Consider ADHD, autism, dyslexia, and other learning differences in all design decisions
- **Gamification**: Include progress tracking, badges, achievements, and engaging interactions
- **No Coding Required**: All learning should happen through drag-and-drop and visual interfaces

## Technical Stack
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Framer Motion for animations
- @dnd-kit for drag-and-drop functionality
- Lucide React for icons

## Component Guidelines
- Use semantic HTML and proper ARIA labels
- Implement keyboard navigation for all interactive elements
- Include loading states and error handling
- Make animations optional/reducible for users with vestibular disorders
- Use high contrast colors and clear typography
- Provide alternative text for all visual content

## Learning Modules
1. **Introduction to AI/ML** - Interactive storytelling and real-world examples
2. **Classification** - Visual sorting games and rule-based decision trees
3. **Regression** - Prediction games with sliders and interactive charts
4. **Clustering** - Pattern recognition and grouping activities
5. **Neural Networks** - Animated neuron simulations and network building
6. **Model Builder** - Drag-and-drop interface for creating simple models

## Coding Style
- Use functional components with hooks
- Implement proper TypeScript types
- Follow React best practices for performance
- Create reusable, composable components
- Include comprehensive error boundaries
- Write accessible, semantic markup
