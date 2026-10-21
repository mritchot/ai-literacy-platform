// S9 DiagnosticPairTable — maps observable AI failures to the property
// pair behind them and a targeted fix (4C spec §13). Two row groups:
// three core diagnostic pairs and two extension patterns rendered with a
// lighter visual weight.
//
// Two modes. "reference" is the static table. "predict" shows the
// citation row as a worked example (the prose above the table already
// traces it), then asks the learner to pick the pair for the other four
// failures in interleaved order before revealing it, and shows the full
// table once all four are checked. Each check persists under
// `3.9.pair_N → { selectedOptionId: 'propA+propB', isPreferred }`; the
// keys do not match the dashboard's `.kc_` filter, so knowledge-check
// metrics are unaffected. Print mode always renders the reference table.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Overline } from '../../components/shared/Overline';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { usePrintMode } from '../../contexts/PrintModeContext';
import { useViewport } from '../../hooks/useViewport';
import { scrollBehavior } from '../../utils/motion';

type PropertyId = 'tokenization' | 'ntp' | 'knowledge' | 'context' | 'steerability';

// Fixed chip order: the order Module 3 teaches the five properties.
const PROPERTY_ORDER: PropertyId[] = ['tokenization', 'ntp', 'knowledge', 'context', 'steerability'];

const PROPERTY_LABELS: Record<PropertyId, string> = {
  tokenization: 'Tokenization',
  ntp: 'Next-token prediction',
  knowledge: 'Knowledge',
  context: 'Context window',
  steerability: 'Steerability',
};

interface PairRow {
  /** Storage leaf under section 3.9. */
  id: 'pair_1' | 'pair_2' | 'pair_3' | 'pair_4' | 'pair_5';
  failure: string;
  pair: [PropertyId, PropertyId];
  property1: string;
  property2: string;
  fix: string;
  reason: string;
}

const CORE_PAIRS: PairRow[] = [
  {
    id: 'pair_1',
    failure:
      'Fabricated citations, invented statistics, confident claims about nonexistent sources',
    pair: ['ntp', 'knowledge'],
    property1: 'Next-token prediction',
    property2: 'Knowledge (sparse)',
    fix:
      'Verify every specific claim against an independent source; use retrieval tools or document grounding.',
    reason:
      'Prediction produces citation-shaped text, and thin knowledge of the specific sources leaves nothing to anchor the details.',
  },
  {
    id: 'pair_2',
    failure:
      'Constraints ignored over a long conversation; tone drifts, format loosens, restrictions reappear',
    pair: ['context', 'steerability'],
    property1: 'Context window',
    property2: 'Steerability',
    fix:
      'Start a fresh conversation with key constraints restated at the top; break long projects into shorter sessions.',
    reason:
      'As the conversation grows, your early instructions take up less of the window and lose influence, so the output drifts toward the model’s default patterns.',
  },
  {
    id: 'pair_3',
    failure:
      'Wrong arithmetic presented with full confidence; character counts off; spelling tasks fail',
    pair: ['tokenization', 'ntp'],
    property1: 'Tokenization',
    property2: 'Next-token prediction',
    fix:
      'Offload computation to dedicated tools; ask the model to write code rather than calculate directly.',
    reason:
      'Digits and letters are packed into tokens that ignore place value and spelling, and the model predicts an answer from those fragments instead of calculating or counting.',
  },
];

const EXTENSION_PAIRS: PairRow[] = [
  {
    id: 'pair_4',
    failure:
      'Incomplete summary of a long document — output looks complete but misses sections',
    pair: ['context', 'ntp'],
    property1: 'Context window',
    property2: 'Next-token prediction',
    fix: 'Chunk the document; verify full-source coverage.',
    reason:
      'Material in the middle of a long input gets less attention, and prediction still produces a summary that sounds complete.',
  },
  {
    id: 'pair_5',
    failure: 'Degrades in non-English languages — more errors, awkward phrasing',
    pair: ['tokenization', 'knowledge'],
    property1: 'Tokenization',
    property2: 'Knowledge (sparse)',
    fix: 'Extra verification time for non-English output.',
    reason:
      'The text splits into more tokens, and the training data holds fewer examples of the language, so both the input and the patterns behind the output are thinner.',
  },
];

const ALL_PAIRS: PairRow[] = [...CORE_PAIRS, ...EXTENSION_PAIRS];

function pairById(id: PairRow['id']): PairRow {
  const row = ALL_PAIRS.find((r) => r.id === id);
  if (!row) throw new Error(`Unknown diagnostic pair: ${id}`);
  return row;
}

