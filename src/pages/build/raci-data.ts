// RACI matrix data — 32 activities across six phases assigned against five
// roles, plus the role and R/A/C/I definitions.
//
// Source: Phase 4 Component 7B RACI Matrix
// (course-info/content/04_phase-04/07b_raci-matrix.docx), §1–§2. The
// assignment cells are transcribed verbatim from that document's table. NOTE:
// the table contains 32 activity rows and 14 L&D-Manager "Accountable" marks;
// 07b's prose says "31 activities" and "Accountable for 19 of 31." The grid
// and its annotations are computed from the cells below (the source of truth
// for what is actually displayed), so they stay internally consistent — the
// prose discrepancy is flagged for correction at the source.

export type Assignment = 'R' | 'A' | 'C' | 'I' | '—';

export interface Role {
  /** Column abbreviation (LM, ID, FE, SME, ES). */
  abbr: string;
  name: string;
  definition: string;
}

export interface RaciDef {
  letter: 'R' | 'A' | 'C' | 'I';
  name: string;
  meaning: string;
  /** Feedback/neutral token name driving the muted cell color. */
  token: 'success' | 'caution' | 'info' | 'neutral';
}

export interface Activity {
  phase: string;
  name: string;
  /** One assignment per role, in ROLES order [LM, ID, FE, SME, ES]. */
  assignments: Assignment[];
}

// Column order — every activity's `assignments` array follows this order.
export const ROLES: Role[] = [
  {
    abbr: 'LM',
    name: 'L&D Manager',
    definition:
      'Owns the program end-to-end. Accountable for timeline, budget, quality, and stakeholder communication. Makes final design decisions and manages the program’s fit with the organization’s broader learning strategy.',
  },
  {
    abbr: 'ID',
    name: 'Instructional Designer',
    definition:
      'Responsible for content design, learning architecture, assessment instruments, and the evaluation framework. Translates the needs analysis into learning experiences — the primary producer of program content.',
  },
  {
    abbr: 'FE',
    name: 'Front-End Developer',
    definition:
      'Responsible for platform implementation: the custom interactive learning environment, data visualizations, admin dashboard, and deployment infrastructure. Works from the Instructional Designer’s component specifications.',
  },
  {
    abbr: 'SME',
    name: 'Subject-Matter Expert',
    definition:
      'Provides domain expertise on AI capabilities, limitations, and organizational usage patterns, and reviews content for technical accuracy. May be an AI/ML practitioner, an AI-adoption lead, or an external consultant.',
  },
  {
    abbr: 'ES',
    name: 'Executive Sponsor',
    definition:
      'Provides organizational authority, budget approval, and strategic alignment. Reviews phase-gate deliverables and champions the program to senior leadership. Does not participate in design or development decisions.',
  },
];

export const RACI: RaciDef[] = [
  { letter: 'R', name: 'Responsible', meaning: 'Does the work — produces the deliverable or completes the activity.', token: 'success' },
  { letter: 'A', name: 'Accountable', meaning: 'Approves the work and holds final decision authority. Only one A per activity.', token: 'caution' },
  { letter: 'C', name: 'Consulted', meaning: 'Provides input before or during the work. Two-way communication.', token: 'info' },
  { letter: 'I', name: 'Informed', meaning: 'Receives notification of outcomes. One-way communication.', token: 'neutral' },
];

export const PHASES: string[] = [
  'Needs Analysis',
  'Design',
  'Content Development',
  'Platform Build',
  'Evaluation Framework',
  'Deployment + PM',
];

