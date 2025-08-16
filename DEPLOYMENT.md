# 🚀 Deployment Guide for 8x Sports Backend

This guide will help you deploy your Node.js backend and connect it to your Vercel frontend.

## 📋 Prerequisites

- [Git](https://git-scm.com/) installed
- [Node.js](https://nodejs.org/) 18+ installed
- [pnpm](https://pnpm.io/) installed
- Your frontend already deployed on Vercel
- Your FastAPI services deployed (if you have them)

## 🎯 Option 1: Deploy to Render (Recommended - Free)

### Step 1: Prepare Your Repository
1. Make sure your backend code is pushed to GitHub
2. Ensure you have the `start` script in `package.json` ✅
3. Ensure you have `render.yaml` ✅

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select your `Server-backend` repository
5. Render will auto-detect the configuration from `render.yaml`
6. Click "Create Web Service"

### Step 3: Configure Environment Variables
In your Render dashboard, go to Environment → Environment Variables and add:

```env
FRONTEND_URL=https://your-frontend-domain.vercel.app
FASTAPI_YOLO_URL=http://your-fastapi-service.com/yolo
FASTAPI_DINO_URL=http://your-fastapi-service.com/dino
FASTAPI_FAISS_URL=http://your-fastapi-service.com/faiss
NODE_ENV=production
```

### Step 4: Deploy
1. Click "Deploy" 
2. Wait for the build to complete
3. Your backend will be available at: `https://your-service-name.onrender.com`

## 🎯 Option 2: Deploy to Railway

### Step 1: Prepare for Railway
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`

### Step 2: Deploy
```bash
cd Server-backend
railway init
railway up
```

### Step 3: Set Environment Variables
```bash
railway variables set FRONTEND_URL=https://your-frontend-domain.vercel.app
railway variables set FASTAPI_YOLO_URL=http://your-fastapi-service.com/yolo
railway variables set FASTAPI_DINO_URL=http://your-fastapi-service.com/dino
railway variables set FASTAPI_FAISS_URL=http://your-fastapi-service.com/faiss
railway variables set NODE_ENV=production
```

## 🎯 Option 3: Deploy to Heroku

### Step 1: Prepare for Heroku
1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Login: `heroku login`

### Step 2: Create App
```bash
cd Server-backend
heroku create your-app-name
```

### Step 3: Deploy
```bash
git add .
git commit -m "Prepare for deployment"
git push heroku main
```

### Step 4: Set Environment Variables
```bash
heroku config:set FRONTEND_URL=https://your-frontend-domain.vercel.app
heroku config:set FASTAPI_YOLO_URL=http://your-fastapi-service.com/yolo
heroku config:set FASTAPI_DINO_URL=http://your-fastapi-service.com/dino
heroku config:set FASTAPI_FAISS_URL=http://your-fastapi-service.com/faiss
heroku config:set NODE_ENV=production
```

## 🔗 Connect Frontend to Backend

### Step 1: Update Frontend Environment
In your Vercel frontend, add environment variables:

```env
VITE_API_BASE_URL=https://your-backend-url.com
```

### Step 2: Update Frontend API Calls
Update your frontend code to use the new backend URL:

```typescript
// In your frontend API calls, replace:
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Example usage:
const response = await fetch(`${API_BASE}/api/upload-image`, {
  method: 'POST',
  body: formData
});
```

### Step 3: Update CORS in Backend
Make sure your backend CORS settings allow your Vercel domain:

```javascript
app.use(cors({ 
  origin: process.env.FRONTEND_URL, 
  credentials: true 
}));
```

## 🧪 Test Your Deployment

### Test Backend Health
```bash
curl https://your-backend-url.com/api/test
```

Expected response:
```json
{
  "message": "Server is working!",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "endpoints": ["/api/upload-image", "/api/generate-jersey", "/api/test"]
}
```

### Test Frontend Connection
1. Go to your Vercel frontend
2. Try uploading an image
3. Check browser console for any CORS errors
4. Verify the request goes to your deployed backend

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure `FRONTEND_URL` is set correctly in backend
2. **Build Failures**: Check that all dependencies are in `package.json`
3. **Port Issues**: Backend should use `process.env.PORT`
4. **Environment Variables**: Double-check all variables are set in deployment platform

### Debug Steps:
1. Check deployment logs in your platform dashboard
2. Verify environment variables are set correctly
3. Test backend endpoints directly
4. Check frontend console for error messages

## 📱 Final Configuration

After successful deployment:

1. ✅ Backend is running on: `https://your-backend-url.com`
2. ✅ Frontend is connected to backend
3. ✅ CORS is properly configured
4. ✅ Environment variables are set
5. ✅ Health check endpoint is working

## 🎉 You're Done!

Your backend is now deployed and connected to your Vercel frontend! 

**Next Steps:**
- Test all functionality end-to-end
- Monitor your deployment for any issues
- Set up custom domain if needed
- Configure monitoring and logging

---

**Need Help?** Check the deployment platform's documentation or create an issue in your repository. 