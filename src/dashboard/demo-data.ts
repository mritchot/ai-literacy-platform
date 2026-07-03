// Pre-populated demo data for the analytics dashboard (4D §11). Static — never
// written to localStorage. Mirrors the *actual* shapes the platform stores
// (`LearnerProgressState` and `AnalyticsEvent[]`), not the spec's idealized
// nested shape.
//
// **Realistic learner distribution:**
//   • Module 1: complete (8/8)
//   • Module 2: complete (8/8)
//   • Module 3: ~60% through (7/11) — first three sections of P5/P6/P7 work
//     done, last four sections (S8 Steerability through S11 Transition,
//     including the M3 KC) NOT yet reached
//   • Module 4: untouched (0/9)
//
// **KC mix:** 8 of 16 items attempted (M1 + M2 only — the M3 KC sits on
// S10 which is past the learner's progress, M4 not yet started). 6 of 8
// preferred (KC-1.2 caution, KC-2.3 caution) so the "not all correct"
// signal reads through the dashboard.
//
// **Reflections:** 5 of 11 optional interactions saved (P2, P3 ref 1+2,
// P4 commitment, P6 reasoning). P7 reasoning skipped per design — even
// though P7 was reached, the learner skipped the optional reflection.
// P8/P9/P11/P12 not yet started.

import type {
  LearnerProgressState,
  KnowledgeCheckResult,
} from '../contexts/LearnerProgressContext';
import type { AnalyticsEvent } from '../contexts/AnalyticsContext';

// ── Anchor timestamp ────────────────────────────────────────────────────
// 2026-04-15T09:00:00.000Z — arbitrary but realistic Tuesday morning.
const T0 = new Date('2026-04-15T09:00:00.000Z').getTime();
const at = (mins: number, secs: number = 0): number => T0 + mins * 60_000 + secs * 1000;

// ── Section completion ──────────────────────────────────────────────────
// M1 (1–8) + M2 (1–8) + M3 (1–7) = 23 sections both-bits-set. Remaining
// 13 sections (M3 S8–S11 + all of M4) are zero. Demo shows mixed completion.
const COMPLETED_SECTIONS = [
  ...Array.from({ length: 8 }, (_, i) => `1.${i + 1}`),
  ...Array.from({ length: 8 }, (_, i) => `2.${i + 1}`),
  ...Array.from({ length: 7 }, (_, i) => `3.${i + 1}`),
];

const completed: Record<string, true> = Object.fromEntries(
  COMPLETED_SECTIONS.map((k) => [k, true]),
);

// ── Knowledge check responses ───────────────────────────────────────────
// Only KCs in completed sections (M1 S7, M2 S7) plus M1 S3 ICs. M3 KC is on
// S10 (past progress); M4 KC sections untouched.
function kc(
  selectedOptionId: string,
  isPreferred: boolean,
  ts: number,
): KnowledgeCheckResult {
  return { selectedOptionId, isPreferred, timestamp: ts };
}

const KC_RESPONSES: Record<string, KnowledgeCheckResult> = {
  // M1 S7: 4 items, 3 preferred (KC-1.2 chose c instead of a).
  '1.7.kc_1_1': kc('b', true, at(13, 12)),
  '1.7.kc_1_2': kc('c', false, at(13, 41)),
  '1.7.kc_1_3': kc('a', true, at(14, 8)),
  '1.7.kc_1_4': kc('d', true, at(14, 33)),
  // M2 S7: 4 items, 3 preferred (KC-2.3 chose b instead of c).
  '2.7.kc_2_1': kc('a', true, at(35, 18)),
  '2.7.kc_2_2': kc('b', true, at(35, 47)),
  '2.7.kc_2_3': kc('b', false, at(36, 14)),
  '2.7.kc_2_4': kc('a', true, at(36, 41)),
  // M1 S3 interpretation checks (P1 data narrative). All preferred.
  '1.3.ic_1_1': kc('b', true, at(5, 22)),
  '1.3.ic_1_2': kc('a', true, at(7, 41)),
  '1.3.ic_1_3': kc('b', true, at(9, 53)),
};

