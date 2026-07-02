// Action Map — interactive artifact. Ported from the design-phase JSX
// prototype (02c_action-map.jsx, Phase 1 planning corpus) into a typed
// route component that lives inside PlatformShell.
//
// Changes from the prototype, all to fit the platform: the Google-Fonts
// <link> is dropped (the platform self-hosts DM fonts via @fontsource — no
// outbound requests), the full-bleed 100vh wrapper and its own page header
// are replaced by the shared artifact chrome, and the behavior grid uses a
// responsive Tailwind column count. The interactive guts keep their inline
// styles and the prototype's hex palette (which already matches the 4D
// Tailwind tokens). The behavior metadata (gap traces, module traces, the
// center goal) is reconciled to the finalized `04_action-map.md` — where the
// prototype's inline text diverged, the markdown wins — and the citation
// links in the traces are preserved by rendering them through the inline
// markdown renderer. The delivery note, Traceability Summary, Scope notes,
// and Sources are rendered verbatim from that same markdown file.

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import ACTION_MAP_MD from './content/04_action-map.md?raw';
import { renderInline, renderMarkdown } from '../../components/shared/render-markdown';
import { ArtifactFooter, ArtifactTopBar, SeriesEyebrow } from './chrome';

// ─── Types ─────────────────────────────────────────────────────────────

type QuadrantKey = 'delegation' | 'description' | 'discernment' | 'diligence';

interface ColorSet {
  bg: string;
  light: string;
  mid: string;
  text: string;
}

interface Behavior {
  id: string;
  short: string;
  full: string;
  subComp: string;
  gap: string;
  module: string;
  builds: string[];
  refs: string[];
}

interface Activity {
  id: string;
  short: string;
  module: string;
  type: string;
  component: string;
}

interface Reference {
  id: string;
  short: string;
  format: string;
}

// ─── Data ──────────────────────────────────────────────────────────────

const COLORS: Record<QuadrantKey, ColorSet> = {
  delegation: { bg: '#6B7F5E', light: '#E8EDE4', mid: '#B5C4AB', text: '#3D4A35' },
  description: { bg: '#8B7355', light: '#F0EAE0', mid: '#C9B99E', text: '#5A4A37' },
  discernment: { bg: '#5E7080', light: '#E4EBF0', mid: '#A8BCCA', text: '#354A57' },
  diligence: { bg: '#7A6B80', light: '#EDE4F0', mid: '#BEA8C9', text: '#4A3557' },
};

const QUADRANTS: { key: QuadrantKey; label: string; sub: string }[] = [
  { key: 'delegation', label: 'Delegation', sub: 'Setting goals and deciding whether, when, and how to engage with AI' },
  { key: 'description', label: 'Description', sub: 'Effectively describing goals to prompt useful AI behaviors and outputs' },
  { key: 'discernment', label: 'Discernment', sub: 'Accurately assessing the usefulness of AI outputs and behaviors' },
  { key: 'diligence', label: 'Diligence', sub: 'Taking responsibility for what we do with AI and how we do it' },
];

