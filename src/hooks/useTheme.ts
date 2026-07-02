// Three-state theme: system (default) | light | dark.
// Applies the `dark` class to <html> based on resolved preference,
// reacts to OS-level changes when in 'system' mode (Section 10.1).
//
// Module-level store + `useSyncExternalStore` — the same pattern as
// usePlatformMode and useCitations. useTheme used to hold per-instance
// React state, and useChartTokens calls it directly inside every chart
// component: toggling the theme updated only the shell's instance, so
// on-screen charts kept the stale palette until remount, and each
// chart's 'system' listener could fight an explicit light/dark choice.
// One shared store means every consumer (shell toggle, TopBar, chart
// tokens, aria labels) flips together, and the sidebar no longer needs
// theme props threaded through PlatformShell.
//
// Persistence: localStorage key 'ail.theme'. The value is
// JSON-encoded ("\"dark\"", with quotes) because this hook previously
// stored through useLocalStorage — the format is kept so existing
// stored preferences survive.
//
// Toggle model: `cycle()` rotates through all three states —
// system → light → dark → system. An earlier version only flipped
// between light and dark, which meant a single click permanently
// locked the user out of 'system' mode. The 3-state rotation keeps
// 'system' reachable from the UI.

import { useSyncExternalStore } from 'react';
import type { IconName } from '../components/shared/Icon';

export type ThemePreference = 'system' | 'light' | 'dark';
type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'ail.theme';

function isPreference(v: unknown): v is ThemePreference {
  return v === 'system' || v === 'light' || v === 'dark';
}

function readStoredPreference(): ThemePreference {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return 'system';
    const parsed: unknown = JSON.parse(raw);
    return isPreference(parsed) ? parsed : 'system';
  } catch {
    return 'system';
  }
}

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref !== 'system') return pref;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// ─── Module-level store ───────────────────────────────────────────

interface ThemeSnapshot {
  preference: ThemePreference;
  resolved: ResolvedTheme;
}

let preference: ThemePreference =
  typeof window === 'undefined' ? 'system' : readStoredPreference();
let resolved: ResolvedTheme = resolveTheme(preference);
// Immutable snapshot object — useSyncExternalStore compares by identity.
let snapshot: ThemeSnapshot = { preference, resolved };
const listeners = new Set<() => void>();

function applyClass(): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

function notify(): void {
  snapshot = { preference, resolved };
  for (const listener of listeners) listener();
}

// OS-level change listener — active only while preference === 'system',
// so an explicit light/dark choice can never be overridden by the OS.
let mql: MediaQueryList | null = null;
const onSystemChange = (): void => {
  resolved = resolveTheme(preference);
  applyClass();
  notify();
};
function syncSystemListener(): void {
  if (typeof window === 'undefined') return;
  if (preference === 'system') {
    if (!mql) {
      mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener('change', onSystemChange);
    }
  } else if (mql) {
    mql.removeEventListener('change', onSystemChange);
    mql = null;
  }
}

function commit(next: ThemePreference): void {
  preference = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* in-memory value still drives the UI for this session */
  }
  resolved = resolveTheme(preference);
  applyClass();
  syncSystemListener();
  notify();
}

if (typeof window !== 'undefined') {
  applyClass();
  syncSystemListener();
  // Cross-tab sync.
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    preference = readStoredPreference();
    resolved = resolveTheme(preference);
    applyClass();
    syncSystemListener();
    notify();
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ThemeSnapshot {
  return snapshot;
}

// Rotate through all three states: system → light → dark → system.
// The icon (driven by `themeToggleMeta` below) changes on every click,
// so each press gives visible feedback even when the resolved CSS theme
// doesn't change (e.g. system→light while the OS is already light).
function cycle(): void {
  commit(preference === 'system' ? 'light' : preference === 'light' ? 'dark' : 'system');
}

// ─── Hook ─────────────────────────────────────────────────────────

export function useTheme(): {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  cycle: () => void;
} {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { preference: snap.preference, resolved: snap.resolved, cycle };
}

/**
 * Presentation for the theme toggle button. The icon reflects the
 * *current* preference (so all three modes are distinguishable at a
 * glance — sun/moon/monitor); the label names the next mode in the
 * system → light → dark → system rotation, for the accessible name.
 */
export function themeToggleMeta(preference: ThemePreference): {
  icon: IconName;
  label: string;
} {
  switch (preference) {
    case 'light':
      return { icon: 'sun', label: 'Theme: light — switch to dark' };
    case 'dark':
      return { icon: 'moon', label: 'Theme: dark — switch to system' };
    case 'system':
    default:
      return { icon: 'monitor', label: 'Theme: follows system — switch to light' };
  }
}
