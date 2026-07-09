// Knowledge Check + Interpretation Check display-relevant metadata for the
// analytics dashboard (4D §9.5). Static lookup — duplicates the *display-relevant
// subset* of the KC content (stem preview + option labels + preferred answer)
// so the dashboard chunk does not need the full module content files.
//
// `sectionId` matches where the KC is rendered in the platform; this lets
// the dashboard locate the stored response via `4.7.kc_4_3` etc.

import type { ModuleId } from './section-labels';

export interface KCMetadata {
  id: string;
  moduleId: ModuleId;
  sectionId: number;
  objectiveRef: string;
  stemPreview: string; // First ~80 chars of the stem text + "…"
  preferredOptionId: string;
  options: { id: string; label: string }[];
}

export const KC_IDS: Record<ModuleId, KCId[]> = {
  1: ['kc_1_1', 'kc_1_2', 'kc_1_3', 'kc_1_4'],
  2: ['kc_2_1', 'kc_2_2', 'kc_2_3', 'kc_2_4'],
  3: ['kc_3_1', 'kc_3_2', 'kc_3_3', 'kc_3_4'],
  4: ['kc_4_1', 'kc_4_2', 'kc_4_3', 'kc_4_4'],
};

// IC IDs and the section where they're rendered. Module 1 is the only module
// with interpretation checks (P1 data narrative, all on S3).
export const IC_IDS: Record<ModuleId, ICId[]> = {
  1: ['ic_1_1', 'ic_1_2', 'ic_1_3'],
  2: [],
  3: [],
  4: [],
};