// Behavior `full` text, sub-components, gap traces, and module traces are
// taken verbatim from `04_action-map.md`. Gap/module strings carry markdown
// links so the citations stay clickable when rendered.
const BEHAVIORS: Record<QuadrantKey, Behavior[]> = {
  delegation: [
    {
      id: 'D1',
      short: 'Define task goals and appropriate AI components',
      full: 'Before using AI, the participant defines the task goal, identifies which components require human judgment, and determines which are appropriate for AI assistance.',
      subComp: 'Problem Awareness → Task Delegation',
      gap: `Misreading the augmentation/automation boundary (Persona — 65% self-report vs. 57% behavioral; participants don't recognize when they've shifted from collaboration to full delegation; [Handa et al. 2025, p. 3](https://bear-images.sfo2.cdn.digitaloceanspaces.com/ritchot/04761v1.pdf))`,
      module: `Module 2 (Live Data Dashboard — augmentation vs. automation aggregate data with self-reflection prompts that surface the documented behavioral discrepancy) → Module 4 (AI Interaction Sandbox — structured task decomposition exercises where the participant practices the delegation decision before prompting)`,
      builds: ['P1', 'P3', 'P8'],
      refs: ['R1', 'R2'],
    },
    {
      id: 'D2',
      short: 'Distinguish augmentation from human-only tasks',
      full: 'The participant distinguishes between tasks that benefit from AI augmentation and tasks that should remain human-only, based on stakes, verifiability, and domain expertise requirements.',
      subComp: 'Task Delegation',
      gap: `Underuse through overcaution in high-complexity tasks + overreliance in perceived-routine tasks (Persona — Lee et al. finding that reduced scrutiny is most pronounced in tasks perceived as routine; [Lee et al., CHI 2025, pp. 1–2](https://doi.org/10.1145/3706598.3713778)). *(Note: "Underuse through overcaution" is a design-grounded inference derived from the augmentation/automation behavioral divergence in Handa et al., Feb 2025 — see the persona's footnote 1. No direct survey item on task avoidance behavior is available in the current corpus.)*`,
      module: `Module 2 (task-type productivity data) → Module 4 (sandbox — structured delegation exercises)`,
      builds: ['P3', 'P4', 'P8'],
      refs: ['R1', 'R2'],
    },
    {
      id: 'D3',
      short: 'Identify AI capability boundaries before delegating',
      full: 'The participant identifies the capability boundaries of the AI tool they are using — what it can generate reliably vs. where it is likely to produce errors — before delegating a task.',
      subComp: 'Platform Awareness',
      gap: `Confusing generation with retrieval (Persona — interacting with AI as though it retrieves stored facts rather than generating probabilistic text); WEF adverse outcome risk from stretching AI beyond capability (WEF 2025, p. 11)`,
      module: `Module 3 (next-token prediction demo, tokenizer playground — mechanistic understanding of what the model actually does) → Module 4 (sandbox — testing boundary conditions)`,
      builds: ['P4', 'P5', 'P6', 'P7'],
      refs: ['R5'],
    },
  ],
  description: [
    {
      id: 'D4',
      short: 'Provide context, constraints, and specifications',
      full: 'The participant provides task-relevant context, constraints, and output specifications when prompting AI, rather than issuing single-turn, underspecified requests.',
      subComp: 'Product Description → Process Description',
      gap: `Surface-level engagement producing a fraction of available efficiency ([Tamkin & McCrory, pp. 12–13](https://www.anthropic.com/research/estimating-ai-productivity-gains): 81% median savings under proficient use in observational data, against a more conservative 14–56% range in the referenced randomized controlled trials); directive single-turn interactions constitute a substantial and growing share of AI usage, rising from 27% to 39% of sampled conversations between January and August 2025 ([Anthropic Economic Index, September 2025 report](https://www.anthropic.com/research/anthropic-economic-index-september-2025-report), p. 9), indicating that many users are not iterating or providing contextual specifications.`,
      module: `Module 4 (AI Interaction Sandbox — side-by-side comparison of prompt reformulation → output quality change)`,
      builds: ['P9'],
      refs: ['R3'],
    },
    {
      id: 'D5',
      short: 'Specify format, audience, and quality criteria',
      full: 'The participant specifies the desired format, audience, and quality criteria for AI output before generating it.',
      subComp: 'Product Description',
      gap: `The augmentation/automation behavioral discrepancy (65% self-report augmentative vs. 57% behavioral, Handa et al. 2025, p. 3) suggests that participants who believe they are augmenting but are actually automating are not setting output specifications because they are not planning to review. *(Design-grounded inference from Handa et al. behavioral data; no direct survey item on output specification behavior is available in the current corpus.)*`,
      module: `Module 4 (sandbox — structured prompt exercises with scaffolded product description)`,
      builds: ['P9'],
      refs: ['R3'],
    },
    {
      id: 'D6',
      short: 'Iterate through multi-turn refinement',
      full: 'The participant iterates on AI outputs through multi-turn refinement rather than accepting or discarding first-generation results.',
      subComp: 'Process Description → Performance Description',
      gap: `Lee et al. — overconfidence predicts reduced critical engagement ([Lee et al., CHI 2025, pp. 1–2](https://doi.org/10.1145/3706598.3713778)); behavioral pattern of single-turn accept/reject rather than iterative collaboration (Handa et al. task iteration patterns, Feb 2025)`,
      module: `Module 4 (sandbox — feedback simulator interaction flow; structured roleplay with iterative refinement)`,
      builds: ['P9', 'P11'],
      refs: ['R3'],
    },
  ],
  discernment: [
    {
      id: 'D7',
      short: 'Verify factual claims against independent sources',
      full: 'The participant verifies factual claims, citations, and statistics in AI-generated output against independent sources before incorporating them into business deliverables.',
      subComp: 'Product Discernment',
      gap: `Confusing generation with retrieval (Persona — uncritical acceptance of plausible-sounding but fabricated citations, statistics, regulatory references); Lee et al. overconfidence → reduced scrutiny (Lee et al., CHI 2025, pp. 1–2)`,
      module: `Module 3 (understanding why models confabulate — next-token prediction, not information retrieval) → Module 4 (sequential classification scenario — evaluating AI output with planted errors)`,
      builds: ['P6', 'P10'],
      refs: ['R4'],
    },
    {
      id: 'D8',
      short: 'Recognize hallucination and capability-range failures',
      full: "The participant identifies when an AI-generated output is operating outside the model's reliable capability range — recognizing hallucination indicators, reasoning failures, and confidence without competence.",
      subComp: 'Product Discernment → Process Discernment',
      gap: `WEF — adverse outcomes where users unknowingly stretch technology beyond capability (WEF 2025, p. 11); generation-vs.-retrieval misconception (Persona)`,
      module: `Module 3 (mechanistic understanding — tokenization, attention, probability-based generation, hallucination mechanics) → Module 4 (sandbox — annotation layer where learner tags outputs as reliable/uncertain/fabricated)`,
      builds: ['P5', 'P6', 'P7', 'P10'],
      refs: ['R4', 'R5'],
    },
    {
      id: 'D9',
      short: 'Evaluate reasoning process, not just final output',
      full: "The participant evaluates whether the AI's reasoning process — not just the final output — is sound, checking for logical gaps, unsupported assumptions, and circular reasoning.",
      subComp: 'Process Discernment',
      gap: `Lee et al. — scrutiny reduction is most pronounced in routine tasks, meaning process evaluation is the first thing dropped (Lee et al., CHI 2025, pp. 1–2); Handa et al. — validation is the smallest behavioral category at 2.8% of all interactions (Handa et al., Feb 2025, p. 10)`,
      module: `Module 4 (sequential classification scenario — consequence-based feedback when process evaluation is skipped)`,
      builds: ['P7', 'P10', 'P11'],
      refs: ['R4'],
    },
  ],
  diligence: [
    {
      id: 'D10',
      short: "Document AI's role in deliverables",
      full: 'The participant documents the role AI played in producing a deliverable, including which components were AI-generated, AI-assisted, or human-authored.',
      subComp: 'Transparency Diligence',
      gap: `69% social stigma / concealment dynamic (Anthropic Interviewer, Dec 2025 — workers using AI, observing gains, and concealing both from colleagues and managers)`,
      module: `Module 1 (stigma data in interactive data narratives — normalizing disclosure) → Module 4 (sandbox — practicing AI diligence statements)`,
      builds: ['P1', 'P2', 'P12'],
      refs: ['R1', 'R6'],
    },
    {
      id: 'D11',
      short: 'Full accountability before sharing AI-assisted output',
      full: 'The participant takes full accountability for the accuracy and appropriateness of any AI-assisted output before it is shared, submitted, or published — treating AI-generated content with the same review standard as work produced by a junior colleague.',
      subComp: 'Deployment Diligence',
      gap: `Overconfidence as scrutiny suppressant (Lee et al., CHI 2025, pp. 1–2); the augmentation/automation behavioral discrepancy (Handa et al. 2025, p. 3) means participants are deploying outputs they believe they reviewed but did not`,
      module: `Module 4 (sequential classification scenario — consequences of deploying unverified AI output in a workplace context)`,
      builds: ['P10', 'P12'],
      refs: ['R4', 'R6'],
    },
    {
      id: 'D12',
      short: 'Discuss AI practices openly using 4D vocabulary',
      full: 'The participant discusses their AI usage practices openly with colleagues and managers, using the 4D competency vocabulary to describe how they delegate, prompt, evaluate, and verify.',
      subComp: 'Transparency Diligence (extended to organizational behavior change)',
      gap: `69% concealment dynamic (Anthropic Interviewer, Dec 2025); the Executive Problem Statement's argument that individual competency without social normalization produces no measurable business outcome`,
      module: `Module 1 (stigma data, normalization framing) → Module 2 (peer usage patterns — making invisible practices visible) → Module 4 (reflection prompts using 4D vocabulary)`,
      builds: ['P2', 'P12'],
      refs: ['R1', 'R6', 'R7'],
    },
  ],
};

