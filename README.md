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

### Quick Deploy to GitHub Pages

The project is **ready for GitHub Pages deployment**! Choose your method:

#### Option 1: Automatic (Recommended) ✨
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push
```
GitHub Actions will automatically build and deploy!

#### Option 2: Using Deployment Script 🔧
```bash
./scripts/deploy.sh
```
Interactive deployment with safety checks.

#### Option 3: Manual gh-pages 📦
```bash
npm run deploy
```

### 📚 Deployment Guides

- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Fast setup in 5 steps
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete documentation
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist

### 🔑 Important: API Key Setup

The AI chatbot requires a Gemini API key:

1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add as GitHub secret: `VITE_GEMINI_API_KEY`
   - Go to: Settings → Secrets and variables → Actions
   - Click: New repository secret
   - Name: `VITE_GEMINI_API_KEY`
   - Value: Your API key

### 🌐 Live URL

After deployment, your app will be at:
```
https://YOUR_USERNAME.github.io/learnonauts/
```

### 🛠️ Configuration

- **Base path**: Set to `/learnonauts/` in `vite.config.ts`
- **Build output**: `dist/` directory
- **GitHub Actions**: `.github/workflows/deploy.yml`
- **.nojekyll**: Automatically created during build

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```