# Google Maps API Key Troubleshooting Guide

## Current Issue

The application is showing `InvalidKeyMapError` because the Google Maps API key is either missing, invalid, or misconfigured.

## Step-by-Step Troubleshooting

### 1. Check if API Key is Loaded

Open your browser's developer console and look for debug messages like:

```
[DEBUG] GoogleMapsProvider: API Key status: { hasKey: true/false, keyLength: X, ... }
```

### 2. Create/Update `.env` file

Create a file named `.env` in the root directory with:

```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 3. Verify API Key in Google Cloud Console

#### A. Check API Key Exists

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Verify your API key exists and is active

#### B. Check Required APIs are Enabled

Go to "APIs & Services" > "Library" and enable:

- **Maps JavaScript API** (REQUIRED)
- **Places API** (if using places functionality)
- **Geocoding API** (if using geocoding functionality)

#### C. Check API Key Restrictions

1. Click on your API key in Credentials
2. **Application restrictions**:

   - For development: Select "HTTP referrers (web sites)"
   - Add: `localhost:*`, `127.0.0.1:*`, `http://localhost:*`
   - For production: Add your domain (e.g., `https://yourdomain.com/*`)

3. **API restrictions**:
   - Select "Restrict key"
   - Choose: Maps JavaScript API, Places API, Geocoding API

### 4. Common Issues & Solutions

#### Issue: "InvalidKeyMapError"

**Causes:**

- API key is undefined/empty
- API key is invalid/expired
- API key restrictions block your domain
- Required APIs not enabled

**Solutions:**

1. Verify API key is correctly set in `.env`
2. Check API key in Google Cloud Console
3. Ensure Maps JavaScript API is enabled
4. Check application restrictions allow your domain

#### Issue: "RefererNotAllowedMapError"

**Cause:** API key restrictions don't allow your current domain
**Solution:** Add your domain to HTTP referrers in Google Cloud Console

#### Issue: "RequestDeniedMapError"

**Cause:** API key doesn't have required permissions
**Solution:** Enable Maps JavaScript API in Google Cloud Console

### 5. Test Your API Key

#### Quick Test

Open this URL in your browser (replace `YOUR_API_KEY`):

```
https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=marker
```

If it loads without errors, your API key is working.

#### Debug in Console

Check the browser console for detailed error messages:

- `InvalidKeyMapError` = API key is wrong/missing
- `RefererNotAllowedMapError` = Domain restrictions
- `RequestDeniedMapError` = API not enabled

### 6. Restart Development Server

After making changes:

```bash
npm run dev
```

### 7. Verify Fix

Look for these success messages in console:

```
[DEBUG] GoogleMapsProvider: Google Maps fully loaded
[DEBUG] GoogleMapsProvider: Script loaded successfully
```

## Debug Information

The application now includes detailed debugging that will show:

- Whether API key is loaded
- Key length and prefix (for security)
- Specific error messages
- Troubleshooting suggestions
