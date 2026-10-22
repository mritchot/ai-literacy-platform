// Pre-populated demo data for the analytics dashboard (4D §11). Static — never
// written to localStorage. Mirrors the *actual* shapes the platform stores
// (`LearnerProgressState` and `AnalyticsEvent[]`), not the spec's idealized
// nested shape.
//
// Two demo learners share one history. DEMO_PROGRESS / DEMO_EVENTS stop in
// Module 3 (described below). DEMO_PROGRESS_COMPLETE / DEMO_EVENTS_COMPLETE
// (end of file) finish the program over 14 days and take the
// post-assessment, so reviewers can see the pre→post growth view. The two
// assessment records reproduce the Level 2 worked example row for row:
// pre 8/12 (constructs 2, 4, 6, 10 missed), post 11/12 (10 still missed).
//
// **Realistic learner distribution (in progress):**
//   • Module 1: complete (8/8)
//   • Module 2: complete (8/8)
//   • Module 3: ~60% through (7/11) — first three sections of P5/P6/P7 work
//     done, last four sections (S8 Steerability through S11 Transition,
//     including the M3 KC) NOT yet reached
//   • Module 4: untouched (0/10)
//
// **KC mix:** 8 of 16 items attempted (M1 + M2 only — the M3 KC sits on
// S10 which is past the learner's progress, M4 not yet started). 6 of 8
// preferred (KC-1.2 caution, KC-2.3 caution) so the "not all correct"
// signal reads through the dashboard.
//
// **Reflections:** 5 optional interactions saved (P2, P3 ref 1+2,
// P4 commitment, P6 reasoning). P7 reasoning skipped per design — even
// though P7 was reached, the learner skipped the optional reflection.
// P8/P9/P11/P12 not yet started.

import type {
  AssessmentRecord,
  AssessmentResponse,
  KCConfidence,
  LearnerProgressState,
  KnowledgeCheckResult,
} from '../contexts/LearnerProgressContext';
import type { AnalyticsEvent } from '../contexts/AnalyticsContext';
import { INSTRUMENT_VERSION } from '../data/instrument-version';
import { PRE_ASSESSMENT_ITEMS, type AssessmentItem } from '../data/pre-assessment';
import { POST_ASSESSMENT_ITEMS } from '../data/post-assessment';

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
  // Timestamps sit inside S7's nav window (10.5–13 min) so the module
  // completion event can't predate its knowledge checks.
  '1.7.kc_1_1': kc('c', true, at(11, 12)),
  '1.7.kc_1_2': kc('c', false, at(11, 41)),
  '1.7.kc_1_3': kc('d', true, at(12, 8)),
  '1.7.kc_1_4': kc('b', true, at(12, 33)),
  // M2 S7: 4 items, 3 preferred (KC-2.3 chose d instead of b).
  // Timestamps sit inside S7's nav window (28.5–31.5 min); module_2_complete
  // fires at m2.endMin = 32.5 min, after all four.
  '2.7.kc_2_1': kc('a', true, at(29, 18)),
  '2.7.kc_2_2': kc('d', true, at(29, 47)),
  '2.7.kc_2_3': kc('d', false, at(30, 14)),
  '2.7.kc_2_4': kc('c', true, at(30, 41)),
  // M1 S3 interpretation checks (P1 data narrative). All preferred.
  '1.3.ic_1_1': kc('b', true, at(5, 22)),
  '1.3.ic_1_2': kc('b', true, at(7, 41)),
  '1.3.ic_1_3': kc('c', true, at(9, 53)),
  // M1 S5 unscored 4D practice items. Their keys sit outside `.kc_`, so the
  // KC aggregates ignore them. The demo learner merges the two Ds once.
  '1.5.vocab_1': kc('c', true, at(12, 55)),
  '1.5.vocab_2': kc('c', false, at(13, 18)),
  // M2 S5 unscored prediction before the P4 dashboard (also outside `.kc_`).
  // 25:40 sits in S5's nav window, before the first P4 view event.
  '2.5.pred_2_5': kc('c', false, at(25, 40)),
};

