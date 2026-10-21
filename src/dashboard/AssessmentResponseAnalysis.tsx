// AssessmentResponseAnalysis — dashboard per-item view of the pre/post
// assessment, organized by block. Parallel to KCResponseAnalysis but
// reads from `progress.assessments.{pre,post}.responses` instead of
// `progress.knowledgeChecks`.
//
// Each construct renders as a card showing both the pre and the post
// response side by side (stacked vertically on mobile).
// Left accent color encodes the joint correctness state:
//   both correct → success green
//   mixed (one correct, one not) → caution amber
//   both incorrect → error red
//   post not attempted → dashed border-light (matches KC's "not
//                       attempted" pattern)
//
// A score summary bar at the top mirrors the SummaryMetricsBar's
// 5th-card content, plus a count of answers given in under ten seconds
// (possible rapid guesses), the engagement check the Level 2 thresholds
// ask for before a low score is read as a learning outcome. When
// neither assessment has any data, the section collapses to a single
// "No assessment data" empty state.

import { useMemo } from 'react';
import { Overline } from '../components/shared/Overline';
import type { LearnerProgressState } from '../contexts/LearnerProgressContext';
import {
  PRE_ASSESSMENT_ITEMS,
  type AssessmentBlock,
  type AssessmentItem,
} from '../data/pre-assessment';
import {
  POST_ASSESSMENT_ITEMS,
  type PostAssessmentItem,
} from '../data/post-assessment';
import {
  constructOutcomes,
  RAPID_RESPONSE_MS,
  summarizeGrowth,
  type GrowthSummary,
} from '../utils/assessment-scoring';

interface AssessmentResponseAnalysisProps {
  progress: LearnerProgressState;
}

// Block display metadata. Names + ordering are canonical (match the
// instrument spec); colors are dashboard-only display tokens picked to
// stay distinct from the 4D competency palette used in
// KCResponseAnalysis. Hex declared here, consumed via `style` props
// in render — the rest of the file uses CSS variables.
const BLOCK_DISPLAY: Record<
  AssessmentBlock,
  { label: string; bg: string; text: string }
> = {
  usage: { label: 'Usage Patterns', bg: '#E6E9ED', text: '#29323D' }, // assessment slate (matches the 5th-accent PDF palette)
  failure: { label: 'Failure Modes', bg: '#F5EEDB', text: '#6B5A2A' }, // caution-family amber
  mechanics: { label: 'Mechanics', bg: '#E4EBF0', text: '#354A57' }, // info-family blue
  evaluation: { label: 'Evaluation', bg: '#EDE4F0', text: '#4A3557' }, // diligence-family purple
};

const BLOCK_ORDER: AssessmentBlock[] = [
  'usage',
  'failure',
  'mechanics',
  'evaluation',
];

interface AssessmentSidePayload {
  itemId: string;
  selectedOptionId: string | null;
  isCorrect: boolean | null;
  scenarioSummary: string;
  /** null when no response time was recorded (older responses). */
  responseMs: number | null;
}

interface AssessmentPairRow {
  constructKey: string;
  constructName: string;
  block: AssessmentBlock;
  pre: AssessmentSidePayload;
  post: AssessmentSidePayload;
}

/**
 * Join PRE+POST item banks by `constructKey` and decorate each pair
 * with the learner's recorded response (if any). The post-side
 * scenarioSummary is the one shown in the card (parallel scenario;
 * the pre summary stays available on the pre side).
 */
function buildPairRows(progress: LearnerProgressState): AssessmentPairRow[] {
  const preResponses = progress.assessments?.pre?.responses ?? {};
  const postResponses = progress.assessments?.post?.responses ?? {};

  const sidePayload = (
    item: AssessmentItem | PostAssessmentItem | undefined,
    response:
      | { selectedOptionId: string; isCorrect: boolean; responseMs?: number | undefined }
      | undefined,
  ): AssessmentSidePayload => ({
    itemId: item?.id ?? '',
    selectedOptionId: response?.selectedOptionId ?? null,
    isCorrect: response ? response.isCorrect : null,
    scenarioSummary: item?.scenarioSummary ?? '',
    responseMs: response?.responseMs ?? null,
  });

  // Post drives the order (matches the spec table ordering).
  return POST_ASSESSMENT_ITEMS.map((post) => {
    const pre = PRE_ASSESSMENT_ITEMS.find(
      (p) => p.constructKey === post.constructKey,
    );
    return {
      constructKey: post.constructKey,
      constructName: post.construct,
      block: post.block,
      pre: sidePayload(pre, preResponses[pre?.id ?? '']),
      post: sidePayload(post, postResponses[post.id]),
    } satisfies AssessmentPairRow;
  });
}