const WORKED_EXAMPLE = pairById('pair_1');

// Interleaved so no two neighboring failures share a property
// (arithmetic, drift, non-English, summary).
const PREDICT_ROWS: PairRow[] = [
  pairById('pair_3'),
  pairById('pair_2'),
  pairById('pair_5'),
  pairById('pair_4'),
];

function isPropertyId(v: string): v is PropertyId {
  return (PROPERTY_ORDER as string[]).includes(v);
}

function encodeSelection(selection: PropertyId[]): string {
  return [...selection]
    .sort((a, b) => PROPERTY_ORDER.indexOf(a) - PROPERTY_ORDER.indexOf(b))
    .join('+');
}

// Persisted values come from the shared 'ail.progress' store, so a
// malformed value reads as "not yet checked" and the learner can retry.
function decodeSelection(stored: string | undefined): PropertyId[] | null {
  if (!stored) return null;
  const parts = stored.split('+').filter(isPropertyId);
  return parts.length === 2 && parts[0] !== parts[1] ? parts : null;
}

function matchCount(selection: PropertyId[], row: PairRow): number {
  return selection.filter((p) => row.pair.includes(p)).length;
}

export function DiagnosticPairTable({
  mode = 'reference',
}: {
  mode?: 'predict' | 'reference';
}): JSX.Element {
  const isPrint = usePrintMode();
  if (mode === 'predict' && !isPrint) return <PairPrediction />;
  return <PairReference />;
}

