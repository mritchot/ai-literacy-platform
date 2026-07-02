// EventTimeline — chronological filterable event log (4D §10).
// Most-recent-first. Filter pills: module 1–4 (radio), KCs / Reflections
// (checkbox). Pagination: 50 per load via "Show More". Categorization order
// matters — first match wins (4D §10.6).

import { useMemo, useState } from 'react';
import { Overline } from '../components/shared/Overline';
import { nextRadioIndex } from '../components/shared/radio-group-nav';
import type { AnalyticsEvent } from '../contexts/AnalyticsContext';

interface EventTimelineProps {
  events: AnalyticsEvent[];
}

type EventCategory =
  | 'navigation'
  | 'knowledge_check'
  | 'interpretation_check'
  | 'reflection'
  | 'completion'
  | 'practice_activity'
  | 'assessment';

// 4D §10.6 categorization. Order matters — first match wins. The "completion"
// pattern would otherwise be claimed by "navigation" since `module_*_complete`
// starts with `module_`, so we list completion *before* navigation. (Spec
// shows completion at priority 5, but practical first-match-wins requires it
// before navigation here.)
//
// `assessment` is matched LAST among named categories (before the
// `practice_activity` catch-all) so its broad `/assessment/` pattern
// doesn't poach narrower events that contain the substring. In
// practice the assessment events all start with `pre_assessment_*`,
// `post_assessment_*`, or `assessment_item_*` — none collide with
// the patterns above.
function categorize(eventType: string): EventCategory {
  if (/^module_\d+_complete$/.test(eventType)) return 'completion';
  if (/^module_\d+_start$/.test(eventType)) return 'navigation';
  if (/^section_\d+_\d+_(enter|scrolled)$/.test(eventType)) return 'navigation';
  if (/^kc_/.test(eventType)) return 'knowledge_check';
  if (/^ic_\d+_\d+_submitted$/.test(eventType)) return 'interpretation_check';
  if (/_reflection_|_reasoning_/.test(eventType)) return 'reflection';
  if (/assessment/.test(eventType)) return 'assessment';
  return 'practice_activity';
}

const PAGE_SIZE = 50;
type ModuleFilter = 0 | 1 | 2 | 3 | 4; // 0 = All

interface Filters {
  module: ModuleFilter;
  kcsOnly: boolean;
  reflectionsOnly: boolean;
  assessmentsOnly: boolean;
}

function applyFilters(events: AnalyticsEvent[], f: Filters): AnalyticsEvent[] {
  return events.filter((e) => {
    if (f.module !== 0 && e.moduleId !== f.module) return false;
    const anyCatFilter = f.kcsOnly || f.reflectionsOnly || f.assessmentsOnly;
    if (anyCatFilter) {
      const cat = categorize(e.type);
      const inKC = cat === 'knowledge_check' || cat === 'interpretation_check';
      const inReflection = cat === 'reflection';
      const inAssessment = cat === 'assessment';
      // Treat the three category filters as an OR union — if multiple
      // pills are active, surface anything matching any of them. This
      // matches the existing kcsOnly + reflectionsOnly union behavior.
      const matches =
        (f.kcsOnly && inKC) ||
        (f.reflectionsOnly && inReflection) ||
        (f.assessmentsOnly && inAssessment);
      if (!matches) return false;
    }
    return true;
  });
}

const MODULE_PILL_BG: Record<number, string> = {
  1: '#E8EDE4',
  2: '#F0EAE0',
  3: '#E4EBF0',
  4: '#EBE6EE',
};
const MODULE_PILL_TEXT: Record<number, string> = {
  1: '#3D4A35',
  2: '#5A4A37',
  3: '#354A57',
  4: '#4A3557',
};

