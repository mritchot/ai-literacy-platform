// R7PolicyStarter — body content for the Organizational AI Use Policy
// Starter. Rendered inside `ReferencePanel`. The seventh and final
// reference card (R1–R7). It is a *conversation scaffold*, not a
// policy — the learner brings it to a 1:1 or team meeting to surface
// shared norms, directly addressing the 69% concealment finding.
//
// Structure: intro + How-to-use → four collapsible discussion areas
// (Delegation / Disclosure / Verification / Documentation Norms), each
// with a topic table + "Your input" preparation prompt → three
// conversation-starter frames → closing + attribution.
//
// Color palette: Diligence purple-gray throughout, same as R6 — these
// are the two "transparency" tools the learner can reach for at P12.

import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────

const DILIGENCE = '#7A6B80';

// ─────────────────────────────────────────────────────────────────────
// Discussion area data — 4 numbered sections matching the PDF
// ─────────────────────────────────────────────────────────────────────

interface AreaTopic {
  topic: string;
  prompt: string;
}

interface DiscussionArea {
  id: string;
  number: number;
  overline: string; // "Delegation Norms"
  question: string; // "What tasks are appropriate for AI use on this team?"
  topics: AreaTopic[];
  yourInput: string;
}

const AREAS: DiscussionArea[] = [
  {
    id: 'delegation',
    number: 1,
    overline: 'Delegation Norms',
    question: 'What tasks are appropriate for AI use on this team?',
    topics: [
      {
        topic: 'Appropriate tasks',
        prompt:
          'Which types benefit from AI? (drafting, data compilation, research, brainstorming, formatting…)',
      },
      {
        topic: 'Off-limits tasks',
        prompt:
          'Where should AI not be used? (client-confidential, regulatory, personnel decisions…)',
      },
      {
        topic: 'Data boundaries',
        prompt:
          'What info can/cannot be shared with AI tools? (proprietary, client, internal strategy…)',
      },
      {
        topic: 'Tool selection',
        prompt: 'Which AI tools are approved or preferred?',
      },
    ],
    yourInput: 'I currently use AI for ___. I avoid it for ___. I’d like clarity on ___.',
  },
  {
    id: 'disclosure',
    number: 2,
    overline: 'Disclosure Norms',
    question: 'What transparency is expected?',
    topics: [
      {
        topic: 'Internal work',
        prompt: 'What disclosure for internal deliverables? (None? Verbal? Written?)',
      },
      {
        topic: 'Client-facing',
        prompt: 'What disclosure for external or client-facing deliverables?',
      },
      {
        topic: 'Threshold',
        prompt: 'Stakes level below which disclosure isn’t necessary?',
      },
      {
        topic: 'Format',
        prompt: 'Diligence statement, footnote, verbal note, or team documentation?',
      },
    ],
    yourInput: 'I currently disclose by ___. I’m unsure about disclosure for ___.',
  },
  {
    id: 'verification',
    number: 3,
    overline: 'Verification Norms',
    question: 'What review standard applies?',
    topics: [
      {
        topic: 'Minimum standard',
        prompt: 'What verification before sharing? (spot-check? full review? peer review?)',
      },
      {
        topic: 'High-stakes work',
        prompt:
          'Deliverable types needing extra verification? (client-facing, financial, legal)',
      },
      {
        topic: 'Accountability',
        prompt: 'Who’s accountable for errors — delegator, reviewer, or both?',
      },
      {
        topic: 'Escalation',
        prompt: 'If an error reaches a client or stakeholder, how is that handled?',
      },
    ],
    yourInput: 'I currently verify by ___. I’d like agreement on the standard for ___.',
  },
  {
    id: 'documentation',
    number: 4,
    overline: 'Documentation Norms',
    question: 'How is AI use recorded on this team?',
    topics: [
      {
        topic: 'Team visibility',
        prompt: 'Track at individual, project, or team level?',
      },
      {
        topic: 'Learning sharing',
        prompt: 'How do members share effective practices? (channel, retros, docs)',
      },
      {
        topic: 'Improvement',
        prompt: 'How to evaluate whether AI improves quality, not just speed?',
      },
    ],
    yourInput: 'I’d find it helpful if our team ___ to share what’s working.',
  },
];

// ─────────────────────────────────────────────────────────────────────
// Conversation frames — three ready-to-use scripts
// ─────────────────────────────────────────────────────────────────────

interface ConversationFrame {
  id: string;
  title: string;
  body: string;
}

