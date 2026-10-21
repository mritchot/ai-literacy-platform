// useCitations — platform-wide show/hide toggle for inline citation
// chips. When hidden, every `<Citation>` renders nothing; when visible,
// citations keep their full interactive behavior. Learners start with
// sources hidden and opt in via the sidebar toggle; portfolio reviewers
// start with them visible.
//
// Design note — why a module-level store rather than per-instance
// `useState`: this hook is called directly at *every* site that needs
// it — Citation.tsx (one per chip across the modules) and
// SidebarFooter.tsx (one). If each call site held its own `useState`, toggling from the
// sidebar would not re-render the Citation chips — they'd hold stale,
// independent state. So the visibility lives in a single module-level
// store, shared across all instances via `useSyncExternalStore` (the
// same pattern usePlatformMode and useTheme use). No context provider,
// no prop threading: components just call the hook and stay in sync.
//
// Persistence: localStorage key 'citation-visibility'. With no stored
// value, the default is 'visible' in portfolio mode and 'hidden' in
// learner mode. The store holds only an explicit choice; the hook
// derives the default from the current platform mode, so switching
// mode mid-session (Ctrl/Cmd+Shift+A, or Exit) also moves the default.
// A module-level `storage` listener keeps the state consistent if the
// preference is changed in another tab.

import { useSyncExternalStore } from 'react';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { usePlatformMode } from './usePlatformMode';

type CitationVisibility = 'visible' | 'hidden';

const STORAGE_KEY = STORAGE_KEYS.CITATIONS;

// Read the persisted choice. An explicit 'visible' or 'hidden' always
// wins over the mode default; a missing or unrecognized value, or a
// localStorage failure, means no choice has been made.
function read(): CitationVisibility | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'visible' || stored === 'hidden' ? stored : null;
  } catch {
    return null;
  }
}

// ─── Module-level store ───────────────────────────────────────────

let value: CitationVisibility | null = read();
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

function getSnapshot(): CitationVisibility | null {
  return value;
}

function setVisibility(next: CitationVisibility): void {
  value = next;
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
  const choice = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const { mode } = usePlatformMode();
  const showCitations = choice === null ? mode === 'portfolio' : choice === 'visible';
  return {
    showCitations,
    toggleCitations: () => setVisibility(showCitations ? 'hidden' : 'visible'),
  };
}
