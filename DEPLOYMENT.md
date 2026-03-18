# Deployment Guide: FinSight

This guide explains how to deploy FinSight as a live portfolio project on **Render** (Backend) and **Vercel** (Frontend).

## 1. Backend Deployment (Render)
1. **Create a Web Service** on Render and connect your GitHub repository.
2. **Environment Variables**: Add the following in the Render Dashboard under 'Environment':
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `JWT_SECRET`: A long random string for securing sessions.
   - `DATABASE_URL`: Your PostgreSQL connection string (if using Render Postgres).
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`

## 2. Database (PostgreSQL)
- FinSight is configured to automatically switch to PostgreSQL if a `DATABASE_URL` exists.
- On Render, you can create a "New PostgreSQL" instance. Copy the Internal Database URL and paste it into your Web Service's `DATABASE_URL` environment variable.

## 3. Frontend Deployment (Vercel)
1. **Create a Project** on Vercel and connect your GitHub repository.
2. **Framework Preset**: Other (or Static).
3. **Environment (Optional)**: If you change your Render URL, update `services/api.js` in your code and push:
   ```javascript
   const API_BASE_URL = 'https://your-render-app-name.onrender.com';
   ```
4. Vercel will automatically detect `vercel.json` and handle routing for you.

## 🏁 Post-Deployment Check
1. Visit your Vercel URL.
2. Login with `admin@finsight.io` / `admin123`.
3. Upload a document and verify the Gemini AI extracts real data!
