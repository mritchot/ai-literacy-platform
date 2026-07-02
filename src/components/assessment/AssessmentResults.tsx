// AssessmentResults — comparative pre→post view shown immediately
// after the learner submits the post-assessment. This is the
// payoff screen of the entire matched-assessment system: pre and
// post responses sit side-by-side for each construct so the
// learner can see exactly how their reasoning shifted.
//
// Composition:
//   1. ScoreHeader   — pre N/T, post N/T, delta chip
//   2. BlockBreakdown — 4 blocks × {pre count, post count}
//   3. ConstructList — 10 expandable cards (one per construct pair).
//      Collapsed: construct name + pre/post option pills + ✓/✗.
//      Expanded: full pre stem + learner's pre answer; full post stem
//      + learner's post answer + post item's feedback for that option.
//
// The component is read-only — it's rendered both inline at the end
// of the post-assessment flow and (via AssessmentGrowth) inside M4 S10
// itself.

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { PRE_ASSESSMENT_ITEMS, type AssessmentItem } from '../../data/pre-assessment';
import { POST_ASSESSMENT_ITEMS, type PostAssessmentItem } from '../../data/post-assessment';
import { renderMarkdownLite } from '../../modules/module4/render-markdown-lite';
import { Icon } from '../shared/Icon';
import { Overline } from '../shared/Overline';

// Accents reused from the program palette so the assessment surface
// reads as native to the rest of the platform.
const ASSESSMENT_ACCENT = '#5E7080';
const SUCCESS = 'rgb(var(--success))';
const SUCCESS_LIGHT = 'rgb(var(--success-light))';
const ERROR = 'rgb(var(--error))';
const ERROR_LIGHT = 'rgb(var(--error-light))';
const SURFACE = 'rgb(var(--surface))';
const WHITE = 'rgb(var(--white))';

const BLOCK_LABELS: Record<string, string> = {
  usage: 'Usage patterns',
  failure: 'Failure modes',
  mechanics: 'Mechanics',
  evaluation: 'Evaluation',
};

interface AssessmentResultsProps {
  /** When true, surfaces the M1→M4 navigation links + congrats hero
   *  (the standalone results page after submission). When false, the
   *  header/footer chrome is suppressed because the component is being
   *  embedded inside M4 S10's CompletionSummary via AssessmentGrowth. */
  variant: 'standalone' | 'embedded';
}

interface ConstructPair {
  constructKey: string;
  construct: string;
  block: AssessmentItem['block'];
  preItem: AssessmentItem;
  postItem: PostAssessmentItem;
}

export function AssessmentResults({ variant }: AssessmentResultsProps): JSX.Element {
  const { getAssessmentResponses, isAssessmentComplete } = useLearnerProgress();

  // Defensive guard — AssessmentResults can be loaded directly via the
  // route, so a learner who hasn't completed both sides gets a
  // placeholder rather than an empty grid. (The post-assessment route
  // also blocks this at the controller level; this is the second wall.)
  const preComplete = isAssessmentComplete('pre');
  const postComplete = isAssessmentComplete('post');
  // Join pre + post items by constructKey. The post list drives the
  // order (post-assessment ordering matches the spec table).
  const pairs = useMemo<ConstructPair[]>(
    () =>
      POST_ASSESSMENT_ITEMS.map((post) => {
        const pre = PRE_ASSESSMENT_ITEMS.find(
          (p) => p.constructKey === post.constructKey,
        );
        // If a pre item is missing (shouldn't happen — both files are
        // built from the same construct map), skip the pair rather
        // than throwing.
        if (!pre) return null;
        return {
          constructKey: post.constructKey,
          construct: post.construct,
          block: post.block,
          preItem: pre,
          postItem: post,
        };
      }).filter((p): p is ConstructPair => p !== null),
    [],
  );

  if (!preComplete || !postComplete) {
    return <IncompletePlaceholder preComplete={preComplete} postComplete={postComplete} />;
  }

  const preResponses = getAssessmentResponses('pre');
  const postResponses = getAssessmentResponses('post');

  // Per-item correctness for the score header + block breakdown.
  const preScore = countCorrect(PRE_ASSESSMENT_ITEMS, preResponses);
  const postScore = countCorrect(POST_ASSESSMENT_ITEMS, postResponses);
  const total = pairs.length;

  return (
    <div className="space-y-6">
      {variant === 'standalone' && <ResultsHero />}
      <ScoreHeader preCorrect={preScore} postCorrect={postScore} total={total} />
      <BlockBreakdown
        pairs={pairs}
        preResponses={preResponses}
        postResponses={postResponses}
      />
      <ConstructList
        pairs={pairs}
        preResponses={preResponses}
        postResponses={postResponses}
      />
      {variant === 'standalone' && <ResultsFooter />}
    </div>
  );
}

