// SummaryMetricsBar — four aggregate metrics (4D §7). HTML/CSS progress bars,
// no Recharts. Each metric is computed from the normalized `DashboardData`
// passed in by the parent. Zero-state handling per §7.3 — "—" shown for
// metrics with no inputs (live mode, early-journey).

import { useMemo } from 'react';
import type { AnalyticsEvent } from '../contexts/AnalyticsContext';
import type { LearnerProgressState } from '../contexts/LearnerProgressContext';
import { Overline } from '../components/shared/Overline';
import { TOTAL_SECTIONS } from './section-labels';

interface SummaryMetricsBarProps {
  progress: LearnerProgressState;
  events: AnalyticsEvent[];
}

// Optional interaction event keys (4D §7.6). 11 total.
const OPTIONAL_INTERACTION_EVENTS = new Set<string>([
  'p3_reflection_1_saved',
  'p3_reflection_2_saved',
  'p4_commitment_saved',
  'p3_methodology_expanded',
  'p5_free_mode_entered',
  'p6_reasoning_submitted',
  'p7_reasoning_submitted',
  'p8_reflection_saved',
  'p9_reflection_saved',
  'p11_reflection_saved',
  'p12_reflection_saved',
]);
const TOTAL_OPTIONAL = 11;

interface Metrics {
  completion: { done: number; total: number; pct: number };
  kc: { preferred: number; attempted: number; pct: number | null };
  time: { ms: number | null; formatted: string };
  engagement: { done: number; total: number; pct: number };
  assessment: {
    preScore: number | null; // null if pre not complete
    postScore: number | null; // null if post not complete
    preTotal: number; // always 10 by instrument design
    postTotal: number; // always 10 by instrument design
    delta: number | null; // postScore - preScore, null if either incomplete
  };
}

function computeMetrics(progress: LearnerProgressState, events: AnalyticsEvent[]): Metrics {
  // Completion: a section counts as done when BOTH bits are set.
  let done = 0;
  for (const key of Object.keys(progress.scrolledSections)) {
    if (progress.interactionCompleteSections[key]) done += 1;
  }
  // KC stats: iterate the recorded responses, every key matching `${m}.${s}.kc_*`.
  let preferred = 0;
  let attempted = 0;
  for (const [key, result] of Object.entries(progress.knowledgeChecks)) {
    if (!/\.kc_/.test(key)) continue;
    attempted += 1;
    if (result.isPreferred) preferred += 1;
  }
  // Active time on platform: sum of per-section reading time recorded by
  // the visibility/idle tracker in LearnerProgressContext. This replaces
  // the old `max(ts) - min(ts)` session-span, which over-counted any
  // time a tab was left open (visibility, idle, sleep all uncounted).
  // Sums whatever sections have a recorded value; absent sections
  // contribute 0. Null when nothing has been recorded yet.
  const activeTimeEntries = Object.values(progress.activeTimeMs ?? {});
  const timeMs =
    activeTimeEntries.length > 0
      ? activeTimeEntries.reduce((a, b) => a + b, 0)
      : null;
  // Engagement: count of unique optional interaction events seen.
  const seen = new Set<string>();
  for (const e of events) {
    if (OPTIONAL_INTERACTION_EVENTS.has(e.type)) seen.add(e.type);
  }

  // Assessment scores — defensive access via optional chaining since
  // `progress.assessments` could be undefined in edge cases (very old
  // localStorage from before the assessments migration was added).
  const preResponses = Object.values(progress.assessments?.pre?.responses ?? {});
  const postResponses = Object.values(progress.assessments?.post?.responses ?? {});
  const preComplete = progress.assessments?.pre?.completedAt != null;
  const postComplete = progress.assessments?.post?.completedAt != null;
  const preScore = preComplete
    ? preResponses.filter((r) => r.isCorrect).length
    : null;
  const postScore = postComplete
    ? postResponses.filter((r) => r.isCorrect).length
    : null;
  const delta =
    preScore != null && postScore != null ? postScore - preScore : null;

  return {
    completion: {
      done,
      total: TOTAL_SECTIONS,
      pct: TOTAL_SECTIONS === 0 ? 0 : done / TOTAL_SECTIONS,
    },
    kc: {
      preferred,
      attempted,
      pct: attempted === 0 ? null : preferred / attempted,
    },
    time: { ms: timeMs, formatted: formatTime(timeMs) },
    engagement: {
      done: seen.size,
      total: TOTAL_OPTIONAL,
      pct: seen.size / TOTAL_OPTIONAL,
    },
    assessment: {
      preScore,
      postScore,
      preTotal: 10,
      postTotal: 10,
      delta,
    },
  };
}