function PairReference(): JSX.Element {
  // Mobile renders each row as a stacked card (failure heading,
  // property-pair chips, fix). The 4-column desktop table had to
  // horizontally-scroll on mobile to fit and required the learner to
  // pan the table to read fixes — awkward UX that broke the natural
  // top-to-bottom reading flow of the rest of the section. Cards
  // preserve the same data (failure / pair / fix) but give each row
  // the full row width so all three pieces are visible at once.
  const viewport = useViewport();
  const isMobile = viewport === 'mobile';
  return (
    <figure
      className="m-0"
      aria-label="Diagnostic pair reference table"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgb(var(--border-light))' }}>
        <Overline className="mb-1">Diagnostic pairs</Overline>
        <p className="m-0 font-sans text-body-sm text-body">
          Most workplace AI failures are two properties intersecting. Naming the pair turns a vague
          “something is off” into a targeted fix.
        </p>
      </div>

      {isMobile ? (
        <MobilePairList />
      ) : (
        <div className="overflow-x-auto">
          <table
            className="w-full border-collapse font-sans text-body-sm"
            role="table"
          >
            <caption className="sr-only">
              Diagnostic pair reference: failure signature, the two properties that produced it, and
              the targeted fix.
            </caption>
            <thead style={{ background: 'rgb(var(--surface-warm))' }}>
              <tr>
                <Th>Failure you see</Th>
                <Th>Property 1</Th>
                <Th>Property 2</Th>
                <Th>The fix</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} style={cellHeaderStyle}>
                  <span className="font-mono text-overline font-bold uppercase text-tertiary" style={{ letterSpacing: '0.1em' }}>
                    Core pairs
                  </span>
                </td>
              </tr>
              {CORE_PAIRS.map((row, i) => (
                <PairRowEl key={`core-${i}`} row={row} variant="core" />
              ))}
              <tr>
                <td colSpan={4} style={cellHeaderStyle}>
                  <span className="font-mono text-overline font-bold uppercase text-tertiary" style={{ letterSpacing: '0.1em' }}>
                    Other common patterns
                  </span>
                </td>
              </tr>
              {EXTENSION_PAIRS.map((row, i) => (
                <PairRowEl key={`ext-${i}`} row={row} variant="extension" />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}

// Mobile-only rendering of the diagnostic-pair data as stacked cards.
// Two row groups (core + extension) with their existing headers; each
// row card shows the failure as the headline, the property pair as
// small chips, and the fix as body text below.
function MobilePairList(): JSX.Element {
  return (
    <div style={{ padding: '14px 16px' }}>
      <GroupHeader label="Core pairs" />
      <div className="mt-2 space-y-2.5">
        {CORE_PAIRS.map((row, i) => (
          <MobilePairCard key={`core-${i}`} row={row} variant="core" />
        ))}
      </div>
      <div className="mt-5">
        <GroupHeader label="Other common patterns" />
      </div>
      <div className="mt-2 space-y-2.5">
        {EXTENSION_PAIRS.map((row, i) => (
          <MobilePairCard key={`ext-${i}`} row={row} variant="extension" />
        ))}
      </div>
    </div>
  );
}

function GroupHeader({ label }: { label: string }): JSX.Element {
  return (
    <div
      className="font-mono text-overline font-bold uppercase text-tertiary"
      style={{ letterSpacing: '0.1em' }}
    >
      {label}
    </div>
  );
}

function MobilePairCard({
  row,
  variant,
}: {
  row: PairRow;
  variant: 'core' | 'extension';
}): JSX.Element {
  const dim = variant === 'extension';
  return (
    <div
      style={{
        background: dim ? 'rgb(var(--surface))' : 'rgb(var(--white))',
        border: '1px solid rgb(var(--border-light))',
        padding: '12px 14px',
      }}
    >
      <div
        className="mb-3 font-sans text-body-sm font-semibold"
        style={{
          color: dim ? 'rgb(var(--secondary))' : 'rgb(var(--ink))',
          lineHeight: 1.4,
        }}
      >
        {row.failure}
      </div>
      {/* Pair rendered as inline text instead of chips on mobile. Two
          attempts at chips didn't work: inline `PAIR · chip1 · × ·
          chip2` left chip2 wrapping alone with an orphaned × on the
          previous line, and promoting PAIR to its own row still
          didn't fit the widest pair ("Next-token prediction" +
          "Knowledge (sparse)" sum to ~344 px of chip width vs
          ~298 px of card content). Text with a small "PAIR" label
          prefix wraps cleanly if needed and reads more like
          continuous prose, which fits the card's overall reading
          flow anyway. */}
      <div
        className="mb-3 font-sans text-body-sm"
        style={{ color: dim ? 'rgb(var(--secondary))' : 'rgb(var(--body))', lineHeight: 1.5 }}
      >
        <span
          className="font-mono text-[10px] font-semibold uppercase text-tertiary"
          style={{ letterSpacing: '0.08em', marginRight: 6 }}
        >
          Pair
        </span>
        <span className="text-ink">{row.property1}</span>
        <span className="mx-1.5 text-tertiary">×</span>
        <span className="text-ink">{row.property2}</span>
      </div>
      <div className="font-sans text-body-sm" style={{ color: dim ? 'rgb(var(--secondary))' : 'rgb(var(--body))', lineHeight: 1.5 }}>
        <span
          className="font-mono text-[10px] font-semibold uppercase text-tertiary"
          style={{ letterSpacing: '0.08em', marginRight: 6 }}
        >
          Fix
        </span>
        {row.fix}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <th
      scope="col"
      className="font-sans text-h4 font-semibold text-ink"
      style={{
        textAlign: 'left',
        padding: '10px 14px',
        borderBottom: '1px solid rgb(var(--border-light))',
        fontSize: 13,
      }}
    >
      {children}
    </th>
  );
}

const cellHeaderStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: 'rgb(var(--surface))',
  borderTop: '1px solid rgb(var(--border-light))',
  borderBottom: '1px solid rgb(var(--border-light))',
};

function PairRowEl({
  row,
  variant,
}: {
  row: PairRow;
  variant: 'core' | 'extension';
}): JSX.Element {
  const dim = variant === 'extension';
  return (
    <tr style={{ borderBottom: '1px solid rgb(var(--border-light))' }}>
      <td style={cellStyle(dim)}>
        <span className="text-ink">{row.failure}</span>
      </td>
      <td style={cellStyle(dim)}>{row.property1}</td>
      <td style={cellStyle(dim)}>{row.property2}</td>
      <td style={cellStyle(dim)}>{row.fix}</td>
    </tr>
  );
}

function cellStyle(dim: boolean): React.CSSProperties {
  return {
    padding: '12px 14px',
    verticalAlign: 'top',
    color: dim ? 'rgb(var(--secondary))' : 'rgb(var(--body))',
    background: dim ? 'rgb(var(--surface))' : 'rgb(var(--white))',
    fontSize: 13,
  };
}

// ─── Predict mode ─────────────────────────────────────────────────

const RESULT_FEEDBACK: Record<0 | 1 | 2, { title: string; tone: 'success' | 'caution' }> = {
  2: { title: 'Match', tone: 'success' },
  1: { title: 'One of two', tone: 'caution' },
  0: { title: 'A different pair', tone: 'caution' },
};

const TONE_BORDER: Record<'success' | 'caution', string> = {
  success: 'rgb(var(--success))',
  caution: 'rgb(var(--caution))',
};

const TONE_BG: Record<'success' | 'caution', string> = {
  success: 'rgb(var(--success-light))',
  caution: 'rgb(var(--caution-light))',
};

function pairLabel(row: PairRow): string {
  return `${PROPERTY_LABELS[row.pair[0]]} × ${PROPERTY_LABELS[row.pair[1]]}`;
}

function PairPrediction(): JSX.Element {
  const { state, recordKnowledgeCheck } = useLearnerProgress();
  const { track } = useAnalytics();

  const results = useMemo(() => {
    const out: Partial<Record<PairRow['id'], PropertyId[]>> = {};
    for (const row of PREDICT_ROWS) {
      const decoded = decodeSelection(state.knowledgeChecks[`3.9.${row.id}`]?.selectedOptionId);
      if (decoded) out[row.id] = decoded;
    }
    return out;
  }, [state.knowledgeChecks]);

  const checkedRows = PREDICT_ROWS.filter((row) => results[row.id] !== undefined);
  const allChecked = checkedRows.length === PREDICT_ROWS.length;
  const correctCount = PREDICT_ROWS.filter((row) => {
    const sel = results[row.id];
    return sel !== undefined && matchCount(sel, row) === 2;
  }).length;

  const onCheck = (row: PairRow, selection: PropertyId[], timestamp: number) => {
    if (results[row.id] !== undefined || selection.length !== 2) return;
    const isPreferred = matchCount(selection, row) === 2;
    recordKnowledgeCheck(3, 9, row.id, {
      selectedOptionId: encodeSelection(selection),
      isPreferred,
      timestamp,
    });
    // `results` still reflects the state before this write, so the set
    // is complete when every other row was already checked.
    if (checkedRows.length === PREDICT_ROWS.length - 1) {
      track({
        type: 'p_pairs_predicted',
        moduleId: 3,
        sectionId: 9,
        payload: { correct: correctCount + (isPreferred ? 1 : 0), total: PREDICT_ROWS.length },
      });
    }
  };

  return (
    <div className="space-y-6">
      <section
        aria-label="Diagnostic pair practice"
        style={{
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border))',
        }}
      >
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgb(var(--border-light))' }}>
          <Overline className="mb-1">Diagnostic pairs: name the pair</Overline>
          <p className="m-0 font-sans text-body-sm text-body">
            Most workplace AI failures are two properties intersecting. The first failure is
            worked for you. For each of the other four, pick the two properties you think produced
            it, then check your answer.
          </p>
        </div>

        <div className="space-y-3" style={{ padding: '14px 18px 18px' }}>
          <WorkedExampleCard row={WORKED_EXAMPLE} />
          <ol className="m-0 list-none space-y-3 p-0">
            {PREDICT_ROWS.map((row, i) => (
              <PredictionCard
                key={row.id}
                row={row}
                index={i + 1}
                total={PREDICT_ROWS.length}
                result={results[row.id] ?? null}
                onCheck={(selection, timestamp) => onCheck(row, selection, timestamp)}
              />
            ))}
          </ol>
          <p
            className="m-0 text-right font-mono text-caption text-tertiary"
            style={{ letterSpacing: '0.02em' }}
          >
            {checkedRows.length} of {PREDICT_ROWS.length} checked
          </p>
        </div>
      </section>

      {allChecked && (
        <div className="space-y-4">
          <p className="m-0 font-sans text-body text-body">
            You named {correctCount} of {PREDICT_ROWS.length} pairs exactly. The full reference
            follows, with all five pairs and their fixes in one place.
          </p>
          <PairReference />
        </div>
      )}
    </div>
  );
}

function WorkedExampleCard({ row }: { row: PairRow }): JSX.Element {
  return (
    <div
      style={{
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border-light))',
        padding: '12px 14px',
      }}
    >
      <Overline className="mb-1" style={{ fontSize: 10 }}>
        Worked example
      </Overline>
      <div className="mb-2 font-sans text-body-sm font-semibold text-ink" style={{ lineHeight: 1.4 }}>
        {row.failure}
      </div>
      <PairResultBody row={row} />
    </div>
  );
}

