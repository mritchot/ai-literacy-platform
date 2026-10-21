// useReducedMotion — tracks the OS "reduce motion" setting (Section 8
// of the design system). The global rule in styles/index.css zeroes CSS
// animation and transition durations, but Recharts tweens bars and lines
// in JavaScript, so each chart reads this hook and passes
// `isAnimationActive={!reducedMotion}`.
//
// Same `useSyncExternalStore` pattern as useTheme. The media query is
// subscribed per consumer: there are only a handful of charts per page,
// and a mid-session OS change re-renders them with the new value.

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', listener);
  return () => mql.removeEventListener('change', listener);
}

function getSnapshot(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(QUERY).matches;
}

export function useReducedMotion(): boolean {
  // Third arg (server snapshot): client-only SPA, so motion is allowed.
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
