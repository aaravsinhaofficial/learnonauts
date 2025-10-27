# Learnonauts - GitHub Pages Deployment Guide

## 🚀 Deployment Setup

This guide will help you deploy the Learnonauts application to GitHub Pages with automated CI/CD using GitHub Actions.

## Prerequisites

- A GitHub account
- Git installed on your local machine
- Node.js 18+ installed
- Your Gemini API key

## Step 1: Repository Setup

### If you haven't created a repository yet:

1. Create a new repository on GitHub:
   - Go to [GitHub](https://github.com/new)
   - Name it `learnonauts` (or your preferred name)
   - **Important:** Make it public (GitHub Pages free hosting requires public repos)
   - Don't initialize with README (we already have one)

2. Initialize Git and push to GitHub:
   ```bash
   cd /Users/aaravsinha/learnonaut
   git init
   git add .
   git commit -m "Initial commit - Learnonauts AI Learning Platform"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/learnonauts.git
   git push -u origin main
   ```

### If you already have a repository:

```bash
git add .
git commit -m "Add GitHub Pages deployment configuration"
git push
```

## Step 2: Configure Secrets

Your application uses the Gemini API for the AI chatbot. You need to add your API key as a secret:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:
   - **Name:** `VITE_GEMINI_API_KEY`
   - **Value:** Your Gemini API key (from your `.env.local` file)
5. Click **Add secret**

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Save the configuration

## Step 4: Deploy

### Automatic Deployment (Recommended)

Once you've completed the above steps, deployment happens automatically:

1. Every time you push to the `main` branch, GitHub Actions will:
   - Install dependencies
   - Build the project
   - Deploy to GitHub Pages

2. You can monitor the deployment:
   - Go to the **Actions** tab in your repository
   - Click on the latest workflow run to see progress

### Manual Deployment

You can also trigger deployment manually:

1. Go to **Actions** tab
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**

### Local Deployment (Alternative)

If you prefer using the `gh-pages` package locally:

```bash
npm run deploy
```

This will build and deploy directly from your machine.

## Step 5: Access Your App

After successful deployment:

1. Go to **Settings** → **Pages**
2. You'll see: "Your site is live at https://YOUR_USERNAME.github.io/learnonauts/"
3. Click the link or wait a few minutes for DNS propagation

## 📁 Project Configuration

### Vite Configuration

The `vite.config.ts` is already configured with the correct base path:

```typescript
export default defineConfig({
  base: '/learnonauts/', // Matches your repository name
  plugins: [react()],
})
```

**Important:** If your repository name is different from "learnonauts", update this base path!

### Build Scripts

The `package.json` includes these deployment scripts:

```json
{
  "scripts": {
    "prebuild": "node scripts/sync-images.mjs && node scripts/generate-sample-manifest.mjs",
    "build": "tsc -b && vite build && node scripts/create-nojekyll.js",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

## 🔧 Troubleshooting

### Problem: Blank page after deployment

**Solution:** Check that the `base` in `vite.config.ts` matches your repository name:
- Repository: `https://github.com/username/my-repo`
- Base should be: `/my-repo/`

### Problem: 404 errors for assets

**Solution:** This is usually caused by incorrect base path. Verify:
1. `vite.config.ts` has correct `base` property
2. Repository name matches the base path
3. Rebuild and redeploy

### Problem: API key not working

**Solution:** 
1. Verify you added the `VITE_GEMINI_API_KEY` secret in GitHub
2. The secret name must match exactly (case-sensitive)
3. Re-run the workflow after adding the secret

### Problem: Workflow fails

**Solution:**
1. Check the Actions tab for error details
2. Common issues:
   - Missing secret (VITE_GEMINI_API_KEY)
   - Node version mismatch
   - Build errors (test locally first: `npm run build`)

### Problem: Changes not showing up

**Solution:**
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Wait a few minutes for GitHub Pages to update
3. Check if the workflow completed successfully

## 🔐 Security Notes

### Environment Variables

- **Never** commit `.env.local` or `.env` files
- Always use GitHub Secrets for sensitive data
- The `.gitignore` is configured to exclude these files

### API Key Protection

While the Gemini API key is embedded in the build:
- Use API key restrictions in Google Cloud Console
- Limit to your domain: `https://YOUR_USERNAME.github.io`
- Set usage quotas to prevent abuse
- Consider using a separate API key for production

## 📊 Monitoring Deployments

### View Deployment Status

1. **Actions Tab:** See all workflow runs and their status
2. **Environments:** Check deployment history under **Settings** → **Environments** → **github-pages**
3. **Commit Status:** Green checkmark on commits = successful deployment

### Deployment URL

Your app will be available at:
```
https://YOUR_USERNAME.github.io/learnonauts/
```

Replace `YOUR_USERNAME` with your GitHub username.

## 🔄 Update Workflow

The GitHub Actions workflow (`.github/workflows/deploy.yml`) includes:

- ✅ Automatic deployment on push to main
- ✅ Manual trigger support
- ✅ Environment variable injection
- ✅ Proper permissions
- ✅ Concurrent deployment handling
- ✅ Latest GitHub Actions versions

## 🎯 Best Practices

1. **Test Locally First**
   ```bash
   npm run build
   npm run preview
   ```
   Visit `http://localhost:4173` to test the production build

2. **Use Feature Branches**
   ```bash
   git checkout -b feature/new-module
   # Make changes
   git commit -m "Add new module"
   git push origin feature/new-module
   # Create PR on GitHub, then merge to main
   ```

3. **Review Workflow Logs**
   - Always check the Actions tab after pushing
   - Review build output for warnings
   - Monitor deployment success

4. **Keep Dependencies Updated**
   ```bash
   npm update
   npm audit fix
   ```

## 🚢 Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `public/` folder with your domain:
   ```
   www.learnonauts.com
   ```

2. Configure DNS with your domain provider:
   - Add a CNAME record pointing to `YOUR_USERNAME.github.io`

3. Enable HTTPS in GitHub Pages settings

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## ✅ Deployment Checklist

Before deploying, ensure:

- [ ] Repository is created on GitHub
- [ ] `VITE_GEMINI_API_KEY` secret is added
- [ ] GitHub Pages is enabled (Source: GitHub Actions)
- [ ] `vite.config.ts` base path matches repository name
- [ ] Local build succeeds (`npm run build`)
- [ ] `.env.local` is in `.gitignore`
- [ ] All changes are committed and pushed

## 🎉 Success!

Once deployed, your Learnonauts AI Learning Platform will be live and accessible to students worldwide! The app includes:

- ✨ Interactive AI learning modules
- 🤖 Context-aware AI chatbot
- ♿ Accessibility features
- 🎮 Engaging games and activities
- 📊 Progress tracking
- 🧠 AI training lab

Happy teaching! 🚀