function PairResultBody({ row }: { row: PairRow }): JSX.Element {
  return (
    <div className="space-y-1.5 font-sans text-body-sm text-body" style={{ lineHeight: 1.5 }}>
      <div>
        <FieldLabel>Pair</FieldLabel>
        <span className="text-ink">{pairLabel(row)}</span>
      </div>
      <div>
        <FieldLabel>Why</FieldLabel>
        {row.reason}
      </div>
      <div>
        <FieldLabel>Fix</FieldLabel>
        {row.fix}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: string }): JSX.Element {
  return (
    <span
      className="font-mono text-[10px] font-semibold uppercase text-tertiary"
      style={{ letterSpacing: '0.08em', marginRight: 6 }}
    >
      {children}
    </span>
  );
}

function PredictionCard({
  row,
  index,
  total,
  result,
  onCheck,
}: {
  row: PairRow;
  index: number;
  total: number;
  result: PropertyId[] | null;
  onCheck: (selection: PropertyId[], timestamp: number) => void;
}): JSX.Element {
  const [selection, setSelection] = useState<PropertyId[]>(result ?? []);
  const checked = result !== null;
  const shown = result ?? selection;
  const feedback = checked ? RESULT_FEEDBACK[matchCount(result, row) as 0 | 1 | 2] : null;
  // The Check button unmounts once the result is stored, so focus moves
  // to the feedback; otherwise a keyboard user is dropped to the page top.
  // Only after a check in this session, not when stored results remount.
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const justCheckedRef = useRef(false);
  useEffect(() => {
    if (checked && justCheckedRef.current && feedbackRef.current) {
      justCheckedRef.current = false;
      feedbackRef.current.focus({ preventScroll: true });
      feedbackRef.current.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' });
    }
  }, [checked]);

  const toggle = (id: PropertyId) => {
    if (checked) return;
    setSelection((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : prev.length < 2 ? [...prev, id] : prev,
    );
  };

  return (
    <li
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        padding: '14px 16px',
      }}
    >
      <Overline className="mb-1" style={{ fontSize: 10 }}>
        Failure {index} of {total}
      </Overline>
      <div className="mb-3 font-sans text-body-sm font-semibold text-ink" style={{ lineHeight: 1.4 }}>
        {row.failure}
      </div>

      {/* aria-label on the fieldset rather than an sr-only legend, for
          the iOS scrollWidth reason documented in KnowledgeCheck. */}
      <fieldset
        disabled={checked}
        aria-label={`Pick the two properties behind: ${row.failure}`}
        className="m-0 border-0 p-0"
      >
        <div className="flex flex-wrap gap-2">
          {PROPERTY_ORDER.map((id) => {
            const isSelected = shown.includes(id);
            const locked = !checked && !isSelected && selection.length >= 2;
            return (
              <label
                key={id}
                className="inline-flex items-center gap-2 font-sans text-body-sm text-ink"
                style={{
                  border: `1px solid ${isSelected ? 'rgb(var(--discernment))' : 'rgb(var(--border))'}`,
                  background: isSelected ? 'rgb(var(--discernment-light))' : 'rgb(var(--white))',
                  padding: '6px 10px',
                  cursor: checked || locked ? 'default' : 'pointer',
                  opacity: locked ? 0.55 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={locked}
                  onChange={() => toggle(id)}
                  style={{ accentColor: 'rgb(var(--discernment))' }}
                />
                {PROPERTY_LABELS[id]}
              </label>
            );
          })}
        </div>
      </fieldset>

      {!checked && (
        <div className="mt-3 flex items-center justify-end gap-3">
          <span className="font-mono text-caption text-tertiary" style={{ letterSpacing: '0.02em' }}>
            {selection.length} of 2 picked
          </span>
          <button
            type="button"
            onClick={() => {
              justCheckedRef.current = true;
              onCheck(selection, Date.now());
            }}
            disabled={selection.length !== 2}
            aria-disabled={selection.length !== 2}
            className="bg-action px-5 py-2.5 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] dark:text-[rgb(var(--canvas))] transition-colors duration-[160ms] hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-ghost disabled:text-muted"
          >
            Check
          </button>
        </div>
      )}

      {/* Always mounted so the result is announced when it appears. */}
      <span aria-live="polite" className="sr-only">
        {feedback ? `${feedback.title}. The pair is ${pairLabel(row)}. ${row.reason}` : ''}
      </span>

      {feedback && (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          className="mt-3 outline-none"
          style={{
            background: TONE_BG[feedback.tone],
            borderLeft: `3px solid ${TONE_BORDER[feedback.tone]}`,
            padding: '12px 14px',
          }}
        >
          <div
            className="mb-1.5 font-sans text-body-sm font-semibold"
            style={{ color: TONE_BORDER[feedback.tone] }}
          >
            {feedback.title}
          </div>
          <PairResultBody row={row} />
        </div>
      )}
    </li>
  );
}
