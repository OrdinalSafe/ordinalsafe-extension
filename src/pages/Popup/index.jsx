import React from 'react';
import { createRoot } from 'react-dom/client';

import './index.out.css';

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

import * as amplitude from '@amplitude/analytics-browser';

import secrets from 'secrets';
import { isDevelopment } from '../../config';
import App from './App';

Sentry.init({
  dsn: secrets.SENTRY_DSN,
  integrations: [
    new BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  environment: isDevelopment ? 'development' : 'production',
});

// init amplitude only in production
if (!isDevelopment) {
  amplitude.init(
    secrets.AMPLITUDE_KEY,
    undefined, // should we set user id? if so, how?
    {
      defaultTracking: {
        sessions: true,
        pageViews: false,
        formInteractions: false,
        fileDownloads: false,
      },
    }
  );
}

const container = document.getElementById('app-container');
const root = createRoot(container);
root.render(<App />);
