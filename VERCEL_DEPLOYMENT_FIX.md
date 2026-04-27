# Vercel Deployment Fix

## Problem
The Vercel deployment was failing because:
1. The project has a monorepo structure with frontend code in the `frontend/` subdirectory
2. There were conflicting `vercel.json` files (one at root, one in frontend/)
3. Vercel was trying to build from the root directory without proper configuration

## Solution
1. **Removed** `frontend/vercel.json` to avoid configuration conflicts
2. **Updated** root-level `vercel.json` with proper monorepo configuration
3. Configured Vercel to change directory to `frontend/` before installing and building

## Files Changed
- **Updated**: `vercel.json` (root level)
- **Deleted**: `frontend/vercel.json` (to avoid conflicts)

## Configuration Details

The root `vercel.json` now contains:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "devCommand": "cd frontend && npm run dev",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Key Configuration Points:
- **installCommand**: Changes to frontend directory before installing dependencies
- **buildCommand**: Changes to frontend directory before building
- **outputDirectory**: Points to the build output in `frontend/dist`
- **rewrites**: Ensures all routes are handled by the SPA (Single Page Application)

## Environment Variables
Make sure these are set in your Vercel project settings:
- `VITE_API_URL` - Your backend API URL
  - Current value: `https://site--ggecl-lms-backend--j5c4srwzm2wk.code.run`

## Deployment Steps

### 1. Commit and Push Changes
```bash
git add vercel.json VERCEL_DEPLOYMENT_FIX.md
git add frontend/vercel.json  # This file was deleted
git commit -m "fix: Configure Vercel for monorepo structure and remove conflicting config"
git push
```

### 2. Verify Deployment
Vercel will automatically trigger a new deployment. Monitor it in the Vercel dashboard.

### 3. If Deployment Still Fails
Check the following in order:

#### A. Build Logs
- Go to Vercel Dashboard → Your Project → Deployments → Latest Deployment
- Click on "Build Logs" to see the full output
- Look for specific error messages

#### B. Environment Variables
- Go to Project Settings → Environment Variables
- Ensure `VITE_API_URL` is set for Production, Preview, and Development
- Value should be: `https://site--ggecl-lms-backend--j5c4srwzm2wk.code.run`

#### C. Node.js Version
- Vercel uses Node.js 18+ by default
- If needed, you can specify a version in `package.json`:
  ```json
  "engines": {
    "node": ">=18.0.0"
  }
  ```

#### D. TypeScript Compilation
- Ensure all TypeScript errors are fixed
- Test locally: `cd frontend && npm run build`
- All 86 previous TypeScript errors have been fixed

## Alternative: Configure Root Directory in Vercel Dashboard

Instead of using `vercel.json` at the root, you can configure this directly in Vercel:

1. Go to Project Settings → General
2. Set **Root Directory** to `frontend`
3. Leave other settings as default:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

**Note**: If you use this approach, you should remove the root-level `vercel.json` file.

## Troubleshooting Common Issues

### Issue: "Cannot find module" errors
**Solution**: Ensure all dependencies are in `frontend/package.json` and `npm install` runs successfully

### Issue: Build succeeds but site shows blank page
**Solution**: 
- Check browser console for errors
- Verify `VITE_API_URL` environment variable is set
- Ensure rewrites are configured correctly for SPA routing

### Issue: 404 errors on page refresh
**Solution**: The rewrites configuration in `vercel.json` should handle this. Ensure it's set to:
```json
"rewrites": [
  { "source": "/(.*)", "destination": "/index.html" }
]
```

### Issue: Build timeout
**Solution**: 
- Check for large dependencies
- Consider optimizing build process
- Upgrade Vercel plan if needed (free tier has 45-minute limit)

## Verification Checklist

Before deploying, verify:
- [ ] Root `vercel.json` exists with correct configuration
- [ ] `frontend/vercel.json` has been deleted
- [ ] All TypeScript errors are fixed (`npm run build` succeeds locally)
- [ ] Environment variables are set in Vercel dashboard
- [ ] Changes are committed and pushed to GitHub
- [ ] Vercel is connected to the correct GitHub repository and branch

## Success Indicators

A successful deployment should show:
1. ✅ Install command completes (dependencies installed)
2. ✅ Build command completes (TypeScript compiles, Vite builds)
3. ✅ Output directory found (`frontend/dist`)
4. ✅ Deployment URL is accessible
5. ✅ Application loads without errors
6. ✅ API calls work (check Network tab in browser DevTools)

## Next Steps After Successful Deployment

1. Test all major features:
   - Student dashboard
   - Instructor dashboard
   - Admin dashboard
   - Authentication flows
   - Live classes
   - Course enrollment

2. Monitor for errors:
   - Check Vercel logs for runtime errors
   - Monitor browser console for client-side errors
   - Test API connectivity

3. Set up custom domain (optional):
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed
