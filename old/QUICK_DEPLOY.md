# 🚀 Quick Deployment to GitHub Pages

## One-Command Setup

If you're ready to deploy immediately, follow these steps:

### 1. Set Your Repository Name

Make sure the `base` path in `vite.config.ts` matches your repository name:

```typescript
// If your repo is: https://github.com/username/my-app
// Then base should be:
base: '/my-app/',

// Current setting:
base: '/learnonauts/',
```

### 2. Create GitHub Repository

```bash
# On GitHub, create a new repository named 'learnonauts' (or your preferred name)
# Then run:

git remote add origin https://github.com/YOUR_USERNAME/learnonauts.git
git branch -M main
git push -u origin main
```

### 3. Add API Key Secret

1. Go to: `https://github.com/YOUR_USERNAME/learnonauts/settings/secrets/actions`
2. Click **New repository secret**
3. Name: `VITE_GEMINI_API_KEY`
4. Value: Your Gemini API key
5. Click **Add secret**

### 4. Enable GitHub Pages

1. Go to: `https://github.com/YOUR_USERNAME/learnonauts/settings/pages`
2. Under **Source**, select: **GitHub Actions**
3. Save

### 5. Deploy!

**Option A: Automatic (Recommended)**
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push
```
→ GitHub Actions will automatically build and deploy

**Option B: Using the deployment script**
```bash
./scripts/deploy.sh
```
→ Interactive deployment with safety checks

**Option C: Manual gh-pages**
```bash
npm run deploy
```
→ Direct deployment using gh-pages package

## 🎯 Your Live URL

After deployment (2-3 minutes), visit:
```
https://YOUR_USERNAME.github.io/learnonauts/
```

## ✅ Verification

1. Check deployment status: `https://github.com/YOUR_USERNAME/learnonauts/actions`
2. View your site: `https://YOUR_USERNAME.github.io/learnonauts/`
3. Test the chatbot to verify API key is working

## 📖 Full Documentation

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete instructions, troubleshooting, and best practices.

## 🔧 Important Notes

- **Repository must be public** for free GitHub Pages hosting
- **API key** must be added as a GitHub secret (not committed to code)
- **Base path** in vite.config.ts must match repository name
- **First deployment** may take up to 5 minutes

## 🆘 Need Help?

Common issues and solutions:

| Problem | Solution |
|---------|----------|
| Blank page | Check `base` path in `vite.config.ts` |
| 404 errors | Verify repository name matches base path |
| Chatbot not working | Add `VITE_GEMINI_API_KEY` secret |
| Build fails | Run `npm run build` locally to see errors |

---

Ready to deploy? Follow the steps above! 🚀
