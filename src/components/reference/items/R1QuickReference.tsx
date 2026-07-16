// R1QuickReference — body content for the 4D Competency Quick-Reference Card.
// Rendered inside `ReferencePanel`. Mirrors the finalized PDF's structure
// (header text + two-loop visual + four quadrant tables + footer) but uses
// the platform's design tokens (Source Serif 4 / IBM Plex Sans / IBM Plex Mono) and
// adapts to dark mode via the `--{competency}-light` and `--{competency}-text`
// CSS variables added during 3B-8.

import type { ReactNode } from 'react';

const HEADER_TEXT =
  "The 4Ds describe four competencies for effective, responsible AI use at work. They operate in two loops: the Delegation–Diligence loop governs whether and when to use AI (strategic decisions); the Description–Discernment loop governs how to work with AI effectively (operational workflow).";

type CompetencyKey = 'delegation' | 'description' | 'discernment' | 'diligence';

// Competency accents as tokens rather than hexes, so the diagram follows
// the theme. Consumed via the CSS `fill` / `stroke` *properties*, never
// the same-named SVG attributes — attributes are parsed as SVG paint and
// reject var(), while the CSS properties resolve it normally.
// Declared above QUADRANTS: that array reads it at module-evaluation time.
const COMP_COLOR = {
  delegation: 'rgb(var(--delegation))',
  description: 'rgb(var(--description))',
  discernment: 'rgb(var(--discernment))',
  diligence: 'rgb(var(--diligence))',
} as const;

interface SubComponent {
  name: string;
  meaning: string;
  action: string;
}

interface QuadrantData {
  key: CompetencyKey;
  label: string;
  // Solid fill for the quadrant header, from the 4D competency tokens.
  // The accents carry distinct light and dark values, so the header text
  // over this has to invert with the theme too.
  bg: string;
  definition: string;
  subs: SubComponent[];
}

const QUADRANTS: QuadrantData[] = [
  {
    key: 'delegation',
    label: 'Delegation',
    bg: COMP_COLOR.delegation,
    definition: 'Deciding what work is appropriate for you, for AI, or for both.',
    subs: [
      {
        name: 'Problem Awareness',
        meaning:
          'Understanding your goals and the nature of the work before involving AI.',
        action:
          'Define the task goal. Identify which components require human judgment and which are appropriate for AI assistance.',
      },
      {
        name: 'Platform Awareness',
        meaning: 'Understanding the capabilities and limitations of the AI tool you are using.',
        action:
          'Identify what the tool generates reliably vs. where it systematically fails, before delegating.',
      },
      {
        name: 'Task Delegation',
        meaning:
          'Distributing work between humans and AI to draw on the strengths of each.',
        action:
          'Distinguish augmentation from automation. Decompose tasks by stakes, verifiability, and your domain expertise.',
      },
    ],
  },
  {
    key: 'description',
    label: 'Description',
    bg: COMP_COLOR.description,
    definition: 'Communicating what you need from AI clearly enough to get a useful result.',
    subs: [
      {
        name: 'Product Description',
        meaning: 'Defining what you want the output to look like.',
        action:
          'Specify format, audience, length, detail level, and quality criteria before generating.',
      },
      {
        name: 'Process Description',
        meaning: 'Guiding how the AI should approach the task.',
        action:
          'Provide methods, steps, constraints, and reasoning sequence. Give context, not single-turn directives.',
      },
      {
        name: 'Performance Description',
        meaning: 'Shaping how the AI behaves during the interaction.',
        action:
          'Set expectations for tone, voice, directness, and priorities. Iterate rather than accept/discard first results.',
      },
    ],
  },
  {
    key: 'discernment',
    label: 'Discernment',
    bg: COMP_COLOR.discernment,
    definition: 'Evaluating what AI gives you back before you use it.',
    subs: [
      {
        name: 'Product Discernment',
        meaning: 'Evaluating whether the output meets your specification.',
        action:
          'Verify factual claims, citations, and statistics against independent sources. Identify hallucination indicators.',
      },
      {
        name: 'Process Discernment',
        meaning: "Evaluating whether the AI's reasoning is sound.",
        action:
          'Check for logical gaps, unsupported assumptions, and circular reasoning. Trace the reasoning, not just the conclusion.',
      },
      {
        name: 'Performance Discernment',
        meaning: "Evaluating whether the AI's behavior matched what you needed.",
        action:
          'Assess whether tone, register, and style match the intended audience. Flag deviations from your instructions.',
      },
    ],
  },
  {
    key: 'diligence',
    label: 'Diligence',
    bg: COMP_COLOR.diligence,
    definition: 'Taking responsibility for what you do with AI and how you do it.',
    subs: [
      {
        name: 'Creation Diligence',
        meaning:
          'Being thoughtful about which AI systems you use and how you interact with them.',
        action:
          'Select appropriate tools for the task. Understand how your interaction patterns affect output quality.',
      },
      {
        name: 'Transparency Diligence',
        meaning:
          "Being honest about AI's role in your work with everyone who needs to know.",
        action:
          'Document which components were AI-generated, AI-assisted, or human-authored. Discuss practices openly.',
      },
      {
        name: 'Deployment Diligence',
        meaning: 'Verifying and vouching for the outputs you share.',
        action:
          'Take full accountability before sharing. Apply the same review standard as work from a junior colleague.',
      },
    ],
  },
];