// Confidence ratings on the eight demo KCs, kept beside KC_RESPONSES so the
// calibration row renders in portfolio mode. KC-1.2 is the confident miss.
const KC_CONFIDENCE: Record<string, KCConfidence> = {
  '1.7.kc_1_1': 'fairly',
  '1.7.kc_1_2': 'certain',
  '1.7.kc_1_3': 'certain',
  '1.7.kc_1_4': 'certain',
  '2.7.kc_2_1': 'fairly',
  '2.7.kc_2_2': 'guessing',
  '2.7.kc_2_3': 'guessing',
  '2.7.kc_2_4': 'certain',
};

const KC_RESPONSES_RATED: Record<string, KnowledgeCheckResult> = Object.fromEntries(
  Object.entries(KC_RESPONSES).map(([key, result]) => {
    const confidence = KC_CONFIDENCE[key];
    return [key, confidence ? { ...result, confidence } : result];
  }),
);

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

// Per-section active reading time (ms), as if recorded by the
// visibility/idle tracker in LearnerProgressContext. Heavier values on
// interactive sections (data narratives, dashboards, the tokenizer
// playground); shorter on transitions. Sums to ~60 min across the 23
// completed sections: a fast learner who skims. The program.ts durations
// assume every option and feedback is read, so they run well above this,
// and the demo event timeline is paced to these values.
const ACTIVE_TIME_MS: Record<string, number> = {
  '1.1':  90_000, '1.2': 120_000, '1.3': 240_000, '1.4':  90_000,
  '1.5': 180_000, '1.6':  90_000, '1.7': 150_000, '1.8':  45_000,
  '2.1':  90_000, '2.2': 150_000, '2.3': 240_000, '2.4': 150_000,
  '2.5': 240_000, '2.6': 120_000, '2.7': 150_000, '2.8':  45_000,
  '3.1':  90_000, '3.2': 150_000, '3.3': 360_000, '3.4': 150_000,
  '3.5': 240_000, '3.6': 180_000, '3.7': 240_000,
};

// ── Event helper ────────────────────────────────────────────────────────
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

// ── Pre/post assessment answers ─────────────────────────────────────────
// One table per form drives both the stored responses and the
// `assessment_item_answered` events, so the two cannot drift apart.
// Correctness, construct, and block come from the item banks. Response
// times vary around a minute; PRE-6 took 7 seconds, so the dashboard's
// rapid-answer flag has a case to show.
type DemoAnswer = readonly [itemId: string, option: 'A' | 'B' | 'C' | 'D', seconds: number];

function demoAssessment(
  kind: 'pre' | 'post',
  items: readonly AssessmentItem[],
  answers: readonly DemoAnswer[],
  startTs: number,
): { record: AssessmentRecord; events: Ev[] } {
  const responses: Record<string, AssessmentResponse> = {};
  const events: Ev[] = [
    ev(startTs, `${kind}_assessment_started`, undefined, undefined, { itemCount: items.length }),
  ];
  let ts = startTs;
  for (const [itemId, option, seconds] of answers) {
    const item = items.find((it) => it.id === itemId);
    if (!item) continue;
    ts += seconds * 1000;
    const isCorrect = item.options.find((o) => o.id === option)?.isCorrect ?? false;
    responses[itemId] = {
      itemId,
      selectedOptionId: option,
      isCorrect,
      timestamp: ts,
      responseMs: seconds * 1000,
      instrumentVersion: INSTRUMENT_VERSION,
    };
    events.push(
      ev(ts, 'assessment_item_answered', undefined, undefined, {
        kind,
        itemId,
        construct: item.constructKey,
        block: item.block,
        selectedOptionId: option,
        isCorrect,
        responseMs: seconds * 1000,
        instrumentVersion: INSTRUMENT_VERSION,
      }),
    );
  }
  const completedAt = ts + 5000;
  events.push(
    ev(completedAt, `${kind}_assessment_completed`, undefined, undefined, { itemCount: items.length }),
  );
  return { record: { startedAt: startTs, completedAt, responses }, events };
}

