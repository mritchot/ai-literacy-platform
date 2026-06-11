// RoiCalculator — the live ROI model for the Level 4 artifact page. On the
// web it stands in for the static formula/variable/worked-example tables
// (the canonical markdown keeps those for the PDF), recomputing the same
// model as the reader changes inputs. The conservative defaults reproduce
// the document's worked example: $840,000 / $32,000 / $872,000 → 191% ROI.
//
// Built on the course interactives' shared vocabulary (NextTokenDemo et
// al.): theme tokens only — so dark mode flips for free — with the Overline
// eyebrow, the bg-action button, and slider + numeric-readout pairs. The
// fixed Discernment slate (SERIES_ACCENT) is the one deliberate non-token
// color, reserved for the ROI emphasis and the slider accent.

import { useMemo, useState } from 'react';
import { Overline } from '../../components/shared/Overline';
import { SERIES_ACCENT } from './config';

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
  /** C_program — total fully loaded program cost, $. */
  programCost: number;
  /** Q — annual cost of AI-related quality failures across the cohort, $. */
  qualityCost: number;
  /** Q_reduction — reduction in those failures, %. */
  qualityReduction: number;
}

const DEFAULTS: RoiInputs = {
  participants: 200,
  loadedCost: 140000,
  aiShare: 25,
  timeSavings: 30,
  attribution: 40,
  programCost: 300000,
  qualityCost: 400000,
  qualityReduction: 20,
};

type Unit = 'count' | 'usd' | 'pct';

interface FieldDef {
  key: keyof RoiInputs;
  symbol: string;
  label: string;
  unit: Unit;
  min: number;
  max?: number;
  step: number;
  rationale: string;
}