export function AssessmentResponseAnalysis({
  progress,
}: AssessmentResponseAnalysisProps): JSX.Element {
  const { rows, hasAnyData, preComplete, postComplete, growth } = useMemo(() => {
    const _preComplete = progress.assessments?.pre?.completedAt != null;
    const _postComplete = progress.assessments?.post?.completedAt != null;
    return {
      rows: buildPairRows(progress),
      hasAnyData: _preComplete || _postComplete,
      preComplete: _preComplete,
      postComplete: _postComplete,
      growth: summarizeGrowth(
        constructOutcomes(
          PRE_ASSESSMENT_ITEMS,
          POST_ASSESSMENT_ITEMS,
          progress.assessments?.pre?.responses ?? {},
          progress.assessments?.post?.responses ?? {},
        ),
      ),
    };
  }, [progress]);

  if (!hasAnyData) {
    return (
      <article
        style={{
          background: 'rgb(var(--surface))',
          border: '1px solid rgb(var(--border-light))',
          padding: '20px 16px',
          textAlign: 'center',
        }}
      >
        <span className="font-sans text-body-sm text-tertiary">
          No assessment data
        </span>
      </article>
    );
  }

  // Group rows by block for the per-block layout.
  const byBlock: Record<AssessmentBlock, AssessmentPairRow[]> = {
    usage: [],
    failure: [],
    mechanics: [],
    evaluation: [],
  };
  for (const row of rows) byBlock[row.block].push(row);

  return (
    <section
      aria-label="Assessment response analysis"
      className="space-y-5"
    >
      <ScoreSummaryBar
        preComplete={preComplete}
        postComplete={postComplete}
        growth={growth}
        rapid={{
          pre: rows.filter((r) => isRapid(r.pre)).length,
          post: rows.filter((r) => isRapid(r.post)).length,
        }}
      />
      {BLOCK_ORDER.map((block) => {
        const blockRows = byBlock[block];
        if (blockRows.length === 0) return null;
        const meta = BLOCK_DISPLAY[block];
        return (
          <div key={block}>
            <Overline className="mb-2" style={{ color: meta.text, fontSize: 11 }}>
              {meta.label}
            </Overline>
            <ul className="m-0 list-none p-0 space-y-2">
              {blockRows.map((row) => (
                <li key={row.constructKey}>
                  <ConstructCard row={row} preComplete={preComplete} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

// ─── Score summary bar (top of section) ──────────────────────────

function isRapid(side: AssessmentSidePayload): boolean {
  return side.responseMs !== null && side.responseMs < RAPID_RESPONSE_MS;
}

function ScoreSummaryBar({
  preComplete,
  postComplete,
  growth,
  rapid,
}: {
  preComplete: boolean;
  postComplete: boolean;
  growth: GrowthSummary;
  rapid: { pre: number; post: number };
}): JSX.Element {
  const delta = preComplete && postComplete ? growth.change : null;
  const deltaText =
    delta == null
      ? '—'
      : delta > 0
        ? `+${delta}`
        : delta < 0
          ? `${delta}`
          : '±0';
  const deltaColor =
    delta == null
      ? 'rgb(var(--muted))'
      : delta > 0
        ? 'rgb(var(--success))'
        : delta < 0
          ? 'rgb(var(--caution))'
          : 'rgb(var(--secondary))';

  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        padding: '12px 16px',
      }}
    >
      <ScoreCell
        label="Pre-Assessment"
        value={preComplete ? `${growth.preCorrect} / ${growth.preAnswered}` : '—'}
        sub={preComplete ? 'Complete' : 'Not started'}
      />
      <ScoreCell
        label="Post-Assessment"
        value={postComplete ? `${growth.postCorrect} / ${growth.postTotal}` : '—'}
        sub={postComplete ? 'Complete' : 'Not started'}
      />
      <ScoreCell
        label="Growth"
        value={deltaText}
        sub={
          growth.compared < growth.postTotal && delta != null
            ? `Δ items · ${growth.compared} in baseline`
            : 'Δ items'
        }
        color={deltaColor}
      />
      <ScoreCell
        label="Rapid answers"
        value={preComplete || postComplete ? `${rapid.pre} · ${rapid.post}` : '—'}
        sub={`pre · post, under ${RAPID_RESPONSE_MS / 1000} s`}
        color={rapid.pre + rapid.post > 0 ? 'rgb(var(--caution))' : undefined}
      />
    </div>
  );
}

function ScoreCell({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color?: string | undefined;
}): JSX.Element {
  return (
    <div className="min-w-0">
      <Overline className="mb-1" style={{ fontSize: 10 }}>
        {label}
      </Overline>
      <div
        className="font-display text-ink"
        style={{
          fontSize: 20,
          lineHeight: 1.15,
          marginBottom: 2,
          color: color ?? 'rgb(var(--ink))',
        }}
      >
        {value}
      </div>
      <div className="font-mono text-tertiary" style={{ fontSize: 11 }}>
        {sub}
      </div>
    </div>
  );
}

// ─── Construct pair card ─────────────────────────────────────────

function pairAccent(
  preCorrect: boolean | null,
  postCorrect: boolean | null,
): { color: string; dashed: boolean } {
  // Defensive: pre missing shouldn't happen in normal flow (Module 1 is
  // gated on pre-completion), but we treat it the same as post-missing.
  if (preCorrect == null || postCorrect == null) {
    return { color: 'rgb(var(--border-light))', dashed: true };
  }
  if (preCorrect && postCorrect) {
    return { color: 'rgb(var(--success))', dashed: false };
  }
  if (!preCorrect && !postCorrect) {
    return { color: 'rgb(var(--error))', dashed: false };
  }
  return { color: 'rgb(var(--caution))', dashed: false };
}

function ConstructCard({
  row,
  preComplete,
}: {
  row: AssessmentPairRow;
  preComplete: boolean;
}): JSX.Element {
  const accent = pairAccent(row.pre.isCorrect, row.post.isCorrect);
  const sideStyle = accent.dashed
    ? '1px dashed rgb(var(--border-light))'
    : '1px solid rgb(var(--border))';
  const blockMeta = BLOCK_DISPLAY[row.block];

  return (
    <article
      style={{
        background: accent.dashed
          ? 'rgb(var(--surface))'
          : 'rgb(var(--white))',
        borderTop: sideStyle,
        borderRight: sideStyle,
        borderBottom: sideStyle,
        borderLeft: `3px solid ${accent.color}`,
        padding: 12,
      }}
    >
      {/* Header row — construct name + block pill */}
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span
          className="font-mono text-[12px] font-bold text-ink"
          style={{ letterSpacing: '0.04em' }}
        >
          {row.constructName}
        </span>
        <span
          className="font-mono text-[10px] font-bold uppercase"
          style={{
            background: blockMeta.bg,
            color: blockMeta.text,
            padding: '2px 6px',
            letterSpacing: '0.06em',
            flexShrink: 0,
          }}
        >
          {blockMeta.label}
        </span>
      </div>

      {/* Pre/post row — two columns at md+, stacked on mobile. */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ResponseSide label="Pre" side={row.pre} preComplete={preComplete} />
        <ResponseSide label="Post" side={row.post} preComplete={preComplete} />
      </div>
    </article>
  );
}

function ResponseSide({
  label,
  side,
  preComplete,
}: {
  label: 'Pre' | 'Post';
  side: AssessmentSidePayload;
  preComplete: boolean;
}): JSX.Element {
  const attempted = side.selectedOptionId != null;
  const indicator = renderIndicator(side, label, preComplete);
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-baseline gap-2">
        <span
          className="font-mono text-[11px] font-bold uppercase text-tertiary"
          style={{ letterSpacing: '0.08em' }}
        >
          {label}:
        </span>
        {attempted ? (
          <span
            className="font-mono text-[12.5px] font-bold text-ink"
            style={{ letterSpacing: '0.04em' }}
          >
            {String(side.selectedOptionId).toUpperCase()}
          </span>
        ) : null}
        {indicator}
        {isRapid(side) && (
          <span
            className="font-mono text-[11px] font-semibold"
            style={{ color: 'rgb(var(--caution))' }}
          >
            rapid · {Math.round((side.responseMs ?? 0) / 1000)} s
          </span>
        )}
      </div>
      {side.scenarioSummary && (
        <div
          className="font-sans text-tertiary"
          style={{ fontSize: 11, lineHeight: 1.45, overflowWrap: 'anywhere' }}
        >
          {side.scenarioSummary}
        </div>
      )}
    </div>
  );
}

function renderIndicator(
  side: AssessmentSidePayload,
  label: 'Pre' | 'Post',
  preComplete: boolean,
): JSX.Element {
  if (side.selectedOptionId == null) {
    // Three not-attempted reasons: post not started is the common case
    // (mid-program learner); a completed pre without this item is a
    // baseline taken on the earlier ten-item form; anything else is
    // anomalous.
    return (
      <span className="font-sans text-[12px] text-muted">
        {label === 'Post' ? 'Not started' : preComplete ? 'Not in baseline' : '—'}
      </span>
    );
  }
  if (side.isCorrect) {
    return (
      <span
        className="font-sans text-[12px] font-semibold"
        style={{ color: 'rgb(var(--success))' }}
      >
        ✓ Preferred
      </span>
    );
  }
  return (
    <span
      className="font-sans text-[12px] font-semibold"
      style={{ color: 'rgb(var(--caution))' }}
    >
      ✗ Not preferred
    </span>
  );
}