const ACTIVITIES: Activity[] = [
  { id: 'P1', short: 'Interactive Data Narrative', module: 'Module 1', type: 'Guided data exploration', component: '4C / 5B' },
  { id: 'P2', short: 'Stigma Data Reflection', module: 'Module 1', type: 'Reflective prompt (private)', component: '4C / 5B' },
  { id: 'P3', short: 'Dashboard: Augmentation vs. Automation', module: 'Module 2', type: 'Filterable dashboard', component: '4A / 5B' },
  { id: 'P4', short: 'Dashboard: Productivity Distributions', module: 'Module 2', type: 'Filterable dashboard', component: '4A / 5B' },
  { id: 'P5', short: 'Tokenizer Playground', module: 'Module 3', type: 'Input-output sandbox', component: '4C / 5A' },
  { id: 'P6', short: 'Next-Token Prediction Demo', module: 'Module 3', type: 'Parameter-adjustment interactive', component: '4C / 5A' },
  { id: 'P7', short: 'Context Window Scenario', module: 'Module 3', type: 'Simulated failure scenario', component: '4C / 5A' },
  { id: 'P8', short: 'Task Decomposition Exercise', module: 'Module 4', type: 'Categorization with consequences', component: '4B / 5A' },
  { id: 'P9', short: 'Prompt Reformulation Comparison', module: 'Module 4', type: 'Before/after workshop', component: '4B / 5A' },
  { id: 'P10', short: 'Output Verification Scenario', module: 'Module 4', type: 'Sequential element classification', component: '4B / 5A' },
  { id: 'P11', short: 'Iterative Refinement Exercise', module: 'Module 4', type: 'Multi-turn guided interaction', component: '4B / 5A' },
  { id: 'P12', short: 'Diligence Statement Practice', module: 'Module 4', type: 'Constructed response', component: '4B / 5A' },
];