// ── Reflections ─────────────────────────────────────────────────────────
const REFLECTIONS: Record<string, string> = {
  '1.5.p2_reflection':
    "Reading the stigma data, what struck me was the gap between what we say about AI use and what we actually do. I tell my team that exploring AI tools is encouraged, but I rarely model that openly — I'll iterate on a draft with AI and then present the polished version without flagging where the help came from. That's exactly the pattern this section is naming.",
  '2.3.p3_reflection_1':
    "Looking at my last five AI interactions, I think three were task iteration (drafting and refining a board memo, mostly), one was for novel synthesis, and one was straightforward summarization. The pattern surprised me — I assumed I used AI mostly for summarization, but it's actually more about iteration on judgment-heavy work.",
  '2.3.p3_reflection_2':
    "The 18-point gap is striking. I definitely categorized my email drafting as augmentation in the first reflection, but on closer inspection, I almost never read the AI's draft critically — I just edit for tone. That's closer to surface review than augmentation. I'm going to start treating first drafts as automation outputs and apply the same verification I'd use for any external draft.",
  '2.5.p4_commitment_task1':
    "Budget variance analysis — I've been doing this manually each month, which takes about three hours. I'm going to delegate the AI to produce a first draft of the variance summary with my historical commentary as context, then verify the numbers against source data myself. If the verification load is under 30 minutes, this stays delegated; if it creeps higher, I'll move the analytical sections back to human-only.",
  '2.5.p4_commitment_task2':
    "Client proposal first drafts — I send these without checking the model's source claims about the client's industry. I'm going to require myself to verify any claim about the client's history, market position, or recent strategic moves before the proposal goes out. Adding a 'verified by [me]' line to my proposal template will force the discipline.",
  '3.5.p6_reasoning':
    "At temperature 0.0, the model always picked the most probable token, which made the output feel mechanical but predictable. At 1.0, the variance was enough that the same prompt produced visibly different framings. The interesting part was 0.4 — variation in word choice but the underlying argument structure was identical. That's the temperature I'd reach for when I want polish without losing the model's strongest interpretation.",
};

// ── Tab views + engagement flags ────────────────────────────────────────
const VIEWED_TABS: Record<string, true> = {
  '2.3.view_a': true,
  '2.3.view_b': true,
  '2.3.view_c': true,
  '2.5.view_a': true,
  '2.5.view_b': true,
};

const ENGAGED_FLAGS: Record<string, true> = {
  '2.3.p3_methodology_expanded': true,
  '2.5.p4_commitment_engaged': true,
  '3.3.p5_free_mode_entered': true,
};

// Realistic per-section active reading time (ms), as if recorded by the
// visibility/idle tracker in LearnerProgressContext. Heavier values on
// interactive sections (data narratives, dashboards, the tokenizer
// playground); shorter on transitions. Sums to ~60 min across the 23
// completed sections — proportional to the 80–120 min full-program
// duration estimate.
const ACTIVE_TIME_MS: Record<string, number> = {
  '1.1':  90_000, '1.2': 120_000, '1.3': 240_000, '1.4':  90_000,
  '1.5': 180_000, '1.6':  90_000, '1.7': 150_000, '1.8':  45_000,
  '2.1':  90_000, '2.2': 150_000, '2.3': 240_000, '2.4': 150_000,
  '2.5': 240_000, '2.6': 120_000, '2.7': 150_000, '2.8':  45_000,
  '3.1':  90_000, '3.2': 150_000, '3.3': 360_000, '3.4': 150_000,
  '3.5': 240_000, '3.6': 180_000, '3.7': 240_000,
};

