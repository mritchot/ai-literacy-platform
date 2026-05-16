// Three-state theme: system (default) | light | dark.
// Applies the `dark` class to <html> based on resolved preference,
// reacts to OS-level changes when in 'system' mode (Section 10.1).
//
// Implementation note: `resolved` is real React state (not a `useMemo`),
// so when in 'system' mode and the OS toggles dark mode, the listener
// updates state — which propagates to every `useTheme()` consumer via
// re-render. An earlier version derived `resolved` via `useMemo([pref])`,
// which kept the cached value when `pref === 'system'` and the OS
// changed; the .dark class flipped (CSS reacted) but components reading
// `resolved` (the topbar moon/sun icon, `useChartTokens`, aria labels)
// stayed frozen — producing a half-converted UI on OS changes.
//
// Toggle model: `cycle()` rotates through all three states —
// system → light → dark → system. An earlier version only flipped
// between light and dark, which meant a single click permanently
// locked the user out of 'system' mode (the OS-change listener only
// mounts while preference === 'system', so the auto-switch silently
// died after the first toggle). The 3-state rotation keeps 'system'
// reachable from the UI.

import { useCallback, useEffect, useState } from 'react';
import type { IconName } from '../components/shared/Icon';
import { useLocalStorage } from './useLocalStorage';

export type ThemePreference = 'system' | 'light' | 'dark';
type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'ail.theme';

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref !== 'system') return pref;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme(): {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (pref: ThemePreference) => void;
  cycle: () => void;
} {
  const [preference, setPreferenceRaw] = useLocalStorage<ThemePreference>(STORAGE_KEY, 'system');

  // Real state, not derived. The OS-change listener updates this directly
  // so consumers re-render when system theme changes.
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolveTheme(preference));

  // Recompute resolved whenever preference changes (manual switches).
  useEffect(() => {
    setResolved(resolveTheme(preference));
  }, [preference]);

  // Listen for OS-level theme changes when in 'system' mode. Updates
  // React state, which then drives the .dark class effect below — so
  // CSS, icons, aria labels, and chart tokens all flip together.
  useEffect(() => {
    if (preference !== 'system' || typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setResolved(mql.matches ? 'dark' : 'light');
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [preference]);

  // Apply the .dark class to <html> whenever the resolved theme changes.
  useEffect(() => {
    const html = document.documentElement;
    if (resolved === 'dark') html.classList.add('dark');
    else html.classList.remove('dark');
  }, [resolved]);

  const setPreference = useCallback(
    (pref: ThemePreference) => setPreferenceRaw(pref),
    [setPreferenceRaw],
  );

  // Rotate through all three states: system → light → dark → system.
  // The functional updater means `cycle`'s identity stays stable (empty
  // dep array) and it always acts on the latest preference. The icon
  // (driven by `themeToggleMeta` below) changes on every click, so each
  // press gives visible feedback even when the resolved CSS theme
  // doesn't change (e.g. system→light while the OS is already light).
  const cycle = useCallback(() => {
    setPreferenceRaw((prev) =>
      prev === 'system' ? 'light' : prev === 'light' ? 'dark' : 'system',
    );
  }, [setPreferenceRaw]);

  return { preference, resolved, setPreference, cycle };
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
