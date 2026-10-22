// RoiCalculator — the live ROI model for the Level 4 artifact page. On the
// web it stands in for the static formula/variable/worked-example tables
// (the canonical markdown keeps those for the PDF), recomputing the same
// model as the reader changes inputs. The conservative defaults reproduce
// the document's worked example: C_program $340,000 ($235,000 + 200 ×
// $525), Q $400,000, $840,000 / $32,000 / $872,000 → 156% ROI.
//
// RoiFormulaFigure is the textbook-style "equation anatomy" that precedes
// the calculator: the formula lines with each term as a chip, plus a
// symbol-keyed legend. Figure and calculator render from the same FIELDS
// registry, so symbols, glosses, and defaults cannot drift apart.
//
// Built on the course interactives' shared vocabulary (NextTokenDemo et
// al.): theme tokens only — so dark mode flips for free — with the Overline
// eyebrow, the bg-action button, and uniform spinner-less number fields
// (one control anatomy for all nine inputs). The fixed Discernment slate
// (SERIES_ACCENT) is the one deliberate non-token color, reserved for the
// ROI emphasis and the figure's term chips.

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Overline } from '../../components/shared/Overline';
import { assessmentMinutes, MODULE_MINUTES } from '../../data/program';
import { PRE_ASSESSMENT_ITEMS } from '../../data/pre-assessment';
import { POST_ASSESSMENT_ITEMS } from '../../data/post-assessment';
import { BUDGET_TOTAL } from '../build/resources-data';
import { SERIES_ACCENT } from './config';

// ─── Participant and manager time ──────────────────────────────────────
//
// The per-participant cost line prices the hours each person spends in the
// program and its evaluation. Program minutes are read from the module
// plan, so a re-timing of program.ts flows into C_program and the ROI.

/** Pre- and post-assessments together, timed as the intro screens and
 *  the landing total time them. */
const PRE_MINUTES = assessmentMinutes(PRE_ASSESSMENT_ITEMS.length);
const POST_MINUTES = assessmentMinutes(POST_ASSESSMENT_ITEMS.length);
/** Level 1 reaction survey (11–17 items). */
const REACTION_SURVEY_MINUTES = 10;
/** Level 3, per interval: the self-assessment (one written example per
 *  indicator) and the 15-to-20-minute check-in, taken at its midpoint. */
const SELF_ASSESSMENT_MINUTES = 15;
const CHECK_IN_MINUTES = 17.5;
const LEVEL3_INTERVALS = 3;
/** Three check-ins rounded up to an hour to cover the evidence review. */
const MANAGER_HOURS_PER_PARTICIPANT = 1;
/** Proxy for a line manager's loaded rate: the resource plan's L&D
 *  Manager ($175–195K fully loaded) at its midpoint. */
const MANAGER_LOADED_COST = 185_000;
const WORK_HOURS_PER_YEAR = 2_080;
const DEFAULT_LOADED_COST = 140_000;

const PROGRAM_MINUTES_LOW = MODULE_MINUTES.low + PRE_MINUTES.low + POST_MINUTES.low;
const PROGRAM_MINUTES_HIGH = MODULE_MINUTES.high + PRE_MINUTES.high + POST_MINUTES.high;
// Program time at its midpoint: the conservative margin on cost already
// sits in C_fixed, whose default is in the upper half of the build range.
const PARTICIPANT_HOURS =
  ((PROGRAM_MINUTES_LOW + PROGRAM_MINUTES_HIGH) / 2 +
    REACTION_SURVEY_MINUTES +
    LEVEL3_INTERVALS * (SELF_ASSESSMENT_MINUTES + CHECK_IN_MINUTES)) /
  60;
const MANAGER_HOURLY = MANAGER_LOADED_COST / WORK_HOURS_PER_YEAR;
const COST_PER_PARTICIPANT_STEP = 25;
const DEFAULT_COST_PER_PARTICIPANT =
  Math.round(
    (PARTICIPANT_HOURS * (DEFAULT_LOADED_COST / WORK_HOURS_PER_YEAR) +
      MANAGER_HOURS_PER_PARTICIPANT * MANAGER_HOURLY) /
      COST_PER_PARTICIPANT_STEP,
  ) * COST_PER_PARTICIPANT_STEP;

