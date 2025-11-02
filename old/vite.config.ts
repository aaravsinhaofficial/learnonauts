import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/learnonauts/', // Set base path for GitHub Pages
  plugins: [react()],
  // Proxy removed - using direct API calls with VITE_GEMINI_API_KEY from .env.local
})