// Min-height tokens so adjacent quadrant cards' sub-rows align across the
// 2x2 grid. The values are sized for the worst-case content variant in
// each block:
//   • name: 36px covers two-line wraps (e.g. "Performance Discernment"
//     wrapping at ~190px column width)
//   • meaning: 70px covers a 3-line wrap of the longest meaning text
//     (~78 chars at ~12px / 30 chars-per-line)
//   • action: 110px covers a 5-line wrap of the longest action text
//     (~130 chars)
// With these floors, every sub-row in every card occupies the same
// vertical real estate, so the three sub-rows of adjacent cards line up
// across the 2x2 grid regardless of which one happens to have the
// longest text in any given block.
const SUB_NAME_MIN_HEIGHT = 36;
const SUB_MEANING_MIN_HEIGHT = 70;
const SUB_ACTION_MIN_HEIGHT = 110;

export function R1QuickReference(): JSX.Element {
  return (
    <div className="font-sans">
      {/* Header text */}
      <p
        className="m-0 mb-4 text-body-sm text-body"
        style={{ lineHeight: 1.55 }}
      >
        {HEADER_TEXT}
      </p>

      {/* Two-loop visual */}
      <TwoLoopDiagram />

      {/* 2x2 quadrant grid (stacks at narrow widths). The grid uses a
          fixed two-column layout (or single column on mobile) so that the
          two cards in each row share their rendering width — combined
          with the min-heights inside each sub-component, this keeps the
          three sub-rows of adjacent cards visually aligned. */}
      <div
        className="mt-6 grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
      >
        {QUADRANTS.map((q) => (
          <QuadrantCard key={q.key} q={q} />
        ))}
      </div>

      {/* Footer */}
      <p
        className="m-0 mt-6 text-caption text-tertiary"
        style={{ lineHeight: 1.5, fontStyle: 'italic' }}
      >
        Framework: Anthropic 4D AI Fluency Framework (Dakan, Feller, and Anthropic, 2025).
        Action verbs adapted for workplace application.
      </p>
    </div>
  );
}

// ── Quadrant card ──────────────────────────────────────────────────────

function QuadrantCard({ q }: { q: QuadrantData }): JSX.Element {
  return (
    <article
      className="flex flex-col overflow-hidden"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
      }}
    >
      {/* Header band uses the competency `bg` color — same hex in both modes.
          minHeight is sized to cover Description's 3-line definition wrap
          ("Communicating what you need from AI clearly enough to get a
          useful result.") at the ~190px column width the 2x2 grid produces,
          so all four cards' headers occupy the same vertical space and the
          sub-row indices below them line up across the grid. */}
      <header
        style={{
          background: q.bg,
          padding: '12px 14px',
          minHeight: 100,
        }}
      >
        <div
          className="font-mono text-[10px] font-bold uppercase"
          style={{ color: 'rgb(var(--white) / 0.78)', letterSpacing: '0.12em' }}
        >
          {q.label}
        </div>
        <p
          className="m-0 mt-1 font-sans text-[12.5px]"
          style={{ color: 'rgb(var(--white))', lineHeight: 1.4, fontWeight: 500 }}
        >
          {q.definition}
        </p>
      </header>

      {/* Sub-component rows. Each row has fixed min-heights for its three
          internal blocks (name / meaning / action) so the same row index
          renders at the same height across all four cards. */}
      <div className="flex flex-col">
        {q.subs.map((s, i) => (
          <SubRow
            key={s.name}
            sub={s}
            competency={q.key}
            zebra={i % 2 === 1}
            isLast={i === q.subs.length - 1}
          />
        ))}
      </div>
    </article>
  );
}