// ─── Hero (standalone variant only) ──────────────────────────────

function ResultsHero(): JSX.Element {
  return (
    <div>
      <Overline className="mb-2">Post-assessment complete</Overline>
      <h1
        className="m-0 mb-3 font-display text-title font-normal text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        Your pre &rarr; post comparison
      </h1>
      <p
        className="m-0 max-w-reading font-sans text-body text-body"
        style={{ lineHeight: 1.6 }}
      >
        Same constructs, different scenarios. Each card pairs your reasoning at the
        start of the program with your reasoning now, plus feedback on the
        post-assessment option you picked.
      </p>
    </div>
  );
}

function ResultsFooter(): JSX.Element {
  return (
    <div
      className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border-light pt-6"
    >
      <p className="m-0 max-w-reading font-sans text-body-sm text-secondary">
        Your competency profile (Module 4 &middot; Section 10) shows the program work behind
        the change.
      </p>
      <Link
        to="/module/4/section/10"
        className="inline-flex items-center gap-2.5 rounded-md bg-action px-5 py-3 font-sans text-[14px] font-semibold text-[rgb(var(--white))] no-underline transition-colors duration-150 hover:bg-action-hover"
        style={{ border: '1.5px solid rgb(var(--action))' }}
      >
        See your competency profile
        <Icon name="arrowRight" size={14} />
      </Link>
    </div>
  );
}

// ─── Score header ────────────────────────────────────────────────