// Pre: 8 of 12, missing constructs 2, 4, 6, and 10. Taken 13 minutes
// before Module 1 starts, so it sits first on the timeline.
const PRE_ANSWERS: readonly DemoAnswer[] = [
  ['PRE-1', 'B', 58],
  ['PRE-2', 'A', 64],
  ['PRE-3', 'A', 52],
  ['PRE-4', 'D', 47],
  ['PRE-5', 'B', 71],
  ['PRE-6', 'C', 7],
  ['PRE-7', 'D', 55],
  ['PRE-8', 'C', 62],
  ['PRE-9', 'B', 66],
  ['PRE-10', 'B', 49],
  ['PRE-11', 'C', 73],
  ['PRE-12', 'A', 57],
];
const PRE_DEMO = demoAssessment('pre', PRE_ASSESSMENT_ITEMS, PRE_ANSWERS, at(-13, 0));

export const DEMO_PROGRESS: LearnerProgressState = {
  // Last position: M3 S7 (the most recently completed section). Sets the
  // sidebar's "current" indicator and matches the resume target on landing.
  current: { moduleId: 3, sectionId: 7 },
  scrolledSections: { ...completed },
  interactionCompleteSections: { ...completed },
  completedSections: {}, // legacy field; the new split maps are authoritative
  knowledgeChecks: KC_RESPONSES_RATED,
  reflections: REFLECTIONS,
  viewedTabs: VIEWED_TABS,
  engagedFlags: ENGAGED_FLAGS,
  activeTimeMs: ACTIVE_TIME_MS,
  // The demo learner is mid-program (M3 S7), so the pre-assessment is
  // complete and the post-assessment hasn't been started yet.
  assessments: {
    pre: PRE_DEMO.record,
    post: {
      startedAt: null,
      completedAt: null,
      responses: {},
    },
  },
};

// ── Analytics events ────────────────────────────────────────────────────
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
  ev(at(7, 41), 'ic_1_2_submitted', 1, 3, { optionId: 'b', isPreferred: true }),
  ev(at(8, 19), 'p1_story_3_viewed', 1, 3),
  ev(at(9, 53), 'ic_1_3_submitted', 1, 3, { optionId: 'c', isPreferred: true }),
  ev(at(10, 22), 'p1_chart_toggle_used', 1, 3, { toggleId: 'productivity-band', state: 'on' }),
  // P2 reflection on M1 S5.
  ev(at(11, 33), 'p2_reflection_viewed', 1, 5),
  ev(at(12, 47), 'p2_reflection_continued', 1, 5),
  ev(at(12, 47), 'p2_time_on_prompt', 1, 5, { seconds: 74 }),
  ev(at(12, 55), 'vocab_1_submitted', 1, 5, { optionId: 'c', isPreferred: true }),
  ev(at(13, 18), 'vocab_2_submitted', 1, 5, { optionId: 'c', isPreferred: false }),
  // KC-1.1 to KC-1.4 on S7 (10.5–13 min window; must precede
  // module_1_complete at 14:00). Timestamps mirror KC_RESPONSES.
  ev(at(11, 12), 'kc_1_1_submitted', 1, 7, { optionId: 'c', isPreferred: true }),
  ev(at(11, 41), 'kc_1_2_submitted', 1, 7, { optionId: 'c', isPreferred: false }),
  ev(at(12, 8), 'kc_1_3_submitted', 1, 7, { optionId: 'd', isPreferred: true }),
  ev(at(12, 33), 'kc_1_4_submitted', 1, 7, { optionId: 'b', isPreferred: true }),
  ev(at(12, 36), 'kc_module_1_complete', 1, 7),
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
  // P4 productivity dashboard on M2 S5, after the unscored prediction.
  ev(at(m1.endMin + 11, 40), 'pred_2_5_submitted', 2, 5, { optionId: 'c', isPreferred: false }),
  ev(at(m1.endMin + 12, 8), 'p4_view_a_viewed', 2, 5),
  ev(at(m1.endMin + 12, 41), 'p4_view_a_sorted', 2, 5, { column: 'speed-gain', direction: 'desc' }),
  ev(at(m1.endMin + 13, 12), 'p4_view_b_viewed', 2, 5),
  ev(at(m1.endMin + 13, 47), 'p4_commitment_task1_engaged', 2, 5),
  ev(at(m1.endMin + 14, 22), 'p4_commitment_task2_engaged', 2, 5),
  ev(at(m1.endMin + 15, 51), 'p4_commitment_saved', 2, 5, { task1Chars: 380, task2Chars: 312 }),
  // KCs on M2 S7 (28.5–31.5 min window; must precede module_2_complete
  // at m2.endMin = 32.5). KC-2.3 non-preferred. Timestamps mirror
  // KC_RESPONSES.
  ev(at(29, 18), 'kc_2_1_submitted', 2, 7, { optionId: 'a', isPreferred: true }),
  ev(at(29, 47), 'kc_2_2_submitted', 2, 7, { optionId: 'd', isPreferred: true }),
  ev(at(30, 14), 'kc_2_3_submitted', 2, 7, { optionId: 'd', isPreferred: false }),
  ev(at(30, 41), 'kc_2_4_submitted', 2, 7, { optionId: 'c', isPreferred: true }),
  ev(at(30, 44), 'kc_module_2_complete', 2, 7),
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