export function EventTimeline({ events }: EventTimelineProps): JSX.Element {
  const [filters, setFilters] = useState<Filters>({
    module: 0,
    kcsOnly: false,
    reflectionsOnly: false,
    assessmentsOnly: false,
  });
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Most-recent-first ordering for display (4D §10.5 implies recent first).
  const allFiltered = useMemo(() => {
    const filtered = applyFilters(events, filters);
    return [...filtered].sort((a, b) => b.ts - a.ts);
  }, [events, filters]);

  const visible = allFiltered.slice(0, visibleCount);
  const hasMore = allFiltered.length > visibleCount;

  const setModule = (m: ModuleFilter) => {
    setFilters((f) => ({ ...f, module: m }));
    setVisibleCount(PAGE_SIZE);
  };
  const toggleKCs = () => {
    setFilters((f) => ({ ...f, kcsOnly: !f.kcsOnly }));
    setVisibleCount(PAGE_SIZE);
  };
  const toggleReflections = () => {
    setFilters((f) => ({ ...f, reflectionsOnly: !f.reflectionsOnly }));
    setVisibleCount(PAGE_SIZE);
  };
  const toggleAssessments = () => {
    setFilters((f) => ({ ...f, assessmentsOnly: !f.assessmentsOnly }));
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <section aria-label="Analytics event timeline">
      <h2 className="m-0">
        <Overline as="span" className="mb-3" style={{ fontSize: 11 }}>
          Event Timeline
        </Overline>
      </h2>

      {/* Filter pills */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span
          className="font-mono text-[10px] font-semibold uppercase text-tertiary mr-1"
          style={{ letterSpacing: '0.06em' }}
        >
          Filter:
        </span>
        <div role="radiogroup" aria-label="Filter by module" className="flex flex-wrap gap-1">
          {MODULE_FILTER_OPTIONS.map(([id, label], idx) => (
            <FilterPill
              key={id}
              id={`evt-filter-m${id}`}
              role="radio"
              active={filters.module === id}
              tabIndex={filters.module === id ? 0 : -1}
              onKeyDown={(e) => {
                // role=radio promises arrow-key movement (APG); roving
                // tabindex + focus-follows-activation, as elsewhere.
                const next = nextRadioIndex(e.key, idx, MODULE_FILTER_OPTIONS.length);
                if (next === null) return;
                e.preventDefault();
                const target = MODULE_FILTER_OPTIONS[next];
                if (!target) return;
                setModule(target[0] as ModuleFilter);
                document.getElementById(`evt-filter-m${target[0]}`)?.focus();
              }}
              onClick={() => setModule(id as ModuleFilter)}
            >
              {label}
            </FilterPill>
          ))}
        </div>
        <span aria-hidden="true" className="mx-1 h-4 w-px bg-border-light" />
        <FilterPill
          role="checkbox"
          active={filters.kcsOnly}
          onClick={toggleKCs}
        >
          KCs only
        </FilterPill>
        <FilterPill
          role="checkbox"
          active={filters.reflectionsOnly}
          onClick={toggleReflections}
        >
          Reflections only
        </FilterPill>
        <FilterPill
          role="checkbox"
          active={filters.assessmentsOnly}
          onClick={toggleAssessments}
        >
          Assessments
        </FilterPill>
      </div>

      {/* Event list */}
      <div
        role="log"
        aria-label="Analytics event timeline"
        className="overflow-hidden rounded-lg"
        style={{
          border: '1px solid rgb(var(--border))',
          background: 'rgb(var(--white))',
        }}
      >
        {visible.length === 0 ? (
          <div
            className="font-sans text-body-sm text-tertiary"
            style={{ padding: '20px 16px', textAlign: 'center' }}
          >
            No events match the current filters.
          </div>
        ) : (
          <ul className="m-0 list-none p-0">
            {visible.map((e, idx) => (
              <li
                key={`${e.ts}-${idx}`}
                className="border-t border-border-light first:border-t-0 hover:bg-[rgb(var(--surface))]"
              >
                <EventRow event={e} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination footer */}
      <div className="mt-3 flex items-center justify-between gap-3 font-mono text-[11px] text-tertiary">
        <span aria-live="polite">
          Showing {visible.length} of {allFiltered.length}
          {allFiltered.length !== events.length && ` (filtered from ${events.length})`}
        </span>
        {hasMore && (
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="rounded-md font-sans text-[12.5px] font-semibold text-action hover:bg-surface"
            style={{
              padding: '6px 12px',
              border: '1px solid rgb(var(--border))',
              background: 'rgb(var(--white))',
            }}
          >
            Show More
          </button>
        )}
      </div>
    </section>
  );
}

function EventRow({ event }: { event: AnalyticsEvent }): JSX.Element {
  const time = new Date(event.ts).toLocaleTimeString([], { hour12: false });
  const moduleId = event.moduleId;
  const payloadStr = event.payload ? formatPayload(event.payload) : '';
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:flex-nowrap"
      style={{ padding: '7px 14px' }}
    >
      <span
        className="font-mono text-[11px] text-tertiary tabular-nums"
        style={{ minWidth: 70 }}
      >
        {time}
      </span>
      <span className="font-mono text-body-sm text-ink" style={{ flex: '1 1 auto', minWidth: 0 }}>
        {event.type}
      </span>
      {payloadStr && (
        <span className="font-sans text-[11px] text-secondary truncate" style={{ minWidth: 0 }}>
          {payloadStr}
        </span>
      )}
      {moduleId !== undefined && (
        <span
          className="font-mono text-[10px] font-bold uppercase rounded"
          style={{
            background: MODULE_PILL_BG[moduleId],
            color: MODULE_PILL_TEXT[moduleId],
            padding: '2px 6px',
            letterSpacing: '0.06em',
            flexShrink: 0,
          }}
        >
          M{moduleId}
        </span>
      )}
    </div>
  );
}

function formatPayload(payload: Record<string, unknown>): string {
  const parts: string[] = [];
  if ('optionId' in payload && 'isPreferred' in payload) {
    const ok = payload['isPreferred'] ? '✓' : '✗';
    parts.push(`(${String(payload['optionId'])}) ${ok}`);
  } else if ('classification' in payload) {
    const matchSym = payload['match'] === false ? ' ✗' : payload['match'] === true ? ' ✓' : '';
    parts.push(`${String(payload['classification'])}${matchSym}`);
  } else if ('temp' in payload && 'token' in payload) {
    parts.push(`T=${String(payload['temp'])} → ${String(payload['token'])}`);
  } else if ('chars' in payload) {
    parts.push(`${String(payload['chars'])} chars`);
  } else if ('seconds' in payload) {
    parts.push(`${String(payload['seconds'])}s`);
  } else if ('predicted' in payload) {
    parts.push(`pred ${String(payload['predicted'])}`);
  } else if ('actual' in payload) {
    parts.push(`actual ${String(payload['actual'])}`);
  } else if ('matchCount' in payload && 'total' in payload) {
    parts.push(`${String(payload['matchCount'])}/${String(payload['total'])}`);
  } else if ('sortKey' in payload) {
    parts.push(`sort: ${String(payload['sortKey'])}`);
  }
  return parts.join(' · ');
}

const MODULE_FILTER_OPTIONS = [
  [0, 'All'],
  [1, 'M1'],
  [2, 'M2'],
  [3, 'M3'],
  [4, 'M4'],
] as const;

interface FilterPillProps {
  active: boolean;
  role: 'radio' | 'checkbox';
  onClick: () => void;
  children: React.ReactNode;
  id?: string;
  tabIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

function FilterPill({
  active,
  role,
  onClick,
  children,
  id,
  tabIndex,
  onKeyDown,
}: FilterPillProps): JSX.Element {
  return (
    <button
      type="button"
      id={id}
      role={role}
      aria-checked={active}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      onClick={onClick}
      className="rounded-full font-sans text-[12px] font-medium transition-colors duration-150"
      style={{
        padding: '4px 12px',
        background: active ? 'rgb(var(--ink))' : 'rgb(var(--surface))',
        color: active ? 'rgb(var(--white))' : 'rgb(var(--secondary))',
        border: `1px solid ${active ? 'rgb(var(--ink))' : 'rgb(var(--border))'}`,
      }}
    >
      {children}
    </button>
  );
}
