// R2DelegationGuide — body content for the Task Delegation Decision Guide.
// Rendered inside `ReferencePanel`. Mirrors the finalized PDF's content
// (four sequential decision questions → three terminal categories) but
// reflows the flowchart vertically because the in-platform panel is much
// narrower than the landscape PDF page. The category color mapping mirrors
// P8 exactly:
//   • Fully Delegable → Discernment palette (blue-gray)
//   • AI-Assisted with Review → Description palette (amber)
//   • Human-Only → Delegation palette (olive green)
// This is intentional: the learner sees the same visual language in the
// practice activity (P8) and the portable job aid (R2).

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────────
// Categories — terminal recommendations from the flowchart, also rendered
// as a reference table below the flowchart. Hex bg matches P8's category
// border / count colors so that the same hue carries from exercise to
// reference.
// ─────────────────────────────────────────────────────────────────────

type CategoryKey = 'fully_delegable' | 'ai_assisted' | 'human_only';

interface CategorySpec {
  key: CategoryKey;
  name: string;
  /** Accent for the chip border and the reference card's left rule.
   *  A competency token, so it follows the theme. */
  hex: string;
  /** Competency CSS-variable family that supplies the soft tint and text
   *  color (with a dark-mode equivalent in src/styles/index.css). */
  cssVar: 'discernment' | 'description' | 'delegation';
  /** "What it means" — short definition. */
  meaning: string;
  /** "Typical tasks" — comma-separated examples. */
  typical: string;
}

const CATEGORIES: Record<CategoryKey, CategorySpec> = {
  fully_delegable: {
    key: 'fully_delegable',
    name: 'Fully Delegable',
    hex: 'rgb(var(--discernment))',
    cssVar: 'discernment',
    meaning: 'AI produces the output; you spot-check the result.',
    typical:
      'Data compilation from known sources, formatting, proofreading, standard translations, template population.',
  },
  ai_assisted: {
    key: 'ai_assisted',
    name: 'AI-Assisted with Review',
    hex: 'rgb(var(--description))',
    cssVar: 'description',
    meaning:
      'AI produces a draft or structure; you direct, evaluate, and revise using your expertise.',
    typical:
      'Comparative analysis with verified inputs, first-draft summaries you’ll review, structural scaffolding.',
  },
  human_only: {
    key: 'human_only',
    name: 'Human-Only',
    hex: 'rgb(var(--delegation))',
    cssVar: 'delegation',
    meaning:
      'You produce the output. AI may assist with sub-components, but the core judgment stays with you.',
    typical:
      'Strategic recommendations, causal interpretation, tasks depending on unrecorded or proprietary information.',
  },
};

// Diamond stroke = Delegation brand color (the governing competency for
// this guide). Same hex in light + dark mode by spec.
const DIAMOND_STROKE = 'rgb(var(--delegation))';

// ─────────────────────────────────────────────────────────────────────
// Flowchart data — four questions, each with two exits. An exit either
// terminates at a category recommendation or continues to the next Q.
// ─────────────────────────────────────────────────────────────────────

interface ExitTerminal {
  kind: 'terminal';
  /** The category recommendation reached at this exit. */
  category: CategoryKey;
  /** Branch label (e.g., "Minimal consequence"). */
  label: string;
}

interface ExitContinue {
  kind: 'continue';
  /** "Yes" / "No" / "Moderate to significant" — the routing decision. */
  label: string;
  /** Display label for the next question (e.g., "Q2"). */
  nextId: string;
}

type FlowExit = ExitTerminal | ExitContinue;

interface FlowQuestion {
  id: string; // "Q1"
  pillar: string; // "STAKES"
  question: string; // "What happens if this output is wrong?"
  consider: string;
  exits: [FlowExit, FlowExit]; // Always exactly two
}

