// Static content tables for the Action Map artifact, split out of
// ActionMap.tsx (which keeps the page shell/prose; the interactive map
// lives in action-map-interactive.tsx).
//
// Behavior `full` text, sub-components, gap traces, and module traces are
// taken verbatim from `04_action-map.md` — where the design-phase
// prototype's inline text diverged, the markdown wins. Gap/module strings
// carry markdown links so the citations stay clickable when rendered
// through the inline markdown renderer.

// ─── Types ─────────────────────────────────────────────────────────────

export type QuadrantKey = 'delegation' | 'description' | 'discernment' | 'diligence';

export interface ColorSet {
  bg: string;
  light: string;
  mid: string;
  text: string;
  textSub: string;
}

export interface Behavior {
  id: string;
  short: string;
  full: string;
  subComp: string;
  gap: string;
  module: string;
  builds: string[];
  refs: string[];
}

export interface Activity {
  id: string;
  short: string;
  module: string;
  type: string;
  component: string;
}

export interface Reference {
  id: string;
  short: string;
  format: string;
}

// ─── Data ──────────────────────────────────────────────────────────────

// `bg` and `mid` are the 4D competency accent hexes — brand colors used
// identically in light and dark themes across the platform. They stay
// literal both because accent identity is theme-invariant and because they
// feed hex-alpha compositing (`c.bg + '15'`, `${c.bg}25`), which requires
// raw hex strings. `light` / `text` resolve through the theme-aware
// competency tokens in src/styles/index.css — their light-mode values are
// identical to the original prototype hexes (#E8EDE4 / #3D4A35 etc.), and
// the `.dark` overrides let the map follow dark mode. `textSub` replaces
// the prototype's `c.text + 'AA'` hex-alpha trick (0xAA ≈ 67% alpha),
// which can't be appended to a `rgb(var(...))` expression.
export const COLORS: Record<QuadrantKey, ColorSet> = {
  delegation: {
    bg: '#6B7F5E',
    light: 'rgb(var(--delegation-light))',
    mid: '#B5C4AB',
    text: 'rgb(var(--delegation-text))',
    textSub: 'rgb(var(--delegation-text) / 0.67)',
  },
  description: {
    bg: '#8B7355',
    light: 'rgb(var(--description-light))',
    mid: '#C9B99E',
    text: 'rgb(var(--description-text))',
    textSub: 'rgb(var(--description-text) / 0.67)',
  },
  discernment: {
    bg: '#5E7080',
    light: 'rgb(var(--discernment-light))',
    mid: '#A8BCCA',
    text: 'rgb(var(--discernment-text))',
    textSub: 'rgb(var(--discernment-text) / 0.67)',
  },
  diligence: {
    bg: '#7A6B80',
    light: 'rgb(var(--diligence-light))',
    mid: '#BEA8C9',
    text: 'rgb(var(--diligence-text))',
    textSub: 'rgb(var(--diligence-text) / 0.67)',
  },
};

export const QUADRANTS: { key: QuadrantKey; label: string; sub: string }[] = [
  { key: 'delegation', label: 'Delegation', sub: 'Setting goals and deciding whether, when, and how to engage with AI' },
  { key: 'description', label: 'Description', sub: 'Effectively describing goals to prompt useful AI behaviors and outputs' },
  { key: 'discernment', label: 'Discernment', sub: 'Accurately assessing the usefulness of AI outputs and behaviors' },
  { key: 'diligence', label: 'Diligence', sub: 'Taking responsibility for what we do with AI and how we do it' },
];

export const BEHAVIORS: Record<QuadrantKey, Behavior[]> = {
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
      gap: `Surface-level engagement producing a fraction of available efficiency ([Tamkin & McCrory, pp. 12–13](https://www.anthropic.com/research/estimating-productivity-gains): 81% median savings under proficient use in observational data, against a more conservative 14–56% range in the referenced randomized controlled trials); directive single-turn interactions constitute a substantial and growing share of AI usage, rising from 27% to 39% of sampled conversations between January and August 2025 ([Anthropic Economic Index, September 2025 report](https://www.anthropic.com/research/anthropic-economic-index-september-2025-report), p. 9), indicating that many users are not iterating or providing contextual specifications.`,
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

export const ACTIVITIES: Activity[] = [
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

export const REFERENCES: Reference[] = [
  { id: 'R1', short: '4D Competency Quick-Reference Card', format: 'PDF / in-platform panel' },
  { id: 'R2', short: 'Task Delegation Decision Guide', format: 'One-pager / interactive checklist' },
  { id: 'R3', short: 'Prompt Structure Template', format: 'Downloadable template' },
  { id: 'R4', short: 'Output Verification Checklist', format: 'One-pager / in-platform panel' },
  { id: 'R5', short: 'AI Capability Boundary Reference', format: 'Reference panel from Module 3' },
  { id: 'R6', short: 'AI Diligence Statement Template', format: 'Downloadable template (Word/Doc)' },
  { id: 'R7', short: 'Organizational AI Use Policy Starter', format: 'Downloadable template' },
];

export const GOAL_TEXT = `Within 90 days of program completion, participants consistently select appropriate tasks for AI use, apply structured evaluation to AI-generated outputs before incorporation into business deliverables, and use a shared competency vocabulary to make their AI practices visible to colleagues and managers — resulting in measurable gains in productive AI utilization and reductions in unverified AI output across participating teams.`;

export const GOAL_NOTE = `Specific performance targets (e.g., percentage reduction in unverified outputs, increase in task range) are calibrated to organizational baselines during deployment. The directional commitment is fixed; the threshold is context-dependent.`;
