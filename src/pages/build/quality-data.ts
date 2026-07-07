// Quality-assurance data — the defect taxonomy, the ten verification passes,
// the triple-validation data protocol, and the eight-check capability
// framework. Drives the QA dashboard.
//
// Source: Phase 4 Component 7E Quality Assurance Documentation
// (course-info/content/04_phase-04/07e_quality-assurance-documentation.docx),
// §2–§6. Counts are transcribed from the document; the defect categories sum
// to the ~65 total it reports.

export interface DefectCategory {
  category: string;
  count: number;
  description: string;
  resolution: string;
}

// §6 Defect Summary — ordered by count (descending). Sum = 65.
export const DEFECT_CATEGORIES: DefectCategory[] = [
  { category: 'Spec-level inconsistency', count: 28, description: 'Event-key prefixes, state-shape mismatches, completion-logic conflicts, consumer-mapping errors.', resolution: 'All resolved across six files; reconciliation catalogs produced.' },
  { category: 'JSX diagram drift', count: 18, description: 'Duration, dimension-label, activity-type, and casing divergences between the interactive diagrams and the built codebase.', resolution: 'All 18 resolved; downstream document fixes applied.' },
  { category: 'Assessment item quality', count: 6, description: 'Distractor length imbalance (3), forward-reference violations (2), option-length parity (1).', resolution: 'Knowledge-check items revised and re-verified.' },
  { category: 'Document-level inconsistency', count: 6, description: 'Alignment-matrix D-code discrepancies in the program overview (03a).', resolution: 'Correction table produced and applied.' },
  { category: 'Stale documentation', count: 4, description: 'Status markers in M2/M3 outstanding items (2); consumer listings in the data readme (2).', resolution: 'Corrections applied or flagged.' },
  { category: 'Data accuracy', count: 2, description: 'Median task cost ($55 → $54); citation page range (p. 12 → pp. 12–13).', resolution: 'JSON file and document corrections applied.' },
  { category: 'Activity design', count: 1, description: 'P11 conflated Description and Discernment on Turn 1.', resolution: 'Activity restructured to an evaluation-first sequence.' },
];

export const DEFECT_TOTAL = DEFECT_CATEGORIES.reduce((n, d) => n + d.count, 0);

export interface QaPass {
  activity: string;
  method: string;
  scope: string;
  sample: string;
  result: string;
}

// §2 QA Activities — the ten structured verification passes.
export const QA_PASSES: QaPass[] = [
  { activity: 'Capability check logs (M1–M4)', method: 'Inline pass/fail checks during authoring', scope: 'Narrative, scenario stems, feedback, KC items', sample: '4 modules', result: 'All passed; outstanding items resolved before build handoff.' },
  { activity: 'Knowledge-check evaluation', method: 'Binary checks: scenario-based, application-level, plausible distractors, consequence feedback, no cueing', scope: '16 KC items across 4 modules', sample: '16 items', result: 'KC-1.1–1.3 revised for distractor balance; KC-2.3/2.4 for forward-reference; KC-4.4 Option C for length parity.' },
  { activity: 'Practice-activity traceability audit', method: 'Each P-activity vs. action-map and content D-codes', scope: '12 practice activities (P1–P12)', sample: '12 items', result: 'All 12 match across both sources in behavior targets and descriptions.' },
  { activity: 'KC–objective traceability', method: 'Each KC stem vs. its referenced performance objective', scope: '16 KCs against 17 objectives', sample: '16 items', result: 'All 16 correctly assess their referenced objectives.' },
  { activity: 'Data-file triple validation', method: 'Schema, value verification vs. sources, cross-file consistency', scope: '6 JSON files', sample: '6 files × 3 passes', result: 'All validated; $55 → $54 and citation page-range corrections applied.' },
  { activity: 'Cross-cutting integration check (1)', method: 'Event model, state shape, completion logic, consumer mapping', scope: '5 component specs + 6 data files', sample: '28 edits across 6 files', result: '95 event keys cataloged; 37+ state keys reconciled; master event-key table produced.' },
  { activity: 'Cross-cutting integration check (2)', method: 'Content flow, terminology, tone, D-code trace, color batch fix', scope: '4 content docs + 2 planning + 4 specs', sample: '6 tasks', result: 'All clean; six 03a alignment-matrix discrepancies corrected; two stale markers flagged.' },
  { activity: 'JSX artifact audit', method: 'Reconcile interactive diagrams vs. the built codebase', scope: '2 JSX files against src/', sample: '18 discrepancies', result: '5 major, 13 minor found and resolved; downstream doc fixes applied.' },
  { activity: 'Citation verification pass', method: 'Every inline statistic vs. reference-quotes.md and source papers', scope: '21 statistics across 4 modules', sample: '21 items', result: 'One known discrepancy (81% vs 84% median savings) confirmed resolved per the Figure 6 methodology.' },
  { activity: 'Reference item (R1–R7) design review', method: 'PDF assets vs. design system; content accuracy and register', scope: '7 reference items at 10 placements', sample: '7 items', result: 'All 7 redesigned in the project design system; contextual placement verified.' },
];

