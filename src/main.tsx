import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Self-hosted DM font family (WOFF2 via @fontsource). Replaces the
// Google Fonts CDN links that used to live in index.html — those made
// every page load ping fonts.googleapis.com / fonts.gstatic.com,
// leaking visitor IP + User-Agent to Google. The WOFF2 files get
// inlined into the single-file bundle by vite-plugin-singlefile, so
// the platform self-hosts the fonts entirely with no external requests.
// Weights match what the Google Fonts URL used to request: DM Sans
// 400/500/600/700, DM Serif Display 400, DM Mono 400/500 (DM Mono
// doesn't ship a 700 — the closest available weight is used).
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/dm-serif-display/400.css';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';

import './styles/index.css';
import App from './App';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found in index.html');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