export const ACTIVITIES: Activity[] = [
  { phase: 'Needs Analysis', name: 'Research corpus assembly', assignments: ['A', 'R', '—', 'C', 'I'] },
  { phase: 'Needs Analysis', name: 'Stakeholder interviews', assignments: ['R', 'C', '—', 'C', 'I'] },
  { phase: 'Needs Analysis', name: 'Learner persona development', assignments: ['A', 'R', '—', 'C', 'I'] },
  { phase: 'Needs Analysis', name: 'Capability gap analysis', assignments: ['A', 'R', '—', 'C', 'I'] },
  { phase: 'Needs Analysis', name: 'Needs analysis approval', assignments: ['R', 'I', '—', 'C', 'A'] },
  { phase: 'Design', name: 'Action map', assignments: ['A', 'R', '—', 'C', 'I'] },
  { phase: 'Design', name: 'Program structure + objectives', assignments: ['A', 'R', 'C', 'C', 'I'] },
  { phase: 'Design', name: 'Platform architecture', assignments: ['C', 'C', 'R', '—', 'I'] },
  { phase: 'Design', name: 'Design system', assignments: ['I', 'R', 'C', '—', '—'] },
  { phase: 'Design', name: 'Component specifications', assignments: ['A', 'R', 'C', 'C', 'I'] },
  { phase: 'Design', name: 'Design review approval', assignments: ['R', 'I', 'I', 'C', 'A'] },
  { phase: 'Content Development', name: 'Module content authoring', assignments: ['A', 'R', '—', 'C', '—'] },
  { phase: 'Content Development', name: 'Knowledge check items', assignments: ['A', 'R', '—', 'C', '—'] },
  { phase: 'Content Development', name: 'Pre/post assessment instruments', assignments: ['A', 'R', '—', 'C', '—'] },
  { phase: 'Content Development', name: 'Data file creation + validation', assignments: ['I', 'R', 'C', 'C', '—'] },
  { phase: 'Content Development', name: 'SME content review', assignments: ['I', 'C', '—', 'R', '—'] },
  { phase: 'Platform Build', name: 'Platform implementation', assignments: ['I', 'C', 'R', '—', '—'] },
  { phase: 'Platform Build', name: 'Interactive components (P1–P12)', assignments: ['C', 'C', 'R', '—', '—'] },
  { phase: 'Platform Build', name: 'Admin dashboard', assignments: ['C', 'I', 'R', '—', '—'] },
  { phase: 'Platform Build', name: 'Accessibility + responsive QA', assignments: ['I', 'C', 'R', '—', '—'] },
  { phase: 'Platform Build', name: 'Content integration', assignments: ['I', 'R', 'R', '—', '—'] },
  { phase: 'Evaluation Framework', name: 'Level 1 survey design', assignments: ['A', 'R', '—', '—', 'I'] },
  { phase: 'Evaluation Framework', name: 'Level 2 assessment design', assignments: ['A', 'R', '—', 'C', '—'] },
  { phase: 'Evaluation Framework', name: 'Level 3 behavioral instruments', assignments: ['A', 'R', '—', 'C', 'I'] },
  { phase: 'Evaluation Framework', name: 'Level 4 ROI model', assignments: ['R', 'C', '—', '—', 'A'] },
  { phase: 'Deployment + PM', name: 'Project timeline + RACI', assignments: ['R', 'C', 'C', '—', 'I'] },
  { phase: 'Deployment + PM', name: 'Stakeholder communications', assignments: ['R', 'I', '—', '—', 'I'] },
  { phase: 'Deployment + PM', name: 'Resource planning + budget', assignments: ['R', 'C', 'C', '—', 'A'] },
  { phase: 'Deployment + PM', name: 'QA documentation', assignments: ['A', 'R', 'C', 'C', '—'] },
  { phase: 'Deployment + PM', name: 'Manager orientation materials', assignments: ['A', 'R', '—', 'C', 'I'] },
  { phase: 'Deployment + PM', name: 'Deployment to hosting', assignments: ['I', '—', 'R', '—', 'I'] },
  { phase: 'Deployment + PM', name: 'Baseline data collection', assignments: ['R', 'C', '—', '—', 'I'] },
];

/** Count of a given letter in a role's column (role by ROLES index). */
export function countFor(roleIndex: number, letter: Assignment): number {
  return ACTIVITIES.reduce((n, a) => (a.assignments[roleIndex] === letter ? n + 1 : n), 0);
}
