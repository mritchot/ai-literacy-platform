// useCitations — platform-wide show/hide toggle for inline citation
// chips. When hidden, every `<Citation>` renders nothing; when visible
// (the default), citations keep their full interactive behavior.
//
// Design note — why a module-level store rather than per-instance
// `useState` (the useTheme pattern):
//   useTheme is lifted to PlatformShell and threaded down via props,
//   so there's exactly one instance. This hook is called directly at
//   *every* site that needs it — Citation.tsx (20+ instances across
//   the modules) and Sidebar.tsx (one). If each call site held its own
//   `useState`, toggling from the sidebar would not re-render the
//   Citation chips — they'd hold stale, independent state. So the
//   visibility lives in a single module-level store, shared across all
//   instances via `useSyncExternalStore`. No context provider, no prop
//   threading: components just call the hook and stay in sync.
//
// Persistence: localStorage key 'citation-visibility'. Default
// 'visible' when no stored value exists. A module-level `storage`
// listener keeps the state consistent if the preference is changed in
// another tab.

import { useSyncExternalStore } from 'react';

type CitationVisibility = 'visible' | 'hidden';

const STORAGE_KEY = 'citation-visibility';

// Read the persisted preference. Anything other than the explicit
// 'hidden' string (including a missing key or a localStorage failure)
// resolves to 'visible' — citations are on by default.
function read(): CitationVisibility {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'hidden' ? 'hidden' : 'visible';
  } catch {
    return 'visible';
  }
}

// ─── Module-level store ───────────────────────────────────────────

let value: CitationVisibility = read();
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

// One module-level cross-tab sync listener, registered once on first
// import — not per subscriber (there can be 20+ subscribers).
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      value = read();
      notify();
    }
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): CitationVisibility {
  return value;
}

function toggleVisibility(): void {
  value = value === 'visible' ? 'hidden' : 'visible';
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // localStorage may be unavailable (private browsing); the in-memory
    // `value` still drives the UI for the rest of this session.
  }
  notify();
}

// ─── Hook ─────────────────────────────────────────────────────────

export function useCitations(): {
  showCitations: boolean;
  toggleCitations: () => void;
} {
  // Third arg (server snapshot) reuses getSnapshot — this is a
  // client-only SPA, so there's no separate server value.
  const visibility = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    showCitations: visibility === 'visible',
    toggleCitations: toggleVisibility,
  };
}