const FRAMES: ConversationFrame[] = [
  {
    id: 'frame-1',
    title: 'Frame 1: Process improvement',
    body: '“I’ve been thinking about how we could be more consistent in how we use AI tools. I put together some discussion points — could we spend 10 minutes in our next 1:1?”',
  },
  {
    id: 'frame-2',
    title: 'Frame 2: Quality standard',
    body: '“I want to make sure my AI-assisted work meets the team’s standards. Can we align on what verification and disclosure look like for our deliverables?”',
  },
  {
    id: 'frame-3',
    title: 'Frame 3: Team learning',
    body: '“I think several of us are using AI but figuring it out independently. Would it be useful to agree on shared practices so we can learn from each other?”',
  },
];

// ─────────────────────────────────────────────────────────────────────
// How-to-use steps
// ─────────────────────────────────────────────────────────────────────

const HOW_STEPS = [
  'Review the four areas below.',
  'Draft your “Your input” answers.',
  'Bring to a 1:1 or team meeting.',
  'Use as conversation structure, not a form.',
];

// ─────────────────────────────────────────────────────────────────────
// Top-level component
// ─────────────────────────────────────────────────────────────────────

export function R7PolicyStarter(): JSX.Element {
  // Each area tracks its own collapsed state. All four default to OPEN
  // per spec — collapsing is opt-in.
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {};
    for (const a of AREAS) out[a.id] = true;
    return out;
  });

  const toggle = (id: string) => {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="font-sans">
      {/* Intro */}
      <p
        className="m-0 mb-4 text-body-sm text-body"
        style={{ lineHeight: 1.55 }}
      >
        <strong style={{ color: 'rgb(var(--ink))' }}>
          This is a conversation starter, not a policy.
        </strong>{' '}
        69% of professionals who use AI productively conceal it from colleagues. This scaffold
        helps you initiate a conversation about shared AI use norms. You are proposing shared
        standards, not asking for permission.
      </p>

      {/* How to use — compact strip */}
      <HowToUse />

      {/* Four discussion areas */}
      <div className="mt-5 space-y-4">
        {AREAS.map((a) => (
          <AreaCard
            key={a.id}
            area={a}
            isOpen={openMap[a.id] ?? true}
            onToggle={() => toggle(a.id)}
          />
        ))}
      </div>

      {/* Starting the conversation — three frames */}
      <ConversationFrames />

      {/* Closing line — italic, low-key */}
      <p
        className="m-0 mt-5 font-sans text-body-sm"
        style={{
          color: 'rgb(var(--ink))',
          lineHeight: 1.55,
        }}
      >
        <strong>The goal is to replace private, uncoordinated AI use with visible, accountable
        team practice</strong>, not to create bureaucracy.
      </p>

      {/* Attribution footer */}
      <p
        className="m-0 mt-6 text-caption text-tertiary"
        style={{ lineHeight: 1.5, fontStyle: 'italic' }}
      >
        Framework: Anthropic 4D AI Fluency Framework, Diligence competency (Transparency
        sub-component; Dakan, Feller, and Anthropic, 2025).
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// How to use — compact 4-step strip
// ─────────────────────────────────────────────────────────────────────

function HowToUse(): JSX.Element {
  return (
    <div
      className="rounded-md"
      style={{
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border-light))',
        padding: '10px 14px',
      }}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className="font-mono text-overline font-bold uppercase"
          style={{
            color: DILIGENCE,
            letterSpacing: '0.1em',
          }}
        >
          How to use
        </span>
        <ol className="m-0 flex flex-wrap items-baseline gap-x-3 gap-y-1 list-none p-0">
          {HOW_STEPS.map((step, i) => (
            <li
              key={i}
              className="font-sans text-[12px]"
              style={{ color: 'rgb(var(--ink))', lineHeight: 1.45 }}
            >
              <span
                className="font-mono font-bold"
                style={{
                  color: DILIGENCE,
                  marginRight: 4,
                }}
              >
                {i + 1}.
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Area card — collapsible, with topic table + "Your input" line
// ─────────────────────────────────────────────────────────────────────

function AreaCard({
  area,
  isOpen,
  onToggle,
}: {
  area: DiscussionArea;
  isOpen: boolean;
  onToggle: () => void;
}): JSX.Element {
  const panelId = `r7-area-${area.id}`;
  return (
    <article
      className="rounded-lg overflow-hidden"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${DILIGENCE}`,
      }}
    >
      {/* Disclosure header */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-3 text-left"
        style={{ padding: '14px 16px', background: 'transparent' }}
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-baseline gap-2">
            <span
              className="font-mono text-[11px] font-bold"
              style={{ color: DILIGENCE }}
            >
              {area.number}.
            </span>
            <span
              className="font-mono text-overline font-bold uppercase"
              style={{
                color: DILIGENCE,
                letterSpacing: '0.12em',
              }}
            >
              {area.overline}
            </span>
          </div>
          <p
            className="m-0 font-sans text-h4 font-semibold text-ink"
            style={{ fontSize: 14, lineHeight: 1.35 }}
          >
            {area.question}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
          style={{
            color: DILIGENCE,
            background: 'rgb(var(--surface))',
            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 180ms ease',
          }}
        >
          <Chevron />
        </span>
      </button>

      {/* Body — topic table + "Your input" */}
      {isOpen && (
        <div id={panelId} style={{ borderTop: '1px solid rgb(var(--border-light))' }}>
          {/* Header row */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: '160px 1fr',
              gap: 12,
              padding: '8px 16px',
              background: 'rgb(var(--surface))',
              borderBottom: '1px solid rgb(var(--border-light))',
            }}
          >
            <ColLabel>Topic</ColLabel>
            <ColLabel>Discussion prompt</ColLabel>
          </div>

          {area.topics.map((t, i) => (
            <div
              key={t.topic}
              className="grid"
              style={{
                gridTemplateColumns: '160px 1fr',
                gap: 12,
                padding: '10px 16px',
                background: i % 2 === 0 ? 'rgb(var(--diligence-light))' : 'transparent',
                borderBottom:
                  i === area.topics.length - 1
                    ? 'none'
                    : '1px solid rgb(var(--border-light))',
              }}
            >
              <div
                className="font-sans text-[12.5px] font-semibold"
                style={{
                  color: 'rgb(var(--diligence-text))',
                  lineHeight: 1.4,
                }}
              >
                {t.topic}
              </div>
              <div
                className="font-sans text-[12px]"
                style={{
                  color: 'rgb(var(--ink))',
                  lineHeight: 1.5,
                }}
              >
                {t.prompt}
              </div>
            </div>
          ))}

          {/* "Your input" preparation prompt — distinct treatment with
              diligence-light bg + purple left accent bar so it reads
              as a writable preparation field. */}
          <YourInputBox text={area.yourInput} />
        </div>
      )}
    </article>
  );
}

function YourInputBox({ text }: { text: string }): JSX.Element {
  return (
    <div
      style={{
        background: 'rgb(var(--diligence-light))',
        borderTop: '1px solid rgb(var(--border-light))',
        borderLeft: `3px solid ${DILIGENCE}`,
        padding: '12px 16px',
      }}
    >
      <div
        className="font-mono text-[9px] font-bold uppercase"
        style={{
          color: DILIGENCE,
          letterSpacing: '0.1em',
          marginBottom: 4,
        }}
      >
        Your input
      </div>
      <p
        className="m-0 font-sans text-[12px]"
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
// Conversation frames — three ready-to-use scripts
// ─────────────────────────────────────────────────────────────────────

function ConversationFrames(): JSX.Element {
  return (
    <section
      aria-label="Starting the conversation"
      className="mt-6"
    >
      <div className="mb-2">
        <div
          className="font-mono text-overline font-bold uppercase"
          style={{
            color: DILIGENCE,
            letterSpacing: '0.12em',
          }}
        >
          Starting the conversation
        </div>
        <p
          className="m-0 mt-1 font-sans text-body-sm"
          style={{ color: 'rgb(var(--secondary))', lineHeight: 1.5 }}
        >
          If raising AI norms feels uncomfortable, that’s the concealment dynamic. Three framing
          options:
        </p>
      </div>

      {/* Stack vertically (panel is too narrow for 3 columns) */}
      <div className="space-y-3">
        {FRAMES.map((f) => (
          <FrameCard key={f.id} frame={f} />
        ))}
      </div>
    </section>
  );
}

function FrameCard({ frame }: { frame: ConversationFrame }): JSX.Element {
  return (
    <article
      className="rounded-lg"
      style={{
        background: 'rgb(var(--diligence-light))',
        border: `1.5px solid ${DILIGENCE}`,
        padding: '12px 16px',
      }}
    >
      <h3
        className="m-0 mb-1 font-sans text-[12.5px] font-semibold"
        style={{
          color: 'rgb(var(--diligence-text))',
          lineHeight: 1.3,
        }}
      >
        {frame.title}
      </h3>
      <p
        className="m-0 font-sans text-[12.5px]"
        style={{
          color: 'rgb(var(--ink))',
          lineHeight: 1.55,
          fontStyle: 'italic',
        }}
      >
        {frame.body}
      </p>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function ColLabel({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div
      className="font-mono text-[9px] font-bold uppercase"
      style={{ color: 'rgb(var(--tertiary))', letterSpacing: '0.1em' }}
    >
      {children}
    </div>
  );
}

function Chevron(): JSX.Element {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
