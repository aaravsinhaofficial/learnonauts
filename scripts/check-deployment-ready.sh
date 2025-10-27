#!/bin/bash

# Learnonauts Deployment Readiness Check
# Validates that everything is configured correctly for GitHub Pages

echo "🔍 Learnonauts Deployment Readiness Check"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: vite.config.ts exists and has base path
echo "Checking Vite configuration..."
if [ -f "vite.config.ts" ]; then
    if grep -q "base:" vite.config.ts; then
        BASE_PATH=$(grep "base:" vite.config.ts | sed -E "s/.*base: ['\"](.*)['\"].*/\1/")
        echo -e "${GREEN}✓${NC} vite.config.ts found with base: ${BASE_PATH}"
    else
        echo -e "${RED}✗${NC} vite.config.ts missing 'base' property"
        ((ERRORS++))
    fi
else
    echo -e "${RED}✗${NC} vite.config.ts not found"
    ((ERRORS++))
fi
echo ""

# Check 2: GitHub Actions workflow
echo "Checking GitHub Actions workflow..."
if [ -f ".github/workflows/deploy.yml" ]; then
    echo -e "${GREEN}✓${NC} Deployment workflow found"
    
    if grep -q "VITE_GEMINI_API_KEY" .github/workflows/deploy.yml; then
        echo -e "${GREEN}✓${NC} API key injection configured"
    else
        echo -e "${YELLOW}⚠${NC} API key not configured in workflow"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}✗${NC} .github/workflows/deploy.yml not found"
    ((ERRORS++))
fi
echo ""

# Check 3: package.json deployment scripts
echo "Checking package.json scripts..."
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json found"
    
    if grep -q "\"deploy\"" package.json; then
        echo -e "${GREEN}✓${NC} Deploy script configured"
    else
        echo -e "${YELLOW}⚠${NC} Deploy script not found"
        ((WARNINGS++))
    fi
    
    if grep -q "\"gh-pages\"" package.json; then
        echo -e "${GREEN}✓${NC} gh-pages package installed"
    else
        echo -e "${YELLOW}⚠${NC} gh-pages package not found"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}✗${NC} package.json not found"
    ((ERRORS++))
fi
echo ""

# Check 4: .gitignore configuration
echo "Checking .gitignore..."
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✓${NC} .gitignore found"
    
    if grep -q "*.local" .gitignore || grep -q ".env" .gitignore; then
        echo -e "${GREEN}✓${NC} Environment files excluded"
    else
        echo -e "${YELLOW}⚠${NC} .env files might not be excluded"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}✗${NC} .gitignore not found"
    ((ERRORS++))
fi
echo ""

# Check 5: .env.local exists (for local dev)
echo "Checking environment setup..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local found (for local development)"
    
    if grep -q "VITE_GEMINI_API_KEY" .env.local; then
        if grep -q "VITE_GEMINI_API_KEY=your" .env.local; then
            echo -e "${YELLOW}⚠${NC} API key appears to be placeholder"
            ((WARNINGS++))
        else
            echo -e "${GREEN}✓${NC} API key configured"
        fi
    else
        echo -e "${YELLOW}⚠${NC} VITE_GEMINI_API_KEY not found in .env.local"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} .env.local not found (create from .env.example)"
    ((WARNINGS++))
fi
echo ""

# Check 6: .env.example exists
echo "Checking .env.example template..."
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✓${NC} .env.example template found"
else
    echo -e "${YELLOW}⚠${NC} .env.example not found"
    ((WARNINGS++))
fi
echo ""

# Check 7: Deployment documentation
echo "Checking documentation..."
DOCS=("QUICK_DEPLOY.md" "DEPLOYMENT_GUIDE.md" "DEPLOYMENT_CHECKLIST.md" "GITHUB_PAGES_READY.md")
DOC_COUNT=0
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        ((DOC_COUNT++))
    fi
done
echo -e "${GREEN}✓${NC} Found ${DOC_COUNT}/${#DOCS[@]} deployment guides"
echo ""

# Check 8: Build scripts
echo "Checking build scripts..."
if [ -f "scripts/create-nojekyll.js" ]; then
    echo -e "${GREEN}✓${NC} .nojekyll creation script found"
else
    echo -e "${YELLOW}⚠${NC} .nojekyll script not found"
    ((WARNINGS++))
fi

if [ -f "scripts/deploy.sh" ]; then
    echo -e "${GREEN}✓${NC} Deployment script found"
    if [ -x "scripts/deploy.sh" ]; then
        echo -e "${GREEN}✓${NC} Deployment script is executable"
    else
        echo -e "${YELLOW}⚠${NC} Deployment script not executable (run: chmod +x scripts/deploy.sh)"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} Deployment script not found"
    ((WARNINGS++))
fi
echo ""

# Check 9: Git repository
echo "Checking Git configuration..."
if [ -d ".git" ]; then
    echo -e "${GREEN}✓${NC} Git repository initialized"
    
    if git remote | grep -q origin; then
        REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "none")
        echo -e "${GREEN}✓${NC} Git remote configured: ${REMOTE_URL}"
    else
        echo -e "${YELLOW}⚠${NC} No 'origin' remote configured"
        echo "  Run: git remote add origin https://github.com/YOUR_USERNAME/learnonauts.git"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} Not a Git repository (run: git init)"
    ((WARNINGS++))
fi
echo ""

# Check 10: Node modules
echo "Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Dependencies not installed (run: npm install)"
    ((WARNINGS++))
fi
echo ""

# Check 11: Try to build
echo "Testing production build..."
if command -v npm &> /dev/null; then
    echo "Running: npm run build"
    if npm run build > /tmp/learnonauts-build.log 2>&1; then
        echo -e "${GREEN}✓${NC} Build successful!"
        
        if [ -d "dist" ]; then
            echo -e "${GREEN}✓${NC} dist/ directory created"
            
            if [ -f "dist/.nojekyll" ]; then
                echo -e "${GREEN}✓${NC} .nojekyll file created"
            else
                echo -e "${YELLOW}⚠${NC} .nojekyll file missing in dist/"
                ((WARNINGS++))
            fi
        fi
    else
        echo -e "${RED}✗${NC} Build failed - check /tmp/learnonauts-build.log for details"
        echo "Last 10 lines of build log:"
        tail -10 /tmp/learnonauts-build.log
        ((ERRORS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} npm not found - cannot test build"
    ((WARNINGS++))
fi
echo ""

# Summary
echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 Perfect! Your project is ready for GitHub Pages deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Add your repository on GitHub"
    echo "2. Add VITE_GEMINI_API_KEY secret in GitHub Settings"
    echo "3. Enable GitHub Pages (Source: GitHub Actions)"
    echo "4. Push to deploy: git push"
    echo ""
    echo "See QUICK_DEPLOY.md for detailed instructions."
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ ${WARNINGS} warning(s) found - review above and fix if needed${NC}"
    echo ""
    echo "Your project should still deploy, but some features might not work perfectly."
else
    echo -e "${RED}✗ ${ERRORS} error(s) and ${WARNINGS} warning(s) found${NC}"
    echo ""
    echo "Please fix the errors above before deploying."
fi

echo ""
echo "For help, see:"
echo "- QUICK_DEPLOY.md"
echo "- DEPLOYMENT_GUIDE.md"
echo "- DEPLOYMENT_CHECKLIST.md"
echo ""

exit $ERRORS