const REFERENCES: Reference[] = [
  { id: 'R1', short: '4D Competency Quick-Reference Card', format: 'PDF / in-platform panel' },
  { id: 'R2', short: 'Task Delegation Decision Guide', format: 'One-pager / interactive checklist' },
  { id: 'R3', short: 'Prompt Structure Template', format: 'Downloadable template' },
  { id: 'R4', short: 'Output Verification Checklist', format: 'One-pager / in-platform panel' },
  { id: 'R5', short: 'AI Capability Boundary Reference', format: 'Reference panel from Module 3' },
  { id: 'R6', short: 'AI Diligence Statement Template', format: 'Downloadable template (Word/Doc)' },
  { id: 'R7', short: 'Organizational AI Use Policy Starter', format: 'Downloadable template' },
];

const GOAL_TEXT = `Within 90 days of program completion, participants consistently select appropriate tasks for AI use, apply structured evaluation to AI-generated outputs before incorporation into business deliverables, and use a shared competency vocabulary to make their AI practices visible to colleagues and managers — resulting in measurable gains in productive AI utilization and reductions in unverified AI output across participating teams.`;

const GOAL_NOTE = `Specific performance targets (e.g., percentage reduction in unverified outputs, increase in task range) are calibrated to organizational baselines during deployment. The directional commitment is fixed; the threshold is context-dependent.`;