export const KC_METADATA = {
  // ── Module 1 ──────────────────────────────────────────────────────────
  kc_1_1: {
    id: 'kc_1_1',
    moduleId: 1,
    sectionId: 7,
    objectiveRef: '1.1',
    stemPreview:
      'You manage an operations team in Southeast Asia with high AI adoption. A peer in Latin America asks…',
    preferredOptionId: 'c',
    options: [
      { id: 'a', label: '(a) GDP-and-infrastructure framing' },
      { id: 'b', label: '(b) Decline based on use-case concentration' },
      { id: 'c', label: '(c) Share workflows with institutional caveat' },
      { id: 'd', label: '(d) Wait for adoption equalization' },
    ],
  },
  kc_1_2: {
    id: 'kc_1_2',
    moduleId: 1,
    sectionId: 7,
    objectiveRef: '1.2',
    stemPreview:
      'Your CLO asks for a one-paragraph justification for an AI literacy program. Which draft makes the…',
    preferredOptionId: 'a',
    options: [
      { id: 'a', label: '(a) Behavioral divergence + concealment evidence' },
      { id: 'b', label: '(b) WEF ranking + competitive urgency' },
      { id: 'c', label: '(c) Satisfaction data as proof it already works' },
      { id: 'd', label: '(d) Five-year full-automation claim' },
    ],
  },
  kc_1_3: {
    id: 'kc_1_3',
    moduleId: 1,
    sectionId: 7,
    objectiveRef: '1.3',
    stemPreview:
      'A junior colleague mentions she hides her AI use for client drafts, and the room tenses. Which…',
    preferredOptionId: 'd',
    options: [
      { id: 'a', label: '(a) Just-be-open encouragement' },
      { id: 'b', label: '(b) Advise discretion until a policy exists' },
      { id: 'c', label: '(c) Anecdotal reassurance, stigma overblown' },
      { id: 'd', label: '(d) Validate with data + shared vocabulary' },
    ],
  },
  kc_1_4: {
    id: 'kc_1_4',
    moduleId: 1,
    sectionId: 7,
    objectiveRef: '1.4',
    stemPreview:
      'You paste notes into AI for your weekly summary, scan for obvious errors, and send. Which…',
    preferredOptionId: 'b',
    options: [
      { id: 'a', label: '(a) Augmentation: the judgment is in my notes' },
      { id: 'b', label: '(b) Automation: substantive work is delegated' },
      { id: 'c', label: '(c) The category doesn’t matter, output does' },
      { id: 'd', label: '(d) Augmentation: I’m still the decision-maker' },
    ],
  },

  // ── Module 2 ──────────────────────────────────────────────────────────
  // Regenerated from the shipped scenario item bank (module2/
  // knowledge-check-items.tsx) — the previous entries described the
  // pre-25-05 definitional items. Option letters reflect the 09-07
  // repositioning; keep in sync with the bank AND demo-data.ts.
  kc_2_1: {
    id: 'kc_2_1',
    moduleId: 2,
    sectionId: 7,
    objectiveRef: '2.1',
    stemPreview:
      'A product manager describes her AI workflow: notes in, stakeholder summary out, names…',
    preferredOptionId: 'a',
    options: [
      { id: 'a', label: '(a) Automation classified as augmentation' },
      { id: 'b', label: '(b) She’s right — this is augmentation' },
      { id: 'c', label: '(c) Could be either; withhold judgment' },
      { id: 'd', label: '(d) Well-designed directive interaction' },
    ],
  },
  kc_2_2: {
    id: 'kc_2_2',
    moduleId: 2,
    sectionId: 7,
    objectiveRef: '2.2',
    stemPreview:
      'Your department head asks which of four work activities to prioritize for AI integration…',
    preferredOptionId: 'd',
    options: [
      { id: 'a', label: '(a) Start with Task A — highest savings' },
      { id: 'b', label: '(b) Start with Task D — safest to learn on' },
      { id: 'c', label: '(c) Deploy across all four simultaneously' },
      { id: 'd', label: '(d) Depends on the verification burden' },
    ],
  },
  kc_2_3: {
    id: 'kc_2_3',
    moduleId: 2,
    sectionId: 7,
    objectiveRef: '2.3',
    stemPreview:
      'A finance colleague uses AI extensively for two tasks and handles two others manually…',
    preferredOptionId: 'b',
    options: [
      { id: 'a', label: '(a) Her balance is right' },
      { id: 'b', label: '(b) Partially inverted vs the savings data' },
      { id: 'c', label: '(c) Add AI to all four tasks' },
      { id: 'd', label: '(d) Stop using AI for the summaries' },
    ],
  },
  kc_2_4: {
    id: 'kc_2_4',
    moduleId: 2,
    sectionId: 7,
    objectiveRef: '2.4',
    stemPreview:
      'Your HR director presents a 72% "collaborative use" survey result as proof adoption is healthy…',
    preferredOptionId: 'c',
    options: [
      { id: 'a', label: '(a) Encouraging — ahead of external benchmarks' },
      { id: 'b', label: '(b) Self-report is unreliable; discard it' },
      { id: 'c', label: '(c) Check behavioral indicators first' },
      { id: 'd', label: '(d) Interaction patterns don’t matter' },
    ],
  },

  // ── Module 3 ──────────────────────────────────────────────────────────
  // Regenerated from the shipped bank — three-option scenario items.
  kc_3_1: {
    id: 'kc_3_1',
    moduleId: 3,
    sectionId: 10,
    objectiveRef: '3.1',
    stemPreview:
      'A colleague’s AI translations: French output is strong, Vietnamese is noticeably worse…',
    preferredOptionId: 'b',
    options: [
      { id: 'a', label: '(a) Less training data — knowledge problem' },
      { id: 'b', label: '(b) Tokenization + training data; structural' },
      { id: 'c', label: '(c) Temperature settings — tune it lower' },
    ],
  },
  kc_3_2: {
    id: 'kc_3_2',
    moduleId: 3,
    sectionId: 10,
    objectiveRef: '3.2',
    stemPreview:
      'An AI-drafted competitive analysis cites a Forrester report with specific figures…',
    preferredOptionId: 'a',
    options: [
      { id: 'a', label: '(a) Verify every specific element' },
      { id: 'b', label: '(b) Looks fine — major analysts are reliable' },
      { id: 'c', label: '(c) Delete it and write manually' },
    ],
  },
  kc_3_3: {
    id: 'kc_3_3',
    moduleId: 3,
    sectionId: 10,
    objectiveRef: '3.3',
    stemPreview:
      'Three team members report three different AI failures. The best diagnostic reading…',
    preferredOptionId: 'b',
    options: [
      { id: 'a', label: '(a) All three are knowledge problems' },
      { id: 'b', label: '(b) Three distinct failure mechanisms' },
      { id: 'c', label: '(c) Parameter fixes without diagnosis' },
    ],
  },
  kc_3_4: {
    id: 'kc_3_4',
    moduleId: 3,
    sectionId: 10,
    objectiveRef: '3.4',
    stemPreview:
      'A strategy-meeting brief loads long documents; the analysis misses late-input material…',
    preferredOptionId: 'c',
    options: [
      { id: 'a', label: '(a) Model supplemented from general knowledge' },
      { id: 'b', label: '(b) Only two risks were well-supported' },
      { id: 'c', label: '(c) Context window nearly consumed' },
    ],
  },

  // ── Module 4 ──────────────────────────────────────────────────────────
  // Regenerated from the shipped bank; letters reflect the 09-07
  // repositioning.
  kc_4_1: {
    id: 'kc_4_1',
    moduleId: 4,
    sectionId: 4,
    objectiveRef: '4.1',
    stemPreview:
      'A product manager plans to delegate all four components of a quarterly product review…',
    preferredOptionId: 'd',
    options: [
      { id: 'a', label: '(a) Efficient delegation as planned' },
      { id: 'b', label: '(b) Keep all four components human-only' },
      { id: 'c', label: '(c) Mostly fine; adjust component 1' },
      { id: 'd', label: '(d) Delegate 1 + 4; keep 2 + 3 human-led' },
    ],
  },
  kc_4_2: {
    id: 'kc_4_2',
    moduleId: 4,
    sectionId: 4,
    objectiveRef: '4.2',
    stemPreview:
      'A vague social-post prompt returns generic output. The best diagnosis of the problem…',
    preferredOptionId: 'b',
    options: [
      { id: 'a', label: '(a) The AI tool’s quality is the issue' },
      { id: 'b', label: '(b) All three Description dimensions missing' },
      { id: 'c', label: '(c) Prompt length — just write more' },
      { id: 'd', label: '(d) AI isn’t reliable for creative work' },
    ],
  },
  kc_4_3: {
    id: 'kc_4_3',
    moduleId: 4,
    sectionId: 7,
    objectiveRef: '4.3',
    stemPreview:
      'An AI-drafted investment summary cites a Morgan Stanley report with precise figures…',
    preferredOptionId: 'a',
    options: [
      { id: 'a', label: '(a) Verify the citation; assess the rest' },
      { id: 'b', label: '(b) Likely reliable — specifics are plausible' },
      { id: 'c', label: '(c) Classify the whole paragraph fabricated' },
      { id: 'd', label: '(d) Send it; flag concerns verbally later' },
    ],
  },
  kc_4_4: {
    id: 'kc_4_4',
    moduleId: 4,
    sectionId: 7,
    objectiveRef: '4.4',
    stemPreview:
      'A stakeholder-update draft omits the vendor delay from its root causes. The loop says…',
    preferredOptionId: 'c',
    options: [
      { id: 'a', label: '(a) Manually patch the root-causes section' },
      { id: 'b', label: '(b) Ask the AI to self-evaluate the draft' },
      { id: 'c', label: '(c) Reformulate with the missing context' },
      { id: 'd', label: '(d) Discard it and write manually' },
    ],
  },
} satisfies Record<string, KCMetadata>;