// Combine and sort chronologically. Pre-assessment block goes first
// (negative offsets sort before the T0-anchored module blocks).
export const DEMO_EVENTS: AnalyticsEvent[] = [
  ...PRE_DEMO.events,
  ...m1.events,
  ...M1_EVENTS,
  ...m2.events,
  ...M2_EVENTS,
  ...m3.events,
  ...M3_EVENTS,
].sort((a, b) => a.ts - b.ts);

// ── Completed learner (Demo · completed) ────────────────────────────────
// The same learner, followed to the end: Module 3 finished on day 3,
// Module 4 on day 10, the post-assessment on day 13, then the competency
// profile. All 37 sections done, all 16 knowledge checks answered (13
// preferred; KC-4.3 chose c), all 14 optional interactions saved. The
// post-assessment scores 11 of 12, still missing structured prompting,
// so the dashboard and the Level 2 worked example tell the same story.
const DAY = 24 * 60;

function sectionNavBlock(
  moduleId: number,
  firstSectionId: number,
  startMin: number,
  sectionDurations: number[],
): { events: Ev[]; endMin: number } {
  const events: Ev[] = [];
  let cursor = startMin;
  sectionDurations.forEach((minutes, i) => {
    const sectionId = firstSectionId + i;
    events.push(ev(at(cursor, 2), `section_${moduleId}_${sectionId}_enter`, moduleId, sectionId));
    events.push(
      ev(
        at(cursor, Math.max(20, minutes * 60 - 25)),
        `section_${moduleId}_${sectionId}_scrolled`,
        moduleId,
        sectionId,
      ),
    );
    cursor += minutes;
  });
  return { events, endMin: cursor };
}

const ALL_SECTIONS: Record<string, true> = Object.fromEntries(
  [8, 8, 11, 10].flatMap((count, m) =>
    Array.from({ length: count }, (_, i) => [`${m + 1}.${i + 1}`, true] as const),
  ),
);

const m3Rest = sectionNavBlock(3, 8, 3 * DAY, [2, 3, 3, 1]);
const m4Start = 10 * DAY;
const m4 = sectionNavBlock(4, 1, m4Start, [1.5, 6, 6, 3, 7, 6, 3, 7, 2]);

