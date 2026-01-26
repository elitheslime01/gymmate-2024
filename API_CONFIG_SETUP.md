# API Configuration Setup Guide

## Overview
Your frontend is now configured to use environment variables for the API base URL instead of hardcoded localhost URLs. This allows seamless switching between development and production environments.

## Files Created/Modified

1. **frontend/src/config.js** - New file that exports API_BASE_URL
2. **.env.local** - Development environment variables (localhost:5000)
3. **.env.production** - Production environment variables (for Vercel)
4. **All store files** - Updated to use `API_BASE_URL` instead of hardcoded URLs

## How It Works

- **Development**: When you run `npm run dev`, Vite loads `.env.local` and sets `VITE_API_URL=http://localhost:5000`
- **Production**: When you deploy to Vercel, it loads `.env.production` and uses your backend URL

## Setup for Vercel Deployment

### Step 1: Get Your Backend URL
- Deploy your backend to a platform (Heroku, Railway, AWS, Render, etc.)
- Note the deployed URL (e.g., `https://gymmate-api.railway.app`)

### Step 2: Update .env.production
Replace the placeholder in `frontend/.env.production`:
```env
VITE_API_URL=https://your-actual-backend-url.com
```

### Step 3: Configure Vercel Environment Variables (IMPORTANT)
1. Go to your Vercel project settings
2. Navigate to **Settings → Environment Variables**
3. Add:
   - Name: `VITE_API_URL`
   - Value: `https://your-actual-backend-url.com`
4. Save

### Step 4: Verify Backend CORS
Ensure your backend (server.js) has CORS enabled for your Vercel domain:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-vercel-domain.vercel.app'],
  credentials: true
}));
```

## Environment Variables Reference

| Variable | Development | Production |
|----------|-------------|-----------|
| VITE_API_URL | http://localhost:5000 | https://your-backend-url |
| File | .env.local | .env.production |

## Testing Locally

1. Make sure your backend is running: `npm run dev` (in backend directory)
2. Start frontend: `npm run dev` (in frontend directory)
3. You should see requests to `http://localhost:5000`

## Common Issues

**Issue**: "Failed to load resource: net::ERR_CONNECTION_REFUSED"
- **Cause**: Backend is not running or URL is wrong
- **Solution**: 
  1. Verify backend is running locally
  2. Check .env.local has correct URL
  3. Restart frontend development server

**Issue**: CORS errors in production
- **Cause**: Backend CORS not configured for your Vercel domain
- **Solution**: Update backend CORS origins to include your Vercel domain

**Issue**: 404 errors on API calls in production
- **Cause**: Environment variable not set in Vercel
- **Solution**: Add `VITE_API_URL` to Vercel project settings

## Next Steps

1. Deploy your backend to a production platform
2. Get the deployed backend URL
3. Update `VITE_API_URL` in `.env.production`
4. Add `VITE_API_URL` to Vercel environment variables
5. Redeploy your frontend to Vercel

Your app will now seamlessly switch between local and production backends!