export const DEMO_PROGRESS: LearnerProgressState = {
  // Last position: M3 S7 (the most recently completed section). Sets the
  // sidebar's "current" indicator and matches the resume target on landing.
  current: { moduleId: 3, sectionId: 7 },
  scrolledSections: { ...completed },
  interactionCompleteSections: { ...completed },
  completedSections: {}, // legacy field; the new split maps are authoritative
  knowledgeChecks: KC_RESPONSES,
  reflections: REFLECTIONS,
  viewedTabs: VIEWED_TABS,
  engagedFlags: ENGAGED_FLAGS,
  activeTimeMs: ACTIVE_TIME_MS,
  // The demo learner is mid-program (M3 S7), so the pre-assessment is
  // complete and the post-assessment hasn't been started yet. Demo
  // responses for the pre-assessment are seeded with 6/10 correct so
  // the eventual post-assessment comparison shows visible growth.
  assessments: {
    pre: {
      startedAt: Date.now() - 14 * 24 * 60 * 60_000,
      completedAt: Date.now() - 14 * 24 * 60 * 60_000 + 8 * 60_000,
      responses: {
        'PRE-1':  { itemId: 'PRE-1',  selectedOptionId: 'B', isCorrect: true,  timestamp: Date.now() - 14 * 24 * 60 * 60_000 },
        'PRE-2':  { itemId: 'PRE-2',  selectedOptionId: 'A', isCorrect: false, timestamp: Date.now() - 14 * 24 * 60 * 60_000 },
        'PRE-3':  { itemId: 'PRE-3',  selectedOptionId: 'A', isCorrect: true,  timestamp: Date.now() - 14 * 24 * 60 * 60_000 },
        'PRE-4':  { itemId: 'PRE-4',  selectedOptionId: 'D', isCorrect: false, timestamp: Date.now() - 14 * 24 * 60 * 60_000 },
        'PRE-5':  { itemId: 'PRE-5',  selectedOptionId: 'B', isCorrect: true,  timestamp: Date.now() - 14 * 24 * 60 * 60_000 },
        'PRE-6':  { itemId: 'PRE-6',  selectedOptionId: 'C', isCorrect: false, timestamp: Date.now() - 14 * 24 * 60 * 60_000 },
        'PRE-7':  { itemId: 'PRE-7',  selectedOptionId: 'D', isCorrect: true,  timestamp: Date.now() - 14 * 24 * 60 * 60_000 },
        'PRE-8':  { itemId: 'PRE-8',  selectedOptionId: 'C', isCorrect: true,  timestamp: Date.now() - 14 * 24 * 60 * 60_000 },
        'PRE-9':  { itemId: 'PRE-9',  selectedOptionId: 'A', isCorrect: true,  timestamp: Date.now() - 14 * 24 * 60 * 60_000 },
        'PRE-10': { itemId: 'PRE-10', selectedOptionId: 'B', isCorrect: false, timestamp: Date.now() - 14 * 24 * 60 * 60_000 },
      },
    },
    post: {
      startedAt: null,
      completedAt: null,
      responses: {},
    },
  },
};

// ── Analytics events ────────────────────────────────────────────────────
type Ev = AnalyticsEvent;

const ev = (
  ts: number,
  type: string,
  moduleId?: number,
  sectionId?: number,
  payload?: Record<string, unknown>,
): Ev => ({
  ts,
  type,
  ...(moduleId !== undefined && { moduleId }),
  ...(sectionId !== undefined && { sectionId }),
  ...(payload && { payload }),
});

// Module entry: start + section_enter + section_scrolled for each section.
// Returns end time so subsequent modules chain correctly.
function moduleNavBlock(
  moduleId: number,
  startMin: number,
  sectionDurations: number[],
): { events: Ev[]; endMin: number } {
  const events: Ev[] = [];
  let cursor = startMin;
  events.push(ev(at(cursor, 0), `module_${moduleId}_start`, moduleId));
  for (let i = 0; i < sectionDurations.length; i += 1) {
    const sectionId = i + 1;
    events.push(ev(at(cursor, 2), `section_${moduleId}_${sectionId}_enter`, moduleId, sectionId));
    const scrollOffset = Math.max(20, sectionDurations[i]! * 60 - 25);
    events.push(
      ev(
        at(cursor, scrollOffset),
        `section_${moduleId}_${sectionId}_scrolled`,
        moduleId,
        sectionId,
      ),
    );
    cursor += sectionDurations[i]!;
  }
  return { events, endMin: cursor };
}

// M1 nav block — all 8 sections.
const m1 = moduleNavBlock(1, 0, [1.5, 1.5, 2.5, 1.5, 2, 1.5, 2.5, 1]);
// M2 nav block — all 8 sections.
const m2 = moduleNavBlock(2, m1.endMin, [1.5, 1.5, 4.5, 1.5, 4, 1.5, 3, 1]);
// M3 nav block — only 7 sections done. Note: no module_3_complete fires.
const m3 = moduleNavBlock(3, m2.endMin, [1.5, 1.5, 3, 1.5, 3, 1.5, 4]);
// M4: no events at all (untouched).