const POST_ANSWERS: readonly DemoAnswer[] = [
  ['POST-1', 'C', 52],
  ['POST-2', 'A', 61],
  ['POST-3', 'B', 49],
  ['POST-4', 'D', 44],
  ['POST-5', 'A', 68],
  ['POST-6', 'C', 57],
  ['POST-7', 'D', 53],
  ['POST-8', 'B', 74],
  ['POST-9', 'B', 59],
  ['POST-10', 'D', 66],
  ['POST-11', 'D', 81],
  ['POST-12', 'C', 63],
];
const POST_DEMO = demoAssessment('post', POST_ASSESSMENT_ITEMS, POST_ANSWERS, at(13 * DAY, 0));
const profileMin = 13 * DAY + 20;

const KC_RESPONSES_COMPLETE: Record<string, KnowledgeCheckResult> = {
  ...KC_RESPONSES_RATED,
  '3.10.kc_3_1': kc('b', true, at(3 * DAY + 5, 14)),
  '3.10.kc_3_2': kc('a', true, at(3 * DAY + 5, 52)),
  '3.10.kc_3_3': kc('b', true, at(3 * DAY + 6, 37)),
  '3.10.kc_3_4': kc('c', true, at(3 * DAY + 7, 21)),
  '4.4.kc_4_1': kc('d', true, at(m4Start + 14, 10)),
  '4.4.kc_4_2': kc('b', true, at(m4Start + 15, 2)),
  '4.7.kc_4_3': kc('c', false, at(m4Start + 30, 44)),
  '4.7.kc_4_4': kc('c', true, at(m4Start + 31, 30)),
};

const REFLECTIONS_COMPLETE: Record<string, string> = {
  ...REFLECTIONS,
  '3.7.p7_reasoning':
    'The contract summary looked complete, but the clauses in the middle of the document were the ones it skipped. Next time I will ask about the middle sections on their own.',
  '4.2.p8_reflection':
    'My monthly variance pack splits cleanly: pulling the figures is delegable, the commentary is AI-assisted, and the explanation to the CFO stays with me.',
  '4.3.p9_reflection':
    'I usually describe the product and skip the process and the performance standard. Naming the audience and the format did more than any wording change.',
  '4.6.p11_reflection':
    'The second draft only improved once I added the missing context. Asking the tool to try harder changed the tone, not the content.',
  '4.8.p12_reflection':
    'Writing the statement made me separate what I checked from what I only read, which I had not done before.',
  '4.8.p12_statement':
    'AI compiled the competitor figures and drafted the comparison table. I checked every figure against the filings and corrected two. The recommendations are mine, and I am responsible for the briefing.',
  '4.5.p10_reflection':
    'Last week I used an AI summary of a supplier contract. I would flag the quoted penalty rate, verify the renewal date, and include the list of parties as written. I only checked the renewal date.',
  '4.9.closing_confidence':
    'My confidence that I can tell when a variance summary is wrong grew more than my confidence in the tool. I will keep tying every figure in the summary back to the ledger, even when it reads well.',
  '4.9.p4_revised_task1':
    'Budget variance analysis: the figures are a boundary-task risk (arithmetic), so the AI drafts the commentary and I recompute every variance from source. If checking takes more than 30 minutes, the analytical sections go back to human-only.',
  '4.9.p4_revised_task2':
    'Client proposals: claims about the client are fluent-fabrication risks, so I flag every specific fact about their history or market and verify it before the draft goes out. My prompt now names the client, the audience, and the decision the proposal supports.',
  '4.9.p4_revised_tell': 'My finance manager',
};

const ACTIVE_TIME_MS_COMPLETE: Record<string, number> = {
  ...ACTIVE_TIME_MS,
  '3.8': 120_000, '3.9': 180_000, '3.10': 240_000, '3.11': 45_000,
  '4.1': 90_000, '4.2': 360_000, '4.3': 360_000, '4.4': 180_000, '4.5': 420_000,
  '4.6': 360_000, '4.7': 180_000, '4.8': 420_000, '4.9': 120_000, '4.10': 150_000,
};