// ─── Model ─────────────────────────────────────────────────────────────

interface RoiInputs {
  /** N — participants in the cohort. */
  participants: number;
  /** W — fully loaded annual cost per participant, $. */
  loadedCost: number;
  /** T_ai — share of work hours on AI-eligible tasks, %. */
  aiShare: number;
  /** S — time savings on those tasks with competent use, %. */
  timeSavings: number;
  /** A — attribution factor (share of improvement credited to the program), %. */
  attribution: number;
  /** C_fixed — build, delivery, evaluation administration, and contingency, $. */
  fixedCost: number;
  /** c — participant and manager time per participant, $. C_program = C_fixed + N × c. */
  costPerParticipant: number;
  /** q — annual AI-related quality-failure cost per participant, $. Q = N × q. */
  qualityCostPerParticipant: number;
  /** Q_reduction — reduction in those failures, %. */
  qualityReduction: number;
}

const DEFAULTS: RoiInputs = {
  participants: 200,
  loadedCost: DEFAULT_LOADED_COST,
  aiShare: 25,
  timeSavings: 30,
  attribution: 40,
  fixedCost: 235000,
  costPerParticipant: DEFAULT_COST_PER_PARTICIPANT,
  qualityCostPerParticipant: 2000,
  qualityReduction: 20,
};

type Unit = 'count' | 'usd' | 'pct';

interface FieldDef {
  key: keyof RoiInputs;
  symbol: string;
  label: string;
  /** Short meaning for the formula-figure legend. */
  gloss: string;
  unit: Unit;
  min: number;
  max?: number;
  step: number;
  rationale: string;
}

// One registry drives the figure legend and the input controls. The
// rationale captions are the point of the conservative defaults — they
// stay visible under every control rather than hiding in a tooltip.
const FIELDS: FieldDef[] = [
  {
    key: 'participants',
    symbol: 'N',
    label: 'Participants',
    gloss: 'participants in the cohort',
    unit: 'count',
    min: 0,
    step: 10,
    rationale: 'Mid-sized cohort for a departmental rollout.',
  },
  {
    key: 'loadedCost',
    symbol: 'W',
    label: 'Fully loaded annual cost',
    gloss: 'fully loaded annual cost per participant',
    unit: 'usd',
    min: 0,
    step: 5000,
    rationale:
      'Mid-career base ~$100K × 1.4 fully loaded (benefits ~30% per BLS, plus payroll taxes and overhead).',
  },
  {
    key: 'aiShare',
    symbol: 'T_ai',
    label: 'AI-eligible task share',
    gloss: 'share of work hours on AI-eligible tasks',
    unit: 'pct',
    min: 0,
    max: 100,
    step: 1,
    rationale:
      'MGI puts agents, its term for all machines that automate nonphysical work, AI-based or not, at 44% of US work hours as technical potential. Its midpoint scenario automates about 27% of all US work hours by 2030 (Yee et al., 2025); 25% sits just below that midpoint. Handa et al. find 57% of occupations use AI on at least a tenth of their tasks; their 57% conversation split is a different statistic and is not used here.',
  },
  {
    key: 'timeSavings',
    symbol: 'S',
    label: 'Time savings, competent use',
    gloss: 'time savings on those tasks with competent use',
    unit: 'pct',
    min: 0,
    max: 100,
    step: 1,
    rationale:
      'Inside the 14–56% range that controlled trials report; well below the 81% in-conversation median, which leaves out the time spent refining output (Tamkin & McCrory, 2025).',
  },
  {
    key: 'attribution',
    symbol: 'A',
    label: 'Attribution factor',
    gloss: 'share of improvement credited to the program',
    unit: 'pct',
    min: 0,
    max: 100,
    step: 1,
    rationale: 'Lower-bound; assumes 60% of improvement is from other factors.',
  },
  {
    key: 'fixedCost',
    symbol: 'C_fixed',
    label: 'Fixed program cost',
    gloss: 'build, delivery, evaluation administration, and contingency',
    unit: 'usd',
    min: 0,
    step: 5000,
    rationale: `The program's resource plan prices a five-person build at ${BUDGET_TOTAL.low}–${BUDGET_TOTAL.high}, including evaluation administration and 15% contingency; the default sits in the upper half of that range.`,
  },
  {
    key: 'costPerParticipant',
    symbol: 'c',
    label: 'Time cost per participant',
    gloss: 'participant and manager time per participant',
    unit: 'usd',
    min: 0,
    step: COST_PER_PARTICIPANT_STEP,
    rationale: `About ${formatHours(PARTICIPANT_HOURS)} hours of participant time (the ${PROGRAM_MINUTES_LOW}–${PROGRAM_MINUTES_HIGH}-minute program, the Level 1 survey, and three Level 3 self-assessments and check-ins) at W ÷ 2,080, plus about ${MANAGER_HOURS_PER_PARTICIPANT} hour of manager time at ~$${Math.round(MANAGER_HOURLY)} an hour. The default prices this at the default W.`,
  },
  {
    key: 'qualityCostPerParticipant',
    symbol: 'q',
    label: 'AI-quality-failure cost per participant',
    gloss: 'annual cost of AI-related quality failures per participant',
    unit: 'usd',
    min: 0,
    step: 100,
    rationale:
      'Placeholder (~$2,000 per participant a year); no cited source prices AI-related errors. Replace with incident data: errors × hours to fix × loaded rate.',
  },
  {
    key: 'qualityReduction',
    symbol: 'Q_reduction',
    label: 'Failure reduction',
    gloss: 'reduction in those failures',
    unit: 'pct',
    min: 0,
    max: 100,
    step: 1,
    rationale: 'Conservative one-fifth reduction.',
  },
];

