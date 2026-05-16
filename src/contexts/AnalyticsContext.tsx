// AnalyticsContext — accumulates interaction events for the admin dashboard
// (Component 4D). Written to localStorage; the dashboard reads the same store.
// downloadAnalytics() exports a JSON file for portability (Section 5).

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
  download: () => void;
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

  const download = useCallback(() => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-literacy-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [events]);

  const value = useMemo<AnalyticsValue>(
    () => ({ events, track, reset, download }),
    [events, track, reset, download],
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics(): AnalyticsValue {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalytics must be used within AnalyticsProvider');
  return ctx;
}
