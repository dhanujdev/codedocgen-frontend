# Frontend Deployment Instructions

## Environment Variable Setup

For the frontend to properly connect to the backend, you need to set the following environment variable in Vercel:

```
REACT_APP_API_URL=https://codedocgen-backend.onrender.com/api
```

## Steps to Update Vercel Deployment

1. Go to your project on the Vercel dashboard
2. Click on "Settings"
3. Navigate to the "Environment Variables" section
4. Add a new environment variable:
   - Name: `REACT_APP_API_URL`
   - Value: `https://codedocgen-backend.onrender.com/api`
5. Click "Save"
6. Redeploy your application by going to "Deployments" and clicking "Redeploy"

## Local Testing

For local testing, create a `.env` file in the root of the frontend project with:

```
REACT_APP_API_URL=https://codedocgen-backend.onrender.com/api
```

If you run `npm start`, the React app will pick up this environment variable.

## Current Issues Fixed

1. The `RepoInputForm.js` was using a different environment variable name (`REACT_APP_API_BASE_URL`) than what was set up in `api.js` (`REACT_APP_API_URL`).
2. The API paths in `RepoInputForm.js` were using `/api/repo/...` instead of just `/repo/...` because the environment variable already includes `/api`.

These issues have been fixed in the latest code. After deploying with the correct environment variable, the frontend should properly connect to the backend. 