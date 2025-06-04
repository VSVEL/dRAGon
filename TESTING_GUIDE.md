# Authentication Flow Testing Guide

## Pre-Testing Setup

1. **Environment Variables Check**
   - [ ] `GOOGLE_CLIENT_ID` is set
   - [ ] `GOOGLE_CLIENT_SECRET` is set
   - [ ] `NEXTAUTH_SECRET` is set (generate with `openssl rand -base64 32`)
   - [ ] `GROQ_API_KEY` is set

2. **Google Cloud Console Setup**
   - [ ] Gmail API is enabled
   - [ ] Calendar API is enabled
   - [ ] OAuth consent screen is configured
   - [ ] Authorized redirect URIs include your domain + `/api/auth/callback/google`

## Testing Steps

### 1. Basic Authentication Flow

1. **Visit the test page**: `/test-auth`
2. **Check initial state**: Should show "unauthenticated" status
3. **Click "Sign In with Google"**: Should redirect to Google OAuth
4. **Grant permissions**: Accept all requested scopes
5. **Verify redirect**: Should return to your app with "authenticated" status

### 2. Session Verification

- [ ] User info displays correctly (name, email)
- [ ] Access token is present
- [ ] Refresh token is present (if offline access granted)
- [ ] No session errors

### 3. API Integration Tests

Click "Test APIs" button and verify:

- [ ] **Calendar API**: Returns 200 status and event data
- [ ] **Gmail API**: Returns 200 status and email data  
- [ ] **Chat API**: Returns 200 status (streaming response)

### 4. Error Handling Tests

1. **Test with invalid token**:
   - Manually expire session or revoke permissions in Google account
   - Verify proper error handling and redirect to sign-in

2. **Test permission denial**:
   - Sign out and try signing in again
   - Deny some permissions during OAuth flow
   - Verify error page shows appropriate message

3. **Test API failures**:
   - Temporarily disable APIs in Google Cloud Console
   - Verify graceful error handling in API responses

### 5. Navigation Tests

- [ ] Sign out redirects to sign-in page
- [ ] Protected routes redirect unauthenticated users
- [ ] Callback URLs work correctly after sign-in

## Debugging Tools

### Development Debug Panel
- Located in bottom-right corner (development only)
- Shows real-time session status
- Quick access to test page

### Browser Developer Tools
- Check Network tab for API calls
- Look for 401/403 errors indicating auth issues
- Verify cookies are being set correctly

### Server Logs
- Check console for detailed API logs
- Look for authentication callback logs
- Monitor for any error messages

## Common Issues and Solutions

### "Unknown error" on auth
- Check environment variables are set correctly
- Verify Google Cloud Console configuration
- Check redirect URIs match exactly

### API 401/403 errors
- Verify scopes are granted during OAuth
- Check access token is being passed correctly
- Ensure APIs are enabled in Google Cloud Console

### Session not persisting
- Check NEXTAUTH_SECRET is set
- Verify cookies are being set (check browser dev tools)
- Check for HTTPS requirements in production

## Success Criteria

✅ **Authentication Flow Complete** when:
- User can sign in with Google successfully
- Session persists across page refreshes
- All API tests pass with 200 status codes
- User can sign out and sign back in
- Error handling works for various failure scenarios