const FLOW: FlowQuestion[] = [
  {
    id: 'Q1',
    pillar: 'Stakes',
    question: 'What happens if this output is wrong?',
    consider:
      'Who sees this? What decisions depend on it? What’s the cost of an error: rework, reputational damage, legal exposure, financial loss?',
    exits: [
      { kind: 'terminal', category: 'fully_delegable', label: 'Minimal consequence' },
      { kind: 'continue', label: 'Moderate to significant', nextId: 'Q2' },
    ],
  },
  {
    id: 'Q2',
    pillar: 'Contextual Knowledge',
    question: 'Does this task require knowledge the model doesn’t have?',
    consider:
      'Does it depend on unrecorded conversations, relationship context, proprietary data you haven’t provided in the prompt, or real-time information the model can’t access?',
    exits: [
      { kind: 'terminal', category: 'human_only', label: 'Yes' },
      { kind: 'continue', label: 'No', nextId: 'Q3' },
    ],
  },
  {
    id: 'Q3',
    pillar: 'Verifiability',
    question: 'Can you verify every key claim in the output against an independent source?',
    consider:
      'Is there a dashboard, database, document, or known standard you can check against? Or would you be relying on the output’s plausibility alone?',
    exits: [
      { kind: 'terminal', category: 'human_only', label: 'No' },
      { kind: 'continue', label: 'Yes', nextId: 'Q4' },
    ],
  },
  {
    id: 'Q4',
    pillar: 'Domain Expertise',
    question: 'Do you have the expertise to catch errors in this output?',
    consider:
      'Would you recognize a wrong number, a flawed argument, or a misapplied concept in this domain? Or would a plausible-sounding error pass your review?',
    exits: [
      { kind: 'terminal', category: 'human_only', label: 'No' },
      { kind: 'terminal', category: 'ai_assisted', label: 'Yes' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// Top-level component
// ─────────────────────────────────────────────────────────────────────

export function R2DelegationGuide(): JSX.Element {
  return (
    <div className="font-sans">
      {/* Intro paragraph */}
      <p
        className="m-0 mb-5 text-body-sm text-body"
        style={{ lineHeight: 1.55 }}
      >
        Use this guide before delegating a task to AI. Walk through four questions in sequence.
        Each question either routes you to a recommendation or advances you to the next filter.
      </p>

      {/* Vertical flowchart — the centerpiece of this guide. */}
      <Flowchart />

      {/* Q4-No parenthetical — pulled out as a callout because it’s an
          escape hatch the learner needs to see distinctly, not buried in
          the flowchart itself. */}
      <Q4Note />

      {/* Three-category reference table (rendered as cards for narrow
          viewport readability). Order matches the PDF: Fully Delegable,
          AI-Assisted, Human-Only. */}
      <section
        aria-label="Recommendation category reference"
        className="mt-8"
      >
        <div
          className="mb-3 font-mono text-overline font-bold uppercase"
          style={{
            color: 'rgb(var(--tertiary))',
            letterSpacing: '0.1em',
          }}
        >
          Recommendation reference
        </div>
        <div className="space-y-3">
          <CategoryCard cat={CATEGORIES.fully_delegable} />
          <CategoryCard cat={CATEGORIES.ai_assisted} />
          <CategoryCard cat={CATEGORIES.human_only} />
        </div>
      </section>

      {/* One Task, Multiple Components — concept callout */}
      <aside
        role="note"
        aria-label="One task, multiple components"
        className="mt-6"
        style={{
          background: 'rgb(var(--surface-warm))',
          border: '1px solid rgb(var(--border))',
          borderLeft: `3px solid ${DIAMOND_STROKE}`,
          padding: '14px 16px',
        }}
      >
        <div
          className="mb-1.5 font-mono text-overline font-bold uppercase"
          style={{ color: 'rgb(var(--delegation-text))', letterSpacing: '0.1em' }}
        >
          One task, multiple components
        </div>
        <p className="m-0 text-body-sm text-body" style={{ lineHeight: 1.55 }}>
          Most workplace tasks are bundles of sub-tasks with different risk profiles. Apply this
          guide <em>per component</em>, not per deliverable. A quarterly business review might
          include data compilation (fully delegable), trend narrative (AI-assisted), and strategic
          recommendations (human-only).
        </p>
        <p className="m-0 text-body-sm text-body" style={{ lineHeight: 1.55, marginTop: 8 }}>
          When you decompose a task into separate components, a compilation step followed by a
          dedicated human verification step can be fully delegated even when the overall
          deliverable carries significant stakes, because the verification step absorbs the risk.
          If compilation and verification are not separated, the combined task routes through the
          full flowchart at the higher stakes level.
        </p>
      </aside>

      {/* The data gate — organizational-boundary callout. Sits with the
          concept callouts because it precedes the four questions
          conceptually: what enters an external tool is a policy
          decision, not an individual delegation decision. */}
      <aside
        role="note"
        aria-label="The data gate"
        className="mt-4"
        style={{
          background: 'rgb(var(--surface-warm))',
          border: '1px solid rgb(var(--border))',
          borderLeft: `3px solid ${DIAMOND_STROKE}`,
          padding: '14px 16px',
        }}
      >
        <div
          className="mb-1.5 font-mono text-overline font-bold uppercase"
          style={{ color: 'rgb(var(--delegation-text))', letterSpacing: '0.1em' }}
        >
          Before the four questions: the data gate
        </div>
        <p className="m-0 text-body-sm text-body" style={{ lineHeight: 1.55 }}>
          The flowchart assumes the task is yours to delegate. One gate comes first: whatever you
          paste into an AI tool leaves your organization&rsquo;s boundary the moment you send it.
          Client records, unreleased financials, personal data, internal strategy, anything under
          NDA — whether that material can enter an external tool at all is an organizational
          policy decision, not an individual delegation decision.
        </p>
        <p className="m-0 text-body-sm text-body" style={{ lineHeight: 1.55, marginTop: 8 }}>
          Check your organization&rsquo;s AI-use policy before the flowchart, not after. If no
          policy exists, that absence is worth surfacing — R7&rsquo;s Delegation Norms section is
          the conversation starter for exactly this question.
        </p>
      </aside>

      {/* Attribution footer — matches R1's footer treatment */}
      <p
        className="m-0 mt-6 text-caption text-tertiary"
        style={{ lineHeight: 1.5, fontStyle: 'italic' }}
      >
        Framework: Anthropic 4D AI Fluency Framework, Delegation competency (Dakan, Feller, and
        Anthropic, 2025).
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Flowchart
// ─────────────────────────────────────────────────────────────────────

function Flowchart(): JSX.Element {
  return (
    <ol
      aria-label="Delegation decision flowchart, four sequential questions"
      className="m-0 list-none p-0"
      style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
    >
      {FLOW.map((q, i) => (
        <FlowStep
          key={q.id}
          q={q}
          stepIndex={i}
          isLast={i === FLOW.length - 1}
        />
      ))}
    </ol>
  );
}

function FlowStep({
  q,
  isLast,
}: {
  q: FlowQuestion;
  stepIndex: number;
  isLast: boolean;
}): JSX.Element {
  // Which exit is the "continue" path? We need this so the connector
  // line can be positioned under that column (right column for Q1–Q3,
  // never present for Q4 since both exits terminate).
  const continueExitIdx = q.exits.findIndex((e) => e.kind === 'continue');

  return (
    <li>
      <Diamond qid={q.id} pillar={q.pillar} />

      {/* Question text — pulled OUT of the diamond so it can wrap freely
          without overflowing the hexagon shape. The diamond is the
          "what kind of decision" badge; the question is the actual
          prompt the learner is answering. */}
      <p
        className="m-0 mx-auto mt-2 text-center font-sans"
        style={{
          color: 'rgb(var(--ink))',
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1.4,
          maxWidth: 440,
        }}
      >
        {q.question}
      </p>

      {/* "Consider:" hint — italic, narrow, centered under the question. */}
      <p
        className="m-0 mx-auto mt-1.5 text-center font-sans"
        style={{
          color: 'rgb(var(--secondary))',
          fontSize: 11.5,
          fontStyle: 'italic',
          lineHeight: 1.45,
          maxWidth: 420,
        }}
      >
        <span
          className="font-mono not-italic"
          style={{
            color: 'rgb(var(--secondary))',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginRight: 6,
          }}
        >
          Consider:
        </span>
        {q.consider}
      </p>

      {/* Two exits — laid out as a 2-column grid below the diamond. The
          left exit is always the "branch off" (route label that exits
          the flow), and the right exit is the "continue" route — except
          on Q4 where both exits are terminals (Human-Only / AI-Assisted). */}
      <div
        className="mt-3 grid"
        style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: EXIT_GAP }}
      >
        {q.exits.map((exit, exitIdx) => (
          <ExitChip key={exitIdx} exit={exit} />
        ))}
      </div>

      {/* Connector to next Q — only when there is a "continue" exit.
          Drawn as a routing line that begins above the continue chip
          and lands centered under the next diamond, so the routing is
          geometrically explicit. */}
      {!isLast && continueExitIdx >= 0 && (
        <Connector continueOnRight={continueExitIdx === 1} />
      )}
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Diamond — SVG decision node containing the Q label + pillar only.
// Rendered as an elongated hexagon (flat top/bottom + angled left/right
// edges) so it reads as a flowchart "decision node" while accommodating
// the pillar text without wasting vertical space. The actual question
// text is rendered OUTSIDE the hexagon (as wrapped HTML below it) so
// long question copy never overflows the shape.
// ─────────────────────────────────────────────────────────────────────

const DIAMOND_W = 320;

// Gutter between the two exit chips. Shared with the Connector, which
// anchors its tail to a chip's column-center and so needs the same gap
// the grid actually renders — a hardcoded `gap-3` on one side and a
// guess on the other is how the tail drifted off the chip before.
const EXIT_GAP = 12;
const DIAMOND_H = 84;
const DIAMOND_INSET = 28; // horizontal inset of the flat top/bottom

function Diamond({
  qid,
  pillar,
}: {
  qid: string;
  pillar: string;
}): JSX.Element {
  // Hexagon points: (inset, 0) top-left → (W-inset, 0) top-right →
  // (W, H/2) right → (W-inset, H) bottom-right → (inset, H) bottom-left →
  // (0, H/2) left → close.
  const points = [
    [DIAMOND_INSET, 0],
    [DIAMOND_W - DIAMOND_INSET, 0],
    [DIAMOND_W, DIAMOND_H / 2],
    [DIAMOND_W - DIAMOND_INSET, DIAMOND_H],
    [DIAMOND_INSET, DIAMOND_H],
    [0, DIAMOND_H / 2],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');

  return (
    <div
      className="mx-auto"
      style={{ width: DIAMOND_W, maxWidth: '100%', position: 'relative' }}
    >
      <svg
        width="100%"
        viewBox={`0 0 ${DIAMOND_W} ${DIAMOND_H}`}
        role="img"
        aria-label={`${qid}: ${pillar}`}
        style={{ display: 'block' }}
      >
        <polygon
          points={points}
          fill="rgb(var(--white))"
          style={{ stroke: DIAMOND_STROKE }}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {/* Q identifier (IBM Plex Mono small caps) — switched from olive to
            ink so it reads against the dark hexagon fill in dark mode. */}
        <text
          x={DIAMOND_W / 2}
          y={28}
          textAnchor="middle"
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          fontSize={10}
          fontWeight={700}
          letterSpacing={1.4}
          fill="rgb(var(--secondary))"
        >
          {qid}
        </text>
        {/* Pillar (IBM Plex Sans bold uppercase) */}
        <text
          x={DIAMOND_W / 2}
          y={56}
          textAnchor="middle"
          fontFamily="IBM Plex Sans, system-ui, sans-serif"
          fontSize={15}
          fontWeight={700}
          letterSpacing={0.6}
          fill="rgb(var(--ink))"
          style={{ textTransform: 'uppercase' }}
        >
          {pillar}
        </text>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Exit chip — terminal (colored) or continue (subtle, with arrow).
// ─────────────────────────────────────────────────────────────────────

function ExitChip({ exit }: { exit: FlowExit }): JSX.Element {
  if (exit.kind === 'terminal') {
    const cat = CATEGORIES[exit.category];
    return (
      <div
        style={{
          background: `rgb(var(--${cat.cssVar}-light))`,
          border: `1px solid ${cat.hex}`,
          padding: '10px 12px',
          textAlign: 'center',
        }}
      >
        {/* Branch label uses the competency-text token rather than
            --tertiary so it stays legible against the tinted bg in
            both light and dark mode. */}
        <div
          className="font-mono text-[10px] font-bold uppercase"
          style={{
            color: `rgb(var(--${cat.cssVar}-text))`,
            opacity: 0.85,
            letterSpacing: '0.08em',
            marginBottom: 4,
          }}
        >
          {exit.label}
        </div>
        <div
          className="font-sans text-[12px] font-bold uppercase"
          style={{
            color: `rgb(var(--${cat.cssVar}-text))`,
            letterSpacing: '0.04em',
            lineHeight: 1.25,
          }}
        >
          {cat.name}
        </div>
      </div>
    );
  }

  // Continue exit — neutral chip with an arrow indicator. Solid border
  // (not dashed) for better visibility in dark mode where dashed
  // borders fade against the dark surface.
  return (
    <div
      style={{
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        padding: '10px 12px',
        textAlign: 'center',
      }}
    >
      <div
        className="font-mono text-[10px] font-bold uppercase"
        style={{
          color: 'rgb(var(--secondary))',
          letterSpacing: '0.08em',
          marginBottom: 4,
        }}
      >
        {exit.label}
      </div>
      <div
        className="font-sans text-[12px] font-medium"
        style={{
          color: 'rgb(var(--ink))',
          lineHeight: 1.25,
        }}
      >
        Continue to <strong style={{ color: 'rgb(var(--ink))' }}>{exit.nextId}</strong>{' '}
        <span aria-hidden="true">↓</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Connector — routing line between flowchart steps. Drawn as a single
// SVG path that begins above the continue-chip column (offset right or
// left from center, matching where that exit lives) and curves down to
// land centered under the next hexagon. This makes the routing
// geometrically explicit instead of relying on the chip text alone.
// Stroke is delegation olive so it reads in both light and dark mode.
// No arrowhead: the line already carries the routing, and the chip it
// hangs from names the destination.
// ─────────────────────────────────────────────────────────────────────

const CONNECTOR_H = 56;

function Connector({ continueOnRight }: { continueOnRight: boolean }): JSX.Element {
  // The line has to start above the *continue chip*, so its coordinate
  // space must be the exit row's, not a box of its own. It previously
  // drew into a fixed 320-wide viewBox (sized to DIAMOND_W) that
  // `mx-auto`-centered inside the full-width exit row, and took its start
  // as 75% of that inner box — which is only the chip's column-center
  // when the row happens to be exactly 320 wide. In the 560px panel the
  // row measures ~515, and the tail landed ~51px inside the chip it was
  // meant to hang from. The end point never showed the fault because both
  // it and the box are centered, so the two errors cancel.
  //
  // So: span the row, and map the viewBox 1:1 onto CSS pixels. A 1:1 map
  // is what holds the stroke at a fixed weight instead of scaling it with
  // the panel, which a percentage-width viewBox would do.
  const ref = useRef<HTMLDivElement | null>(null);
  const [rowW, setRowW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setRowW(w);
    };
    // Measure synchronously, before paint: a ResizeObserver alone would
    // leave the first frame with no width to draw into, and it only
    // delivers on the rendering lifecycle — which is suspended while the
    // tab is backgrounded. rAF-independent measurement here means the
    // arrow is right on the first paint and the observer only has to
    // handle later resizes (panel open on mobile vs. desktop widths).
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Two equal columns separated by EXIT_GAP, so each column is
  // (rowW - gap) / 2 wide and the left one centers at half of that. The
  // gap matters: dropping it is what left the old math 3px out even at
  // the one width where the rest of it worked.
  const colCenter = (rowW - EXIT_GAP) / 4;
  const startX = continueOnRight ? rowW - colCenter : colCenter;
  const endX = rowW / 2;
  const startY = 4;
  const endY = CONNECTOR_H - 8;
  // Cubic Bezier control points keep the curve gentle — straight at the
  // top, bending into center near the bottom.
  const c1x = startX;
  const c1y = startY + (endY - startY) * 0.55;
  const c2x = endX;
  const c2y = startY + (endY - startY) * 0.55;

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg
        width="100%"
        height={CONNECTOR_H}
        viewBox={`0 0 ${rowW || 1} ${CONNECTOR_H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        style={{ display: 'block', margin: '4px auto' }}
      >
        <path
          d={`M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`}
          fill="none"
          style={{ stroke: DIAMOND_STROKE }}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Q4-No parenthetical — escape hatch callout below the flowchart.
// ─────────────────────────────────────────────────────────────────────

function Q4Note(): JSX.Element {
  return (
    <p
      className="m-0 mt-5 text-body-sm"
      style={{
        color: 'rgb(var(--secondary))',
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border-light))',
        padding: '10px 14px',
        lineHeight: 1.55,
      }}
    >
      <strong style={{ color: 'rgb(var(--ink))' }}>Note:</strong> If Q4 = No but the task still
      benefits from AI acceleration, use AI-assisted with mandatory peer review from someone with
      the domain expertise.
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Category reference card — used in the table-style reference below the
// flowchart. Mirrors P8's category palette exactly (P8 sub-component
// rationale).
// ─────────────────────────────────────────────────────────────────────

function CategoryCard({ cat }: { cat: CategorySpec }): JSX.Element {
  return (
    <article
      style={{
        background: `rgb(var(--${cat.cssVar}-light))`,
        border: '1px solid rgb(var(--border))',
        borderLeft: `3px solid ${cat.hex}`,
        padding: '12px 14px',
      }}
    >
      <h3
        className="m-0 mb-1 font-sans text-h4 font-semibold uppercase"
        style={{
          color: `rgb(var(--${cat.cssVar}-text))`,
          letterSpacing: '0.04em',
          fontSize: 13,
        }}
      >
        {cat.name}
      </h3>
      <DetailRow label="What it means">{cat.meaning}</DetailRow>
      <DetailRow label="Typical tasks">{cat.typical}</DetailRow>
    </article>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <div style={{ marginTop: 8 }}>
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
          color: 'rgb(var(--ink))',
          lineHeight: 1.5,
        }}
      >
        {children}
      </div>
    </div>
  );
}
