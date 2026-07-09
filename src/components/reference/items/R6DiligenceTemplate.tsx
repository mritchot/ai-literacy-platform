// R6DiligenceTemplate — body content for the AI Diligence Statement
// Template. Rendered inside `ReferencePanel`. Four numbered scaffold
// sections (one per 4D competency, in canonical order: Delegation,
// Description, Discernment, Diligence), then two example statements
// at different specificity levels (Narrative model + Structured model).
//
// Color palette: Diligence purple-gray throughout. R6 is the portable
// version of P12's scaffold — same prompts, but read-only here. P12
// owns the writing experience; R6 owns the reference.

import type { ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────

const DILIGENCE = '#7A6B80';

// ─────────────────────────────────────────────────────────────────────
// Scaffold data — four numbered sections matching P12's structure
// ─────────────────────────────────────────────────────────────────────

interface ScaffoldSection {
  number: number;
  pillar: string;
  heading: string;
  italic: string;
  questions: string[];
  fillIn: string;
}

const SCAFFOLD_SECTIONS: ScaffoldSection[] = [
  {
    number: 1,
    pillar: 'Delegation',
    heading: 'What was delegated?',
    italic:
      'Which components of the deliverable were AI-generated, AI-assisted, or human-authored?',
    questions: [
      'Which sections or components did AI produce in full?',
      'Which sections did AI draft and you revised?',
      'Which sections did you produce without AI involvement?',
      'What AI tool and model were used?',
    ],
    fillIn:
      '“This [deliverable type] was produced using [tool/model]. The following components were [AI-generated / AI-assisted / human-authored]: [list by section].”',
  },
  {
    number: 2,
    pillar: 'Description',
    heading: 'How was the task specified?',
    italic: 'What constraints, format, or quality standards were included in the prompt?',
    questions: [
      'What product specification was given? (format, audience, length)',
      'What process constraints were set? (framework, data sources)',
      'What performance instructions shaped the output? (tone, voice)',
    ],
    fillIn:
      '“The AI task was specified with the following parameters: [format/audience], using [framework/method], constrained to [data sources/boundaries].”',
  },
  {
    number: 3,
    pillar: 'Discernment',
    heading: 'What was verified?',
    italic:
      'What verification was performed on the AI-generated content? What was found and corrected?',
    questions: [
      'Which factual claims or statistics were independently verified?',
      'What errors were identified and corrected?',
      'Was reasoning traced step by step or only conclusions reviewed?',
    ],
    fillIn:
      '“Verification included [methods]. Claims were checked against [sources]. [Describe corrections, if any].”',
  },
  {
    number: 4,
    pillar: 'Diligence',
    heading: 'What limitations remain?',
    italic: 'What should the reader be aware of?',
    questions: [
      'Are there claims that could not be independently verified?',
      'Are there sections where AI may have introduced subtle bias?',
      'What should the reader verify independently before acting?',
    ],
    fillIn:
      '“The following limitations should be noted: [unverified claims, caveats]. The reader should [specific advisory].”',
  },
];

// ─────────────────────────────────────────────────────────────────────
// Example A — Narrative model (continuous prose)
// ─────────────────────────────────────────────────────────────────────

const EXAMPLE_A_TITLE = 'AI Diligence Statement: Q3 Market Analysis';
const EXAMPLE_A_PARAGRAPHS: string[] = [
  'In developing this market analysis, we collaborated with Claude (Anthropic) to assist with initial data compilation, structural development, and drafting of descriptive sections. The analytical framework, strategic interpretation, competitive positioning recommendations, and executive summary were developed by the human authors, drawing on internal data sources and domain expertise that were not shared with the AI tool.',
  'All AI-generated and co-created content underwent review and revision by the authoring team. The final document reflects the team’s judgment, expertise, and intended recommendations. While AI assistance was instrumental in accelerating the drafting process, the authors maintain full responsibility for the content, its accuracy, and its conclusions.',
  'This disclosure is made in accordance with our team’s AI use practices and to maintain transparency about the role of AI in our analytical work.',
];

// ─────────────────────────────────────────────────────────────────────
// Example B — Structured model (4D-labelled prose)
// ─────────────────────────────────────────────────────────────────────

const EXAMPLE_B_TITLE = 'AI Diligence Statement: Client Onboarding Proposal';
const EXAMPLE_B_BLOCKS: { label: string; body: string }[] = [
  {
    label: 'Delegation',
    body: 'This proposal was produced with AI assistance (Claude, Anthropic). Sections 1–3 (company background, service overview, and timeline) were AI-drafted from source materials we provided and revised by the authoring team. Section 4 (pricing and terms) and Section 5 (team bios and case studies) are entirely human-authored. No proprietary client data was shared with the AI tool.',
  },
  {
    label: 'Description',
    body: 'The AI was directed to produce a formal proposal tone for a C-suite audience, structured around our standard onboarding template, constrained to publicly available company information.',
  },
  {
    label: 'Discernment',
    body: 'All company descriptions, market claims, and competitive references in Sections 1–3 were verified against company filings and our internal research database. Two inaccurate market share characterizations were corrected.',
  },
  {
    label: 'Diligence',
    body: 'Industry growth projections in Section 1 are based on third-party estimates and should be treated as directional, not definitive. The authors take full responsibility for all content and recommendations.',
  },
];

// ─────────────────────────────────────────────────────────────────────
// Top-level component
// ─────────────────────────────────────────────────────────────────────

export function R6DiligenceTemplate(): JSX.Element {
  return (
    <div className="font-sans">
      {/* Intro paragraph */}
      <p
        className="m-0 mb-5 text-body-sm text-body"
        style={{ lineHeight: 1.55 }}
      >
        Append to any deliverable that involved AI assistance. A diligence statement makes your
        AI practices legible. It does not ask for permission. It does not apologize. It states
        what happened. <em>Length scales with stakes.</em>
      </p>

      {/* Section: Statement structure (4 numbered scaffolds) */}
      <StatementStructure />

      {/* Example A — Narrative model */}
      <ExampleACard />

      {/* Example B — Structured model */}
      <ExampleBCard />

      {/* Attribution footer */}
      <p
        className="m-0 mt-6 text-caption text-tertiary"
        style={{ lineHeight: 1.5, fontStyle: 'italic' }}
      >
        Framework: Anthropic 4D AI Fluency Framework, Diligence competency (Dakan, Feller, and
        Anthropic, 2025).
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Statement structure card
// ─────────────────────────────────────────────────────────────────────

function StatementStructure(): JSX.Element {
  return (
    <article
      className="rounded-lg overflow-hidden"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${DILIGENCE}`,
      }}
    >
      <header style={{ padding: '14px 16px 6px' }}>
        <div
          className="font-mono text-overline font-bold uppercase"
          style={{
            color: 'rgb(var(--diligence-text))',
            letterSpacing: '0.1em',
            marginBottom: 4,
          }}
        >
          Statement structure
        </div>
        <p
          className="m-0 font-sans text-body-sm"
          style={{
            color: 'rgb(var(--secondary))',
            lineHeight: 1.5,
            fontStyle: 'italic',
          }}
        >
          Use as a thinking scaffold, then write in continuous prose.
        </p>
      </header>

      <div style={{ borderTop: '1px solid rgb(var(--border-light))' }}>
        {SCAFFOLD_SECTIONS.map((s, i) => (
          <ScaffoldRow key={s.number} section={s} isLast={i === SCAFFOLD_SECTIONS.length - 1} />
        ))}
      </div>
    </article>
  );
}

function ScaffoldRow({
  section,
  isLast,
}: {
  section: ScaffoldSection;
  isLast: boolean;
}): JSX.Element {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : '1px solid rgb(var(--border-light))',
      }}
    >
      {/* Heading row: number + pillar + heading question */}
      <div className="mb-1">
        <span
          className="font-mono text-[11px] font-bold"
          style={{
            color: 'rgb(var(--diligence-text))',
            marginRight: 6,
          }}
        >
          {section.number}.
        </span>
        <span
          className="font-mono text-[11px] font-bold uppercase"
          style={{
            color: 'rgb(var(--diligence-text))',
            letterSpacing: '0.12em',
            marginRight: 8,
          }}
        >
          {section.pillar}
        </span>
        <span className="font-sans text-h4 font-semibold text-ink" style={{ fontSize: 14 }}>
          : {section.heading}
        </span>
      </div>

      {/* Italic prompt that frames the section */}
      <p
        className="m-0 mb-2 font-sans text-body-sm"
        style={{
          color: 'rgb(var(--secondary))',
          lineHeight: 1.45,
          fontStyle: 'italic',
        }}
      >
        {section.italic}
      </p>

      {/* Guiding questions list */}
      <ul
        className="m-0 list-none p-0"
        style={{ marginTop: 6, marginBottom: 10 }}
      >
        {section.questions.map((q) => (
          <li
            key={q}
            className="font-sans text-[12.5px]"
            style={{
              color: 'rgb(var(--ink))',
              lineHeight: 1.5,
              paddingLeft: 14,
              position: 'relative',
              marginBottom: 3,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 4,
                top: 0,
                color: 'rgb(var(--diligence-text))',
              }}
            >
              •
            </span>
            {q}
          </li>
        ))}
      </ul>

      {/* Fill-in starter — distinct treatment with diligence-light bg
          + left accent bar in the diligence brand color. */}
      <FillInBox text={section.fillIn} />
    </div>
  );
}

function FillInBox({ text }: { text: string }): JSX.Element {
  return (
    <div
      className="rounded-md"
      style={{
        background: 'rgb(var(--diligence-light))',
        borderLeft: `3px solid ${DILIGENCE}`,
        padding: '10px 14px',
      }}
    >
      <div
        className="font-mono text-[9px] font-bold uppercase"
        style={{
          color: 'rgb(var(--diligence-text))',
          letterSpacing: '0.1em',
          marginBottom: 4,
        }}
      >
        Fill in
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
// Example A — Narrative model (continuous prose)
// ─────────────────────────────────────────────────────────────────────

function ExampleACard(): JSX.Element {
  return (
    <article
      className="mt-6 rounded-lg overflow-hidden"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${DILIGENCE}`,
      }}
    >
      <ExampleHeader
        label="Example A: Narrative model"
        italic="Default for most deliverables. Describes the collaboration model."
      />

      {/* The example body itself sits inside a slightly tinted region so
          it reads as "an actual statement" rather than reference copy. */}
      <div
        style={{
          background: 'rgb(var(--surface-warm))',
          borderTop: '1px solid rgb(var(--border-light))',
          padding: '16px 18px',
        }}
      >
        <h3
          className="m-0 mb-3 font-sans text-h4 font-semibold text-ink"
          style={{ fontSize: 13.5 }}
        >
          {EXAMPLE_A_TITLE}
        </h3>
        {EXAMPLE_A_PARAGRAPHS.map((para, i) => (
          <p
            key={i}
            className="m-0 font-sans text-[12.5px]"
            style={{
              color: 'rgb(var(--ink))',
              lineHeight: 1.6,
              marginBottom: i < EXAMPLE_A_PARAGRAPHS.length - 1 ? 10 : 0,
            }}
          >
            {para}
          </p>
        ))}
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Example B — Structured model (4D-labelled prose)
// ─────────────────────────────────────────────────────────────────────

function ExampleBCard(): JSX.Element {
  return (
    <article
      className="mt-4 rounded-lg overflow-hidden"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${DILIGENCE}`,
      }}
    >
      <ExampleHeader
        label="Example B: Structured model"
        italic="For higher-stakes deliverables. Adds section-level attribution and verification detail."
      />

      <div
        style={{
          background: 'rgb(var(--surface-warm))',
          borderTop: '1px solid rgb(var(--border-light))',
          padding: '16px 18px',
        }}
      >
        <h3
          className="m-0 mb-3 font-sans text-h4 font-semibold text-ink"
          style={{ fontSize: 13.5 }}
        >
          {EXAMPLE_B_TITLE}
        </h3>
        {EXAMPLE_B_BLOCKS.map((block, i) => (
          <p
            key={block.label}
            className="m-0 font-sans text-[12.5px]"
            style={{
              color: 'rgb(var(--ink))',
              lineHeight: 1.6,
              marginBottom: i < EXAMPLE_B_BLOCKS.length - 1 ? 10 : 0,
            }}
          >
            {/* Bold inline 4D label, in diligence-text so it pops while
                staying within the card's color family. */}
            <strong
              style={{
                color: 'rgb(var(--diligence-text))',
                marginRight: 4,
              }}
            >
              {block.label}:
            </strong>
            {block.body}
          </p>
        ))}
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function ExampleHeader({
  label,
  italic,
}: {
  label: ReactNode;
  italic: ReactNode;
}): JSX.Element {
  return (
    <header style={{ padding: '14px 16px 6px' }}>
      <div
        className="font-mono text-overline font-bold uppercase"
        style={{
          color: 'rgb(var(--diligence-text))',
          letterSpacing: '0.1em',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <p
        className="m-0 font-sans text-body-sm"
        style={{
          color: 'rgb(var(--secondary))',
          lineHeight: 1.45,
          fontStyle: 'italic',
        }}
      >
        {italic}
      </p>
    </header>
  );
}
