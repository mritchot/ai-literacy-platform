// R5CapabilityBoundary — body content for the AI Capability Boundary
// Reference. Rendered inside `ReferencePanel`. The only R-card that uses
// a dual-color palette (Delegation olive for "Where AI is reliable" /
// Discernment blue-gray for "Where AI systematically fails"), reflecting
// its bridge role between D3 (Platform Awareness) and D8 (Recognizing
// capability limits). The Fails section is further subdivided by root
// cause (Boundary / Specificity / Volume), each tracing to one mechanical
// pillar from Module 3.

import type { ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────────
// Brand colors — kept inline (not via CSS var) because these are the
// same hex in both light and dark mode by design system spec; only the
// surrounding surface tints adapt per theme.
// ─────────────────────────────────────────────────────────────────────

const DELEGATION = '#6B7F5E';
const DISCERNMENT = '#5E7080';

// ─────────────────────────────────────────────────────────────────────
// Reliable section — 7 task types, each with "Why it works" + "Notes".
// ─────────────────────────────────────────────────────────────────────

interface ReliableRow {
  task: string;
  why: string;
  notes: string;
}

const RELIABLE_ROWS: ReliableRow[] = [
  {
    task: 'Drafting and composition',
    why: 'Dense training patterns for written formats (emails, memos, reports). Well-specified prompts produce well-structured output.',
    notes:
      'Quality scales with Description quality. Specify product, process, and performance.',
  },
  {
    task: 'Summarizing and compression',
    why: 'The model excels at identifying high-probability patterns, which is what compression requires.',
    notes: 'Verify completeness; the model may drop low-frequency details.',
  },
  {
    task: 'Reformatting and restructuring',
    why: 'Deterministic tasks with clear output specifications. Token-level manipulation within well-defined patterns.',
    notes: 'Format + audience + length spec → reliable output.',
  },
  {
    task: 'Brainstorming and ideation',
    why: 'High-temperature sampling across the probability distribution produces diverse options by design.',
    notes: 'Useful for breadth. Evaluate each option independently; plausible ≠ good.',
  },
  {
    task: 'Translation (major languages)',
    why: 'Dense training representation for high-resource language pairs (English ↔ Spanish, French, German, Mandarin).',
    notes:
      'Reliability drops for lower-resource languages due to tokenization asymmetry.',
  },
  {
    task: 'Code generation (common patterns)',
    why: 'Well-documented languages and frameworks are heavily represented in training data.',
    notes:
      'Edge cases, niche libraries, and novel architectures are less reliable. Test all output.',
  },
  {
    task: 'Pattern recognition in text',
    why: 'Categorization, sentiment analysis, entity extraction: tasks where the model identifies structure.',
    notes:
      'Reliable for well-defined categories. Less reliable for subjective or culturally specific judgments.',
  },
];

// ─────────────────────────────────────────────────────────────────────
// Fails section — 3 root-cause sub-categories, each with their own
// "Fails at / Why / Instead" table.
// ─────────────────────────────────────────────────────────────────────

interface FailsRow {
  failsAt: string;
  why: string;
  instead: string;
}

interface FailsCategory {
  id: 'boundary' | 'specificity' | 'volume';
  label: string;
  rootCause: string;
  body: string;
  rows: FailsRow[];
}

const FAILS_CATEGORIES: FailsCategory[] = [
  {
    id: 'boundary',
    label: 'Boundary tasks',
    rootCause: 'Tokenization',
    body: 'Token boundaries misalign with the meaningful structure of the input. Errors concentrate where tokens and meaning diverge.',
    rows: [
      {
        failsAt: 'Multi-digit arithmetic',
        why: 'Numbers split into arbitrary token chunks; “127” may become [“12”, “7”] or [“1”, “27”]',
        instead: 'Ask the model to write code that performs the calculation',
      },
      {
        failsAt: 'Character counting and spelling',
        why: 'The model sees tokens rather than letters; “strawberry” is not processed letter by letter',
        instead: 'Use programmatic tools for character-level tasks',
      },
      {
        failsAt: 'Non-English text processing',
        why: 'Lower-resource languages fragment 2–3× more aggressively, consuming context window and increasing error surface',
        instead: 'Verify non-English output more carefully; expect quality gaps',
      },
    ],
  },
  {
    id: 'specificity',
    label: 'Specificity tasks',
    rootCause: 'NTP × Knowledge',
    body: 'The model generates statistically probable tokens. When a task requires specific facts the training data represents thinly, it produces plausible fabrications.',
    rows: [
      {
        failsAt: 'Specific citations and references',
        why: 'Citation-shaped text is common in training data, so the model generates format-perfect references that may not exist',
        instead: 'Verify every citation against the original source',
      },
      {
        failsAt: 'Precise statistics and figures',
        why: 'Numbers generated to satisfy the pattern, not retrieved from a database',
        instead: 'Check every specific number against primary data',
      },
      {
        failsAt: 'Legal / regulatory references',
        why: 'Regulation numbers, case names, and statutory language are specificity-zone content',
        instead: 'Cross-reference against official legal sources',
      },
      {
        failsAt: 'Named quotes and attributions',
        why: 'Quote-shaped text attributed to specific people is generated by probability, not recall',
        instead: 'Confirm the quote exists in the attributed source',
      },
    ],
  },
  {
    id: 'volume',
    label: 'Volume tasks',
    rootCause: 'Context window',
    body: 'The model has a finite processing window. Information outside is not processed. Information in the middle receives less attention.',
    rows: [
      {
        failsAt: 'Long document analysis (>20 pages)',
        why: 'Middle sections fall into the attention valley: processed but underweighted',
        instead: 'Break long documents into sections; process separately',
      },
      {
        failsAt: 'Sustained instruction fidelity',
        why: 'Over many turns, earlier instructions lose influence as context fills',
        instead: 'Restate critical instructions periodically; compare to original spec',
      },
      {
        failsAt: 'Multi-document synthesis',
        why: 'Multiple documents consume context rapidly; later documents may be underprocessed',
        instead: 'Process documents individually, then synthesize yourself',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// Top-level component
// ─────────────────────────────────────────────────────────────────────

export function R5CapabilityBoundary(): JSX.Element {
  return (
    <div className="font-sans">
      {/* Intro paragraph */}
      <p
        className="m-0 mb-5 text-body-sm text-body"
        style={{ lineHeight: 1.55 }}
      >
        Know what the tool does well and where it systematically fails before you delegate.
        Organized by task type, not technical architecture. Each entry connects to Module 3’s
        mechanical framework.
      </p>

      {/* Section 1: Reliable */}
      <ReliableSection />

      {/* Section 2: Fails (header + 3 category cards) */}
      <FailsSection />

      {/* The core distinction — final callout */}
      <CoreDistinctionStrip />

      {/* Attribution footer */}
      <p
        className="m-0 mt-6 text-caption text-tertiary"
        style={{ lineHeight: 1.5, fontStyle: 'italic' }}
      >
        Framework: Anthropic 4D AI Fluency Framework, Delegation (Platform Awareness) and
        Discernment competencies (Dakan, Feller, and Anthropic, 2025). Mechanical explanations
        from Module 3.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Section 1 — Where AI is reliable (Delegation olive accents)
// ─────────────────────────────────────────────────────────────────────

function ReliableSection(): JSX.Element {
  return (
    <section
      aria-label="Where AI is reliable"
      className="rounded-lg overflow-hidden"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${DELEGATION}`,
      }}
    >
      <header style={{ padding: '14px 16px 8px' }}>
        <div
          className="font-mono text-overline font-bold uppercase"
          style={{
            color: DELEGATION,
            letterSpacing: '0.1em',
            marginBottom: 4,
          }}
        >
          Where AI is reliable
        </div>
        <p
          className="m-0 font-sans text-body-sm"
          style={{ color: 'rgb(var(--secondary))', lineHeight: 1.5 }}
        >
          Tasks where models produce useful output under well-specified prompts. Reliability here
          means errors are infrequent rather than absent.
        </p>
      </header>

      {/* Header row */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: '160px 1fr 1fr',
          gap: 12,
          padding: '8px 16px',
          background: 'rgb(var(--surface))',
          borderTop: '1px solid rgb(var(--border-light))',
          borderBottom: '1px solid rgb(var(--border-light))',
        }}
      >
        <ColHeader label="Task type" />
        <ColHeader label="Why it works" />
        <ColHeader label="Notes" />
      </div>

      {RELIABLE_ROWS.map((row, i) => (
        <div
          key={row.task}
          className="grid"
          style={{
            gridTemplateColumns: '160px 1fr 1fr',
            gap: 12,
            padding: '12px 16px',
            background: i % 2 === 0 ? 'rgb(var(--delegation-light))' : 'transparent',
            borderBottom:
              i === RELIABLE_ROWS.length - 1
                ? 'none'
                : '1px solid rgb(var(--border-light))',
          }}
        >
          <div
            className="font-sans text-[12.5px] font-semibold"
            style={{
              color: 'rgb(var(--delegation-text))',
              lineHeight: 1.35,
            }}
          >
            {row.task}
          </div>
          <div
            className="font-sans text-[12px]"
            style={{ color: 'rgb(var(--ink))', lineHeight: 1.5 }}
          >
            {row.why}
          </div>
          <div
            className="font-sans text-[12px]"
            style={{ color: 'rgb(var(--ink))', lineHeight: 1.5 }}
          >
            {row.notes}
          </div>
        </div>
      ))}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Section 2 — Where AI systematically fails (Discernment blue-gray)
// ─────────────────────────────────────────────────────────────────────

function FailsSection(): JSX.Element {
  return (
    <div
      className="mt-6"
      // The header sits OUTSIDE the cards so that all three category
      // cards visually share the same parent banner. This mirrors the
      // PDF's two-section structure where the section title spans all
      // three sub-tables.
    >
      {/* Section header */}
      <header
        className="rounded-t-lg"
        style={{
          padding: '14px 16px 8px',
          borderTop: `3px solid ${DISCERNMENT}`,
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border))',
          borderBottom: 'none',
          // Round only the top corners — the cards below extend visually.
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <div
          className="font-mono text-overline font-bold uppercase"
          style={{
            color: DISCERNMENT,
            letterSpacing: '0.1em',
            marginBottom: 4,
          }}
        >
          Where AI systematically fails
        </div>
        <p
          className="m-0 font-sans text-body-sm"
          style={{ color: 'rgb(var(--secondary))', lineHeight: 1.5 }}
        >
          Three categories of unreliable tasks from Module 3. Each traces to a mechanical root
          cause.
        </p>
      </header>

      {/* Three sub-category cards */}
      <div
        className="rounded-b-lg overflow-hidden"
        style={{
          border: '1px solid rgb(var(--border))',
          borderTop: 'none',
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          background: 'rgb(var(--white))',
        }}
      >
        {FAILS_CATEGORIES.map((cat, i) => (
          <FailsCategoryBlock
            key={cat.id}
            cat={cat}
            isLast={i === FAILS_CATEGORIES.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function FailsCategoryBlock({
  cat,
  isLast,
}: {
  cat: FailsCategory;
  isLast: boolean;
}): JSX.Element {
  return (
    <div
      style={{
        borderTop: '1px solid rgb(var(--border-light))',
        borderBottom: isLast ? 'none' : '1px solid rgb(var(--border))',
      }}
    >
      {/* Sub-category header — label + root cause label inline */}
      <div
        className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
        style={{ padding: '14px 16px 6px' }}
      >
        <div
          className="font-mono text-[11px] font-bold uppercase"
          style={{
            color: DISCERNMENT,
            letterSpacing: '0.12em',
          }}
        >
          {cat.label}
        </div>
        <div
          className="font-mono text-[11px]"
          style={{
            color: 'rgb(var(--secondary))',
            fontStyle: 'italic',
            letterSpacing: '0.04em',
          }}
        >
          Root cause: {cat.rootCause}
        </div>
      </div>

      {/* Sub-category framing text */}
      <p
        className="m-0 font-sans text-body-sm"
        style={{
          color: 'rgb(var(--ink))',
          lineHeight: 1.5,
          padding: '0 16px 8px',
        }}
      >
        {cat.body}
      </p>

      {/* Column headers */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: '180px 1fr 1fr',
          gap: 12,
          padding: '8px 16px',
          background: 'rgb(var(--surface))',
          borderTop: '1px solid rgb(var(--border-light))',
          borderBottom: '1px solid rgb(var(--border-light))',
        }}
      >
        <ColHeader label="Fails at..." />
        <ColHeader label="Why" />
        <ColHeader label="Instead..." />
      </div>

      {/* Rows */}
      {cat.rows.map((row, i) => (
        <div
          key={row.failsAt}
          className="grid"
          style={{
            gridTemplateColumns: '180px 1fr 1fr',
            gap: 12,
            padding: '12px 16px',
            background: i % 2 === 0 ? 'rgb(var(--discernment-light))' : 'transparent',
            borderBottom:
              i === cat.rows.length - 1
                ? 'none'
                : '1px solid rgb(var(--border-light))',
          }}
        >
          <div
            className="font-sans text-[12.5px] font-semibold"
            style={{
              color: 'rgb(var(--discernment-text))',
              lineHeight: 1.35,
            }}
          >
            {row.failsAt}
          </div>
          <div
            className="font-sans text-[12px]"
            style={{ color: 'rgb(var(--ink))', lineHeight: 1.5 }}
          >
            {row.why}
          </div>
          {/* Instead column rendered BOLD per spec — these are the
              actionable takeaways. */}
          <div
            className="font-sans text-[12px] font-semibold"
            style={{ color: 'rgb(var(--ink))', lineHeight: 1.5 }}
          >
            {row.instead}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Core distinction strip — final callout. Spec says this should sit at
// the bottom with discernment-light bg + discernment-bg border.
// ─────────────────────────────────────────────────────────────────────

function CoreDistinctionStrip(): JSX.Element {
  return (
    <aside
      role="note"
      className="mt-6 rounded-lg"
      style={{
        background: 'rgb(var(--discernment-light))',
        border: `1.5px solid ${DISCERNMENT}`,
        padding: '14px 18px',
      }}
    >
      <div
        className="mb-1 font-mono text-overline font-bold uppercase"
        style={{
          color: DISCERNMENT,
          letterSpacing: '0.12em',
        }}
      >
        The core distinction
      </div>
      <p
        className="m-0 font-sans text-body-sm"
        style={{
          color: 'rgb(var(--ink))',
          lineHeight: 1.55,
          fontWeight: 500,
        }}
      >
        The model generates text rather than retrieving facts. Fluent output and accurate output
        are independent properties.
      </p>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function ColHeader({ label }: { label: ReactNode }): JSX.Element {
  return (
    <div
      className="font-mono text-[9px] font-bold uppercase"
      style={{ color: 'rgb(var(--tertiary))', letterSpacing: '0.1em' }}
    >
      {label}
    </div>
  );
}
