import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Self-hosted type (WOFF2 via @fontsource), matching ritchot.me:
// Source Serif 4 for display and long-form prose, IBM Plex Sans for UI,
// IBM Plex Mono for labels and data. Self-hosting replaces the Google
// Fonts CDN links that used to live in index.html — those made every
// page load ping fonts.googleapis.com / fonts.gstatic.com, leaking
// visitor IP + User-Agent to Google. The WOFF2 files get inlined into
// the single-file bundle by vite-plugin-singlefile, so the platform
// ships the fonts entirely with no external requests.
//
// Latin subsets only, and only the weights actually rendered — the
// bundle inlines every byte imported here, so an unused weight is a
// permanent tax on first paint.
import '@fontsource/source-serif-4/latin-400.css';
import '@fontsource/source-serif-4/latin-400-italic.css';
import '@fontsource/source-serif-4/latin-600.css';
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-400-italic.css';
import '@fontsource/ibm-plex-sans/latin-500.css';
import '@fontsource/ibm-plex-sans/latin-600.css';
import '@fontsource/ibm-plex-sans/latin-700.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource/ibm-plex-mono/latin-700.css';

import './styles/index.css';
import App from './App';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found in index.html');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
