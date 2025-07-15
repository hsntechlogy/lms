# LMS Deployment Guide - CORS Fix

## Overview
This guide provides a complete solution for fixing CORS (Cross-Origin Resource Sharing) issues in your LMS application.

## Issues Fixed
1. **CORS Policy Blocking**: Frontend requests to backend were being blocked
2. **Double Slash in URLs**: URLs had double slashes causing 404 errors
3. **Preflight Request Failures**: OPTIONS requests were not being handled properly
4. **Missing CORS Headers**: Proper headers were not being sent

## Changes Made

### 1. Backend CORS Configuration (`server/server.js`)
- Added comprehensive CORS configuration with proper origins
- Added preflight request handling
- Added additional CORS headers middleware
- Made origins configurable via environment variables

### 2. Frontend URL Construction (`vite-project/src/context/AppContextProvider.jsx`)
- Fixed double slash issue in URL construction
- Added proper URL concatenation logic
- Updated all API calls to use correct URL format

### 3. Environment Configuration
- Created `server/env.example` with all required backend variables
- Created `vite-project/env.example` with frontend configuration

## Deployment Steps

### Backend Deployment (Vercel)

1. **Set Environment Variables in Vercel Dashboard:**
   ```
   MONGODB_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ALLOWED_ORIGINS=https://lms-frontend-git-main-hsntechlogys-projects.vercel.app,https://lms-frontend-hsntechlogys-projects.vercel.app,http://localhost:5173,http://localhost:3000
   ```

2. **Deploy Backend:**
   ```bash
   cd server
   vercel --prod
   ```

### Frontend Deployment (Vercel)

1. **Set Environment Variables in Vercel Dashboard:**
   ```
   VITE_BACKEND_URL=https://lms-backend-git-main-hsntechlogys-projects.vercel.app
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_CURRENCY=USD
   ```

2. **Deploy Frontend:**
   ```bash
   cd vite-project
   vercel --prod
   ```

## Environment Files

### Backend (`server/.env`)
```env
MONGODB_URI=your_mongodb_connection_string_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://lms-frontend-git-main-hsntechlogys-projects.vercel.app,https://lms-frontend-hsntechlogys-projects.vercel.app,http://localhost:5173,http://localhost:3000
```

### Frontend (`vite-project/.env`)
```env
VITE_BACKEND_URL=https://lms-backend-git-main-hsntechlogys-projects.vercel.app
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
VITE_CURRENCY=USD
VITE_NODE_ENV=production
```

## Testing the Fix

1. **Check Backend Health:**
   ```bash
   curl https://lms-backend-git-main-hsntechlogys-projects.vercel.app/
   ```
   Should return: "Api working"

2. **Test CORS with Browser:**
   - Open browser developer tools
   - Navigate to your frontend URL
   - Check Network tab for any CORS errors
   - All API calls should now work without CORS issues

3. **Verify API Endpoints:**
   ```bash
   curl -H "Origin: https://lms-frontend-git-main-hsntechlogys-projects.vercel.app" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://lms-backend-git-main-hsntechlogys-projects.vercel.app/api/course/all
   ```

## Common Issues and Solutions

### Issue: Still getting CORS errors
**Solution:** 
1. Check that environment variables are set correctly in Vercel
2. Redeploy both frontend and backend
3. Clear browser cache and hard refresh

### Issue: Double slash in URLs
**Solution:** 
- The URL construction logic has been fixed in `AppContextProvider.jsx`
- URLs will now be properly formatted

### Issue: Preflight requests failing
**Solution:**
- Added proper OPTIONS handling in server.js
- Added additional CORS headers middleware

## Security Notes

1. **CORS Origins**: Only allow specific domains, not wildcards
2. **Environment Variables**: Never commit real API keys to version control
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Consider adding rate limiting for production

## Monitoring

After deployment, monitor:
1. Network requests in browser developer tools
2. Backend logs in Vercel dashboard
3. Frontend console for any remaining errors
4. API response times and success rates

## Support

If you continue to experience issues:
1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Test API endpoints directly with curl or Postman
4. Check browser console for specific error messages 