# URL Shortener Web App

A complete React + TypeScript URL Shortener application built for Affordmed's frontend assessment.

## Features

- **URL Shortening**: Shorten up to 5 URLs concurrently with custom validity periods and shortcodes
- **Statistics Dashboard**: View detailed statistics and click tracking for all shortened URLs
- **Automatic Redirects**: Handle short URL redirects with proper error handling
- **Client-side Persistence**: All data stored in localStorage
- **Comprehensive Logging**: Integrated AffordLogger for all major user actions
- **Material UI**: Modern, responsive UI built with Material-UI components

## Tech Stack

- React 18 with TypeScript
- Material-UI (MUI) for styling
- React Router v6 for routing
- localStorage for data persistence
- Custom AffordLogger for logging

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view the app

## Project Structure

```
src/
├── App.tsx                 # Main app component with routing
├── index.tsx              # React app entry point
├── services.ts            # Data models and utility functions
├── logger/
│   └── AffordLogger.ts    # Custom logging middleware
└── pages/
    ├── ShortenerPage.tsx  # URL shortening interface
    ├── StatsPage.tsx      # Statistics dashboard
    └── RedirectHandler.tsx # Short URL redirect handler
```

## Features Overview

### URL Shortener Page (/)
- Input up to 5 URLs with optional validity periods and custom shortcodes
- Real-time validation for URLs, validity minutes, and shortcodes
- Automatic shortcode generation if not provided
- Copy-to-clipboard functionality for shortened URLs
- Comprehensive error handling and user feedback

### Statistics Page (/stats)
- View all shortened URLs with creation and expiry dates
- Click tracking with timestamps, referrers, and geolocation
- Expandable click details for each URL
- Summary statistics (total URLs, clicks, active URLs)

### Redirect Handler (/:shortcode)
- Automatic redirect to original URLs
- Expired link handling
- Not found error handling
- Click tracking with geolocation
- Proper logging of all redirect attempts

## Data Model

```typescript
type ClickRecord = {
  timestamp: string;
  referrer: string;
  geo?: string | null;
};

type ShortLink = {
  shortcode: string;
  longUrl: string;
  createdAt: string;
  expiryAt: string;
  clicks: ClickRecord[];
};
```

## Logging

The app uses the custom AffordLogger for all major user actions:
- URL shortening attempts and results
- Validation failures
- Click tracking
- Error handling
- Page navigation

All logs are stored in localStorage and can be viewed in the browser's developer console.

## Validation Rules

- **Long URL**: Must be a valid http:// or https:// URL
- **Validity Minutes**: Must be a positive integer (default: 30 minutes)
- **Custom Shortcode**: Must be 4-12 alphanumeric characters and unique

## Browser Compatibility

- Modern browsers with localStorage support
- Geolocation API support for location tracking (optional)
- Clipboard API support for copy functionality

## Development

The app runs exclusively on `http://localhost:3000` as required. All shortened URLs use the format `http://localhost:3000/{shortcode}`.

## License

Built for Affordmed frontend assessment.

