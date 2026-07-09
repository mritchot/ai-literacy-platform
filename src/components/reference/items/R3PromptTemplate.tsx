// R3PromptTemplate — body content for the Prompt Structure Template.
// Rendered inside `ReferencePanel`. Three collapsible sections, one per
// Description sub-component (Product / Process / Performance). Each
// section pairs a "Specify... / Ask yourself..." table with a fill-in
// starter sentence the learner can adapt to any task. The footer is a
// compact strip explaining the Description-Discernment loop the learner
// runs against the first output.
//
// Color palette: Description amber throughout. The 4D system marks this
// as the "how to communicate to the model" pillar, and R3 is the portable
// version of that competency. Borders + overlines use the static brand
// hex (#8B7355) so they read on both light and dark surfaces; row tints
// use the `--description-light` CSS var which adapts to dark mode
// automatically.

import { useState, type ReactNode } from 'react';
import { Icon } from '../../shared/Icon';

// ─────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────

const DESCRIPTION = '#8B7355';

interface SpecRow {
  /** Left column — the dimension to specify. Bold sentence-case. */
  specify: string;
  /** Right column — guiding questions / examples for that dimension. */
  prompt: string;
}

interface SectionSpec {
  /** Stable id used for the disclosure aria-controls hookup. */
  id: 'product' | 'process' | 'performance';
  /** Overline label, rendered uppercase in mono (e.g. "Product Description"). */
  overline: string;
  /** Section heading question (e.g. "What do you want?"). */
  heading: string;
  /** Italic subtitle below the heading. */
  italic: string;
  rows: SpecRow[];
  /** Fill-in starter sentence — verbatim quote from the PDF. */
  fillIn: string;
}

const SECTIONS: SectionSpec[] = [
  {
    id: 'product',
    overline: 'Product Description',
    heading: 'What do you want?',
    italic: 'Define the output before you request it.',
    rows: [
      {
        specify: 'Format',
        prompt:
          'What form should this take? (memo, email, table, analysis, code, slide outline…)',
      },
      {
        specify: 'Audience',
        prompt: 'Who will read this? What do they already know? What do they need?',
      },
      {
        specify: 'Length',
        prompt: 'How long? (word count, number of items, page count, compression level)',
      },
      {
        specify: 'Detail level',
        prompt: 'Overview or deep dive? Executive summary or technical spec?',
      },
      {
        specify: 'Quality criteria',
        prompt:
          'What standard must it meet? (style guide, accuracy threshold, specific requirements)',
      },
    ],
    fillIn:
      '“I need a [format] for [audience] that is approximately [length] and covers [scope] at [detail level]. It must [quality criteria].”',
  },
  {
    id: 'process',
    overline: 'Process Description',
    heading: 'How should AI approach this?',
    italic: 'Guide the method, not just the destination.',
    rows: [
      {
        specify: 'Steps / sequence',
        prompt: 'Analyze then recommend? Compare X to Y? Work through a framework?',
      },
      {
        specify: 'Methods',
        prompt: 'Use a specific model? (your rubric, SWOT, scoring matrix, regulatory checklist)',
      },
      {
        specify: 'Constraints',
        prompt:
          'What boundaries? (only this data source, this time period, exclude these topics)',
      },
      {
        specify: 'Include / exclude',
        prompt: 'What must it cover? What should it skip?',
      },
      {
        specify: 'Reasoning',
        prompt: 'Show its reasoning? Work step by step? Present alternatives first?',
      },
    ],
    fillIn:
      '“Approach this by [method]. Use [framework] as structure. Constrain to [boundaries]. Include [required] and exclude [out-of-scope].”',
  },
  {
    id: 'performance',
    overline: 'Performance Description',
    heading: 'How should AI behave?',
    italic: 'Shape the interaction, not just the output.',
    rows: [
      {
        specify: 'Tone',
        prompt: 'Direct and actionable? Diplomatic? Analytical? Conversational?',
      },
      {
        specify: 'Voice',
        prompt:
          'Expert consultant? Knowledgeable peer? Supportive instructor? Neutral reporter?',
      },
      {
        specify: 'Directness',
        prompt: 'Tell me what to do? Present options? Challenge my assumptions?',
      },
      {
        specify: 'Priorities',
        prompt: 'Brevity or completeness? Speed or thoroughness? Creativity or precision?',
      },
      {
        specify: 'What to avoid',
        prompt: 'Hedging language? Generic disclaimers? Overly formal register?',
      },
    ],
    fillIn:
      '“Use a [tone] tone. Write as a [voice]. Be [directness]. Prioritize [priority]. Avoid [what to avoid].”',
  },
];

