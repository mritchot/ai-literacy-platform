// Learning-architecture diagram data — modules, performance objectives,
// practice activities, dual-platform mappings, the Kirkpatrick evaluation
// lane, and the three-tier assessment architecture.
//
// Source: Phase 2 "Visual Learning Architecture" prototype
// (planning corpus, outside the repo). Ported
// verbatim except module durations, which are read from src/data/program.ts
// (the single source of truth) rather than hardcoded — the two already agree
// (M1/M2 15–20, M3 20–30, M4 30–40 min), so this only prevents future drift.

import { MODULES as PROGRAM_MODULES, type CompetencyKey } from '../../data/program';

export type { CompetencyKey } from '../../data/program';

// ─── 4D competency palette (design system §1.1) ────────────────────────
// Mirrors the tokens in tailwind.config.js / CompetencyDot. `bg` resolves
// through the competency token so it follows the theme — the accents now
// carry distinct light and dark values. `light` / `mid` / `text` are the
// light-mode tint values, kept for reference; nothing reads them (the
// shared CompetencyDot owns those surfaces).
export const COMPETENCY_HEX: Record<CompetencyKey, { bg: string; light: string; mid: string; text: string }> = {
  delegation: { bg: 'rgb(var(--delegation))', light: '#E8EDE4', mid: '#B5C4AB', text: '#3D4A35' },
  description: { bg: 'rgb(var(--description))', light: '#F0EAE0', mid: '#C9B99E', text: '#5A4A37' },
  discernment: { bg: 'rgb(var(--discernment))', light: '#E4EBF0', mid: '#A8BCCA', text: '#354A57' },
  diligence: { bg: 'rgb(var(--diligence))', light: '#EDE4F0', mid: '#BEA8C9', text: '#4A3557' },
};

// ─── Dual-platform identity (design system §1.2) ───────────────────────
// The two delivery platforms shown side by side in each module card. Only
// the identity `color` is kept (used as a thin stripe + dot); card surfaces
// use neutral tokens so the split renders correctly in dark mode.
export interface PlatformIdentity {
  color: string;
  label: string;
  component: string;
  /** Legend description of the platform's role. */
  legend: string;
}

export const PLATFORMS: Record<'custom' | 'articulate', PlatformIdentity> = {
  custom: {
    color: 'rgb(var(--discernment))',
    label: 'Custom Platform',
    component: 'Component 4',
    legend:
      'React-based learning environment. Interactive dashboards, tokenizer playground, AI interaction sandbox, learning analytics. Primary technical differentiator.',
  },
  articulate: {
    color: 'rgb(var(--description))',
    label: 'Articulate Platform',
    component: 'Component 5',
    legend:
      'Rise 360 + Storyline. Responsive scroll-based content, branching scenarios with consequence-based feedback, SCORM/xAPI assessments. Ecosystem fluency proof.',
  },
};

// ─── Module data ───────────────────────────────────────────────────────

export interface ArchActivity {
  id: string;
  short: string;
  type: string;
}

export interface ArchObjective {
  id: string;
  short: string;
  dims: CompetencyKey[];
  assessment: string;
  tier: 1 | 2 | 3;
  /** True when the objective produces an artifact tracked at Kirkpatrick L3. */
  feedsL3?: boolean;
}

export interface ArchPlatformCell {
  component: string;
  label: string;
  desc: string;
}

export interface ArchModule {
  id: 1 | 2 | 3 | 4;
  title: string;
  focus: string;
  /** CEMA sequence label (Context / Evidence / Mechanism / Application). */
  sequence: string;
  duration: string;
  emphasis: CompetencyKey[];
  custom: ArchPlatformCell;
  articulate: ArchPlatformCell;
  activities: ArchActivity[];
  objectives: ArchObjective[];
}

/** Module duration from program.ts (source of truth), by module id. */
function durationOf(id: number): string {
  return PROGRAM_MODULES.find((m) => m.id === id)?.duration ?? '';
}