const M1_EVENTS: Ev[] = [
  // P1 data narrative on M1 S3.
  ev(at(3, 12), 'p1_story_1_viewed', 1, 3),
  ev(at(5, 22), 'ic_1_1_submitted', 1, 3, { optionId: 'b', isPreferred: true }),
  ev(at(6, 5), 'p1_story_2_viewed', 1, 3),
  ev(at(7, 41), 'ic_1_2_submitted', 1, 3, { optionId: 'a', isPreferred: true }),
  ev(at(8, 19), 'p1_story_3_viewed', 1, 3),
  ev(at(9, 53), 'ic_1_3_submitted', 1, 3, { optionId: 'b', isPreferred: true }),
  ev(at(10, 22), 'p1_chart_toggle_used', 1, 3, { toggleId: 'productivity-band', state: 'on' }),
  // P2 reflection on M1 S5.
  ev(at(11, 33), 'p2_reflection_viewed', 1, 5),
  ev(at(12, 47), 'p2_reflection_continued', 1, 5),
  ev(at(12, 47), 'p2_time_on_prompt', 1, 5, { seconds: 74 }),
  // KC-1.1 to KC-1.4 on S7.
  ev(at(13, 12), 'kc_1_1_submitted', 1, 7, { optionId: 'b', isPreferred: true }),
  ev(at(13, 41), 'kc_1_2_submitted', 1, 7, { optionId: 'c', isPreferred: false }),
  ev(at(14, 8), 'kc_1_3_submitted', 1, 7, { optionId: 'a', isPreferred: true }),
  ev(at(14, 33), 'kc_1_4_submitted', 1, 7, { optionId: 'd', isPreferred: true }),
  ev(at(14, 36), 'kc_module_1_complete', 1, 7),
  // Module 1 complete after S8.
  ev(at(m1.endMin, 0), 'module_1_complete', 1),
];

const M2_EVENTS: Ev[] = [
  // P3 dashboard on M2 S3.
  ev(at(m1.endMin + 3, 12), 'p3_view_a_viewed', 2, 3),
  ev(at(m1.endMin + 3, 47), 'p3_view_a_sorted', 2, 3, { sortKey: 'productivity-gain' }),
  ev(at(m1.endMin + 4, 22), 'p3_view_b_viewed', 2, 3),
  ev(at(m1.endMin + 4, 51), 'p3_view_b_pattern_expanded', 2, 3, { pattern: 'directive-iteration' }),
  ev(at(m1.endMin + 5, 12), 'p3_methodology_expanded', 2, 3),
  ev(at(m1.endMin + 5, 38), 'p3_view_c_viewed', 2, 3),
  ev(at(m1.endMin + 5, 47), 'p3_reflection_1_engaged', 2, 3),
  ev(at(m1.endMin + 6, 32), 'p3_reflection_1_saved', 2, 3, { chars: 332 }),
  ev(at(m1.endMin + 6, 35), 'p3_reflection_1_recalled', 2, 3, { hadContent: true }),
  ev(at(m1.endMin + 6, 48), 'p3_reflection_2_engaged', 2, 3),
  ev(at(m1.endMin + 7, 22), 'p3_reflection_2_saved', 2, 3, { chars: 401 }),
  // P4 productivity dashboard on M2 S5.
  ev(at(m1.endMin + 12, 8), 'p4_view_a_viewed', 2, 5),
  ev(at(m1.endMin + 12, 41), 'p4_view_a_sorted', 2, 5, { column: 'speed-gain', direction: 'desc' }),
  ev(at(m1.endMin + 13, 12), 'p4_view_b_viewed', 2, 5),
  ev(at(m1.endMin + 13, 47), 'p4_commitment_task1_engaged', 2, 5),
  ev(at(m1.endMin + 14, 22), 'p4_commitment_task2_engaged', 2, 5),
  ev(at(m1.endMin + 15, 51), 'p4_commitment_saved', 2, 5, { task1Chars: 380, task2Chars: 312 }),
  // KCs on M2 S7. KC-2.3 non-preferred.
  ev(at(35, 18), 'kc_2_1_submitted', 2, 7, { optionId: 'a', isPreferred: true }),
  ev(at(35, 47), 'kc_2_2_submitted', 2, 7, { optionId: 'b', isPreferred: true }),
  ev(at(36, 14), 'kc_2_3_submitted', 2, 7, { optionId: 'b', isPreferred: false }),
  ev(at(36, 41), 'kc_2_4_submitted', 2, 7, { optionId: 'a', isPreferred: true }),
  ev(at(36, 44), 'kc_module_2_complete', 2, 7),
  ev(at(m2.endMin, 0), 'module_2_complete', 2),
];

