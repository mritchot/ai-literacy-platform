// Project-timeline data — the actual solo build track and the hypothetical
// five-person organizational track, plus the effort comparison figures.
//
// Source: Phase 4 Component 7A Project Timeline
// (course-info/content/04_phase-04/07a_project-timeline.docx). The effort
// figures use the RECONCILED canonical values, not 07a's superseded ones:
// ~150–160 focused hours against a ~735-hour Chapman Alliance baseline for
// comparable Level-3 e-learning — a 4.6–4.9× reduction. The dual-track
// comparison leads on effort, not calendar; 07a's lower effort estimate and
// higher compression multiple are superseded and deliberately not surfaced.

export interface Phase {
  name: string;
  /** Date span (solo) or duration (organizational). */
  when: string;
  detail: string;
}

// Effort comparison — the headline. Numeric anchors drive the bar widths;
// the ranges are the displayed labels.
export const EFFORT = {
  soloHoursLabel: '≈150–160 hrs',
  soloHoursAnchor: 155,
  baselineLabel: '≈735 hrs',
  baselineAnchor: 735,
  reductionLabel: '4.6–4.9×',
  baselineNote: 'Chapman Alliance baseline for comparable Level-3 e-learning',
  soloNote: 'Focused solo effort, AI-accelerated',
  // Calendar is secondary context, never the compression figure.
  soloCalendar: '≈8 weeks',
  orgCalendar: '24–33 weeks',
} as const;

export const SOLO_PHASES: Phase[] = [
  {
    name: 'Phase 0 · Research',
    when: 'Week 1 — Mar 30',
    detail:
      'Research-corpus assembly: an automated scraper for AI-course content (text + video), batched source videos matched to structured transcripts, seven primary sources cataloged with extraction guidance.',
  },
  {
    name: 'Phase 0.5 · Planning',
    when: 'Week 2 — Apr 7',
    detail:
      'Production-plan overhaul (30 pages), eight components across six phases, the six-phase build sequence, QA methodology defined (Hardman AI Evals), system prompt aligned.',
  },
  {
    name: 'Phase 1 · Foundation',
    when: 'Weeks 2–3 — Apr 10–14',
    detail:
      'Components 1 and 2A–2C: executive problem statement, market-level capability gap analysis, evidence-based learner persona, and the action map with its interactive JSX diagram. Full citation verification.',
  },
  {
    name: 'Phase 2 · Architecture',
    when: 'Weeks 3–4 — Apr 18–21',
    detail:
      'Program overview (17 performance objectives), the learning-architecture diagram, the platform architecture decision document and design system, six high-fidelity mockups, five component specs, and six triple-validated JSON data files.',
  },
  {
    name: 'Phase 3 · Content + Build',
    when: 'Weeks 4–6 — Apr 25–May 9',
    detail:
      'Four module documents (36 sections) and the custom platform: Vite + React + TypeScript, Tailwind, Recharts, 12 practice activities, 16 knowledge checks, the pre/post assessment, the admin dashboard, three-mode navigation, and dark mode. Deployed to Cloudflare Pages.',
  },
  {
    name: 'Phase 4 · Evaluation',
    when: 'Weeks 7–8 — May 16–19',
    detail:
      'Kirkpatrick Levels 1–4 evaluation designs, a multi-module QA audit and remediation, and the Component 7 project-management artifacts.',
  },
];

export const ORG_PHASES: Phase[] = [
  {
    name: 'Needs Analysis',
    when: '3–4 weeks',
    detail:
      'Research synthesis, stakeholder interviews, learner-persona development, gap analysis. Gated on SME availability, stakeholder scheduling, and data access.',
  },
  {
    name: 'Design',
    when: '4–5 weeks',
    detail:
      'Action map, program structure, performance objectives, design system, and component specifications — including a 1–2 week stakeholder design-review and approval cycle within the phase.',
  },
  {
    name: 'Content Development',
    when: '6–8 weeks',
    detail:
      'Module authoring (4 modules, 36 sections), knowledge-check and assessment items, data-file creation and validation, and 2–3 SME content-review rounds per module.',
  },
  {
    name: 'Platform Build',
    when: '8–10 weeks',
    detail:
      'Custom React platform: 12 interactive components, data dashboards, admin panel, responsive design, dark mode, three-mode navigation, and QA cycles. Runs parallel with content development for the first ~4 weeks.',
  },
  {
    name: 'Integration + QA',
    when: '3–4 weeks',
    detail:
      'Content integration, cross-module testing, accessibility review, browser compatibility, a near-final stakeholder review, and bug fixes and polish.',
  },
  {
    name: 'Evaluation Design',
    when: '2–3 weeks',
    detail:
      'Level 1–4 evaluation instruments, the ROI model, and administration protocols. Can partially overlap the Integration + QA phase.',
  },
  {
    name: 'Launch Prep',
    when: '2–3 weeks',
    detail:
      'Deployment to hosting, manager orientation materials, learner communication, pilot-group selection, and baseline data collection for the Level-4 KPIs.',
  },
];
