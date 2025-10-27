# GitHub Pages Deployment Checklist

Use this checklist before deploying to GitHub Pages to ensure everything is configured correctly.

## ☑️ Pre-Deployment Checklist

### 📦 Repository Setup
- [ ] Created GitHub repository
- [ ] Repository is **public** (required for free GitHub Pages)
- [ ] Added remote: `git remote add origin https://github.com/YOUR_USERNAME/learnonauts.git`
- [ ] Pushed code to main branch

### ⚙️ Configuration
- [ ] Verified `vite.config.ts` base path matches repository name
  ```typescript
  // If repo is https://github.com/username/learnonauts
  base: '/learnonauts/'
  ```
- [ ] Checked `.gitignore` includes `.env.local` (should already be there)
- [ ] Verified `package.json` has deployment scripts

### 🔐 Secrets & Environment
- [ ] Added `VITE_GEMINI_API_KEY` secret in GitHub repository settings
  - Location: Settings → Secrets and variables → Actions → New repository secret
  - Name must be exactly: `VITE_GEMINI_API_KEY`
  - Value: Your Gemini API key
- [ ] `.env.local` file is NOT committed to repository
- [ ] Tested that `.env.local` is gitignored: `git status` should not show it

### 🌐 GitHub Pages Settings
- [ ] Enabled GitHub Pages in repository settings
  - Location: Settings → Pages
  - Source: **GitHub Actions**
  - NOT "Deploy from a branch"

### 🔨 Build Test
- [ ] Tested build locally: `npm run build`
- [ ] Build completes without errors
- [ ] Tested production preview: `npm run preview`
- [ ] App works correctly at `http://localhost:4173`

### 🤖 Workflow Verification
- [ ] `.github/workflows/deploy.yml` exists
- [ ] Workflow has correct permissions
- [ ] Workflow includes `VITE_GEMINI_API_KEY` in build step

### 🎨 Content Verification
- [ ] All images are in `public/Images/` directory
- [ ] Sample data files are generated (automatic via `prebuild` script)
- [ ] No broken links or missing assets

## 🚀 Deployment Methods

Choose one:

### Method 1: Automatic (Recommended)
```bash
git add .
git commit -m "Deploy Learnonauts to GitHub Pages"
git push
```
✅ Triggers GitHub Actions automatically

### Method 2: Deployment Script
```bash
./scripts/deploy.sh
```
✅ Interactive with safety checks

### Method 3: Manual gh-pages
```bash
npm run deploy
```
✅ Direct deployment from local machine

## ✅ Post-Deployment Verification

After deployment completes:

### 1. Check Workflow Status
- [ ] Go to: `https://github.com/YOUR_USERNAME/learnonauts/actions`
- [ ] Latest workflow run is green (✓)
- [ ] No errors in build logs

### 2. Access Your Site
- [ ] Visit: `https://YOUR_USERNAME.github.io/learnonauts/`
- [ ] Page loads without 404 error
- [ ] No blank white page
- [ ] Assets and images load correctly

### 3. Test Core Features
- [ ] Welcome screen displays correctly
- [ ] Navigation works (click through modules)
- [ ] Chatbot opens (click 💬 button)
- [ ] Chatbot responds (test the AI Helper)
- [ ] Images load in games
- [ ] AI Training Lab works

### 4. Test on Multiple Devices
- [ ] Desktop browser
- [ ] Mobile browser
- [ ] Tablet (if available)

## 🐛 Troubleshooting

If something doesn't work:

### Blank Page
```bash
# Check vite.config.ts base path
# Should match repository name exactly
```

### 404 Errors
```bash
# Verify in vite.config.ts:
base: '/YOUR_REPO_NAME/'
# NOT '/YOUR_REPO_NAME' (missing trailing slash)
```

### Chatbot Not Responding
1. Check GitHub secret is added: `VITE_GEMINI_API_KEY`
2. Secret name is exact (case-sensitive)
3. Re-run workflow after adding secret

### Build Fails
```bash
# Test locally first:
npm run build

# Check the error message
# Fix issues locally, then commit and push
```

### Workflow Fails
1. Click on failed workflow in Actions tab
2. Expand the failed step
3. Read error message
4. Common issues:
   - Missing secret
   - Build errors
   - Permission issues (check workflow permissions)

## 📊 Monitoring

### View Deployment Status
- Actions tab: Real-time workflow progress
- Environments → github-pages: Deployment history
- Commit status: Green checkmark = success

### Deployment Logs
1. Go to Actions tab
2. Click on latest workflow run
3. Expand each step to see logs
4. Build step shows compilation output
5. Deploy step shows upload progress

## 🔄 Updating Your Site

After initial deployment, updates are automatic:

```bash
# Make changes to your code
git add .
git commit -m "Update: description of changes"
git push
```

GitHub Actions will automatically rebuild and redeploy (2-3 minutes).

## 🎯 Best Practices

### Before Each Deployment
1. Test locally: `npm run build && npm run preview`
2. Verify chatbot works with your API key
3. Check console for errors (F12 → Console)
4. Test on different screen sizes

### Version Control
```bash
# Use meaningful commit messages
git commit -m "Add: new AI module"
git commit -m "Fix: chatbot context bug"
git commit -m "Update: accessibility features"
```

### Code Quality
```bash
# Run linter before deploying
npm run lint

# Fix linting issues
npm run lint -- --fix
```

## 🎉 Success Indicators

You'll know deployment is successful when:

✅ Workflow completes with green checkmark
✅ Site loads at `https://YOUR_USERNAME.github.io/learnonauts/`
✅ No console errors (F12 → Console)
✅ Chatbot responds to questions
✅ All modules and games work
✅ Images display correctly
✅ Navigation functions properly

## 📝 Notes

- **First deployment** may take 5-10 minutes
- **Subsequent deployments** take 2-3 minutes
- **DNS propagation** can add 1-2 minutes
- **Browser cache** may show old version (hard refresh: Ctrl+Shift+R)

## 🆘 Get Help

If you encounter issues not covered here:

1. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Review workflow logs in Actions tab
3. Test build locally: `npm run build`
4. Check GitHub Pages status page
5. Verify all secrets are correctly added

---

**Ready to deploy?** Start with the Pre-Deployment Checklist above! ✨
