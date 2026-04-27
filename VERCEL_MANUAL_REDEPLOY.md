# Vercel Manual Redeploy Instructions

## Issue
Vercel is still building from commit `033d742` (old) instead of `6bf3171` (new with fixes).

## Why This Happens
- GitHub webhook delay
- Vercel deployment cache
- Deployment was triggered before the push completed

## Solution: Trigger Manual Redeploy

### Option 1: Redeploy from Vercel Dashboard (RECOMMENDED)

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project (ggecl-lms)
3. Go to the **Deployments** tab
4. Find the latest deployment (should show commit `6bf3171`)
5. If it doesn't exist, click **"Redeploy"** on any recent deployment
6. Or click the **"..."** menu → **"Redeploy"** → **"Use existing Build Cache: No"**

### Option 2: Force Push (Trigger New Deployment)

Make a small change to force a new deployment:

```bash
# Make a small change to trigger deployment
echo "" >> README.md
git add README.md
git commit -m "chore: trigger Vercel redeploy"
git push
```

### Option 3: Use Vercel CLI

If you have Vercel CLI installed:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Trigger deployment
vercel --prod
```

### Option 4: Check Vercel Git Integration

1. Go to Vercel Dashboard → Your Project → Settings → Git
2. Verify the repository is correctly connected
3. Check that the branch is set to `main`
4. Click **"Disconnect"** and **"Reconnect"** if needed

## Verification

After triggering a new deployment, verify:

1. **Commit Hash**: Should show `6bf3171` or later
2. **Build Command**: Should show `cd frontend && npm run build` in logs
3. **Install Command**: Should show `cd frontend && npm install` in logs
4. **Build Success**: Build should complete without errors

## Expected Build Output

When building from the correct commit, you should see:

```
Running "install" command: `cd frontend && npm install`...
✓ Dependencies installed

Running "build" command: `cd frontend && npm run build`...
✓ TypeScript compiled
✓ Vite build completed
✓ Output: frontend/dist
```

## If Still Failing

If the deployment still fails after using the correct commit:

1. **Check the full build logs** in Vercel dashboard
2. **Look for specific error messages** (not just "exited with 1")
3. **Verify environment variables** are set:
   - `VITE_API_URL` = `https://site--ggecl-lms-backend--j5c4srwzm2wk.code.run`

4. **Check Node.js version compatibility**:
   - Vercel uses Node 18+ by default
   - Our build works locally, so this should be fine

5. **Try the alternative approach**: Set Root Directory to `frontend` in Vercel settings

## Alternative: Configure Root Directory in Vercel

If the `vercel.json` approach continues to have issues:

1. Go to Vercel Dashboard → Project Settings → General
2. Scroll to **"Root Directory"**
3. Click **"Edit"**
4. Set to: `frontend`
5. Click **"Save"**
6. Trigger a new deployment

This tells Vercel to treat `frontend/` as the root, so it will:
- Run `npm install` in the frontend directory
- Run `npm run build` in the frontend directory
- Look for output in `dist` (relative to frontend)

## Current Status

- ✅ Local build works perfectly
- ✅ All TypeScript errors fixed
- ✅ Configuration files updated and pushed
- ⏳ Waiting for Vercel to deploy from correct commit
- ❌ Vercel is still using old commit `033d742`

## Next Action

**Manually trigger a redeploy** using Option 1 (Vercel Dashboard) or Option 2 (Force Push).