export const ARCH_MODULES: ArchModule[] = [
  {
    id: 1,
    title: 'Why AI Literacy Matters Now',
    focus: 'Strategic context, market forces, labor market transformation',
    sequence: 'Context',
    duration: durationOf(1),
    emphasis: ['delegation', 'diligence'],
    custom: {
      component: '4C',
      label: 'Interactive Explorations',
      desc: 'Interactive data narratives: scrollable data stories combining WEF and Anthropic findings with embedded reflection prompts',
    },
    articulate: {
      component: '5B',
      label: 'Rise 360',
      desc: 'Responsive scroll-based content with embedded interactions and scenario-based knowledge checks',
    },
    activities: [
      { id: 'P1', short: 'Interactive Data Narrative', type: 'Guided data exploration' },
      { id: 'P2', short: 'Stigma Data Reflection', type: 'Reflective prompt (private)' },
    ],
    objectives: [
      { id: '1.1', short: 'Interpret adoption data; identify implications for own role', dims: ['delegation'], assessment: 'Knowledge check', tier: 1 },
      { id: '1.2', short: 'Articulate business case using three quantified findings', dims: ['delegation'], assessment: 'Knowledge check', tier: 1 },
      { id: '1.3', short: 'Explain 69% concealment dynamic and shared vocabulary solution', dims: ['diligence'], assessment: 'Knowledge check', tier: 1 },
      { id: '1.4', short: 'Locate own usage on augmentation-automation spectrum', dims: ['delegation'], assessment: 'Practice activity (P1)', tier: 2 },
    ],
  },
  {
    id: 2,
    title: 'How AI Is Actually Being Used at Work',
    focus: 'Real usage patterns, productivity data, behavioral reality vs. hype',
    sequence: 'Evidence',
    duration: durationOf(2),
    emphasis: ['delegation', 'discernment'],
    custom: {
      component: '4A',
      label: 'Live Data Dashboard',
      desc: 'Filterable dashboard covering augmentation/automation split, occupation-level adoption data, collaboration patterns, productivity distributions, and guided reflection prompts',
    },
    articulate: {
      component: '5B',
      label: 'Rise 360',
      desc: 'Responsive scroll-based content with embedded data visualizations and scenario-based knowledge checks',
    },
    activities: [
      { id: 'P3', short: 'Dashboard: Augmentation vs. Automation', type: 'Filterable dashboard' },
      { id: 'P4', short: 'Dashboard: Productivity Distributions', type: 'Filterable dashboard' },
    ],
    objectives: [
      { id: '2.1', short: 'Distinguish augmentation from automation against behavioral data', dims: ['delegation'], assessment: 'Practice activity (P3)', tier: 2 },
      { id: '2.2', short: 'Analyze task-level productivity data for high-gain vs. high-risk', dims: ['delegation', 'discernment'], assessment: 'Knowledge check', tier: 1 },
      { id: '2.3', short: 'Identify one task to add AI, one to increase oversight', dims: ['delegation', 'discernment'], assessment: 'Practice activity (P4) → Level 3', tier: 2, feedsL3: true },
      { id: '2.4', short: 'Describe self-report/behavioral divergence and directive patterns', dims: ['delegation'], assessment: 'Knowledge check', tier: 1 },
    ],
  },
  {
    id: 3,
    title: 'Understanding How Language Models Work',
    focus: 'Tokenization, attention, probability-based generation, hallucination mechanics',
    sequence: 'Mechanism',
    duration: durationOf(3),
    emphasis: ['description', 'discernment'],
    custom: {
      component: '4C',
      label: 'Interactive Explorations',
      desc: 'Tokenizer playground, next-token prediction demonstration with parameter adjustment, context window visualization',
    },
    articulate: {
      component: '5A',
      label: 'Storyline Branching',
      desc: 'Decision simulator scenarios with consequence-based feedback on model behavior interpretation',
    },
    activities: [
      { id: 'P5', short: 'Tokenizer Playground', type: 'Input-output sandbox' },
      { id: 'P6', short: 'Next-Token Prediction Demo', type: 'Parameter-adjustment interactive' },
      { id: 'P7', short: 'Context Window Scenario', type: 'Simulated failure scenario' },
    ],
    objectives: [
      { id: '3.1', short: 'Explain tokenization; predict unexpected results; describe systematic errors', dims: ['delegation', 'discernment'], assessment: 'Practice (P5) + Competency', tier: 3 },
      { id: '3.2', short: 'Describe next-token prediction vs. retrieval; explain fluent fabrication', dims: ['delegation', 'discernment'], assessment: 'Practice (P6) + Competency', tier: 3 },
      { id: '3.3', short: 'Identify three systematically unreliable task categories', dims: ['delegation', 'discernment'], assessment: 'Knowledge check + Competency', tier: 3 },
      { id: '3.4', short: 'Determine whether output is within reliable capability range', dims: ['discernment'], assessment: 'Practice (P5–P7) + Competency', tier: 3 },
    ],
  },
  {
    id: 4,
    title: 'Evaluating AI Outputs and Working Responsibly',
    focus: 'Applied judgment, output verification, responsible delegation',
    sequence: 'Application',
    duration: durationOf(4),
    emphasis: ['delegation', 'description', 'discernment', 'diligence'],
    custom: {
      component: '4B',
      label: 'AI Interaction Sandbox',
      desc: 'Structured roleplay, feedback simulator, prompt reformulation workshop, annotation layer, diligence statement builder',
    },
    articulate: {
      component: '5A',
      label: 'Storyline Branching',
      desc: 'Multi-path branching scenarios with compounding consequences and constructed response assessment',
    },
    activities: [
      { id: 'P8', short: 'Task Decomposition Exercise', type: 'Categorization with consequences' },
      { id: 'P9', short: 'Prompt Reformulation Comparison', type: 'Before/after workshop' },
      { id: 'P10', short: 'Output Verification Scenario', type: 'Sequential element classification' },
      { id: 'P11', short: 'Iterative Refinement Exercise', type: 'Multi-turn guided interaction' },
      { id: 'P12', short: 'Diligence Statement Practice', type: 'Constructed response' },
    ],
    objectives: [
      { id: '4.1', short: 'Decompose task into human-only, AI-assisted, and delegated components', dims: ['delegation'], assessment: 'Practice (P8) + Competency', tier: 3 },
      { id: '4.2', short: 'Reformulate underspecified prompt into structured request', dims: ['description'], assessment: 'Practice (P9) + Competency', tier: 3 },
      { id: '4.3', short: 'Evaluate AI deliverable: verify, detect hallucination, classify elements', dims: ['discernment', 'diligence'], assessment: 'Practice (P10) + Competency', tier: 3 },
      { id: '4.4', short: 'Iterate through 3+ refinement turns using Description-Discernment loop', dims: ['description', 'discernment'], assessment: 'Practice (P11)', tier: 2 },
      { id: '4.5', short: 'Produce AI diligence statement using 4D vocabulary', dims: ['diligence'], assessment: 'Practice (P12) + Competency + Level 3', tier: 3, feedsL3: true },
    ],
  },
];

