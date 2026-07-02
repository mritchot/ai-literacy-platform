// usePlatformMode — the platform's two-mode system:
//
//   • learner   (default) — sequential progression: future sections are
//                locked in the sidebar, module cards on the landing page
//                lock until the previous module is complete, the Next
//                button is gated on completion, and `/#/dashboard`
//                redirects home.
//   • portfolio — free navigation everywhere; the analytics dashboard is
//                reachable and defaults to demo data (for hiring
//                committees / reviewers), with a Live toggle for real
//                localStorage data.
//
// Activation:
//   • `?portfolio=true` URL search param — the param is consumed and
//     stripped from the URL via `history.replaceState` so it doesn't
//     linger or get bookmarked.
//   • Ctrl/Cmd+Shift+A — toggles learner ↔ portfolio.
//   • `setMode` / `resetMode` from the hook (the visible Exit control).
//
// Persistence: localStorage key `platform-mode`. `learner` is the
// default and is represented by the *absence* of the key — `resetMode`
// removes it. A module-level `storage` listener keeps tabs in sync.
//
// Architecture: same module-level store + `useSyncExternalStore` pattern
// as `useCitations.ts`. The store is shared across every consumer
// (Sidebar, SectionContainer, LandingPage, router guard, analytics
// dashboard) with no context provider and no prop threading. The
// keyboard listener and the URL-param consumption run once, at module
// import time — not per hook instance.

import { useSyncExternalStore } from 'react';

export type PlatformMode = 'learner' | 'portfolio';

const STORAGE_KEY = 'platform-mode';

function isMode(v: unknown): v is PlatformMode {
  return v === 'learner' || v === 'portfolio';
}

// Resolve the initial mode at module-import time. URL param wins (and is
// then stripped + persisted); otherwise fall back to localStorage;
// otherwise `learner`.
function readInitialMode(): PlatformMode {
  if (typeof window === 'undefined') return 'learner';

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('portfolio') === 'true') {
      try {
        window.localStorage.setItem(STORAGE_KEY, 'portfolio');
      } catch {
        /* localStorage may be unavailable — in-memory value still drives the UI */
      }
      // Strip the activation param so it doesn't linger in the address
      // bar or get bookmarked. Keep the rest of the search + the hash
      // route intact.
      params.delete('portfolio');
      const search = params.toString();
      const cleanUrl =
        window.location.pathname + (search ? `?${search}` : '') + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
      return 'portfolio';
    }
  } catch {
    /* malformed URL — fall through to localStorage */
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isMode(stored)) return stored;
  } catch {
    /* ignore */
  }
  return 'learner';
}

// ─── Module-level store ───────────────────────────────────────────

let value: PlatformMode = readInitialMode();
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

function commit(next: PlatformMode): void {
  if (next === value) return;
  value = next;
  try {
    // `learner` is the default — represented by the absence of the key.
    if (next === 'learner') window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* in-memory value still drives the UI for this session */
  }
  notify();
}

// One-time module-level listeners (registered on first import, not per
// hook instance — there can be many consumers).
if (typeof window !== 'undefined') {
  // Cross-tab sync.
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    value = isMode(e.newValue) ? e.newValue : 'learner';
    notify();
  });

  // Ctrl/Cmd+Shift+A — toggles learner ↔ portfolio.
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      commit(value === 'portfolio' ? 'learner' : 'portfolio');
    }
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): PlatformMode {
  return value;
}

// Stable module-level setters — safe to return directly from the hook.
function setMode(next: PlatformMode): void {
  commit(next);
}
function resetMode(): void {
  commit('learner');
}

// ─── Hook ─────────────────────────────────────────────────────────

export function usePlatformMode(): {
  mode: PlatformMode;
  setMode: (mode: PlatformMode) => void;
  resetMode: () => void;
} {
  // Third arg (server snapshot) reuses getSnapshot — client-only SPA.
  const mode = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { mode, setMode, resetMode };
}
