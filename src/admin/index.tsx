// AdminDashboard — Component 4D entry point. Lazy-loaded chunk mounted at
// `/#/admin` (via the router). Owns the data-source toggle, normalizes
// either demo data or live context state into a common shape, and stacks
// the four dashboard sections.
//
// Live mode reads from `useLearnerProgress` and `useAnalytics`. Demo mode
// reads from the static `demo-data.ts` file. The demo data is never written
// to localStorage — switching back to Live mode reveals the actual learner
// state (or the empty state if it's empty).

import { useMemo, useState } from 'react';
import { useAnalytics, type AnalyticsEvent } from '../contexts/AnalyticsContext';
import {
  useLearnerProgress,
  type LearnerProgressState,
} from '../contexts/LearnerProgressContext';
import { usePlatformMode } from '../hooks/usePlatformMode';
import { Overline } from '../components/shared/Overline';
import { AssessmentResponseAnalysis } from './AssessmentResponseAnalysis';
import { DataSourceToggle, type DataSource } from './DataSourceToggle';
import { DEMO_EVENTS, DEMO_PROGRESS } from './demo-data';
import { EventTimeline } from './EventTimeline';
import { ExportControls } from './ExportControls';
import { KCResponseAnalysis } from './KCResponseAnalysis';
import { ModuleCompletionTable } from './ModuleCompletionTable';
import { SummaryMetricsBar } from './SummaryMetricsBar';

interface DashboardData {
  progress: LearnerProgressState;
  events: AnalyticsEvent[];
}

function isProgressEmpty(progress: LearnerProgressState): boolean {
  return (
    Object.keys(progress.scrolledSections).length === 0 &&
    Object.keys(progress.interactionCompleteSections).length === 0 &&
    Object.keys(progress.knowledgeChecks).length === 0 &&
    Object.keys(progress.reflections).length === 0
  );
}

export default function AdminDashboard(): JSX.Element {
  // Data-source default follows the platform mode: portfolio mode opens
  // on demo data (the dashboard is a showcase for reviewers), admin mode
  // opens on live localStorage data (the operator wants the real numbers).
  // Either way the toggle still works — this only sets the initial value.
  const { mode } = usePlatformMode();
  const [dataSource, setDataSource] = useState<DataSource>(
    mode === 'admin' ? 'live' : 'demo',
  );
  const learnerProgress = useLearnerProgress();
  const analytics = useAnalytics();

  // Normalize: produce a single `DashboardData` from whichever source is active.
  const data: DashboardData = useMemo(() => {
    if (dataSource === 'demo') {
      return { progress: DEMO_PROGRESS, events: DEMO_EVENTS };
    }
    return { progress: learnerProgress.state, events: analytics.events };
  }, [dataSource, learnerProgress.state, analytics.events]);

  const isLiveEmpty = dataSource === 'live' && isProgressEmpty(data.progress);

  // Reset handler — clears both localStorage stores via the contexts and
  // switches the toggle back to Demo (per 4D §6.4).
  const handleReset = () => {
    // Clear progress: setState to a totally empty payload.
    // We can't dispatch — the platform context exposes setters per-leaf.
    // Easiest path: hit localStorage directly and let the next render pick
    // up the empty state. This matches what the existing Reset Progress link
    // does for the same keys.
    try {
      window.localStorage.removeItem('ail.progress');
      window.localStorage.removeItem('ail.analytics');
    } catch {
      /* ignore */
    }
    // Reset in-memory state via the analytics context's reset function (the
    // progress context doesn't have a reset; reload picks it up). Since
    // we can't fully reset progress in-memory without a reload, we reload.
    analytics.reset();
    setDataSource('demo');
    // Force the rest of the platform to re-read from cleared localStorage.
    window.location.reload();
  };

  return (
    <div
      className="mx-auto w-full"
      style={{ padding: '48px 32px 96px', maxWidth: 1240 }}
    >
      {/* Page header (4D §4.3) */}
      <header className="mb-6">
        <Overline className="mb-2" style={{ fontSize: 11 }}>
          Admin Dashboard
        </Overline>
        <h1
          className="m-0 font-display text-display font-normal text-ink"
          style={{ letterSpacing: '-0.005em', fontSize: 32, lineHeight: 1.15 }}
        >
          Learning Analytics Dashboard
        </h1>
        <p
          className="m-0 mt-2 font-sans text-body-sm"
          style={{
            color:
              dataSource === 'demo'
                ? 'rgb(var(--caution))'
                : 'rgb(var(--secondary))',
          }}
        >
          {dataSource === 'demo'
            ? 'Showing pre-populated demo data'
            : 'Showing live data from localStorage'}
        </p>
      </header>

      {/* Toggle + Export controls row */}
      <div
        className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <DataSourceToggle value={dataSource} onChange={setDataSource} />
        <ExportControls
          dataSource={dataSource}
          progress={data.progress}
          events={data.events}
          onResetConfirmed={handleReset}
        />
      </div>

      {/* Main content body. Live-empty state replaces the body sections. */}
      {isLiveEmpty ? (
        <LiveEmptyState onSwitchToDemo={() => setDataSource('demo')} />
      ) : (
        <div className="space-y-10">
          <section aria-label="Summary">
            <SummaryMetricsBar progress={data.progress} events={data.events} />
          </section>

          {/* Assessment Response Analysis is the program-level
              measurement surface — placed above Module Completion and
              KC Response Analysis so admins see the pre→post growth
              picture before drilling into module-level details. */}
          <section>
            <Overline className="mb-3" style={{ fontSize: 11 }}>
              Assessment Response Analysis
            </Overline>
            <AssessmentResponseAnalysis progress={data.progress} />
          </section>

          <section>
            <Overline className="mb-3" style={{ fontSize: 11 }}>
              Module Completion
            </Overline>
            <ModuleCompletionTable progress={data.progress} />
          </section>

          <section>
            <Overline className="mb-3" style={{ fontSize: 11 }}>
              Knowledge Check Response Analysis
            </Overline>
            <KCResponseAnalysis progress={data.progress} />
          </section>

          <section>
            <EventTimeline events={data.events} />
          </section>
        </div>
      )}
    </div>
  );
}

function LiveEmptyState({ onSwitchToDemo }: { onSwitchToDemo: () => void }): JSX.Element {
  return (
    <article
      className="rounded-xl"
      style={{
        background: 'rgb(var(--surface-warm))',
        border: '1px solid rgb(var(--border))',
        padding: '32px 28px',
        textAlign: 'center',
      }}
    >
      <h2
        className="m-0 mb-3 font-sans text-h3 font-semibold text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        No learner data yet
      </h2>
      <p
        className="m-0 mb-5 font-sans text-body text-secondary mx-auto"
        style={{ maxWidth: 520, lineHeight: 1.55 }}
      >
        Complete one or more modules in the learning platform to generate analytics
        data. The dashboard will display your progress, knowledge check responses, and
        interaction patterns in real time.
      </p>
      <button
        type="button"
        onClick={onSwitchToDemo}
        className="inline-flex items-center gap-2 rounded-md font-sans text-[13px] font-semibold text-action"
        style={{
          padding: '9px 16px',
          border: '1.5px solid rgb(var(--action))',
          background: 'transparent',
        }}
      >
        Switch to Demo Data
      </button>
    </article>
  );
}