export interface ValidationPass {
  n: number;
  name: string;
  detail: string;
}

// §4.1 Triple-validation protocol — three dedicated passes per data file.
export const VALIDATION_PASSES: ValidationPass[] = [
  { n: 1, name: 'Schema validation', detail: 'Field names, data types, required vs. optional fields, and structural consistency across array entries.' },
  { n: 2, name: 'Value verification', detail: 'Every numeric value and quoted string traced to a specific page, table, or figure in the source paper, cross-checked against reference-quotes.md.' },
  { n: 3, name: 'Cross-file consistency', detail: 'Values shared across files (e.g., the 81% median-savings figure) verified for consistency; each file’s consuming components confirmed against the specs.' },
];

export interface ValidatedFile {
  file: string;
  source: string;
  content: string;
  status: string;
}

// §4.2 Validation results — the six JSON data files.
export const VALIDATED_FILES: ValidatedFile[] = [
  { file: 'augmentation-automation.json', source: 'Handa et al.', content: 'Occupation/task breakdowns; 57%/43% augmentation-automation split', status: 'Pass' },
  { file: 'productivity-gains.json', source: 'Tamkin & McCrory', content: 'Task time reductions; 81% median savings (Fig. 6 caption, p. 13)', status: 'Pass · 2 corrections' },
  { file: 'geographic-adoption.json', source: 'Appel, McCrory & Tamkin', content: 'Country-level usage rates; institutional-inertia indicators', status: 'Pass' },
  { file: 'wef-skill-demand.json', source: 'WEF Future of Jobs 2025', content: 'Fastest-growing/declining skills; employer transformation expectations', status: 'Pass' },
  { file: 'interviewer-findings.json', source: 'Anthropic Interviewer', content: '86% time savings; 65% satisfaction; 69% stigma; 48% career transition', status: 'Pass' },
  { file: 'adoption-trends.json', source: 'Multiple sources', content: 'Longitudinal adoption rates; interaction-mode temporal data', status: 'Pass' },
];

export interface CapabilityCheck {
  check: string;
  type: 'Capability' | 'Risk';
  criterion: string;
}

// §3.1 Capability-check framework — eight binary pass/fail checks.
export const CAPABILITY_CHECKS: CapabilityCheck[] = [
  { check: 'Scenario authenticity', type: 'Capability', criterion: 'Does the stem present a recognizable workplace situation with a job title, context, and decision point?' },
  { check: 'Application-level cognitive demand', type: 'Capability', criterion: 'Does the item test applying a concept to a novel situation rather than recalling a definition?' },
  { check: 'Distractor plausibility', type: 'Risk', criterion: 'Are all non-preferred options actions a reasonable professional might consider? (No trick or absurd choices.)' },
  { check: 'Correct-answer cueing absence', type: 'Risk', criterion: 'Is the preferred option free of length, specificity, or hedging cues that distinguish it without content knowledge?' },
  { check: 'Consequence-based feedback', type: 'Capability', criterion: 'Does each option branch lead to a realistic observed outcome rather than a "Correct" / "Try again" label?' },
  { check: 'Source fidelity', type: 'Risk', criterion: 'Does every cited statistic match its source paper (checked against reference-quotes.md)?' },
  { check: 'Register consistency', type: 'Capability', criterion: 'Does the text hold the "knowledgeable peer" second-person register without slipping into lecture or compliance tone?' },
  { check: 'Forward-reference avoidance', type: 'Risk', criterion: 'Does the item avoid requiring knowledge from a module the learner has not yet completed?' },
];