/** KC ids as a literal union — keys of KC_METADATA, compiler-enforced
 *  so KC_IDS and consumers can index without non-null assertions. */
export type KCId = keyof typeof KC_METADATA;

export const IC_METADATA = {
  // Regenerated from the shipped bank (module1/interpretation-check-items.ts)
  // — the previous entries carried three-option summaries and two wrong
  // keys from a superseded item generation.
  ic_1_1: {
    id: 'ic_1_1',
    moduleId: 1,
    sectionId: 3,
    stemPreview:
      'A VP asks whether AI literacy training belongs in the 2026 workforce development budget…',
    preferredOptionId: 'b',
    options: [
      { id: 'a', label: '(a) Wait — skill change is declining' },
      { id: 'b', label: '(b) Prioritize — fastest-growing demand' },
      { id: 'c', label: '(c) Deprioritize — the market will solve it' },
      { id: 'd', label: '(d) Wait — expectations, not outcomes' },
    ],
  },
  ic_1_2: {
    id: 'ic_1_2',
    moduleId: 1,
    sectionId: 3,
    stemPreview:
      'A colleague says the adoption gap is mostly about access and GDP. The best reading…',
    preferredOptionId: 'b',
    options: [
      { id: 'a', label: '(a) Essentially correct — income drives it' },
      { id: 'b', label: '(b) Partially right — income explains ~70%' },
      { id: 'c', label: '(c) Wrong — no correlation in the data' },
      { id: 'd', label: '(d) Impossible to tell from this data' },
    ],
  },
  ic_1_3: {
    id: 'ic_1_3',
    moduleId: 1,
    sectionId: 3,
    stemPreview:
      'Looking at the augmentation–automation trend, which interpretation is best supported…',
    preferredOptionId: 'c',
    options: [
      { id: 'a', label: '(a) Clear automation trajectory' },
      { id: 'b', label: '(b) Too few waves to read a direction' },
      { id: 'c', label: '(c) Toward automation, but not linear' },
      { id: 'd', label: '(d) Augmentation recovered — August was noise' },
    ],
  },
} satisfies Record<string, Omit<KCMetadata, 'objectiveRef'>>;

/** IC ids as a literal union — keys of IC_METADATA. */
export type ICId = keyof typeof IC_METADATA;
