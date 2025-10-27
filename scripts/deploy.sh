#!/bin/bash

# Learnonauts Quick Deployment Script
# This script helps you deploy to GitHub Pages

set -e

echo "🚀 Learnonauts GitHub Pages Deployment"
echo "======================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized. Run 'git init' first."
    exit 1
fi

# Check if remote exists
if ! git remote | grep -q origin; then
    echo "❌ No 'origin' remote found."
    echo "Please add your GitHub repository:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/learnonauts.git"
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes:"
    git status -s
    echo ""
    read -p "Do you want to commit all changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
    else
        echo "⚠️  Deploying with uncommitted changes..."
    fi
fi

# Get current branch
BRANCH=$(git branch --show-current)

echo ""
echo "📋 Deployment Summary:"
echo "  Branch: $BRANCH"
echo "  Remote: $(git remote get-url origin)"
echo ""

# Test build locally
echo "🔨 Testing build locally..."
if npm run build; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo ""
read -p "Ready to push to GitHub and trigger deployment? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 Pushing to GitHub..."
    git push origin $BRANCH
    
    echo ""
    echo "✅ Deployment initiated!"
    echo ""
    echo "📊 Monitor deployment progress:"
    echo "  https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
    echo ""
    echo "🌐 Your site will be available at:"
    echo "  https://$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\/.*\.git/\1/').github.io/learnonauts/"
    echo ""
    echo "⏱️  Deployment usually takes 2-3 minutes."
else
    echo "❌ Deployment cancelled."
fi