function formatTime(ms: number | null): string {
  if (ms == null || ms <= 0) return '—';
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function SummaryMetricsBar({ progress, events }: SummaryMetricsBarProps): JSX.Element {
  const m = useMemo(() => computeMetrics(progress, events), [progress, events]);
  const kcColor = kcToneColor(m.kc.pct);

  return (
    <section
      aria-label="Summary metrics"
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
    >
      <MetricCard
        label="Completion"
        value={m.completion.total === 0 ? '—' : `${Math.round(m.completion.pct * 100)}%`}
        detail={`${m.completion.done} of ${m.completion.total} sections`}
        progress={m.completion.pct}
        progressColor="rgb(var(--action))"
      />
      <MetricCard
        label="Knowledge Checks"
        value={m.kc.pct == null ? '—' : `${Math.round(m.kc.pct * 100)}%`}
        detail={
          m.kc.pct == null
            ? 'No items attempted'
            : `${m.kc.preferred} of ${m.kc.attempted} preferred`
        }
        progress={m.kc.pct ?? 0}
        progressColor={kcColor}
        hideProgress={m.kc.pct == null}
      />
      <MetricCard
        label="Active Time on Platform"
        value={m.time.formatted}
        detail={
          m.time.ms == null
            ? 'No active time recorded yet'
            : 'Visible + active reading only'
        }
        progress={null}
      />
      <MetricCard
        label="Engagement Depth"
        value={`${Math.round(m.engagement.pct * 100)}%`}
        detail={`${m.engagement.done} of ${m.engagement.total} optional`}
        progress={m.engagement.pct}
        progressColor="rgb(var(--action))"
      />
      <AssessmentCard a={m.assessment} />
    </section>
  );
}

/**
 * Assessment summary card. Three display states:
 *   • Neither complete  → "—"      with "No assessments taken"
 *   • Pre complete only → "6 / 10" with "Pre-assessment · Post not started"
 *   • Both complete     → "6 → 9"  with "+3 growth · 10 items each"
 *
 * Progress bar only renders in the "both complete" state and tracks the
 * post score against 10 items. Delta framing stays positive: "+N growth"
 * for improvement, "Solid baseline" for no change. (Negative deltas are
 * structurally possible but rare in practice; we still surface them
 * neutrally as "−N change" rather than as failure framing.)
 */
function AssessmentCard({ a }: { a: Metrics['assessment'] }): JSX.Element {
  const preDone = a.preScore != null;
  const postDone = a.postScore != null;

  if (!preDone && !postDone) {
    return (
      <MetricCard
        label="Assessment"
        value="—"
        detail="No assessments taken"
        progress={null}
      />
    );
  }

  if (preDone && !postDone) {
    return (
      <MetricCard
        label="Assessment"
        value={`${a.preScore} / ${a.preTotal}`}
        detail="Pre-assessment · Post not started"
        progress={null}
      />
    );
  }

  // Both complete — show the arrow comparison and the delta.
  const value = `${a.preScore} → ${a.postScore}`;
  const delta = a.delta ?? 0;
  let detail: string;
  if (delta > 0) detail = `+${delta} growth · 10 items each`;
  else if (delta < 0) detail = `${delta} change · 10 items each`;
  else detail = 'Solid baseline · 10 items each';

  return (
    <MetricCard
      label="Assessment"
      value={value}
      detail={detail}
      progress={(a.postScore ?? 0) / a.postTotal}
      progressColor="rgb(var(--action))"
    />
  );
}

function kcToneColor(pct: number | null): string {
  if (pct == null) return 'rgb(var(--border))';
  if (pct >= 0.75) return 'rgb(var(--success))';
  if (pct >= 0.5) return 'rgb(var(--caution))';
  return 'rgb(var(--error))';
}

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  progress: number | null;
  progressColor?: string;
  hideProgress?: boolean;
}

function MetricCard({
  label,
  value,
  detail,
  progress,
  progressColor = 'rgb(var(--action))',
  hideProgress = false,
}: MetricCardProps): JSX.Element {
  const pct = progress == null ? null : Math.max(0, Math.min(1, progress));
  return (
    <article
      className="rounded-lg"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        padding: 16,
      }}
    >
      <Overline className="mb-2" style={{ fontSize: 10 }}>
        {label}
      </Overline>
      <div
        className="font-display text-ink"
        style={{ fontSize: 22, lineHeight: 1.15, marginBottom: 4 }}
      >
        {value}
      </div>
      <div
        className="font-sans text-tertiary"
        style={{ fontSize: 11, marginBottom: pct == null || hideProgress ? 0 : 12 }}
      >
        {detail}
      </div>
      {pct != null && !hideProgress && (
        <div
          className="rounded-full"
          style={{
            background: 'rgb(var(--border-light))',
            height: 4,
            overflow: 'hidden',
          }}
          aria-label={`${label} ${Math.round(pct * 100)}%`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct * 100)}
        >
          <div
            style={{
              width: `${pct * 100}%`,
              height: '100%',
              background: progressColor,
              transition: 'width 200ms ease',
            }}
          />
        </div>
      )}
    </article>
  );
}