// ─── Assessment architecture (design system §1.5) ──────────────────────

export interface AssessmentTier {
  tier: 1 | 2 | 3;
  label: string;
  desc: string;
  color: string;
  /** Fill glyph encoding the tier (so tier is never color-only). */
  icon: string;
}

export const ASSESSMENT_TIERS: AssessmentTier[] = [
  { tier: 1, label: 'Tier 1: Formative', desc: 'Scenario-based knowledge checks with explanatory feedback, embedded within modules', color: '#A0AEB8', icon: '○' },
  { tier: 2, label: 'Tier 2: Practice', desc: 'Learner choices and outputs within interactives, sandbox, and dashboards, assessed in-flow', color: '#7D9BAD', icon: '◐' },
  { tier: 3, label: 'Tier 3: Summative', desc: 'Competency assessment (5C) and Level 3 behavioral follow-up (6C): post-program transfer measurement', color: '#4A6D80', icon: '●' },
];

// ─── Kirkpatrick evaluation lane ───────────────────────────────────────

export interface KirkLevel {
  key: 'L1' | 'L2' | 'L3' | 'L4';
  label: string;
  name: string;
  color: string;
  /** Tinted fill behind the level marker. A companion field rather than
   *  `${color}1F`: hex-alpha can't be appended to a `rgb(var(...))`
   *  expression, and `color` is a token now that the accents flip. */
  wash: string;
  detail: string;
}