function ScoreHeader({
  preCorrect,
  postCorrect,
  total,
}: {
  preCorrect: number;
  postCorrect: number;
  total: number;
}): JSX.Element {
  const delta = postCorrect - preCorrect;
  const deltaSign = delta > 0 ? '+' : delta < 0 ? '' : '±';
  const deltaColor =
    delta > 0 ? SUCCESS : delta < 0 ? ERROR : 'rgb(var(--muted))';
  const deltaBg =
    delta > 0 ? SUCCESS_LIGHT : delta < 0 ? ERROR_LIGHT : SURFACE;

  return (
    <section
      aria-label="Assessment score summary"
      className="rounded-lg"
      style={{
        background: WHITE,
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${ASSESSMENT_ACCENT}`,
        padding: '20px 24px',
      }}
    >
      <Overline className="mb-3" style={{ color: ASSESSMENT_ACCENT }}>
        Assessment growth
      </Overline>
      {/* Grid: stack on mobile, three columns at sm+. Each cell uses
          `minmax(0, 1fr)` semantics through Tailwind's grid-cols
          utilities to prevent the delta chip from forcing the layout. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ScoreCell label="Pre-assessment" value={`${preCorrect} / ${total}`} sub="Baseline" />
        <ScoreCell label="Post-assessment" value={`${postCorrect} / ${total}`} sub="After Module 4" />
        <div
          className="flex flex-col justify-center rounded-md"
          style={{
            background: deltaBg,
            border: `1px solid ${deltaColor === 'rgb(var(--muted))' ? 'rgb(var(--border-light))' : deltaColor}`,
            padding: '12px 16px',
            minWidth: 0,
          }}
        >
          <div
            className="font-mono text-[10px] font-bold uppercase"
            style={{ color: deltaColor, letterSpacing: '0.12em' }}
          >
            Change
          </div>
          <div
            className="mt-0.5 font-display text-[28px]"
            style={{ lineHeight: 1.1, color: deltaColor }}
          >
            {deltaSign}
            {Math.abs(delta)}
          </div>
          <div className="mt-0.5 font-sans text-[12px] text-secondary">
            {delta > 0
              ? `${delta} more preferred response${delta === 1 ? '' : 's'}`
              : delta < 0
                ? `${Math.abs(delta)} fewer preferred response${Math.abs(delta) === 1 ? '' : 's'}`
                : 'No change in score'}
          </div>
        </div>
      </div>
    </section>
  );
}

function ScoreCell({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}): JSX.Element {
  return (
    <div
      className="flex flex-col justify-center rounded-md"
      style={{
        background: SURFACE,
        border: '1px solid rgb(var(--border-light))',
        padding: '12px 16px',
        minWidth: 0,
      }}
    >
      <div
        className="font-mono text-[10px] font-bold uppercase text-tertiary"
        style={{ letterSpacing: '0.12em' }}
      >
        {label}
      </div>
      <div
        className="mt-0.5 font-display text-[28px] text-ink"
        style={{ lineHeight: 1.1 }}
      >
        {value}
      </div>
      <div className="mt-0.5 font-sans text-[12px] text-secondary">{sub}</div>
    </div>
  );
}

// ─── Block breakdown ─────────────────────────────────────────────

function BlockBreakdown({
  pairs,
  preResponses,
  postResponses,
}: {
  pairs: ConstructPair[];
  preResponses: Record<string, { selectedOptionId: string; isCorrect: boolean }>;
  postResponses: Record<string, { selectedOptionId: string; isCorrect: boolean }>;
}): JSX.Element {
  // Aggregate by block — same shape as the spec block listing in the
  // instrument doc (usage / failure / mechanics / evaluation).
  type BlockStats = { total: number; preCorrect: number; postCorrect: number };
  const byBlock: Record<string, BlockStats> = {};
  for (const pair of pairs) {
    const slot = byBlock[pair.block] ?? { total: 0, preCorrect: 0, postCorrect: 0 };
    slot.total += 1;
    if (preResponses[pair.preItem.id]?.isCorrect) slot.preCorrect += 1;
    if (postResponses[pair.postItem.id]?.isCorrect) slot.postCorrect += 1;
    byBlock[pair.block] = slot;
  }
  const blockOrder: Array<keyof typeof BLOCK_LABELS> = [
    'usage',
    'failure',
    'mechanics',
    'evaluation',
  ];

  return (
    <section
      aria-label="Score by block"
      className="rounded-lg"
      style={{
        background: WHITE,
        border: '1px solid rgb(var(--border))',
        padding: '18px 22px',
      }}
    >
      <Overline className="mb-3">By construct block</Overline>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {blockOrder.map((block) => {
          const stats = byBlock[block];
          if (!stats) return null;
          const delta = stats.postCorrect - stats.preCorrect;
          return (
            <div
              key={block}
              className="rounded-md"
              style={{
                background: SURFACE,
                border: '1px solid rgb(var(--border-light))',
                padding: '12px 14px',
                minWidth: 0,
              }}
            >
              <div className="mb-1 font-sans text-[12.5px] font-semibold text-ink">
                {BLOCK_LABELS[block]}
              </div>
              <div
                className="font-mono text-[11px] text-secondary"
                style={{ letterSpacing: '0.02em', lineHeight: 1.6 }}
              >
                <div>
                  Pre <strong className="text-ink">{stats.preCorrect}/{stats.total}</strong>
                </div>
                <div>
                  Post <strong className="text-ink">{stats.postCorrect}/{stats.total}</strong>
                </div>
                <div style={{ color: delta > 0 ? SUCCESS : delta < 0 ? ERROR : 'rgb(var(--muted))' }}>
                  {delta > 0 ? '+' : delta < 0 ? '' : '±'}
                  {Math.abs(delta)} change
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Per-construct expandable cards ──────────────────────────────

function ConstructList({
  pairs,
  preResponses,
  postResponses,
}: {
  pairs: ConstructPair[];
  preResponses: Record<string, { selectedOptionId: string; isCorrect: boolean }>;
  postResponses: Record<string, { selectedOptionId: string; isCorrect: boolean }>;
}): JSX.Element {
  return (
    <section aria-label="Construct-by-construct comparison" className="space-y-3">
      <div className="flex items-baseline justify-between">
        <Overline>Construct by construct</Overline>
        <span
          className="font-mono text-[11px] text-tertiary"
          style={{ letterSpacing: '0.04em' }}
        >
          Click a row to expand
        </span>
      </div>
      <ul className="m-0 list-none space-y-3 p-0">
        {pairs.map((pair, idx) => (
          <ConstructCard
            key={pair.constructKey}
            index={idx + 1}
            pair={pair}
            preResponse={preResponses[pair.preItem.id]}
            postResponse={postResponses[pair.postItem.id]}
          />
        ))}
      </ul>
    </section>
  );
}

function ConstructCard({
  index,
  pair,
  preResponse,
  postResponse,
}: {
  index: number;
  pair: ConstructPair;
  preResponse: { selectedOptionId: string; isCorrect: boolean } | undefined;
  postResponse: { selectedOptionId: string; isCorrect: boolean } | undefined;
}): JSX.Element {
  const [expanded, setExpanded] = useState(false);

  // Locate the actual option objects on each side so we can show the
  // option text in the expanded view + feedback (from post item).
  const preOption = preResponse
    ? pair.preItem.options.find((o) => o.id === preResponse.selectedOptionId)
    : undefined;
  const postOption = postResponse
    ? pair.postItem.options.find((o) => o.id === postResponse.selectedOptionId)
    : undefined;

  return (
    <li
      className="rounded-lg"
      style={{
        background: WHITE,
        border: '1px solid rgb(var(--border))',
        borderLeft: `3px solid ${ASSESSMENT_ACCENT}`,
        // `minWidth: 0` so the row respects its parent column on mobile
        // even when long option text exists.
        minWidth: 0,
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-start gap-3 rounded-lg text-left hover:bg-[rgb(var(--surface))]"
        style={{ padding: '14px 18px', cursor: 'pointer' }}
      >
        <span
          aria-hidden="true"
          className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center"
          style={{ color: 'rgb(var(--secondary))' }}
        >
          <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={16} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <div
              className="font-mono text-[10px] font-bold uppercase text-tertiary"
              style={{ letterSpacing: '0.12em' }}
            >
              Construct {index} &middot; {BLOCK_LABELS[pair.block]}
            </div>
            <div
              className="mt-0.5 font-sans text-body-sm font-semibold text-ink"
              style={{ overflowWrap: 'anywhere' }}
            >
              {pair.construct}
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <ResponsePill
              label="Pre"
              optionId={preResponse?.selectedOptionId}
              isCorrect={preResponse?.isCorrect}
            />
            <span
              aria-hidden="true"
              className="font-mono text-[12px] text-tertiary"
            >
              &rarr;
            </span>
            <ResponsePill
              label="Post"
              optionId={postResponse?.selectedOptionId}
              isCorrect={postResponse?.isCorrect}
            />
          </div>
        </div>
      </button>
      {expanded && (
        <div
          className="section-enter space-y-4 border-t border-border-light"
          style={{ padding: '16px 18px 18px' }}
        >
          <ComparisonSide
            sideLabel="Pre-assessment"
            scenarioSummary={pair.preItem.scenarioSummary}
            stem={pair.preItem.stem}
            chosenOption={preOption}
            correctOption={pair.preItem.options.find((o) => o.isCorrect)}
            showFeedback={false}
          />
          <ComparisonSide
            sideLabel="Post-assessment"
            scenarioSummary={pair.postItem.scenarioSummary}
            stem={pair.postItem.stem}
            chosenOption={postOption}
            correctOption={pair.postItem.options.find((o) => o.isCorrect)}
            showFeedback={true}
          />
        </div>
      )}
    </li>
  );
}

function ResponsePill({
  label,
  optionId,
  isCorrect,
}: {
  label: string;
  optionId?: string;
  isCorrect?: boolean;
}): JSX.Element {
  const display = optionId ?? '—';
  const ok = optionId && isCorrect;
  const wrong = optionId && !isCorrect;
  const color = ok ? SUCCESS : wrong ? ERROR : 'rgb(var(--muted))';
  const bg = ok ? SUCCESS_LIGHT : wrong ? ERROR_LIGHT : SURFACE;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md font-mono text-[11px] font-bold uppercase"
      style={{
        background: bg,
        color,
        border: `1px solid ${color === 'rgb(var(--muted))' ? 'rgb(var(--border-light))' : color}`,
        padding: '4px 8px',
        letterSpacing: '0.08em',
        whiteSpace: 'nowrap',
      }}
    >
      <span className="text-tertiary">{label}</span>
      <span>{display}</span>
      {ok && <span aria-label="correct">✓</span>}
      {wrong && <span aria-label="incorrect">✗</span>}
    </span>
  );
}

function ComparisonSide({
  sideLabel,
  scenarioSummary,
  stem,
  chosenOption,
  correctOption,
  showFeedback,
}: {
  sideLabel: string;
  scenarioSummary: string;
  stem: string;
  chosenOption:
    | { id: string; text: string; isCorrect: boolean; feedbackText: string }
    | undefined;
  correctOption:
    | { id: string; text: string; isCorrect: boolean; feedbackText: string }
    | undefined;
  /** Post-assessment side shows feedback; pre-assessment side hides
   *  it (no feedback was shown during the pre-assessment, and the
   *  post item's feedback is the relevant one for the comparison). */
  showFeedback: boolean;
}): JSX.Element {
  const isCorrect = Boolean(chosenOption?.isCorrect);
  const accent = isCorrect ? SUCCESS : chosenOption ? ERROR : 'rgb(var(--muted))';
  return (
    <div
      className="rounded-md"
      style={{
        background: SURFACE,
        border: '1px solid rgb(var(--border-light))',
        borderLeft: `3px solid ${accent}`,
        padding: '12px 14px',
        minWidth: 0,
      }}
    >
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <Overline style={{ color: accent }}>{sideLabel}</Overline>
        {chosenOption && (
          <span
            className="font-mono text-[10px] font-bold uppercase"
            style={{ color: accent, letterSpacing: '0.1em' }}
          >
            {isCorrect ? 'Preferred response' : 'Not the preferred response'}
          </span>
        )}
      </div>
      <p
        className="m-0 mb-2 font-sans text-[12.5px] italic text-secondary"
        style={{ lineHeight: 1.5, overflowWrap: 'anywhere' }}
      >
        {scenarioSummary}
      </p>
      <details className="group">
        <summary
          className="cursor-pointer font-mono text-[11px] font-semibold text-action hover:underline"
          style={{ letterSpacing: '0.04em', listStyle: 'none' }}
        >
          {/* CSS-only label swap: the `group-open:` variants on each span
              key off the parent <details>'s `[open]` attribute, so the
              browser keeps managing the disclosure state and we don't
              need a separate React useState to track it. */}
          <span className="group-open:hidden">Show full scenario</span>
          <span className="hidden group-open:inline">Hide full scenario</span>
        </summary>
        <div
          className="mt-2 font-sans text-body-sm text-body"
          style={{
            lineHeight: 1.55,
            overflowWrap: 'anywhere',
            background: WHITE,
            border: '1px solid rgb(var(--border-light))',
            borderRadius: 6,
            padding: '10px 12px',
          }}
        >
          {renderMarkdownLite(stem)}
        </div>
      </details>
      <div className="mt-3 space-y-2">
        {chosenOption ? (
          <div>
            <div
              className="mb-0.5 font-mono text-[10px] font-bold uppercase text-tertiary"
              style={{ letterSpacing: '0.1em' }}
            >
              Your response &middot; option {chosenOption.id}
            </div>
            <div
              className="font-sans text-body-sm text-body"
              style={{ lineHeight: 1.55, overflowWrap: 'anywhere' }}
            >
              {chosenOption.text}
            </div>
            {showFeedback && (
              <div
                className="mt-2 rounded-md font-sans text-body-sm text-body"
                style={{
                  background: WHITE,
                  border: '1px solid rgb(var(--border-light))',
                  borderLeft: `3px solid ${accent}`,
                  padding: '10px 12px',
                  lineHeight: 1.55,
                  overflowWrap: 'anywhere',
                }}
              >
                {chosenOption.feedbackText}
              </div>
            )}
          </div>
        ) : (
          <p className="m-0 font-sans text-body-sm italic text-muted">No response recorded.</p>
        )}
        {/* Show the correct option for context whenever the learner
            didn't pick it. Only on the post side — the pre side is the
            baseline and we honor the "no answer reveal" framing. */}
        {showFeedback && chosenOption && !chosenOption.isCorrect && correctOption && (
          <div
            className="rounded-md"
            style={{
              background: SUCCESS_LIGHT,
              border: `1px solid ${SUCCESS}`,
              padding: '10px 12px',
              minWidth: 0,
            }}
          >
            <div
              className="mb-0.5 font-mono text-[10px] font-bold uppercase"
              style={{ color: SUCCESS, letterSpacing: '0.1em' }}
            >
              Preferred response &middot; option {correctOption.id}
            </div>
            <div
              className="mb-1.5 font-sans text-body-sm font-semibold text-ink"
              style={{ overflowWrap: 'anywhere' }}
            >
              {correctOption.text}
            </div>
            <div
              className="font-sans text-body-sm text-body"
              style={{ lineHeight: 1.55, overflowWrap: 'anywhere' }}
            >
              {correctOption.feedbackText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────

function countCorrect(
  items: AssessmentItem[] | PostAssessmentItem[],
  responses: Record<string, { isCorrect: boolean }>,
): number {
  return items.reduce(
    (acc, item) => (responses[item.id]?.isCorrect ? acc + 1 : acc),
    0,
  );
}

function IncompletePlaceholder({
  preComplete,
  postComplete,
}: {
  preComplete: boolean;
  postComplete: boolean;
}): JSX.Element {
  return (
    <div
      className="rounded-lg font-sans"
      style={{
        background: SURFACE,
        border: '1px solid rgb(var(--border))',
        padding: '32px 24px',
        textAlign: 'center',
      }}
    >
      <p
        className="m-0 mb-2 font-sans text-h3 font-semibold text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        Comparative results aren&rsquo;t available yet
      </p>
      <p className="m-0 font-sans text-body-sm text-secondary">
        {!preComplete && !postComplete
          ? 'Take the pre-assessment before Module 1 and the post-assessment after Module 4 to see this comparison.'
          : !preComplete
            ? 'Your post-assessment is recorded, but you didn\'t take the pre-assessment. The comparison needs both.'
            : 'Take the post-assessment after Module 4 to see the comparison with your pre-assessment responses.'}
      </p>
    </div>
  );
}
