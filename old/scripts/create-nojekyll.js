// This script creates a .nojekyll file in the dist directory
// to prevent GitHub Pages from using Jekyll

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Ensure dist directory exists
const distDir = resolve(process.cwd(), 'dist');
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Create empty .nojekyll file
const nojekyllPath = resolve(distDir, '.nojekyll');
writeFileSync(nojekyllPath, '');

console.log('Created .nojekyll file in dist directory');