// Loop section data — the three evaluation pills under "After the first output".
interface LoopPill {
  dimension: string;
  question: string;
}

const LOOP_PILLS: LoopPill[] = [
  {
    dimension: 'Product',
    question: 'Does the output match your format, audience, and length specification?',
  },
  {
    dimension: 'Process',
    question: 'Is the structure and reasoning approach what you asked for?',
  },
  {
    dimension: 'Performance',
    question: 'Does the tone, voice, and register fit?',
  },
];

// ─────────────────────────────────────────────────────────────────────
// Top-level component
// ─────────────────────────────────────────────────────────────────────

export function R3PromptTemplate(): JSX.Element {
  // Each section tracks its own open/closed state. All three default to
  // open on first mount (per spec) — collapsing is opt-in, not opt-out.
  const [openMap, setOpenMap] = useState<Record<SectionSpec['id'], boolean>>({
    product: true,
    process: true,
    performance: true,
  });

  const toggle = (id: SectionSpec['id']) => {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="font-sans">
      {/* Intro paragraph */}
      <p
        className="m-0 mb-5 text-body-sm text-body"
        style={{ lineHeight: 1.55 }}
      >
        Use this template to structure any AI prompt. Organized by the three Description
        sub-components. Most underspecified prompts fail on all three simultaneously.{' '}
        <em>Use it as a structural scaffold for any task, not a prompt library.</em>
      </p>

      {/* Three Description sections, vertically stacked, each collapsible. */}
      <div className="space-y-4">
        {SECTIONS.map((s) => (
          <SectionCard
            key={s.id}
            section={s}
            isOpen={openMap[s.id]}
            onToggle={() => toggle(s.id)}
          />
        ))}
      </div>

      {/* Loop strip — separated by a thin top divider so it reads as a
          coda to the three sections, not a fourth section. */}
      <LoopStrip />

      {/* Attribution footer */}
      <p
        className="m-0 mt-6 text-caption text-tertiary"
        style={{ lineHeight: 1.5, fontStyle: 'italic' }}
      >
        Framework: Anthropic 4D AI Fluency Framework, Description competency (Dakan, Feller, and
        Anthropic, 2025).
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Section card — collapsible header + table + fill-in template.
// ─────────────────────────────────────────────────────────────────────

function SectionCard({
  section,
  isOpen,
  onToggle,
}: {
  section: SectionSpec;
  isOpen: boolean;
  onToggle: () => void;
}): JSX.Element {
  const panelId = `r3-section-${section.id}`;
  return (
    <article
      className="rounded-lg overflow-hidden"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${DESCRIPTION}`,
      }}
    >
      {/* Header — clickable disclosure button covering the full row */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-3 text-left"
        style={{ padding: '14px 16px', background: 'transparent' }}
      >
        <div className="min-w-0 flex-1">
          <div
            className="font-mono text-overline font-bold uppercase"
            style={{
              color: 'rgb(var(--description-text))',
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
          <p
            className="m-0 mt-1 font-sans text-body-sm"
            style={{
              color: 'rgb(var(--secondary))',
              fontStyle: 'italic',
              lineHeight: 1.4,
            }}
          >
            {section.italic}
          </p>
        </div>
        {/* Chevron rotates with state — chevronDown points down when open
            (ready to collapse), and rotated -90° when closed. */}
        <span
          aria-hidden="true"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
          style={{
            color: 'rgb(var(--description-text))',
            background: 'rgb(var(--surface))',
            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 180ms ease',
          }}
        >
          <Icon name="chevronDown" size={16} />
        </span>
      </button>

      {/* Body — table + fill-in. Kept mounted and toggled with `hidden`
          so the header's aria-controls always resolves to a real element
          (a conditionally-rendered panel left it dangling while closed). */}
      <div id={panelId} hidden={!isOpen}>
        <SpecTable rows={section.rows} />
        <FillIn text={section.fillIn} />
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Specify / Ask yourself table — 5 rows with alternating amber tints.
// ─────────────────────────────────────────────────────────────────────

function SpecTable({ rows }: { rows: SpecRow[] }): JSX.Element {
  return (
    <div
      role="table"
      aria-label="Specify — ask yourself"
      style={{
        borderTop: '1px solid rgb(var(--border-light))',
      }}
    >
      {/* Column headers — small mono labels, full-width banner */}
      <div
        role="row"
        className="grid"
        style={{
          gridTemplateColumns: '120px 1fr',
          gap: 12,
          padding: '8px 16px',
          borderBottom: '1px solid rgb(var(--border-light))',
          background: 'rgb(var(--surface))',
        }}
      >
        <div
          role="columnheader"
          className="font-mono text-[9px] font-bold uppercase"
          style={{ color: 'rgb(var(--tertiary))', letterSpacing: '0.1em' }}
        >
          Specify...
        </div>
        <div
          role="columnheader"
          className="font-mono text-[9px] font-bold uppercase"
          style={{ color: 'rgb(var(--tertiary))', letterSpacing: '0.1em' }}
        >
          Ask yourself...
        </div>
      </div>

      {rows.map((row, i) => (
        <div
          key={row.specify}
          role="row"
          className="grid"
          style={{
            gridTemplateColumns: '120px 1fr',
            gap: 12,
            padding: '10px 16px',
            // Alternating amber tint on odd-indexed rows. The CSS var
            // `--description-light` flips to a dark amber wash in dark mode,
            // so contrast stays balanced in both themes.
            background: i % 2 === 0 ? 'rgb(var(--description-light))' : 'transparent',
            borderBottom:
              i === rows.length - 1 ? 'none' : '1px solid rgb(var(--border-light))',
          }}
        >
          <div
            role="cell"
            className="font-sans text-[12.5px] font-semibold"
            style={{
              color: 'rgb(var(--description-text))',
              lineHeight: 1.35,
            }}
          >
            {row.specify}
          </div>
          <div
            role="cell"
            className="font-sans text-[12.5px]"
            style={{
              color: 'rgb(var(--ink))',
              lineHeight: 1.45,
            }}
          >
            {row.prompt}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Fill-in — distinct treatment from the table rows: bordered top
// divider + amber left rule + monospaced label so it reads as the
// "output" of the section.
// ─────────────────────────────────────────────────────────────────────

function FillIn({ text }: { text: string }): JSX.Element {
  return (
    <div
      style={{
        borderTop: '1px solid rgb(var(--border-light))',
        background: 'rgb(var(--surface-warm))',
        borderLeft: `3px solid ${DESCRIPTION}`,
        padding: '12px 16px',
      }}
    >
      <div
        className="font-mono text-[10px] font-bold uppercase"
        style={{
          color: 'rgb(var(--description-text))',
          letterSpacing: '0.1em',
          marginBottom: 6,
        }}
      >
        Fill in
      </div>
      <p
        className="m-0 font-sans text-[12.5px]"
        style={{
          color: 'rgb(var(--ink))',
          lineHeight: 1.55,
          fontStyle: 'italic',
        }}
      >
        {text}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Loop strip — the Description-Discernment loop coda. Three compact
// evaluation pills stacked vertically (panel is too narrow for inline).
// ─────────────────────────────────────────────────────────────────────

function LoopStrip(): JSX.Element {
  return (
    <section
      aria-label="After the first output: the Description-Discernment loop"
      className="mt-6 rounded-lg"
      style={{
        background: 'rgb(var(--surface-warm))',
        border: '1px solid rgb(var(--border))',
        borderLeft: `3px solid ${DESCRIPTION}`,
        padding: '14px 16px',
      }}
    >
      <div
        className="font-mono text-overline font-bold uppercase"
        style={{
          color: 'rgb(var(--description-text))',
          letterSpacing: '0.1em',
          marginBottom: 6,
        }}
      >
        After the first output: the Description–Discernment loop
      </div>
      <p
        className="m-0 mb-3 font-sans text-body-sm"
        style={{
          color: 'rgb(var(--ink))',
          lineHeight: 1.5,
        }}
      >
        Evaluate what comes back using the same three dimensions, identify which has the largest
        gap, then revise that dimension and regenerate.
      </p>
      <ul className="m-0 list-none space-y-2 p-0">
        {LOOP_PILLS.map((p) => (
          <LoopRow key={p.dimension} dimension={p.dimension} question={p.question} />
        ))}
      </ul>
    </section>
  );
}

function LoopRow({
  dimension,
  question,
}: {
  dimension: string;
  question: ReactNode;
}): JSX.Element {
  return (
    <li
      className="rounded-md"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border-light))',
        padding: '8px 12px',
      }}
    >
      <span
        className="font-sans text-[12px] font-bold"
        style={{
          color: 'rgb(var(--description-text))',
          marginRight: 8,
        }}
      >
        {dimension}:
      </span>
      <span
        className="font-sans text-[12px]"
        style={{
          color: 'rgb(var(--ink))',
          lineHeight: 1.45,
        }}
      >
        {question}
      </span>
    </li>
  );
}
