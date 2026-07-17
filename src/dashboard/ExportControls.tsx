// ExportControls — JSON export, xAPI export, Reset All Data (4D §6).
// Each export assembles its payload from the *active* dashboard data source
// (demo or live) so the downloaded file matches what the dashboard shows.
// Reset opens a styled `ConfirmModal` (not browser `confirm()`).

import { useState } from 'react';
import { Icon } from '../components/shared/Icon';
import type { AnalyticsEvent } from '../contexts/AnalyticsContext';
import type { LearnerProgressState } from '../contexts/LearnerProgressContext';
import { ConfirmModal } from './ConfirmModal';
import type { DataSource } from './DataSourceToggle';

interface ExportControlsProps {
  dataSource: DataSource;
  progress: LearnerProgressState;
  events: AnalyticsEvent[];
  /**
   * Called when the user confirms Reset. The parent clears localStorage
   * and switches the dashboard back to Demo mode.
   */
  onResetConfirmed: () => void;
}

const PLATFORM_VERSION = '1.0.0';

interface AnalyticsExport {
  exportTimestamp: string;
  dataSource: DataSource;
  progress: LearnerProgressState;
  analytics: { events: AnalyticsEvent[] };
  platform: { version: string; exportedBy: 'analytics-dashboard' };
}

interface XAPIStatement {
  id: string;
  actor: { mbox: string; name: string };
  verb: { id: string; display: { 'en-US': string } };
  object: { id: string; definition: { name: { 'en-US': string } } };
  timestamp: string;
  context?: Record<string, unknown>;
  result?: Record<string, unknown>;
}

const VERB_MAP = {
  module_start: { id: 'http://adlnet.gov/expapi/verbs/launched', display: 'launched' },
  module_complete: { id: 'http://adlnet.gov/expapi/verbs/completed', display: 'completed' },
  section_enter: { id: 'http://adlnet.gov/expapi/verbs/experienced', display: 'experienced' },
  kc_submitted: { id: 'http://adlnet.gov/expapi/verbs/answered', display: 'answered' },
  reflection: { id: 'http://adlnet.gov/expapi/verbs/reflected', display: 'reflected' },
  generic: { id: 'http://adlnet.gov/expapi/verbs/interacted', display: 'interacted' },
} satisfies Record<string, { id: string; display: string }>;

function categorizeForXAPI(eventType: string): keyof typeof VERB_MAP {
  if (/^module_\d+_start$/.test(eventType)) return 'module_start';
  if (/^module_\d+_complete$/.test(eventType)) return 'module_complete';
  if (/^section_\d+_\d+_(enter|scrolled)$/.test(eventType)) return 'section_enter';
  if (/^kc_\d+_\d+_submitted$/.test(eventType)) return 'kc_submitted';
  if (/_reflection_|_reasoning_/.test(eventType)) return 'reflection';
  return 'generic';
}

function eventToXAPI(event: AnalyticsEvent): XAPIStatement {
  const cat = categorizeForXAPI(event.type);
  const verb = VERB_MAP[cat];
  const objectId = event.moduleId
    ? `https://ai-literacy.example.com/module/${event.moduleId}${event.sectionId ? `/section/${event.sectionId}` : ''}`
    : `https://ai-literacy.example.com/event/${event.type}`;
  return {
    // Spec-conformant statement id — a strict LRS validates the UUID.
    id: `urn:uuid:${crypto.randomUUID()}`,
    actor: { mbox: 'mailto:learner@example.com', name: 'Portfolio Learner' },
    verb: { id: verb.id, display: { 'en-US': verb.display } },
    object: {
      id: objectId,
      definition: { name: { 'en-US': event.type } },
    },
    timestamp: new Date(event.ts).toISOString(),
    ...(event.payload && Object.keys(event.payload).length > 0
      ? { result: { extensions: event.payload } }
      : {}),
  };
}

function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Local calendar day (not UTC) so a late-evening export in a
// negative-UTC timezone isn't stamped with tomorrow's date.
function dateStamp(): string {
  const d = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function ExportControls({
  dataSource,
  progress,
  events,
  onResetConfirmed,
}: ExportControlsProps): JSX.Element {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const handleJSON = () => {
    const payload: AnalyticsExport = {
      exportTimestamp: new Date().toISOString(),
      dataSource,
      progress,
      analytics: { events },
      platform: { version: PLATFORM_VERSION, exportedBy: 'analytics-dashboard' },
    };
    downloadFile(
      `analytics-export-${dateStamp()}.json`,
      JSON.stringify(payload, null, 2),
      'application/json',
    );
    setAnnouncement('JSON export downloaded.');
  };

  const handleXAPI = () => {
    const statements = events.map((e) => eventToXAPI(e));
    const payload = {
      exportTimestamp: new Date().toISOString(),
      dataSource,
      statementCount: statements.length,
      platform: { version: PLATFORM_VERSION, exportedBy: 'analytics-dashboard' },
      statements,
    };
    downloadFile(
      `xapi-export-${dateStamp()}.json`,
      JSON.stringify(payload, null, 2),
      'application/json',
    );
    setAnnouncement('xAPI export downloaded.');
  };

  const handleResetClick = () => setConfirmOpen(true);

  const handleResetConfirm = () => {
    setConfirmOpen(false);
    onResetConfirmed();
    setAnnouncement('Live data cleared. Switched to Demo mode.');
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleJSON}
          aria-label={`Export analytics as JSON (${dataSource} data)`}
          className="inline-flex items-center gap-2 font-sans text-[13px] font-semibold text-ink hover:bg-surface"
          style={{
            padding: '8px 14px',
            background: 'rgb(var(--surface))',
            border: '1px solid rgb(var(--border))',
          }}
        >
          <Icon name="download" size={14} />
          Export JSON
        </button>
        <button
          type="button"
          onClick={handleXAPI}
          aria-label={`Export analytics as xAPI (${dataSource} data)`}
          className="inline-flex items-center gap-2 font-sans text-[13px] font-semibold text-ink hover:bg-surface"
          style={{
            padding: '8px 14px',
            background: 'rgb(var(--surface))',
            border: '1px solid rgb(var(--border))',
          }}
        >
          <Icon name="download" size={14} />
          Export xAPI
        </button>
        <button
          type="button"
          onClick={handleResetClick}
          aria-label="Reset all live learner data"
          className="font-sans text-[13px] font-semibold transition-colors duration-[160ms]"
          style={{
            padding: '8px 14px',
            color: 'rgb(var(--error))',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(166, 80, 75, 0.10)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Reset All Data
        </button>
      </div>

      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Reset all learner data?"
        body="This will delete all learner progress and analytics data from localStorage. Demo data is not affected. This action cannot be undone."
        confirmLabel="Reset Data"
        cancelLabel="Cancel"
        tone="danger"
        onConfirm={handleResetConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