const M3_EVENTS: Ev[] = [
  // P5 tokenizer on M3 S3.
  ev(at(m2.endMin + 3, 12), 'p5_round_1_predicted', 3, 3, { predicted: 12 }),
  ev(at(m2.endMin + 3, 22), 'p5_round_1_revealed', 3, 3, { actual: 14, gap: 2 }),
  ev(at(m2.endMin + 3, 47), 'p5_round_2_predicted', 3, 3, { predicted: 8 }),
  ev(at(m2.endMin + 3, 56), 'p5_round_2_revealed', 3, 3, { actual: 11, gap: 3 }),
  ev(at(m2.endMin + 4, 18), 'p5_round_3_predicted', 3, 3, { predicted: 18 }),
  ev(at(m2.endMin + 4, 28), 'p5_round_3_revealed', 3, 3, { actual: 17, gap: 1 }),
  ev(at(m2.endMin + 4, 51), 'p5_round_4_predicted', 3, 3, { predicted: 6 }),
  ev(at(m2.endMin + 5, 1), 'p5_round_4_revealed', 3, 3, { actual: 9, gap: 3 }),
  ev(at(m2.endMin + 5, 18), 'p5_free_mode_entered', 3, 3),
  ev(at(m2.endMin + 5, 32), 'p5_free_tokenized', 3, 3, { chars: 240, tokens: 58 }),
  ev(at(m2.endMin + 5, 47), 'p5_free_tokenized', 3, 3, { chars: 187, tokens: 41 }),
  ev(at(m2.endMin + 5, 58), 'p5_quickload_used', 3, 3, { label: 'API key fragment' }),
  // P6 next-token demo on M3 S5.
  ev(at(m2.endMin + 9, 12), 'p6_stem_1_viewed', 3, 5),
  ev(at(m2.endMin + 9, 28), 'p6_temperature_adjusted', 3, 5, { temp: 0.4 }),
  ev(at(m2.endMin + 9, 41), 'p6_stem_1_generated', 3, 5, { temp: 0.4, token: 'collaborative' }),
  ev(at(m2.endMin + 10, 8), 'p6_stem_2_viewed', 3, 5),
  ev(at(m2.endMin + 10, 22), 'p6_temperature_adjusted', 3, 5, { temp: 1.0 }),
  ev(at(m2.endMin + 10, 35), 'p6_stem_2_generated', 3, 5, { temp: 1.0, token: 'tangentially' }),
  ev(at(m2.endMin + 11, 2), 'p6_stem_3_viewed', 3, 5),
  ev(at(m2.endMin + 11, 18), 'p6_stem_3_generated', 3, 5),
  ev(at(m2.endMin + 11, 47), 'p6_reasoning_submitted', 3, 5, { chars: 384 }),
  // P7 context window on M3 S7. Reflection skipped per design.
  ev(at(m2.endMin + 16, 12), 'p7_scenario_viewed', 3, 7),
  ev(at(m2.endMin + 16, 38), 'p7_verification_started', 3, 7),
  ev(at(m2.endMin + 16, 51), 'p7_item_1_submitted', 3, 7, { selected: 'a' }),
  ev(at(m2.endMin + 17, 4), 'p7_item_2_submitted', 3, 7, { selected: 'c' }),
  ev(at(m2.endMin + 17, 22), 'p7_item_3_submitted', 3, 7, { selected: 'b' }),
  ev(at(m2.endMin + 17, 41), 'p7_item_4_submitted', 3, 7, { selected: 'd' }),
  ev(at(m2.endMin + 17, 42), 'p7_items_correct', 3, 7, { correct: 3 }),
  ev(at(m2.endMin + 18, 4), 'p7_debrief_viewed', 3, 7),
  // No M3 KC submission, no module_3_complete — learner hasn't reached S8+.
];