// ─── Prose sections sliced from the finalized markdown ─────────────────

const AM_SECTIONS: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  for (const part of ACTION_MAP_MD.replace(/\r\n/g, '\n').split(/\n## /)) {
    const nl = part.indexOf('\n');
    const head = (nl === -1 ? part : part.slice(0, nl)).trim();
    out[head] = nl === -1 ? '' : part.slice(nl + 1).trim();
  }
  return out;
})();

function stripTrailingRule(s: string): string {
  return s.replace(/\n*-{3,}\s*$/, '').trim();
}

// Intro = the framing line + the dual-platform delivery note (the blockquote
// under the document subtitle). Traceability / Scope / Sources are their own
// H2 sections.
const INTRO_MD = stripTrailingRule(AM_SECTIONS['AI Literacy for the Modern Workforce'] ?? '');
const TRACEABILITY_MD = stripTrailingRule(AM_SECTIONS['Traceability Summary'] ?? '');
const SCOPE_MD = stripTrailingRule(AM_SECTIONS['Scope and Feasibility Notes'] ?? '');
const SOURCES_MD = stripTrailingRule(AM_SECTIONS['Sources'] ?? '');

// ─── Interactive pieces ────────────────────────────────────────────────

function Pill({
  label,
  color,
  active,
  onClick,
  small,
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
  small?: boolean;
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      style={{
        padding: small ? '3px 10px' : '5px 14px',
        borderRadius: 20,
        border: `1.5px solid ${color}`,
        background: active ? color : 'transparent',
        color: active ? '#fff' : color,
        fontSize: small ? 11 : 12,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function Tag({ label, color }: { label: string; color: string }): JSX.Element {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        background: color + '22',
        color,
        fontSize: 10,
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '0.03em',
      }}
    >
      {label}
    </span>
  );
}

function MetaBlock({ label, color, children }: { label: string; color: string; children: ReactNode }): JSX.Element {
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 12, color: '#555' }}>{children}</div>
    </div>
  );
}

