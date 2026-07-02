// AnalyticsContext — accumulates interaction events for the analytics
// dashboard (Component 4D). Written to localStorage; the dashboard reads
// the same store. JSON/xAPI export lives in dashboard/ExportControls.

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface AnalyticsEvent {
  ts: number;
  type: string;
  moduleId?: number;
  sectionId?: number;
  payload?: Record<string, unknown>;
}

interface AnalyticsValue {
  events: AnalyticsEvent[];
  track: (event: Omit<AnalyticsEvent, 'ts'>) => void;
  reset: () => void;
}

const AnalyticsContext = createContext<AnalyticsValue | null>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }): JSX.Element {
  const [events, setEvents] = useLocalStorage<AnalyticsEvent[]>('ail.analytics', []);

  const track = useCallback(
    (event: Omit<AnalyticsEvent, 'ts'>) => {
      setEvents((prev) => [...prev, { ...event, ts: Date.now() }]);
    },
    [setEvents],
  );

  const reset = useCallback(() => setEvents([]), [setEvents]);

  const value = useMemo<AnalyticsValue>(
    () => ({ events, track, reset }),
    [events, track, reset],
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics(): AnalyticsValue {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalytics must be used within AnalyticsProvider');
  return ctx;
}
