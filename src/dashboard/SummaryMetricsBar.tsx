// SummaryMetricsBar — four aggregate metrics (4D §7). HTML/CSS progress bars,
// no Recharts. Each metric is computed from the normalized `DashboardData`
// passed in by the parent. Zero-state handling per §7.3 — "—" shown for
// metrics with no inputs (live mode, early-journey).

import { useMemo } from 'react';
import type { AnalyticsEvent } from '../contexts/AnalyticsContext';
import type { LearnerProgressState } from '../contexts/LearnerProgressContext';
import { Overline } from '../components/shared/Overline';
import { PRE_ASSESSMENT_ITEMS } from '../data/pre-assessment';
import { POST_ASSESSMENT_ITEMS } from '../data/post-assessment';
import {
  constructOutcomes,
  heldLabel,
  summarizeGrowth,
  type GrowthSummary,
} from '../utils/assessment-scoring';
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
    preComplete: boolean;
    postComplete: boolean;
    growth: GrowthSummary;
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
  const growth = summarizeGrowth(
    constructOutcomes(
      PRE_ASSESSMENT_ITEMS,
      POST_ASSESSMENT_ITEMS,
      progress.assessments?.pre?.responses ?? {},
      progress.assessments?.post?.responses ?? {},
    ),
  );

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
      preComplete: progress.assessments?.pre?.completedAt != null,
      postComplete: progress.assessments?.post?.completedAt != null,
      growth,
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
 *   • Neither complete  → "—"       with "No assessments taken"
 *   • Pre complete only → "8 / 12"  with "Pre-assessment · Post not started"
 *   • Both complete     → "8 → 11"  with "+3 growth · 75% of gap closed · 12 items each"
 *
 * The arrow compares the constructs answered on both forms, so a learner
 * whose baseline predates the twelve-item form is compared like with
 * like. A zero change reads against the pre score: "Strong baseline
 * held" from 80% or more, "No change yet" below that, so a stalled
 * learner is not shown as a success. Negative changes are surfaced
 * neutrally as "−N change". The progress bar tracks the post score.
 */
function AssessmentCard({ a }: { a: Metrics['assessment'] }): JSX.Element {
  const g = a.growth;

  if (!a.preComplete && !a.postComplete) {
    return (
      <MetricCard
        label="Assessment"
        value="—"
        detail="No assessments taken"
        progress={null}
      />
    );
  }

  if (a.preComplete && !a.postComplete) {
    return (
      <MetricCard
        label="Assessment"
        value={`${g.preCorrect} / ${g.preAnswered}`}
        detail="Pre-assessment · Post not started"
        progress={null}
      />
    );
  }

  const value = `${g.comparedPreCorrect} → ${g.comparedPostCorrect}`;
  const scope =
    g.compared === g.postTotal ? `${g.postTotal} items each` : `${g.compared} of ${g.postTotal} in baseline`;
  let detail: string;
  if (g.change > 0) {
    const closed = g.normalizedGain === null ? '' : ` · ${Math.round(g.normalizedGain * 100)}% of gap closed`;
    detail = `+${g.change} growth${closed} · ${scope}`;
  } else if (g.change < 0) detail = `−${Math.abs(g.change)} change · ${scope}`;
  else detail = `${heldLabel(g)} · ${scope}`;

  return (
    <MetricCard
      label="Assessment"
      value={value}
      detail={detail}
      progress={g.postTotal === 0 ? 0 : g.postCorrect / g.postTotal}
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