function BehaviorCard({
  b,
  quadrant,
  isActive,
  onClick,
  isHighlighted,
  showMeta,
}: {
  b: Behavior;
  quadrant: QuadrantKey;
  isActive: boolean;
  onClick: () => void;
  isHighlighted: boolean | null;
  showMeta: boolean;
}): JSX.Element {
  const c = COLORS[quadrant];
  return (
    <div
      onClick={onClick}
      style={{
        padding: isActive ? '16px 18px' : '10px 14px',
        borderRadius: 10,
        background: isActive ? '#fff' : isHighlighted ? c.light : '#FAFAF7',
        border: `1.5px solid ${isActive ? c.bg : isHighlighted ? c.mid : '#E8E6E1'}`,
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: isActive ? `0 4px 20px ${c.bg}25` : 'none',
        opacity: isHighlighted === false ? 0.4 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 28,
            height: 20,
            borderRadius: 4,
            background: c.bg,
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: '0.05em',
          }}
        >
          {b.id}
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#2D2D2D',
            lineHeight: 1.4,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {b.short}
        </span>
      </div>
      {isActive && (
        <div style={{ marginTop: 14, fontSize: 12.5, lineHeight: 1.6, color: '#4A4A4A', fontFamily: "'DM Sans', sans-serif" }}>
          <p style={{ margin: '0 0 12px', fontStyle: 'italic', color: '#666', fontSize: 12 }}>{b.full}</p>
          {showMeta && (
            <>
              <MetaBlock label="Sub-component" color={c.bg}>
                {b.subComp}
              </MetaBlock>
              <MetaBlock label="Gap Trace" color={c.bg}>
                {renderInline(b.gap, `${b.id}-gap`)}
              </MetaBlock>
              <MetaBlock label="Module Trace" color={c.bg}>
                {renderInline(b.module, `${b.id}-mod`)}
              </MetaBlock>
            </>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
            {b.builds.map((p) => (
              <Tag key={p} label={p} color="#5E7080" />
            ))}
            {b.refs.map((r) => (
              <Tag key={r} label={r} color="#7A6B80" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InteractiveMap(): JSX.Element {
  const [activeQuadrant, setActiveQuadrant] = useState<QuadrantKey | null>(null);
  const [activeBehavior, setActiveBehavior] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showMeta, setShowMeta] = useState(false);
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);
  const [hoveredRef, setHoveredRef] = useState<string | null>(null);

  const highlightedBehaviors = useMemo<Set<string> | null>(() => {
    if (hoveredActivity) {
      const set = new Set<string>();
      Object.values(BEHAVIORS)
        .flat()
        .forEach((b) => {
          if (b.builds.includes(hoveredActivity)) set.add(b.id);
        });
      return set;
    }
    if (hoveredRef) {
      const set = new Set<string>();
      Object.values(BEHAVIORS)
        .flat()
        .forEach((b) => {
          if (b.refs.includes(hoveredRef)) set.add(b.id);
        });
      return set;
    }
    return null;
  }, [hoveredActivity, hoveredRef]);

  const highlightedActivities = useMemo<Set<string> | null>(() => {
    if (!activeBehavior) return null;
    const b = Object.values(BEHAVIORS)
      .flat()
      .find((x) => x.id === activeBehavior);
    return b ? new Set(b.builds) : null;
  }, [activeBehavior]);

  const highlightedRefs = useMemo<Set<string> | null>(() => {
    if (!activeBehavior) return null;
    const b = Object.values(BEHAVIORS)
      .flat()
      .find((x) => x.id === activeBehavior);
    return b ? new Set(b.refs) : null;
  }, [activeBehavior]);

  const visibleQuadrants = activeQuadrant ? [activeQuadrant] : QUADRANTS.map((q) => q.key);
  const filteredActivities = useMemo<Activity[]>(() => {
    if (!activeQuadrant) return ACTIVITIES;
    const behaviorIds = BEHAVIORS[activeQuadrant].flatMap((b) => b.builds);
    return ACTIVITIES.filter((a) => behaviorIds.includes(a.id));
  }, [activeQuadrant]);
  const filteredRefs = useMemo<Reference[]>(() => {
    if (!activeQuadrant) return REFERENCES;
    const refIds = BEHAVIORS[activeQuadrant].flatMap((b) => b.refs);
    return REFERENCES.filter((r) => refIds.includes(r.id));
  }, [activeQuadrant]);

  const handleQuadrantClick = useCallback((key: QuadrantKey) => {
    setActiveQuadrant((prev) => (prev === key ? null : key));
    setActiveBehavior(null);
  }, []);

  const handleBehaviorClick = useCallback((id: string) => {
    setActiveBehavior((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div
      className="my-7 overflow-hidden rounded-xl"
      style={{ background: '#F8F6F2', border: '1px solid #E0DDD7', color: '#2D2D2D', fontFamily: "'DM Sans', sans-serif" }}
    >
      <div style={{ padding: '24px 22px 32px' }}>
        {/* Controls */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 10,
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: '1px solid #E8E6E1',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#999',
              marginRight: 4,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Filter
          </span>
          {QUADRANTS.map((q) => (
            <Pill
              key={q.key}
              label={q.label}
              color={COLORS[q.key].bg}
              active={activeQuadrant === q.key}
              onClick={() => handleQuadrantClick(q.key)}
            />
          ))}
          <div style={{ flex: 1, minWidth: 12 }} />
          <Pill
            label={showMeta ? 'Hide Metadata' : 'Show Metadata'}
            color="#777"
            active={showMeta}
            onClick={() => setShowMeta(!showMeta)}
            small
          />
          <Pill
            label={showAll ? 'Collapse' : 'Show All'}
            color="#666"
            active={showAll}
            onClick={() => {
              setShowAll(!showAll);
              if (!showAll) setActiveBehavior(null);
            }}
            small
          />
        </div>

        {/* Center Goal */}
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            padding: '24px 26px',
            border: '2px solid #6B7F5E',
            marginBottom: 28,
            boxShadow: '0 2px 12px rgba(107,127,94,0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${COLORS.delegation.bg}, ${COLORS.description.bg}, ${COLORS.discernment.bg}, ${COLORS.diligence.bg})`,
            }}
          />
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#6B7F5E',
              marginBottom: 10,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Center — Measurable Business Goal
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0, color: '#3A3A3A' }}>{GOAL_TEXT}</p>
          <p style={{ fontSize: 11, color: '#888', margin: '10px 0 0', fontStyle: 'italic', lineHeight: 1.5 }}>{GOAL_NOTE}</p>
        </div>

        {/* Ring Labels */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Ring 1 — Observable Behaviors', color: '#6B7F5E' },
            { label: 'Ring 2 — Practice Activities', color: '#5E7080' },
            { label: 'Ring 3 — Reference Information', color: '#7A6B80' },
          ].map((r) => (
            <div
              key={r.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                fontWeight: 600,
                color: r.color,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: '0.04em',
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 3, background: r.color }} />
              {r.label}
            </div>
          ))}
        </div>

        {/* Main Grid: Behaviors */}
        <div
          className={activeQuadrant ? 'grid grid-cols-1' : 'grid grid-cols-1 sm:grid-cols-2'}
          style={{ gap: 20, marginBottom: 28 }}
        >
          {QUADRANTS.filter((q) => visibleQuadrants.includes(q.key)).map((q) => {
            const c = COLORS[q.key];
            const behaviors = BEHAVIORS[q.key];
            return (
              <div
                key={q.key}
                style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: `1.5px solid ${activeQuadrant === q.key ? c.bg : '#E0DDD7'}`,
                  background: '#fff',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Quadrant Header */}
                <div
                  onClick={() => handleQuadrantClick(q.key)}
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    background: activeQuadrant === q.key ? c.bg : c.light,
                    borderBottom: `1px solid ${activeQuadrant === q.key ? c.bg : c.mid}`,
                    transition: 'all 0.25s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 16,
                          fontWeight: 700,
                          color: activeQuadrant === q.key ? '#fff' : c.text,
                          fontFamily: "'DM Serif Display', serif",
                        }}
                      >
                        {q.label}
                      </h3>
                      <p
                        style={{
                          margin: '4px 0 0',
                          fontSize: 11.5,
                          lineHeight: 1.4,
                          color: activeQuadrant === q.key ? 'rgba(255,255,255,0.8)' : c.text + 'AA',
                          maxWidth: 400,
                        }}
                      >
                        {q.sub}
                      </p>
                    </div>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: activeQuadrant === q.key ? 'rgba(255,255,255,0.2)' : c.bg + '15',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 700,
                        color: activeQuadrant === q.key ? '#fff' : c.bg,
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {behaviors.length}
                    </div>
                  </div>
                </div>

                {/* Behaviors List */}
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {behaviors.map((b) => (
                    <BehaviorCard
                      key={b.id}
                      b={b}
                      quadrant={q.key}
                      isActive={activeBehavior === b.id || showAll}
                      onClick={() => handleBehaviorClick(b.id)}
                      isHighlighted={highlightedBehaviors ? highlightedBehaviors.has(b.id) : null}
                      showMeta={showMeta}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ring 2: Practice Activities */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', border: '1.5px solid #C8D5DE', marginBottom: 20 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#5E7080',
              marginBottom: 14,
              fontFamily: "'DM Mono', monospace",
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 3, background: '#5E7080' }} />
            Ring 2 — Practice Activities ({filteredActivities.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {filteredActivities.map((a) => {
              const isHL = highlightedActivities ? highlightedActivities.has(a.id) : null;
              return (
                <div
                  key={a.id}
                  onMouseEnter={() => setHoveredActivity(a.id)}
                  onMouseLeave={() => setHoveredActivity(null)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: isHL === true ? '#E4EBF0' : isHL === false ? '#FAFAF7' : hoveredActivity === a.id ? '#EEF2F5' : '#FAFAF7',
                    border: `1px solid ${isHL === true ? '#5E7080' : '#E8E6E1'}`,
                    opacity: isHL === false ? 0.35 : 1,
                    transition: 'all 0.2s ease',
                    cursor: 'default',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#5E7080', fontFamily: "'DM Mono', monospace", minWidth: 24 }}>{a.id}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#2D2D2D' }}>{a.short}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10.5, color: '#888' }}>{a.module}</span>
                    <span style={{ fontSize: 10.5, color: '#AAA' }}>•</span>
                    <span style={{ fontSize: 10.5, color: '#888' }}>{a.component}</span>
                  </div>
                  {(showAll || showMeta) && <div style={{ fontSize: 10.5, color: '#999', marginTop: 4, fontStyle: 'italic' }}>{a.type}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ring 3: Reference Information */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', border: '1.5px solid #D1C4D9' }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#7A6B80',
              marginBottom: 14,
              fontFamily: "'DM Mono', monospace",
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 3, background: '#7A6B80' }} />
            Ring 3 — Reference Information ({filteredRefs.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {filteredRefs.map((r) => {
              const isHL = highlightedRefs ? highlightedRefs.has(r.id) : null;
              return (
                <div
                  key={r.id}
                  onMouseEnter={() => setHoveredRef(r.id)}
                  onMouseLeave={() => setHoveredRef(null)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: isHL === true ? '#EDE4F0' : isHL === false ? '#FAFAF7' : hoveredRef === r.id ? '#F0EAF3' : '#FAFAF7',
                    border: `1px solid ${isHL === true ? '#7A6B80' : '#E8E6E1'}`,
                    opacity: isHL === false ? 0.35 : 1,
                    transition: 'all 0.2s ease',
                    cursor: 'default',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#7A6B80', fontFamily: "'DM Mono', monospace", minWidth: 20 }}>{r.id}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#2D2D2D' }}>{r.short}</span>
                  </div>
                  {(showAll || showMeta) && <div style={{ fontSize: 10.5, color: '#999', fontStyle: 'italic' }}>{r.format}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            marginTop: 28,
            padding: '16px 20px',
            borderRadius: 10,
            background: '#FAF8F5',
            border: '1px solid #E8E6E1',
            fontSize: 11.5,
            color: '#888',
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: '#666' }}>Interactions:</strong> Click a <strong style={{ color: '#6B7F5E' }}>competency header</strong> to filter
          by dimension. Click a <strong style={{ color: '#6B7F5E' }}>behavior card</strong> to expand details and highlight linked activities and
          references. Hover over a <strong style={{ color: '#5E7080' }}>practice activity</strong> or <strong style={{ color: '#7A6B80' }}>reference item</strong>{' '}
          to see which behaviors it supports. Toggle <em>Show Metadata</em> for gap traces, module traces, and sub-component alignment. Toggle{' '}
          <em>Show All</em> to expand every element simultaneously.
        </div>
      </div>
    </div>
  );
}

// ─── Prose section wrapper ─────────────────────────────────────────────

function ProseSection({ heading, body }: { heading: string; body: string }): JSX.Element | null {
  if (!body) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-3 font-sans text-h2 font-semibold text-ink">{heading}</h2>
      <div className="max-w-reading">{renderMarkdown(body)}</div>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────

export default function ActionMap(): JSX.Element {
  return (
    <div className="mx-auto max-w-interactive px-4 py-12 sm:px-8 lg:px-16 lg:py-14">
      <ArtifactTopBar pdfSlug="action-map" />
      <SeriesEyebrow label="Needs Analysis · Interactive" />

      <h1 className="m-0 mb-2 font-display text-display font-normal text-ink">Action Map</h1>
      <p className="m-0 mb-6 font-sans text-h3 font-normal text-secondary">
        AI Literacy for the Modern Workforce
      </p>

      {/* Framing line + dual-platform delivery note, verbatim from the md. */}
      <div className="max-w-reading">{renderMarkdown(INTRO_MD)}</div>

      <InteractiveMap />

      <ProseSection heading="Traceability Summary" body={TRACEABILITY_MD} />
      <ProseSection heading="Scope and Feasibility Notes" body={SCOPE_MD} />
      <ProseSection heading="Sources" body={SOURCES_MD} />

      <ArtifactFooter currentSlug="action-map" />
    </div>
  );
}
