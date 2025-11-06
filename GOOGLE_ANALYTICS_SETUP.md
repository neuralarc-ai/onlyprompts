# Google Analytics Setup Guide

## Overview
Google Analytics has been integrated into the project to track user visits and interactions.

## Setup Instructions

### Step 1: Get Your Google Analytics Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in or create an account
3. Create a new property (GA4) if you don't have one
4. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

### Step 2: Configure Environment Variable

Create a `.env.local` file in the root directory (`nanob/`) with the following content:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

**Important:** 
- `.env.local` is already in `.gitignore` and won't be committed to version control
- Never commit your actual Measurement ID to the repository
- Restart your development server after creating/updating `.env.local`

### Step 3: Verify the Integration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Visit your site in a browser

3. Open browser DevTools → Network tab and look for requests to:
   - `googletagmanager.com`
   - `google-analytics.com`

4. In Google Analytics, go to **Realtime → Overview** to see live visitors

## Files Added

- `src/components/GoogleAnalytics.tsx` - Main GA component
- `src/utils/analytics.ts` - Utility functions for tracking events
- `src/types/gtag.d.ts` - TypeScript type definitions
- `src/app/layout.tsx` - Updated to include GoogleAnalytics component

## Usage

### Automatic Page Tracking
Page views are automatically tracked when users navigate through your site.

### Custom Event Tracking

You can track custom events using the utility functions:

```typescript
import { event } from '@/utils/analytics';

// Track a button click
event({
  action: 'click',
  category: 'Button',
  label: 'Submit Prompt',
});
```

### Manual Page View Tracking

If needed, you can manually track page views:

```typescript
import { pageview } from '@/utils/analytics';

pageview('/custom-page');
```

## How It Works

- The Google Analytics script loads in the root layout using Next.js `Script` component
- Uses `afterInteractive` strategy for optimal performance
- Only loads if `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
- Works in both development and production environments

## Troubleshooting

- **No data in Google Analytics?**
  - Verify your Measurement ID is correct
  - Check that `.env.local` exists and has the correct variable name
  - Restart your dev server after adding/updating `.env.local`
  - Check browser console for any errors

- **Development vs Production**
  - Make sure to set the environment variable in your production environment (Vercel, Netlify, etc.)
  - For Vercel: Add it in Project Settings → Environment Variables

