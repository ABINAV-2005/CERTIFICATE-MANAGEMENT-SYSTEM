# Deployment Guide

This project is set up for:
- Backend: Render Web Service
- Frontend: Vercel

## 1) Deploy Backend on Render

Create a new **Web Service** from your GitHub repo.

- Root Directory: `certificate-management-system/backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Set these environment variables in Render:

- `NODE_ENV=production`
- `MONGODB_URI=<your-mongodb-atlas-uri>`
- `JWT_SECRET=<long-random-secret>`
- `JWT_EXPIRE=7d`
- `FRONTEND_URL=https://<your-vercel-app>.vercel.app`

Optional (recommended when you use multiple frontend domains):
- `ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app,https://<preview-domain>.vercel.app`

After deploy, your backend URL will look like:
- `https://<your-render-service>.onrender.com`

## 2) Deploy Frontend on Vercel

Import the same GitHub repo in Vercel.

- Framework Preset: `Vite`
- Root Directory: `certificate-management-system/frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

Set frontend environment variables in Vercel:

- `VITE_API_URL=https://<your-render-service>.onrender.com/api`
- `VITE_SOCKET_URL=https://<your-render-service>.onrender.com`

This repo includes `frontend/vercel.json` for SPA route fallback.

## 3) Final Cross-Check

1. Open backend health URL:
   - `https://<your-render-service>.onrender.com/api/health`
2. Open frontend URL:
   - `https://<your-vercel-app>.vercel.app`
3. Login/register and verify API calls succeed from browser network tab.
