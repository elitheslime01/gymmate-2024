# Deploy to Vercel - Complete Guide

## What Was Set Up

✅ Created `/api/index.js` - Vercel serverless function that runs your Express backend
✅ Updated `vercel.json` - Config to deploy both backend and frontend
✅ Your backend routes are all at `/api/*`

## Deployment Steps

### **Step 1: Push to GitHub**
```bash
git add .
git commit -m "Setup Vercel backend deployment"
git push origin main
```

### **Step 2: Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Select your `gymmate-2024` repository
5. Click "Import"

### **Step 3: Configure Environment Variables**
In Vercel dashboard, go to **Settings → Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `MONGO_URI` | `mongodb+srv://ggymmate:fEsqEycMqsLIGFKf@cluster0.yzdnq.mongodb.net/gymmate2024?retryWrites=true&w=majority&appName=Cluster0` |
| `ALLOCATION_INTERVAL_TIME` | `0` |
| `NODE_ENV` | `production` |

**DO NOT commit .env file with secrets!** Use Vercel's environment variables instead.

### **Step 4: Deploy**
1. Click "Deploy"
2. Wait 2-3 minutes for deployment
3. You'll get a URL like: `https://gymmate-2024.vercel.app`

### **Step 5: Update Frontend .env.production**
In `frontend/.env.production`, update:
```env
VITE_API_URL=https://gymmate-2024.vercel.app
```

## After Deployment

### **Test Your Backend**
```
https://gymmate-2024.vercel.app/api/health
```
Should return: `{ "status": "Backend is running" }`

### **All Your API Routes Work**
- `https://gymmate-2024.vercel.app/api/admins/login`
- `https://gymmate-2024.vercel.app/api/schedules/...`
- `https://gymmate-2024.vercel.app/api/students/...`
- etc.

## What Happened?

Vercel converts your Express app into a **serverless function** that:
- Starts only when needed
- Scales automatically
- Costs very little (free tier available)
- Integrates perfectly with your frontend

## Troubleshooting

**Backend returns 404:**
- Check vercel.json routes are correct
- Ensure api/index.js exists
- Redeploy with `vercel --prod`

**Database connection fails:**
- Verify MONGO_URI in Vercel environment variables
- Check MongoDB whitelist includes Vercel IPs (usually 0.0.0.0/0)

**CORS errors:**
- Check `/api/index.js` has correct CORS origin

## Local Testing Before Deployment

Test locally first:
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` and test all features before deploying.

---

**Ready to deploy?** Push to GitHub and let me know if you hit any issues!