export const KIRK_LEVELS: KirkLevel[] = [
  { key: 'L1', label: 'Level 1', name: 'Reaction', color: 'rgb(var(--description))', wash: 'rgb(var(--description) / 0.12)', detail: 'Post-program survey across four actionable dimensions: perceived relevance, confidence change, content quality, and intent to apply, plus a standard NPS item' },
  { key: 'L2', label: 'Level 2', name: 'Learning', color: 'rgb(var(--discernment))', wash: 'rgb(var(--discernment) / 0.12)', detail: 'Ten-item scenario-based pre/post assessment, parallel-form to resist gaming, measuring knowledge gain across usage patterns, failure modes, mechanics, and evaluation' },
  { key: 'L3', label: 'Level 3', name: 'Behavior', color: 'rgb(var(--delegation))', wash: 'rgb(var(--delegation) / 0.12)', detail: 'Manager evidence review and participant self-assessment at 30/60/90 days, rating twelve 4D-mapped behavioral indicators; objectives 2.3 and 4.5 produce the trackable artifacts' },
  { key: 'L4', label: 'Level 4', name: 'Results', color: 'rgb(var(--diligence))', wash: 'rgb(var(--diligence) / 0.12)', detail: 'Business outcomes downstream of competent use: efficiency (time-to-first-draft, revision cycles), quality (AI-error rate), transparency, and time-to-competency, run through a Phillips ROI model (191% in the conservative worked example)' },
];

// ─── Analytics infrastructure (hidden from learners) ───────────────────

export interface InfraComponent {
  component: string;
  title: string;
  detail: string;
}

export const INFRA_COMPONENTS: InfraComponent[] = [
  {
    component: '4D · Analytics Dashboard',
    title: 'Per-learner progress tracking, module completion rates, practice activity engagement metrics, and time-on-task data.',
    detail:
      'Portfolio-mode analytics dashboard at /#/dashboard (Ctrl/Cmd+Shift+A enters portfolio mode). Surfaces the practice-activity and KC data that feeds Kirkpatrick Levels 2 and 3.',
  },
  {
    component: '4E · Platform Shell',
    title: 'Sidebar navigation, the 90% scroll-completion sentinel, hash router, theme system, and the learner-progress and analytics contexts.',
    detail:
      'Wraps every module: every section renders inside the shell’s SectionContainer and consumes its shared progress and analytics providers.',
  },
];

// Derived totals for the diagram's header stats.
export const TOTAL_OBJECTIVES = ARCH_MODULES.reduce((s, m) => s + m.objectives.length, 0);
export const TOTAL_ACTIVITIES = ARCH_MODULES.reduce((s, m) => s + m.activities.length, 0);
export const TIER3_COUNT = ARCH_MODULES.reduce((s, m) => s + m.objectives.filter((o) => o.tier === 3).length, 0);
export const L3_COUNT = ARCH_MODULES.reduce((s, m) => s + m.objectives.filter((o) => o.feedsL3).length, 0);
