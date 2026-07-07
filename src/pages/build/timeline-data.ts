// Project-timeline data — the actual solo build track and the hypothetical
// five-person organizational track, rendered as a two-swimlane Gantt on a
// shared week axis, plus the effort-comparison figures.
//
// Source: Phase 4 Component 7A Project Timeline
// (course-info/content/04_phase-04/07a_project-timeline.docx). The effort
// figures use the RECONCILED canonical values, not 07a's superseded ones:
// ~150–160 focused hours against a ~735-hour Chapman Alliance baseline for
// comparable Level-3 e-learning, a 4.6–4.9× reduction. The comparison leads on
// effort, not calendar. Solo bar positions come from the dated process journal;
// the organizational bar positions are an illustrative schedule derived from
// the phase durations (the org track is an exemplar, not a fixed plan).

export type StageKey =
  | 'analysis'
  | 'design'
  | 'development'
  | 'integration'
  | 'evaluation'
  | 'launch';

// Lifecycle stages, shared across both tracks so matching work carries the
// same color. Deliberately a separate Gantt palette, NOT the 4D competency
// colors, which stay reserved for competency tagging.
export const STAGES: Record<StageKey, { label: string; color: string }> = {
  analysis: { label: 'Needs analysis', color: '#5B7A99' },
  design: { label: 'Design', color: '#C0894E' },
  development: { label: 'Content & build', color: '#4E8A80' },
  integration: { label: 'Integration & QA', color: '#B5695F' },
  evaluation: { label: 'Evaluation', color: '#7B6FA8' },
  launch: { label: 'Launch prep', color: '#8A8A6E' },
};

export interface Phase {
  name: string;
  /** Date span (solo) or duration (organizational), shown in the detail. */
  when: string;
  detail: string;
  stage: StageKey;
  /** Gantt bar start, 1-based week index on the shared axis. */
  startWeek: number;
  /** Gantt bar length in weeks. */
  weeks: number;
}

// The shared week axis runs 1..MAX; the organizational track sets the max.
export const TIMELINE_MAX_WEEKS = 30;

// Effort comparison — the headline. Numeric anchors drive the bar widths;
// the ranges are the displayed labels.
export const EFFORT = {
  soloHoursLabel: '≈150–160 hrs',
  soloHoursAnchor: 155,
  baselineLabel: '≈735 hrs',
  baselineAnchor: 735,
  reductionLabel: '4.6–4.9×',
  baselineNote: 'Chapman Alliance (2010) baseline for comparable Level-3 e-learning',
  soloNote: 'Focused solo effort, AI-accelerated',
  // Calendar is secondary context, never the compression figure.
  soloCalendar: '≈8 weeks',
  orgCalendar: '24–33 weeks',
} as const;

export const SOLO_PHASES: Phase[] = [
  {
    name: 'Phase 0 · Research',
    when: 'Week 1, Mar 30',
    stage: 'analysis',
    startWeek: 1,
    weeks: 1,
    detail:
      'Research-corpus assembly: seven primary sources cataloged with extraction guidance, plus reference videos matched to structured transcripts.',
  },
  {
    name: 'Phase 0.5 · Planning',
    when: 'Week 2, Apr 7',
    stage: 'analysis',
    startWeek: 2,
    weeks: 1,
    detail:
      'Production-plan overhaul (30 pages), eight components across six phases, the six-phase build sequence, QA methodology defined (Hardman AI Evals), system prompt aligned.',
  },
  {
    name: 'Phase 1 · Needs Analysis',
    when: 'Weeks 2–3, Apr 10–14',
    stage: 'analysis',
    startWeek: 2,
    weeks: 2,
    detail:
      'Components 1 and 2A–2C: executive problem statement, market-level capability gap analysis, evidence-based learner persona, and the action map with its interactive JSX diagram. Full citation verification.',
  },
  {
    name: 'Phase 2 · Design',
    when: 'Weeks 3–4, Apr 18–21',
    stage: 'design',
    startWeek: 3,
    weeks: 2,
    detail:
      'Program overview (17 performance objectives), the learning-architecture diagram, the platform architecture decision document and design system, six high-fidelity mockups, five component specs, and six triple-validated JSON data files.',
  },
  {
    name: 'Phase 3 · Content + Build',
    when: 'Weeks 4–6, Apr 25–May 9',
    stage: 'development',
    startWeek: 4,
    weeks: 3,
    detail:
      'Four module documents (37 sections) and the custom platform: Vite + React + TypeScript, Tailwind, Recharts, 12 practice activities, 16 knowledge checks, the pre/post assessment, the admin dashboard, three-mode navigation, and dark mode. Deployed to Cloudflare Pages.',
  },
  {
    name: 'Phase 4 · Evaluation',
    when: 'Weeks 7–8, May 16–19',
    stage: 'evaluation',
    startWeek: 7,
    weeks: 2,
    detail:
      'Kirkpatrick Levels 1–4 evaluation designs, a multi-module QA audit and remediation, and the Component 7 project-management artifacts.',
  },
];

export const ORG_PHASES: Phase[] = [
  {
    name: 'Needs Analysis',
    when: '3–4 weeks',
    stage: 'analysis',
    startWeek: 1,
    weeks: 4,
    detail:
      'Research synthesis, stakeholder interviews, learner-persona development, gap analysis. Gated on SME availability, stakeholder scheduling, and data access.',
  },
  {
    name: 'Design',
    when: '4–5 weeks',
    stage: 'design',
    startWeek: 5,
    weeks: 5,
    detail:
      'Action map, program structure, performance objectives, design system, and component specifications, including a 1–2 week stakeholder design-review and approval cycle within the phase.',
  },
  {
    name: 'Content Development',
    when: '6–8 weeks',
    stage: 'development',
    startWeek: 10,
    weeks: 8,
    detail:
      'Module authoring (4 modules, 37 sections), knowledge-check and assessment items, data-file creation and validation, and 2–3 SME content-review rounds per module.',
  },
  {
    name: 'Platform Build',
    when: '8–10 weeks',
    stage: 'development',
    startWeek: 14,
    weeks: 10,
    detail:
      'Custom React platform: 12 interactive components, data dashboards, admin panel, responsive design, dark mode, three-mode navigation, and QA cycles. Runs parallel with content development for the first ~4 weeks.',
  },
  {
    name: 'Integration + QA',
    when: '3–4 weeks',
    stage: 'integration',
    startWeek: 24,
    weeks: 4,
    detail:
      'Content integration, cross-module testing, accessibility review, browser compatibility, a near-final stakeholder review, and bug fixes and polish.',
  },
  {
    name: 'Evaluation Design',
    when: '2–3 weeks',
    stage: 'evaluation',
    startWeek: 25,
    weeks: 3,
    detail:
      'Level 1–4 evaluation instruments, the ROI model, and administration protocols. Can partially overlap the Integration + QA phase.',
  },
  {
    name: 'Launch Prep',
    when: '2–3 weeks',
    stage: 'launch',
    startWeek: 28,
    weeks: 3,
    detail:
      'Deployment to hosting, manager orientation materials, learner communication, pilot-group selection, and baseline data collection for the Level-4 KPIs.',
  },
];
