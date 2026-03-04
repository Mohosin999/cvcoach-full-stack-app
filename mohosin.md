# Google Cloud Console Setup

## 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Give it a name (e.g., "MyApp Auth") and create

## 2. Enable Google+ API (OAuth)

1. Go to **APIs & Services** → **Library**
2. Search for **Google+ API** or **Google Identity Services**
3. Click on it and click **Enable**

## 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (for production, use Internal for G Suite users)
3. Fill in the required fields:
   - **App name**: Your app name
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **Save and Continue**
5. Skip "Scopes" - click **Save and Continue**
6. Skip "Test users" - click **Save and Continue**
7. Click **Back to dashboard**

## 4. Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Fill in:
   - **Name**: Your app name
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173` (for Vite frontend)
     - `http://localhost:3000` (if using different port)
   - **Authorized redirect URIs**:
     - `http://localhost:5173/api/auth/google/callback`
     - `http://localhost:3000/api/auth/google/callback`
     - `https://your-production-domain/api/auth/google/callback`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

## 5. Configure Environment Variables

Add these to your backend `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5173/api/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:5173
```

## 6. Production Setup

When deploying to production:

1. Update **Authorized JavaScript origins** in Google Cloud Console:
   - `https://yourdomain.com`

2. Update **Authorized redirect URIs**:
   - `https://yourdomain.com/api/auth/google/callback`

3. Update `sameSite` in auth.ts if needed:
   ```typescript
   sameSite: 'none', // Required for cross-site cookies
   secure: true,     // Required for sameSite: 'none'
   ```

## Troubleshooting

- **Redirect URI mismatch error**: Check that the callback URL in Google Console matches exactly
- **Invalid client ID**: Verify the Client ID is correct
- **Session not persisting**: Ensure cookies are being set and sent correctly