// ── Pre-assessment events ──────────────────────────────────────────────
// The demo learner took the pre-assessment ~15 minutes before starting
// Module 1, so these events sit BEFORE the M1 block on the timeline.
// Negative `at()` offsets compute timestamps before the T0 anchor.
//
// Item answers MUST stay consistent with the responses in
// DEMO_PROGRESS.assessments.pre.responses above (same selectedOptionId
// + isCorrect per item). The construct/block payload on each item
// comes from the canonical mapping in src/data/pre-assessment.ts.
//
// Cadence: 60 seconds between item answers (10 items × 60s = 10 min),
// flanked by started at T0-15m and completed at T0-4m. All within the
// 15-minute window before M1 starts. Note: the in-state response
// timestamps in DEMO_PROGRESS use `Date.now() - 14d` because they
// were authored before this event block existed; the event timestamps
// here use the T0 anchor for chronological consistency with the
// surrounding M1/M2/M3 events.
const PRE_ASSESSMENT_EVENTS: Ev[] = [
  ev(at(-15, 0), 'pre_assessment_started', undefined, undefined, {
    itemCount: 10,
  }),
  ev(at(-14, 0), 'assessment_item_answered', undefined, undefined, {
    kind: 'pre', itemId: 'PRE-1', construct: 'augmentation-automation', block: 'usage',
    selectedOptionId: 'B', isCorrect: true,
  }),
  ev(at(-13, 0), 'assessment_item_answered', undefined, undefined, {
    kind: 'pre', itemId: 'PRE-2', construct: 'productivity-verification', block: 'usage',
    selectedOptionId: 'A', isCorrect: false,
  }),
  ev(at(-12, 0), 'assessment_item_answered', undefined, undefined, {
    kind: 'pre', itemId: 'PRE-3', construct: 'fluent-fabrication', block: 'failure',
    selectedOptionId: 'A', isCorrect: true,
  }),
  ev(at(-11, 0), 'assessment_item_answered', undefined, undefined, {
    kind: 'pre', itemId: 'PRE-4', construct: 'boundary-task', block: 'failure',
    selectedOptionId: 'D', isCorrect: false,
  }),
  ev(at(-10, 0), 'assessment_item_answered', undefined, undefined, {
    kind: 'pre', itemId: 'PRE-5', construct: 'context-window', block: 'failure',
    selectedOptionId: 'B', isCorrect: true,
  }),
  ev(at(-9, 0), 'assessment_item_answered', undefined, undefined, {
    kind: 'pre', itemId: 'PRE-6', construct: 'prediction-retrieval', block: 'mechanics',
    selectedOptionId: 'C', isCorrect: false,
  }),
  ev(at(-8, 0), 'assessment_item_answered', undefined, undefined, {
    kind: 'pre', itemId: 'PRE-7', construct: 'tokenization', block: 'mechanics',
    selectedOptionId: 'D', isCorrect: true,
  }),
  ev(at(-7, 0), 'assessment_item_answered', undefined, undefined, {
    kind: 'pre', itemId: 'PRE-8', construct: 'capability-diagnosis', block: 'mechanics',
    selectedOptionId: 'C', isCorrect: true,
  }),
  ev(at(-6, 0), 'assessment_item_answered', undefined, undefined, {
    kind: 'pre', itemId: 'PRE-9', construct: 'verification-priority', block: 'evaluation',
    selectedOptionId: 'A', isCorrect: true,
  }),
  ev(at(-5, 0), 'assessment_item_answered', undefined, undefined, {
    kind: 'pre', itemId: 'PRE-10', construct: 'structured-prompting', block: 'evaluation',
    selectedOptionId: 'B', isCorrect: false,
  }),
  ev(at(-4, 0), 'pre_assessment_completed', undefined, undefined, {
    itemCount: 10,
  }),
];

// Combine and sort chronologically. Pre-assessment block goes first
// (negative offsets sort before the T0-anchored module blocks).
export const DEMO_EVENTS: AnalyticsEvent[] = [
  ...PRE_ASSESSMENT_EVENTS,
  ...m1.events,
  ...M1_EVENTS,
  ...m2.events,
  ...M2_EVENTS,
  ...m3.events,
  ...M3_EVENTS,
].sort((a, b) => a.ts - b.ts);