function clamp(value: number, min: number, max?: number): number {
  const lower = Math.max(min, value);
  return max === undefined ? lower : Math.min(max, lower);
}

function fmtUsd(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

function fmtPct(value: number): string {
  return Number.isFinite(value) ? `${Math.round(value)}%` : '—';
}

/** Trim trailing zeros from a halved percentage (40 → "20", 25 → "12.5"). */
function fmtHalf(value: number): string {
  return (value / 2).toLocaleString('en-US', { maximumFractionDigits: 1 });
}

function formatHours(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

/** Above 100% the break-even cannot be reached, so it shows a dash. Below 0
 *  the other stream already covers the cost, so the share needed is 0%. */
function fmtOne(value: number): string {
  if (!Number.isFinite(value) || value > 100) return '—';
  if (value < 0) return '0.0%';
  return `${value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function sharePct(numerator: number, denominator: number): number {
  return denominator > 0 ? (numerator / denominator) * 100 : Number.NaN;
}

function fmtDefault(def: FieldDef): string {
  const value = DEFAULTS[def.key];
  if (def.unit === 'usd') return fmtUsd(value);
  if (def.unit === 'pct') return `${value}%`;
  return value.toLocaleString('en-US');
}

// ─── Formula figure ────────────────────────────────────────────────────
//
// The textbook treatment: meet the equation term by term, then touch it in
// the calculator below. Rendered as native JSX (not an image asset) so it
// themes with dark mode and the symbols match the input labels exactly.

export function RoiFormulaFigure(): JSX.Element {
  const sym = (s: string): ReactNode => <Sym key={s}>{s}</Sym>;
  const times = (k: string): ReactNode => <Op key={k}>×</Op>;

  return (
    <figure
      aria-label="The ROI model, term by term"
      className="m-0 mt-10 bg-surface"
      style={{ border: '1px solid rgb(var(--border-light))', padding: '20px 22px' }}
    >
      <Overline className="mb-4">The ROI model · term by term</Overline>

      <div className="space-y-3">
        <EquationRow label="Efficiency benefit">
          {[sym('N'), times('×1'), sym('W'), times('×2'), sym('T_ai'), times('×3'), sym('S'), times('×4'), sym('A')]}
        </EquationRow>
        <EquationRow label="Quality benefit">
          {[sym('Q'), times('×1'), sym('Q_reduction'), times('×2'), sym('A')]}
        </EquationRow>
        <EquationRow label="Quality-failure cost" term="Q">
          {[sym('N'), times('×1'), sym('q')]}
        </EquationRow>
        <EquationRow label="Program cost" term="C_program">
          {[sym('C_fixed'), <Op key="+">+</Op>, sym('N'), times('×1'), sym('c')]}
        </EquationRow>
        <EquationRow label="ROI">
          <Op>(</Op>
          <span className="font-mono text-body-sm text-ink">Total benefit</span>
          <Op>−</Op>
          {/* Unkeyed: C_program appears twice in this row, and keying both
              by symbol (as the keyed `sym` helper does) would collide. */}
          <Sym>C_program</Sym>
          <Op>)</Op>
          <Op>÷</Op>
          <Sym>C_program</Sym>
          <Op>× 100</Op>
        </EquationRow>
      </div>

      <div className="mt-5 grid gap-x-8 gap-y-2 border-t border-border-light pt-4 sm:grid-cols-2">
        {FIELDS.map((def) => (
          <div key={def.key} className="flex items-baseline gap-2.5">
            <Sym>{def.symbol}</Sym>
            <span className="font-sans text-caption text-secondary" style={{ lineHeight: 1.5 }}>
              {def.gloss} <span className="text-tertiary">(default {fmtDefault(def)})</span>
            </span>
          </div>
        ))}
      </div>

      <figcaption
        className="m-0 mt-4 font-sans text-caption text-tertiary"
        style={{ lineHeight: 1.5 }}
      >
        Two independently attributed benefit streams, set against total program cost. Program
        cost and quality-failure cost both scale with N. The calculator below starts at these
        conservative defaults.
      </figcaption>
    </figure>
  );
}

function Sym({ children }: { children: ReactNode }): JSX.Element {
  return (
    <span
      className="inline-block whitespace-nowrap px-1.5 py-0.5 font-mono text-[13px] font-semibold text-ink"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border-light))',
        borderBottom: `2px solid ${SERIES_ACCENT}`,
      }}
    >
      {children}
    </span>
  );
}

function Op({ children }: { children: ReactNode }): JSX.Element {
  return <span className="font-mono text-body-sm text-secondary">{children}</span>;
}

function EquationRow({
  label,
  term,
  children,
}: {
  label: string;
  /** Symbol the row defines, for derived terms (Q, C_program). */
  term?: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <span className="font-sans text-body-sm font-semibold text-ink">{label}</span>
      {term !== undefined && <Sym>{term}</Sym>}
      <Op>=</Op>
      {children}
    </div>
  );
}

// ─── Calculator ────────────────────────────────────────────────────────

export function RoiCalculator(): JSX.Element {
  const [inputs, setInputs] = useState<RoiInputs>(DEFAULTS);

  const setField = (key: keyof RoiInputs, value: number): void => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const results = useMemo(() => {
    const {
      participants,
      loadedCost,
      aiShare,
      timeSavings,
      attribution,
      fixedCost,
      costPerParticipant,
      qualityCostPerParticipant,
      qualityReduction,
    } = inputs;
    const programCost = fixedCost + participants * costPerParticipant;
    const qualityCost = participants * qualityCostPerParticipant;
    // Both streams before attribution; A multiplies each of them.
    const efficiencyBase = participants * loadedCost * (aiShare / 100) * (timeSavings / 100);
    const qualityBase = qualityCost * (qualityReduction / 100);
    const streams = (attributionPct: number): { efficiency: number; quality: number; total: number; roi: number } => {
      const efficiency = efficiencyBase * (attributionPct / 100);
      const quality = qualityBase * (attributionPct / 100);
      const total = efficiency + quality;
      const roi = programCost > 0 ? ((total - programCost) / programCost) * 100 : Number.NaN;
      return { efficiency, quality, total, roi };
    };
    // Break-even: the A (or S) at which total benefit equals program cost,
    // holding every other input where the reader set it.
    const breakEvenA = sharePct(programCost, efficiencyBase + qualityBase);
    const breakEvenS = sharePct(
      programCost - qualityBase * (attribution / 100),
      participants * loadedCost * (aiShare / 100) * (attribution / 100),
    );
    return {
      programCost,
      current: streams(attribution),
      halved: streams(attribution / 2),
      breakEvenA,
      breakEvenS,
    };
  }, [inputs]);

  const { efficiency, quality, total, roi } = results.current;

  return (
    <section
      aria-label="Interactive ROI calculator"
      className="print-flow mt-6"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        padding: '24px 26px',
      }}
    >
      <Overline className="mb-2">Interactive · ROI model</Overline>
      <h2
        className="m-0 mb-3 font-display text-title font-normal text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        ROI calculator
      </h2>
      <p className="m-0 mb-6 max-w-reading font-sans text-body text-body">
        The defaults below are the conservative inputs from the static model, each with its
        rationale; together they reproduce the document&rsquo;s worked example.
        Change any input and the chain recomputes.
      </p>

      {/* Inputs — every control keeps its rationale caption visible. */}
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {FIELDS.map((def) => (
          <InputField
            key={def.key}
            def={def}
            value={inputs[def.key]}
            onChange={(v) => setField(def.key, clamp(v, def.min, def.max))}
          />
        ))}
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setInputs(DEFAULTS)}
          className="bg-action px-5 py-2.5 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] dark:text-[rgb(var(--canvas))] hover:bg-action-hover"
        >
          Reset to conservative defaults
        </button>
      </div>

      {/* Live benefit-stream flow: two streams converge into the total,
          set against program cost, yielding the ROI. */}
      <div className="mt-8" aria-live="polite">
        <div className="grid gap-4 sm:grid-cols-2">
          <StreamCard
            label="Efficiency benefit"
            formula="N × W × T_ai × S × A"
            value={fmtUsd(efficiency)}
          />
          <StreamCard
            label="Quality benefit"
            formula="Q × Q_reduction × A"
            value={fmtUsd(quality)}
          />
        </div>

        <FlowConnector glyphs="↘ ↙" />

        <div
          className="bg-surface"
          style={{ border: '1px solid rgb(var(--border-light))', padding: '16px 20px' }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-sans text-body-sm font-semibold text-ink">Total annual benefit</span>
            <span className="font-mono text-h3 font-semibold text-ink">{fmtUsd(total)}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-sans text-body-sm text-secondary">− Program cost (C_program)</span>
            <span className="font-mono text-body-sm text-secondary">{fmtUsd(results.programCost)}</span>
          </div>
        </div>

        <FlowConnector glyphs="↓" />

        <div
          className="text-center"
          style={{
            background: 'rgb(var(--white))',
            border: '1px solid rgb(var(--border))',
            borderTop: `3px solid ${SERIES_ACCENT}`,
            padding: '20px 22px',
          }}
        >
          <div
            className="font-mono text-overline font-semibold uppercase text-tertiary"
            style={{ letterSpacing: '0.12em' }}
          >
            Return on investment · illustrative
          </div>
          <div
            className="mt-1 font-mono font-semibold"
            // Theme-adaptive: the static series accent measures 2.77:1
            // on the dark surface — under even the 3:1 large-text
            // minimum. SERIES_ACCENT stays on the decorative rules.
            style={{ fontSize: 40, lineHeight: 1.2, color: 'rgb(var(--discernment-text))' }}
          >
            {fmtPct(roi)}
          </div>
          <div className="mt-2 font-mono text-caption text-tertiary">
            ROI = (Total benefit − Program cost) ÷ Program cost × 100
          </div>
        </div>

        <p className="m-0 mt-4 text-center font-sans text-body-sm text-secondary">
          At the current attribution (A&nbsp;=&nbsp;{inputs.attribution}%), ROI is {fmtPct(roi)};
          halving A to {fmtHalf(inputs.attribution)}% would give {fmtPct(results.halved.roi)}.
          Break-even at these inputs: A of {fmtOne(results.breakEvenA)} or S of{' '}
          {fmtOne(results.breakEvenS)}.
        </p>
      </div>

      <p
        className="m-0 mt-3 text-center font-sans text-caption text-tertiary"
        style={{ lineHeight: 1.5 }}
      >
        Formula and conservative-input discipline follow the Phillips ROI Methodology: net program
        benefits over fully loaded cost, with attribution adjusted downward for error. The defaults
        are illustrative inputs, not a measured return: no Level 4 data exists until an
        organization deploys the program and supplies its own baselines.
      </p>
    </section>
  );
}

// ─── Pieces ────────────────────────────────────────────────────────────

function InputField({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: number;
  onChange: (value: number) => void;
}): JSX.Element {
  const id = `roi-${def.key}`;

  // Local text mirror of the committed number. Binding the input straight
  // to `value` made a cleared field snap to 0 (parseFloat('') → NaN → 0),
  // so it couldn't be blanked to retype. While the field has focus the
  // text is the learner's; valid parses commit upward (where they're
  // clamped) and blur snaps the text back to the committed value.
  const [text, setText] = useState(String(value));
  const focusedRef = useRef(false);
  useEffect(() => {
    // External changes (the reset-to-defaults control) re-sync the text;
    // mid-edit clamping must not fight the keystroke, hence the guard.
    if (!focusedRef.current) setText(String(value));
  }, [value]);

  const handle = (raw: string): void => {
    setText(raw);
    const parsed = Number.parseFloat(raw);
    if (Number.isFinite(parsed)) onChange(parsed);
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-2">
        <span className="font-mono text-caption font-bold text-tertiary">{def.symbol}</span>
        <span className="font-sans text-body-sm font-semibold text-ink">{def.label}</span>
      </label>
      <div className="flex items-center gap-1.5">
        {def.unit === 'usd' && <span className="font-mono text-body-sm text-tertiary">$</span>}
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={def.min}
          max={def.max}
          step={def.step}
          value={text}
          onChange={(e) => handle(e.target.value)}
          onFocus={() => {
            focusedRef.current = true;
          }}
          onBlur={() => {
            focusedRef.current = false;
            setText(String(value));
          }}
          className="w-32 px-2.5 py-1.5 font-mono text-body-sm text-ink [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          style={{ background: 'rgb(var(--white))', border: '1px solid rgb(var(--ghost))' }}
        />
        {def.unit === 'pct' && <span className="font-mono text-body-sm text-tertiary">%</span>}
      </div>
      <p className="m-0 mt-1.5 font-sans text-caption text-tertiary" style={{ lineHeight: 1.5 }}>
        {def.rationale}
      </p>
    </div>
  );
}

function StreamCard({
  label,
  formula,
  value,
}: {
  label: string;
  formula: string;
  value: string;
}): JSX.Element {
  return (
    <div
      className="bg-surface"
      style={{ border: '1px solid rgb(var(--border-light))', padding: '16px 20px' }}
    >
      <div
        className="font-mono text-overline font-semibold uppercase text-tertiary"
        style={{ letterSpacing: '0.1em' }}
      >
        {label}
      </div>
      <div className="mt-1 font-mono text-caption text-secondary">{formula}</div>
      <div className="mt-2 font-mono text-h2 font-semibold text-ink">{value}</div>
    </div>
  );
}

function FlowConnector({ glyphs }: { glyphs: string }): JSX.Element {
  return (
    <div aria-hidden="true" className="my-2 text-center font-mono text-body-sm text-tertiary">
      {glyphs}
    </div>
  );
}