export const DEMO_PROGRESS_COMPLETE: LearnerProgressState = {
  ...DEMO_PROGRESS,
  current: { moduleId: 4, sectionId: 10 },
  scrolledSections: { ...ALL_SECTIONS },
  interactionCompleteSections: { ...ALL_SECTIONS },
  knowledgeChecks: KC_RESPONSES_COMPLETE,
  reflections: REFLECTIONS_COMPLETE,
  activeTimeMs: ACTIVE_TIME_MS_COMPLETE,
  assessments: {
    pre: PRE_DEMO.record,
    post: POST_DEMO.record,
  },
};

const COMPLETION_EVENTS: Ev[] = [
  // P7 reasoning, which the in-progress learner skipped.
  ev(at(m2.endMin + 18, 40), 'p7_reasoning_submitted', 3, 7, { chars: 171 }),
  // M3 S10 knowledge checks; the module closes after S11.
  ev(at(3 * DAY + 5, 14), 'kc_3_1_submitted', 3, 10, { optionId: 'b', isPreferred: true }),
  ev(at(3 * DAY + 5, 52), 'kc_3_2_submitted', 3, 10, { optionId: 'a', isPreferred: true }),
  ev(at(3 * DAY + 6, 37), 'kc_3_3_submitted', 3, 10, { optionId: 'b', isPreferred: true }),
  ev(at(3 * DAY + 7, 21), 'kc_3_4_submitted', 3, 10, { optionId: 'c', isPreferred: true }),
  ev(at(3 * DAY + 7, 24), 'kc_module_3_complete', 3, 10),
  ev(at(m3Rest.endMin, 0), 'module_3_complete', 3),
  // Module 4 practice activities and knowledge checks.
  ev(at(m4Start, 0), 'module_4_start', 4),
  ev(at(m4Start + 6, 30), 'p8_reflection_saved', 4, 2, { chars: 148 }),
  ev(at(m4Start + 12, 45), 'p9_reflection_saved', 4, 3, { chars: 151 }),
  ev(at(m4Start + 14, 10), 'kc_4_1_submitted', 4, 4, { optionId: 'd', isPreferred: true }),
  ev(at(m4Start + 15, 2), 'kc_4_2_submitted', 4, 4, { optionId: 'b', isPreferred: true }),
  ev(at(m4Start + 22, 40), 'p10_reflection_saved', 4, 5, { chars: 194 }),
  ev(at(m4Start + 27, 5), 'p11_reflection_saved', 4, 6, { chars: 129 }),
  ev(at(m4Start + 30, 44), 'kc_4_3_submitted', 4, 7, { optionId: 'c', isPreferred: false }),
  ev(at(m4Start + 31, 30), 'kc_4_4_submitted', 4, 7, { optionId: 'c', isPreferred: true }),
  ev(at(m4Start + 31, 33), 'kc_module_4_complete', 4, 7),
  ev(at(m4Start + 38, 50), 'p12_reflection_saved', 4, 8, { chars: 102 }),
  // Section 9: the closing reflection, then the revisit of the P4 commitment.
  ev(at(m4Start + 40, 10), 'closing_confidence_saved', 4, 9, { chars: 195 }),
  ev(at(m4Start + 40, 25), 'p4_commitment_revisit_engaged', 4, 9),
  ev(at(m4Start + 41, 5), 'p4_commitment_revised_saved', 4, 9, {
    task1Chars: 239,
    task2Chars: 258,
    namedSomeone: true,
  }),
  // The competency profile opens once the post-assessment is done.
  ev(at(profileMin, 2), 'section_4_10_enter', 4, 10),
  ev(at(profileMin, 20), 'completion_profile_viewed', 4, 10),
  ev(at(profileMin + 2, 0), 'section_4_10_scrolled', 4, 10),
  ev(at(profileMin + 3, 0), 'module_4_complete', 4),
];

export const DEMO_EVENTS_COMPLETE: AnalyticsEvent[] = [
  ...DEMO_EVENTS,
  ...m3Rest.events,
  ...m4.events,
  ...POST_DEMO.events,
  ...COMPLETION_EVENTS,
].sort((a, b) => a.ts - b.ts);