// The rationale captions are the point of the conservative defaults — they
// stay visible under every control rather than hiding in a tooltip.
const FIELDS: FieldDef[] = [
  {
    key: 'participants',
    symbol: 'N',
    label: 'Participants',
    unit: 'count',
    min: 0,
    step: 10,
    rationale: 'Mid-sized cohort for a departmental rollout.',
  },
  {
    key: 'loadedCost',
    symbol: 'W',
    label: 'Fully loaded annual cost',
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
    unit: 'pct',
    min: 0,
    max: 100,
    step: 1,
    rationale: 'Against 57% AI-touched (Handa et al.); 25% = practical, not merely possible.',
  },
  {
    key: 'timeSavings',
    symbol: 'S',
    label: 'Time savings, competent use',
    unit: 'pct',
    min: 0,
    max: 100,
    step: 1,
    rationale:
      'Against an 81% in-conversation median; 30% acknowledges full-cycle verification overhead.',
  },
  {
    key: 'attribution',
    symbol: 'A',
    label: 'Attribution factor',
    unit: 'pct',
    min: 0,
    max: 100,
    step: 1,
    rationale: 'Lower-bound; assumes 60% of improvement is from other factors.',
  },
  {
    key: 'programCost',
    symbol: 'C_program',
    label: 'Total program cost',
    unit: 'usd',
    min: 0,
    step: 10000,
    rationale:
      'Amortized development (~735 hrs, Chapman), delivery, ~6 hrs participant time, admin, the full four-level evaluation, and contingency; anchored to ATD 2024 benchmarks.',
  },
  {
    key: 'qualityCost',
    symbol: 'Q',
    label: 'Annual AI-quality-failure cost',
    unit: 'usd',
    min: 0,
    step: 10000,
    rationale: 'Estimated annual cost of AI-related quality failures across the cohort.',
  },
  {
    key: 'qualityReduction',
    symbol: 'Q_reduction',
    label: 'Failure reduction',
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

/** Trim trailing zeros from a halved percentage (20 → "20", 25 → "12.5"). */
function fmtHalf(value: number): string {
  return (value / 2).toLocaleString('en-US', { maximumFractionDigits: 1 });
}

// ─── Component ─────────────────────────────────────────────────────────

export function RoiCalculator(): JSX.Element {
  const [inputs, setInputs] = useState<RoiInputs>(DEFAULTS);

  const setField = (key: keyof RoiInputs, value: number): void => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const results = useMemo(() => {
    const { participants, loadedCost, aiShare, timeSavings, attribution, programCost, qualityCost, qualityReduction } = inputs;
    const streams = (attributionPct: number): { efficiency: number; quality: number; total: number; roi: number } => {
      const efficiency = participants * loadedCost * (aiShare / 100) * (timeSavings / 100) * (attributionPct / 100);
      const quality = qualityCost * (qualityReduction / 100) * (attributionPct / 100);
      const total = efficiency + quality;
      const roi = programCost > 0 ? ((total - programCost) / programCost) * 100 : Number.NaN;
      return { efficiency, quality, total, roi };
    };
    return { current: streams(attribution), halved: streams(attribution / 2) };
  }, [inputs]);

  const { efficiency, quality, total, roi } = results.current;

  return (
    <section
      aria-label="Interactive ROI calculator"
      className="mt-10 rounded-xl"
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
        The model calculates two independently attributed benefit streams against total program
        cost. The defaults below are the conservative inputs from the static model, each with the
        rationale that earned it; together they reproduce the document&rsquo;s worked example.
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
          className="rounded-md bg-action px-5 py-2.5 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] hover:bg-action-hover"
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
          className="rounded-lg bg-surface"
          style={{ border: '1px solid rgb(var(--border-light))', padding: '16px 20px' }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-sans text-body-sm font-semibold text-ink">Total annual benefit</span>
            <span className="font-mono text-h3 font-semibold text-ink">{fmtUsd(total)}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-sans text-body-sm text-secondary">− Program cost (C_program)</span>
            <span className="font-mono text-body-sm text-secondary">{fmtUsd(inputs.programCost)}</span>
          </div>
        </div>

        <FlowConnector glyphs="↓" />

        <div
          className="rounded-lg text-center"
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
            Return on investment
          </div>
          <div
            className="mt-1 font-mono font-semibold"
            style={{ fontSize: 40, lineHeight: 1.2, color: SERIES_ACCENT }}
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
        </p>
      </div>

      <p
        className="m-0 mt-3 text-center font-sans text-caption text-tertiary"
        style={{ lineHeight: 1.5 }}
      >
        Formula and conservative-input discipline follow the Phillips ROI Methodology: net program
        benefits over fully loaded cost, with attribution adjusted downward for error.
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
  const isPct = def.unit === 'pct';

  const handle = (raw: string): void => {
    const parsed = Number.parseFloat(raw);
    onChange(Number.isFinite(parsed) ? parsed : 0);
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-2">
        <span className="font-mono text-caption font-bold text-tertiary">{def.symbol}</span>
        <span className="font-sans text-body-sm font-semibold text-ink">{def.label}</span>
      </label>
      <div className="flex items-center gap-3">
        {isPct && (
          <input
            type="range"
            min={def.min}
            max={def.max}
            step={def.step}
            value={value}
            onChange={(e) => handle(e.target.value)}
            aria-label={`${def.label}, percent`}
            className="w-full min-w-0 flex-1"
            style={{ accentColor: SERIES_ACCENT }}
          />
        )}
        <div className="flex shrink-0 items-center gap-1.5">
          {def.unit === 'usd' && <span className="font-mono text-body-sm text-tertiary">$</span>}
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={def.min}
            max={def.max}
            step={def.step}
            value={value}
            onChange={(e) => handle(e.target.value)}
            className={`${isPct ? 'w-20' : 'w-32'} rounded-md px-2.5 py-1.5 font-mono text-body-sm text-ink`}
            style={{ background: 'rgb(var(--white))', border: '1px solid rgb(var(--border))' }}
          />
          {isPct && <span className="font-mono text-body-sm text-tertiary">%</span>}
        </div>
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
      className="rounded-lg bg-surface"
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
