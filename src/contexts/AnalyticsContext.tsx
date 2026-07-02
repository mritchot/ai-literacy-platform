// AnalyticsContext — accumulates interaction events for the analytics
// dashboard (Component 4D). Written to localStorage; the dashboard reads
// the same store. JSON/xAPI export lives in dashboard/ExportControls.
//
// Split contexts: nearly every consumer only calls `track` (stable
// identity), while the events array changes on every tracked
// interaction. Holding both in one context value re-rendered every
// consumer per event and made each interaction O(all prior events).
// Actions (track/reset) and the events data now live in separate
// contexts — `useAnalytics()` keeps its name and its ~30 call sites;
// only the dashboard subscribes to `useAnalyticsEvents()`.

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface AnalyticsEvent {
  ts: number;
  type: string;
  moduleId?: number;
  sectionId?: number;
  payload?: Record<string, unknown>;
}

interface AnalyticsActions {
  track: (event: Omit<AnalyticsEvent, 'ts'>) => void;
  reset: () => void;
}

const AnalyticsActionsContext = createContext<AnalyticsActions | null>(null);
const AnalyticsEventsContext = createContext<AnalyticsEvent[] | null>(null);

// Read-side shape guard for the frozen 'ail.analytics' key: anything
// that isn't an array falls back to [] instead of crashing the first
// `[...prev, event]` spread.
function isEventArray(v: unknown): v is AnalyticsEvent[] {
  return Array.isArray(v);
}

export function AnalyticsProvider({ children }: { children: ReactNode }): JSX.Element {
  const [events, setEvents] = useLocalStorage<AnalyticsEvent[]>('ail.analytics', [], {
    validate: isEventArray,
  });

  const track = useCallback(
    (event: Omit<AnalyticsEvent, 'ts'>) => {
      setEvents((prev) => [...prev, { ...event, ts: Date.now() }]);
    },
    [setEvents],
  );

  const reset = useCallback(() => setEvents([]), [setEvents]);

  // Both callbacks are stable, so this identity never changes —
  // `useAnalytics()` consumers don't re-render on event appends.
  const actions = useMemo<AnalyticsActions>(() => ({ track, reset }), [track, reset]);

  return (
    <AnalyticsActionsContext.Provider value={actions}>
      <AnalyticsEventsContext.Provider value={events}>
        {children}
      </AnalyticsEventsContext.Provider>
    </AnalyticsActionsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsActions {
  const ctx = useContext(AnalyticsActionsContext);
  if (!ctx) throw new Error('useAnalytics must be used within AnalyticsProvider');
  return ctx;
}

/** The full event log. Subscribing to this re-renders on every tracked
 *  interaction — dashboard-only by design. */
export function useAnalyticsEvents(): AnalyticsEvent[] {
  const ctx = useContext(AnalyticsEventsContext);
  if (!ctx) throw new Error('useAnalyticsEvents must be used within AnalyticsProvider');
  return ctx;
}