function SubRow({
  sub,
  competency,
  zebra,
  isLast,
}: {
  sub: SubComponent;
  competency: CompetencyKey;
  zebra: boolean;
  isLast: boolean;
}): JSX.Element {
  return (
    <div
      style={{
        // Alternating row tint uses the competency's `light` CSS variable so
        // dark mode automatically picks up the dark-mode wash (#2A3025 etc.)
        // configured in src/styles/index.css.
        background: zebra ? `rgb(var(--${competency}-light))` : 'transparent',
        padding: '12px 14px',
        borderBottom: isLast ? 'none' : '1px solid rgb(var(--border-light))',
      }}
    >
      <div
        className="font-sans text-[12.5px] font-semibold"
        style={{
          color: `rgb(var(--${competency}-text))`,
          letterSpacing: '0.005em',
          marginBottom: 6,
          minHeight: SUB_NAME_MIN_HEIGHT,
        }}
      >
        {sub.name}
      </div>
      <Detail label="What it means" minHeight={SUB_MEANING_MIN_HEIGHT}>
        {sub.meaning}
      </Detail>
      <Detail label="What you do" emphasized minHeight={SUB_ACTION_MIN_HEIGHT}>
        {sub.action}
      </Detail>
    </div>
  );
}

// "What it means" / "What you do" are stacked vertically (label above
// content) instead of inline, so each block has a predictable structure
// regardless of column width. Combined with `minHeight`, this keeps
// adjacent cards' sub-rows visually aligned across the 2x2 grid.
function Detail({
  label,
  children,
  emphasized = false,
  minHeight,
}: {
  label: string;
  children: ReactNode;
  emphasized?: boolean;
  minHeight: number;
}): JSX.Element {
  return (
    <div style={{ minHeight, marginTop: 6 }}>
      <div
        className="font-mono text-[9px] font-bold uppercase"
        style={{
          color: 'rgb(var(--tertiary))',
          letterSpacing: '0.1em',
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div
        className="font-sans text-[12px]"
        style={{
          color: emphasized ? 'rgb(var(--ink))' : 'rgb(var(--secondary))',
          lineHeight: 1.45,
          fontWeight: emphasized ? 500 : 400,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Two-loop diagram ──────────────────────────────────────────────────
//
// Two SEPARATE (non-overlapping) circles, each with a curved arrow at the
// 3-o'clock position indicating the loop's revolving / cyclical nature.
// The arc strokes use a *gradient* between the two paired competency
// colors (Delegation olive ↔ Diligence purple in the left loop;
// Description amber ↔ Discernment blue-gray in the right loop) so each
// loop visually conveys its dual-competency pairing as the eye traces
// the arc. Each circle's two competency labels sit at 12 and 6 o'clock
// in their own competency color. Captions below sit in a 2-column grid
// whose column centers line up with the circle centers (25% and 75% of
// the locked 380px diagram width).

// Diagram canvas geometry (kept in module scope so the captions row can
// match the SVG width and circle x-positions exactly).
const DIAGRAM_WIDTH = 380;
const DIAGRAM_HEIGHT = 150;
const LEFT_CX = 95;
const RIGHT_CX = 285;
const CIRCLE_CY = 75;
const CIRCLE_R = 60;

function TwoLoopDiagram(): JSX.Element {
  return (
    <figure
      className="m-0"
      style={{
        background: 'rgb(var(--surface-warm))',
        border: '1px solid rgb(var(--border-light))',
        padding: '14px 16px',
      }}
      aria-label="Two separate loops. Left loop, Delegation cycling with Diligence: should I use AI for this? Right loop, Description cycling with Discernment: how do I work with AI effectively?"
    >
      {/* Locked-width inner container so the SVG and captions share an
          exact pixel grid. `max-width: 100%` keeps the whole assembly
          responsive on narrow drawers (mobile / split panes). */}
      <div className="mx-auto" style={{ width: DIAGRAM_WIDTH, maxWidth: '100%' }}>
        <svg
          width="100%"
          height={DIAGRAM_HEIGHT}
          viewBox={`0 0 ${DIAGRAM_WIDTH} ${DIAGRAM_HEIGHT}`}
          role="img"
          aria-hidden="true"
          style={{ display: 'block' }}
        >
          <defs>
            {/* Arrowheads use the *top* color of their respective loop
                because the arc terminates near 3 o'clock — inside the
                upper half's stroke. */}
            <marker
              id="r1-arrow-left"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: COMP_COLOR.delegation }} />
            </marker>
            <marker
              id="r1-arrow-right"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: COMP_COLOR.description }} />
            </marker>
          </defs>

          {/* Left loop — Delegation (top) / Diligence (bottom) */}
          <Loop
            cx={LEFT_CX}
            cy={CIRCLE_CY}
            r={CIRCLE_R}
            markerId="r1-arrow-left"
            topLabel="Delegation"
            topColor={COMP_COLOR.delegation}
            bottomLabel="Diligence"
            bottomColor={COMP_COLOR.diligence}
          />

          {/* Right loop — Description (top) / Discernment (bottom) */}
          <Loop
            cx={RIGHT_CX}
            cy={CIRCLE_CY}
            r={CIRCLE_R}
            markerId="r1-arrow-right"
            topLabel="Description"
            topColor={COMP_COLOR.description}
            bottomLabel="Discernment"
            bottomColor={COMP_COLOR.discernment}
          />
        </svg>

        {/* Captions — in a 2-column grid sharing the SVG's exact width.
            Each column is 50% of the 380px container, so each column's
            center sits at x=95 and x=285 — matching the circle centers. */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: '1fr 1fr',
            marginTop: 8,
          }}
        >
          <p
            className="m-0 px-2 text-center font-sans text-[11.5px] italic"
            style={{ color: 'rgb(var(--secondary))' }}
          >
            “Should I use AI for this?”
          </p>
          <p
            className="m-0 px-2 text-center font-sans text-[11.5px] italic"
            style={{ color: 'rgb(var(--secondary))' }}
          >
            “How do I work with AI effectively?”
          </p>
        </div>
      </div>
    </figure>
  );
}

// A single loop: an open arc from 20° clockwise around to -20° (i.e., the
// gap sits at 3 o'clock), with an arrowhead at the end of the arc. The
// arc traces ~320° of the circle, leaving the gap on the right edge to
// reinforce "this is a continuous cycle that has direction." Two text
// labels sit inside the loop at 12 and 6 o'clock, each in its own
// competency color so the gradient pairing reads through to the labels.
function Loop({
  cx,
  cy,
  r,
  markerId,
  topLabel,
  topColor,
  bottomLabel,
  bottomColor,
}: {
  cx: number;
  cy: number;
  r: number;
  markerId: string;
  topLabel: string;
  topColor: string;
  bottomLabel: string;
  bottomColor: string;
}): JSX.Element {
  // SVG arc: angle 0° = 3 o'clock, increasing clockwise (because SVG y-axis
  // is inverted relative to math). Start at 20° (just below 3 o'clock),
  // sweep clockwise through 90° (bottom), 180° (left), 270° (top) to end
  // at -20° (340°, just above 3 o'clock). Gap at 3 o'clock = 40°.
  //
  // The loop used to be one path carrying a vertical gradient. It is now
  // two flat strokes meeting at the sweep's midpoint — 9 o'clock, exactly
  // halfway through the 320° sweep — so each competency owns its half of
  // the ring outright. The first half travels through 6 o'clock and is the
  // bottom color; the second travels through 12 o'clock and is the top.
  const pt = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return `${cx + r * Math.cos(rad)} ${cy + r * Math.sin(rad)}`;
  };
  // Each half sweeps 160°, so large-arc-flag stays 0; sweep-flag is 1
  // (clockwise) for both.
  const bottomHalf = `M ${pt(20)} A ${r} ${r} 0 0 1 ${pt(180)}`;
  const topHalf = `M ${pt(180)} A ${r} ${r} 0 0 1 ${pt(340)}`;

  return (
    <g>
      <path
        d={bottomHalf}
        fill="none"
        style={{ stroke: bottomColor }}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d={topHalf}
        fill="none"
        style={{ stroke: topColor }}
        strokeWidth="2.5"
        strokeLinecap="round"
        markerEnd={`url(#${markerId})`}
      />
      {/* Top label — top competency color */}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fontFamily="IBM Plex Sans, system-ui, sans-serif"
        fontSize="12"
        fontWeight="700"
        style={{ fill: topColor, textTransform: "uppercase", letterSpacing: "0.06em" }}
      >
        {topLabel}
      </text>
      {/* Small cycle indicator between the two labels */}
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="11"
        fill="rgb(var(--tertiary))"
      >
        ↕
      </text>
      {/* Bottom label — bottom competency color */}
      <text
        x={cx}
        y={cy + 22}
        textAnchor="middle"
        fontFamily="IBM Plex Sans, system-ui, sans-serif"
        fontSize="12"
        fontWeight="700"
        style={{ fill: bottomColor, textTransform: "uppercase", letterSpacing: "0.06em" }}
      >
        {bottomLabel}
      </text>
    </g>
  );
}
