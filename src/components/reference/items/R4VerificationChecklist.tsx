// R4VerificationChecklist — body content for the Output Verification
// Checklist. Rendered inside `ReferencePanel`. Three checklist sections
// (Product / Process / Performance Discernment) followed by the
// Verification Decision Framework table and the Diagnostic Pairs table.
// Color palette: Discernment blue-gray throughout.
//
// Controlled component: `checked` and `onToggle` are owned by `R4Trigger`
// so the checks survive the panel closing and re-opening. The trigger
// itself unmounts when the learner navigates away from P10, which
// resets the checklist on next visit — the spec's "scratch tool"
// semantics, scoped to a single visit to the activity.

import type { ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────

const DISCERNMENT = '#5E7080';

// ─────────────────────────────────────────────────────────────────────
// Checklist data
// ─────────────────────────────────────────────────────────────────────

interface ChecklistSection {
  id: string;
  overline: string;
  heading: string;
  items: string[];
}

const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: 'product',
    overline: 'Product Discernment',
    heading: 'Does the output meet the specification?',
    items: [
      'Factual claims verified against an independent source (not just plausible-sounding)',
      'Citations checked for existence (search for the source; don’t trust surface features like journal names, authors, or page numbers)',
      'Statistics and specific numbers checked against original data',
      'Names, dates, and institutional references confirmed',
      'Scope matches what was requested (nothing critical added or omitted)',
      'Format and length match specification',
    ],
  },
  {
    id: 'process',
    overline: 'Process Discernment',
    heading: 'Is the reasoning sound?',
    items: [
      'Logical reasoning traced step by step, with conclusions that follow rather than just sound plausible',
      'Conclusions follow from stated premises (not restated as evidence)',
      'No unsupported assumptions smuggled in as facts',
      'No circular reasoning',
      'Dependency chains checked: if conclusions rely on upstream claims, verify upstream first',
      'Alternatives or counterarguments considered where appropriate',
    ],
  },
  {
    id: 'performance',
    overline: 'Performance Discernment',
    heading: 'Does the behavior match?',
    items: [
      'Tone and register appropriate for the intended audience',
      'Level of directness matches what was requested',
      'No hedging language where direct language was specified (or vice versa)',
      'Voice consistent throughout (no register shifts mid-document)',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// Verification Decision Framework data
// ─────────────────────────────────────────────────────────────────────

type Tone = 'error' | 'caution' | 'success' | 'info';

interface VerificationCategory {
  name: string;
  tone: Tone;
  meaning: string;
  /** Italicised "Common: ..." clause — pulled out so we can render it
   *  in a slightly muted style under the main meaning sentence. */
  examples: string;
  defaultAction: string;
}

const VERIFICATION_CATEGORIES: VerificationCategory[] = [
  {
    name: 'Fabricated',
    tone: 'error',
    meaning: 'Generated content presenting as retrieved.',
    examples: 'Specific citations, quotes, statistics from unfamiliar sources.',
    defaultAction: 'Remove or replace. Verify against primary source.',
  },
  {
    name: 'Uncertain',
    tone: 'caution',
    meaning: 'Could be real or generated; you can’t tell from the output.',
    examples: 'Specific metrics, operational figures, quantitative claims.',
    defaultAction: 'Verify against primary source before circulating.',
  },
  {
    name: 'Reliable-with-caveats',
    tone: 'success',
    meaning: 'Manages its own attribution and limitations transparently.',
    examples: 'Claims with explicit sourcing, noted limitations.',
    defaultAction: 'Standard editorial review.',
  },
  {
    name: 'Dependency risk',
    tone: 'info',
    meaning: 'Conclusions rely on upstream inputs that may be unreliable.',
    examples: 'Recommendations, action items, strategic conclusions.',
    defaultAction: 'Verify premises before trusting conclusions.',
  },
];

// ─────────────────────────────────────────────────────────────────────
// Diagnostic pairs data
// ─────────────────────────────────────────────────────────────────────

interface DiagnosticPair {
  pair: string;
  produces: string;
  checkBy: string;
}

const DIAGNOSTIC_PAIRS: DiagnosticPair[] = [
  {
    pair: 'NTP × Knowledge',
    produces: 'Hallucinated specifics (citations, quotes, statistics)',
    checkBy: 'Search for the source independently',
  },
  {
    pair: 'Context window × Steerability',
    produces: 'Drift in long conversations (instructions forgotten, tone shifts)',
    checkBy: 'Compare output against original instructions',
  },
  {
    pair: 'Tokenization × NTP',
    produces: 'Confident arithmetic errors',
    checkBy: 'Recalculate independently',
  },
];

// ─────────────────────────────────────────────────────────────────────
// Top-level component (controlled)
// ─────────────────────────────────────────────────────────────────────

interface R4VerificationChecklistProps {
  /** Map of `${sectionId}-${itemIndex}` → boolean. Owned by `R4Trigger`. */
  checked: Record<string, boolean>;
  /** Toggle a single checkbox by its `${sectionId}-${itemIndex}` key. */
  onToggle: (key: string) => void;
}

export function R4VerificationChecklist({
  checked,
  onToggle,
}: R4VerificationChecklistProps): JSX.Element {
  return (
    <div className="font-sans">
      {/* Intro paragraph */}
      <p
        className="m-0 mb-5 text-body-sm text-body"
        style={{ lineHeight: 1.55 }}
      >
        Use before any AI-assisted output is shared, submitted, or published. Apply the same
        review standard you would to work from a junior colleague.
      </p>

      {/* Three checklist sections, vertically stacked. */}
      <div className="space-y-4">
        {CHECKLIST_SECTIONS.map((s) => (
          <ChecklistCard
            key={s.id}
            section={s}
            checked={checked}
            onToggle={onToggle}
          />
        ))}
      </div>

      {/* Verification Decision Framework */}
      <VerificationFramework />

      {/* Diagnostic Pairs */}
      <DiagnosticPairsCard />

      {/* Attribution footer */}
      <p
        className="m-0 mt-6 text-caption text-tertiary"
        style={{ lineHeight: 1.5, fontStyle: 'italic' }}
      >
        Framework: Anthropic 4D AI Fluency Framework, Discernment competency (Dakan, Feller, and
        Anthropic, 2025).
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Checklist card
// ─────────────────────────────────────────────────────────────────────

function ChecklistCard({
  section,
  checked,
  onToggle,
}: {
  section: ChecklistSection;
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
}): JSX.Element {
  return (
    <article
      className="rounded-lg overflow-hidden"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${DISCERNMENT}`,
      }}
    >
      <header style={{ padding: '14px 16px 6px' }}>
        <div
          className="font-mono text-overline font-bold uppercase"
          style={{
            color: DISCERNMENT,
            letterSpacing: '0.1em',
            marginBottom: 4,
          }}
        >
          {section.overline}
        </div>
        <h3
          className="m-0 font-sans text-h4 font-semibold text-ink"
          style={{ lineHeight: 1.3 }}
        >
          {section.heading}
        </h3>
      </header>

      <ul
        className="m-0 list-none p-0"
        style={{ borderTop: '1px solid rgb(var(--border-light))' }}
      >
        {section.items.map((item, idx) => {
          const key = `${section.id}-${idx}`;
          const isChecked = !!checked[key];
          return (
            <li
              key={key}
              className="flex items-start gap-3"
              style={{
                padding: '10px 16px',
                borderBottom:
                  idx === section.items.length - 1
                    ? 'none'
                    : '1px solid rgb(var(--border-light))',
                background: isChecked ? 'rgb(var(--discernment-light))' : 'transparent',
                transition: 'background 150ms ease',
              }}
            >
              <Checkbox
                id={key}
                checked={isChecked}
                onChange={() => onToggle(key)}
                ariaLabel={item}
              />
              <label
                htmlFor={key}
                className="font-sans text-[12.5px]"
                style={{
                  color: isChecked ? 'rgb(var(--secondary))' : 'rgb(var(--ink))',
                  lineHeight: 1.5,
                  textDecoration: isChecked ? 'line-through' : 'none',
                  cursor: 'pointer',
                  flex: 1,
                  // Keep alignment with the checkbox baseline.
                  paddingTop: 1,
                }}
              >
                {item}
              </label>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Custom checkbox — discernment-bordered, with an SVG check on toggle.
// Built from scratch (not a styled native input) so the visual treatment
// is consistent across browsers and adapts to dark mode via CSS vars.
// ─────────────────────────────────────────────────────────────────────

function Checkbox({
  id,
  checked,
  onChange,
  ariaLabel,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
}): JSX.Element {
  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className="flex flex-shrink-0 items-center justify-center rounded"
      style={{
        width: 18,
        height: 18,
        marginTop: 1,
        background: checked ? DISCERNMENT : 'transparent',
        border: `1.5px solid ${DISCERNMENT}`,
        cursor: 'pointer',
        transition: 'background 150ms ease',
      }}
    >
      {checked && (
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Verification Decision Framework — 4 categories, color-coded dots
// matching P10's feedback tone system (error/caution/success/info).
// ─────────────────────────────────────────────────────────────────────

function VerificationFramework(): JSX.Element {
  return (
    <section
      aria-label="Verification Decision Framework"
      className="mt-6 rounded-lg overflow-hidden"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${DISCERNMENT}`,
      }}
    >
      <header style={{ padding: '14px 16px 6px' }}>
        <div
          className="font-mono text-overline font-bold uppercase"
          style={{
            color: DISCERNMENT,
            letterSpacing: '0.1em',
            marginBottom: 4,
          }}
        >
          Verification Decision Framework
        </div>
        <p
          className="m-0 font-sans text-body-sm"
          style={{ color: 'rgb(var(--secondary))', lineHeight: 1.4 }}
        >
          When evaluating each element, classify it:
        </p>
      </header>

      <div style={{ borderTop: '1px solid rgb(var(--border-light))' }}>
        {VERIFICATION_CATEGORIES.map((cat, i) => (
          <FrameworkRow
            key={cat.name}
            cat={cat}
            zebra={i % 2 === 0}
            isLast={i === VERIFICATION_CATEGORIES.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function FrameworkRow({
  cat,
  zebra,
  isLast,
}: {
  cat: VerificationCategory;
  zebra: boolean;
  isLast: boolean;
}): JSX.Element {
  return (
    <div
      className="grid"
      style={{
        // Three-column layout: dot+name | meaning + examples | default action.
        // We keep the name column narrow (~140px) so meaning has room.
        gridTemplateColumns: '140px 1fr',
        gap: 14,
        padding: '12px 16px',
        background: zebra ? 'rgb(var(--discernment-light))' : 'transparent',
        borderBottom: isLast ? 'none' : '1px solid rgb(var(--border-light))',
      }}
    >
      {/* Left col: dot + category name */}
      <div className="flex items-start gap-2">
        <ToneDot tone={cat.tone} />
        <span
          className="font-sans text-[12.5px] font-semibold"
          style={{ color: 'rgb(var(--ink))', lineHeight: 1.3 }}
        >
          {cat.name}
        </span>
      </div>

      {/* Right col: meaning + examples + default action */}
      <div>
        <p
          className="m-0 font-sans text-[12.5px]"
          style={{
            color: 'rgb(var(--ink))',
            lineHeight: 1.45,
            marginBottom: 4,
          }}
        >
          {cat.meaning}
        </p>
        <p
          className="m-0 font-sans text-[11.5px]"
          style={{
            color: 'rgb(var(--secondary))',
            lineHeight: 1.45,
            fontStyle: 'italic',
            marginBottom: 6,
          }}
        >
          {cat.examples}
        </p>
        <div
          className="font-mono text-[9px] font-bold uppercase"
          style={{
            color: DISCERNMENT,
            letterSpacing: '0.1em',
            marginBottom: 2,
          }}
        >
          Default action
        </div>
        <p
          className="m-0 font-sans text-[12px]"
          style={{
            color: 'rgb(var(--ink))',
            lineHeight: 1.45,
          }}
        >
          {cat.defaultAction}
        </p>
      </div>
    </div>
  );
}

function ToneDot({ tone }: { tone: Tone }): JSX.Element {
  // Map each tone to its CSS-var color (which adapts to dark mode).
  return (
    <span
      aria-hidden="true"
      className="inline-block flex-shrink-0 rounded-full"
      style={{
        width: 10,
        height: 10,
        marginTop: 5,
        background: `rgb(var(--${tone}))`,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Diagnostic Pairs — 3-row table connecting mechanical pairs from
// Module 3 to verification actions. Pair names rendered in DM Mono so
// they read as code-like identifiers (matching Module 3's treatment).
// ─────────────────────────────────────────────────────────────────────

function DiagnosticPairsCard(): JSX.Element {
  return (
    <section
      aria-label="Diagnostic Pairs"
      className="mt-4 rounded-lg overflow-hidden"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${DISCERNMENT}`,
      }}
    >
      <header style={{ padding: '14px 16px 6px' }}>
        <div
          className="font-mono text-overline font-bold uppercase"
          style={{
            color: DISCERNMENT,
            letterSpacing: '0.1em',
            marginBottom: 4,
          }}
        >
          Diagnostic Pairs: what to check and why
        </div>
        <p
          className="m-0 font-sans text-body-sm"
          style={{
            color: 'rgb(var(--secondary))',
            lineHeight: 1.4,
            fontStyle: 'italic',
          }}
        >
          Name the mechanical pair to know what to check and how:
        </p>
      </header>

      {/* Header row */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: '160px 1fr',
          gap: 12,
          padding: '8px 16px',
          background: 'rgb(var(--surface))',
          borderTop: '1px solid rgb(var(--border-light))',
          borderBottom: '1px solid rgb(var(--border-light))',
        }}
      >
        <DiagHeader label="Pair" />
        <DiagHeader label="Produces · Check by..." />
      </div>

      {DIAGNOSTIC_PAIRS.map((p, i) => (
        <div
          key={p.pair}
          className="grid"
          style={{
            gridTemplateColumns: '160px 1fr',
            gap: 12,
            padding: '12px 16px',
            background: i % 2 === 0 ? 'rgb(var(--discernment-light))' : 'transparent',
            borderBottom:
              i === DIAGNOSTIC_PAIRS.length - 1
                ? 'none'
                : '1px solid rgb(var(--border-light))',
          }}
        >
          <div
            className="font-mono text-[11.5px] font-semibold"
            style={{
              color: 'rgb(var(--discernment-text))',
              lineHeight: 1.4,
              wordBreak: 'break-word',
            }}
          >
            {p.pair}
          </div>
          <div>
            <p
              className="m-0 font-sans text-[12px]"
              style={{ color: 'rgb(var(--ink))', lineHeight: 1.45, marginBottom: 4 }}
            >
              {p.produces}
            </p>
            <div
              className="font-mono text-[9px] font-bold uppercase"
              style={{
                color: DISCERNMENT,
                letterSpacing: '0.1em',
                marginBottom: 2,
              }}
            >
              Check by...
            </div>
            <p
              className="m-0 font-sans text-[12px]"
              style={{ color: 'rgb(var(--ink))', lineHeight: 1.45 }}
            >
              {p.checkBy}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}

function DiagHeader({ label }: { label: ReactNode }): JSX.Element {
  return (
    <div
      className="font-mono text-[9px] font-bold uppercase"
      style={{ color: 'rgb(var(--tertiary))', letterSpacing: '0.1em' }}
    >
      {label}
    </div>
  );
}
