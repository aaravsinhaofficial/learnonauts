# Learnonauts 🚀

A drag-and-drop, gamified AI/ML learning platform designed specifically for neurodivergent students.

## ✨ Features Implemented

### 🎮 Current Functionality
- **Welcome Screen**: Beautiful gradient welcome screen with smooth animations
- **Module Dashboard**: Interactive cards showing available learning modules
- **Classification Game**: Fully functional drag-and-drop game teaching AI classification concepts
- **Progress Tracking**: Visual indicators for completed modules and scores
- **Accessibility**: Keyboard navigation support and screen reader friendly
- **Responsive Design**: Works on various screen sizes including Chromebooks

### 🧠 Learning Modules

#### 1. Introduction to AI
- Interactive explanations of AI concepts
- Visual storytelling about how AI learns
- Neurodivergent-friendly presentation

#### 2. Classification Game (COMPLETE ✓)
- Drag-and-drop sorting of living vs non-living things
- Real-time feedback and scoring
- Visual hover effects and animations
- Progress tracking and completion badges

#### 3. Prediction Module (In Development)
- Coming soon placeholder with engaging visuals

## 🛠️ Technical Stack

- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **@dnd-kit** for accessible drag-and-drop functionality
- **Lucide React** for beautiful, consistent icons
- **Tailwind CSS** with inline style fallbacks for reliability
- **Framer Motion** for smooth animations (where supported)

## 🚀 Deployment

### GitHub Pages Deployment

The project is configured for easy deployment to GitHub Pages:

1. **Automatic Deployment (Recommended)**
   - Push to the `main` branch
   - GitHub Actions will automatically build and deploy to GitHub Pages

2. **Manual Deployment**
   ```bash
   # Build the project
   npm run build
   
   # Deploy to GitHub Pages
   npm run deploy
   ```

3. **Configuration**
   - The site is configured to be deployed at: `https://aaravsinhaofficial.github.io/learnonauts/`
   - Base path is set to `/learnonauts/` in `vite.config.ts`
   - A `.nojekyll` file is automatically added to the build to ensure proper file handling

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```