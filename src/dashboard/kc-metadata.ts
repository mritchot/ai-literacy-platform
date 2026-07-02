// Knowledge Check + Interpretation Check display-relevant metadata for the
// analytics dashboard (4D §9.5). Static lookup — duplicates the *display-relevant
// subset* of the KC content (stem preview + option labels + preferred answer)
// so the admin chunk doesn't need to import the full module content files.
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
    preferredOptionId: 'b',
    options: [
      { id: 'a', label: '(a) GDP-and-infrastructure framing' },
      { id: 'b', label: '(b) Share workflows with institutional caveat' },
      { id: 'c', label: '(c) Decline based on use-case concentration' },
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
      { id: 'a', label: '(a) Behavioral evidence + use-case data' },
      { id: 'b', label: '(b) Adoption rate + competitive framing' },
      { id: 'c', label: '(c) Productivity multiplier framing' },
      { id: 'd', label: '(d) Skill-gap framing' },
    ],
  },
  kc_1_3: {
    id: 'kc_1_3',
    moduleId: 1,
    sectionId: 7,
    objectiveRef: '1.3',
    stemPreview:
      'Two team members produce different first drafts using AI. The work-product distinction tells you…',
    preferredOptionId: 'a',
    options: [
      { id: 'a', label: '(a) Surface-similarity vs. judgment-required' },
      { id: 'b', label: '(b) Speed-only outcome metric' },
      { id: 'c', label: '(c) Output-volume framing' },
      { id: 'd', label: '(d) Tool-skill framing' },
    ],
  },
  kc_1_4: {
    id: 'kc_1_4',
    moduleId: 1,
    sectionId: 7,
    objectiveRef: '1.4',
    stemPreview:
      'A junior analyst hides AI use because they fear it will look like cheating. The stigma data suggests…',
    preferredOptionId: 'd',
    options: [
      { id: 'a', label: '(a) Personal-coaching framing' },
      { id: 'b', label: '(b) Tool-fluency framing' },
      { id: 'c', label: '(c) Disclosure-policy framing' },
      { id: 'd', label: '(d) Norm-and-stigma framing' },
    ],
  },

  // ── Module 2 ──────────────────────────────────────────────────────────
  kc_2_1: {
    id: 'kc_2_1',
    moduleId: 2,
    sectionId: 7,
    objectiveRef: '2.1',
    stemPreview:
      'Your team uses AI heavily for first-draft writing. Augmentation vs. automation framing suggests…',
    preferredOptionId: 'a',
    options: [
      { id: 'a', label: '(a) Augmentation pattern, judgment retained' },
      { id: 'b', label: '(b) Automation pattern, supervision required' },
      { id: 'c', label: '(c) Mixed; depends on draft quality' },
      { id: 'd', label: '(d) Insufficient information' },
    ],
  },
  kc_2_2: {
    id: 'kc_2_2',
    moduleId: 2,
    sectionId: 7,
    objectiveRef: '2.2',
    stemPreview:
      'A 27% productivity gain in a workflow using directives like "make this more concise"…',
    preferredOptionId: 'b',
    options: [
      { id: 'a', label: '(a) Generalize to all writing tasks' },
      { id: 'b', label: '(b) Tied to directive specificity, not generalizable' },
      { id: 'c', label: '(c) Reflects tool maturity broadly' },
      { id: 'd', label: '(d) Driven by user expertise level' },
    ],
  },
  kc_2_3: {
    id: 'kc_2_3',
    moduleId: 2,
    sectionId: 7,
    objectiveRef: '2.3',
    stemPreview:
      'In an RCT, novices gained 35% on customer-service tasks while experts gained 11%. Reading this…',
    preferredOptionId: 'c',
    options: [
      { id: 'a', label: '(a) AI replaces expertise' },
      { id: 'b', label: '(b) Experts disadvantaged by AI' },
      { id: 'c', label: '(c) Levels narrow on routine tasks; non-routine stays expert-bounded' },
      { id: 'd', label: '(d) Sample size invalidates the result' },
    ],
  },
  kc_2_4: {
    id: 'kc_2_4',
    moduleId: 2,
    sectionId: 7,
    objectiveRef: '2.4',
    stemPreview:
      'A workflow shows speed gains but no quality gain. The judgment-vs-speed split implies…',
    preferredOptionId: 'a',
    options: [
      { id: 'a', label: '(a) Speed gains do not imply judgment gains' },
      { id: 'b', label: '(b) Quality is bottlenecked by tool capability' },
      { id: 'c', label: '(c) Workflow needs more AI integration' },
      { id: 'd', label: '(d) User skill is the limiting factor' },
    ],
  },

  // ── Module 3 ──────────────────────────────────────────────────────────
  kc_3_1: {
    id: 'kc_3_1',
    moduleId: 3,
    sectionId: 10,
    objectiveRef: '3.1',
    stemPreview:
      'A response splits "unbreakable" into "un | break | able". The tokenization implies…',
    preferredOptionId: 'b',
    options: [
      { id: 'a', label: '(a) Word-level tokenizer behavior' },
      { id: 'b', label: '(b) BPE-style sub-word; tokens ≠ words' },
      { id: 'c', label: '(c) Character-level tokenization' },
      { id: 'd', label: '(d) Random fragmentation' },
    ],
  },
  kc_3_2: {
    id: 'kc_3_2',
    moduleId: 3,
    sectionId: 10,
    objectiveRef: '3.2',
    stemPreview:
      'You paste a 50-page memo and ask the model to summarize. It misses the second-half conclusion. Most likely cause…',
    preferredOptionId: 'a',
    options: [
      { id: 'a', label: '(a) Context window truncation' },
      { id: 'b', label: '(b) Tokenizer mishandling' },
      { id: 'c', label: '(c) Temperature too high' },
      { id: 'd', label: '(d) Random hallucination' },
    ],
  },
  kc_3_3: {
    id: 'kc_3_3',
    moduleId: 3,
    sectionId: 10,
    objectiveRef: '3.3',
    stemPreview:
      'Running the same prompt twice with temperature 0.7 yields different answers. This reflects…',
    preferredOptionId: 'c',
    options: [
      { id: 'a', label: '(a) Tokenizer non-determinism' },
      { id: 'b', label: '(b) Server-side variance' },
      { id: 'c', label: '(c) Probabilistic next-token sampling' },
      { id: 'd', label: '(d) A bug in the model' },
    ],
  },
  kc_3_4: {
    id: 'kc_3_4',
    moduleId: 3,
    sectionId: 10,
    objectiveRef: '3.4',
    stemPreview:
      'A diagnostic pair lets you isolate which mechanism caused a failure. The right pair compares…',
    preferredOptionId: 'a',
    options: [
      { id: 'a', label: '(a) Two prompts that differ along a single mechanism axis' },
      { id: 'b', label: '(b) Two prompts that differ along all axes' },
      { id: 'c', label: '(c) Two outputs from different models' },
      { id: 'd', label: '(d) Two outputs from the same prompt' },
    ],
  },

  // ── Module 4 ──────────────────────────────────────────────────────────
  kc_4_1: {
    id: 'kc_4_1',
    moduleId: 4,
    sectionId: 4,
    objectiveRef: '4.1',
    stemPreview:
      'You face a competitive analysis task. Decomposition into Human-Only / Assisted / Delegated requires…',
    preferredOptionId: 'b',
    options: [
      { id: 'a', label: '(a) Default to Fully Delegated for speed' },
      { id: 'b', label: '(b) Match each component to its reliability profile' },
      { id: 'c', label: '(c) Default to Human-Only when in doubt' },
      { id: 'd', label: '(d) Skip decomposition; iterate later' },
    ],
  },
  kc_4_2: {
    id: 'kc_4_2',
    moduleId: 4,
    sectionId: 4,
    objectiveRef: '4.2',
    stemPreview:
      'A weak prompt produced a fluent but wrong output. The reformulation framework prioritizes…',
    preferredOptionId: 'c',
    options: [
      { id: 'a', label: '(a) Add length constraints' },
      { id: 'b', label: '(b) Add style instructions' },
      { id: 'c', label: '(c) Specify Product / Process / Performance criteria' },
      { id: 'd', label: '(d) Try a different model' },
    ],
  },
  kc_4_3: {
    id: 'kc_4_3',
    moduleId: 4,
    sectionId: 7,
    objectiveRef: '4.3',
    stemPreview:
      'You spot a fabricated statistic in an AI output. The verification loop says next step is…',
    preferredOptionId: 'd',
    options: [
      { id: 'a', label: '(a) Accept and ship; cite the source' },
      { id: 'b', label: '(b) Re-prompt with the same framing' },
      { id: 'c', label: '(c) Lower the temperature' },
      { id: 'd', label: '(d) Diagnose and reformulate' },
    ],
  },
  kc_4_4: {
    id: 'kc_4_4',
    moduleId: 4,
    sectionId: 7,
    objectiveRef: '4.4',
    stemPreview:
      'After three refinement turns the output is acceptable but not great. Description→Discernment loop says…',
    preferredOptionId: 'a',
    options: [
      { id: 'a', label: '(a) Accept; further refinement has diminishing returns' },
      { id: 'b', label: '(b) Continue refining until perfect' },
      { id: 'c', label: '(c) Restart with a new prompt' },
      { id: 'd', label: '(d) Hand-edit final output' },
    ],
  },
} satisfies Record<string, KCMetadata>;

/** KC ids as a literal union — keys of KC_METADATA, compiler-enforced
 *  so KC_IDS and consumers can index without non-null assertions. */
export type KCId = keyof typeof KC_METADATA;

export const IC_METADATA = {
  ic_1_1: {
    id: 'ic_1_1',
    moduleId: 1,
    sectionId: 3,
    stemPreview:
      'Story 1 — adoption rates. The variation across regions reflects…',
    preferredOptionId: 'b',
    options: [
      { id: 'a', label: '(a) Pure infrastructure access' },
      { id: 'b', label: '(b) Institutional + economic + access factors' },
      { id: 'c', label: '(c) Inevitable convergence' },
    ],
  },
  ic_1_2: {
    id: 'ic_1_2',
    moduleId: 1,
    sectionId: 3,
    stemPreview:
      'Story 2 — use-case mix. The 57/43 split between augmentation and automation suggests…',
    preferredOptionId: 'a',
    options: [
      { id: 'a', label: '(a) Augmentation dominates; human judgment central' },
      { id: 'b', label: '(b) Workforce already automated' },
      { id: 'c', label: '(c) Automation will overtake within a year' },
    ],
  },
  ic_1_3: {
    id: 'ic_1_3',
    moduleId: 1,
    sectionId: 3,
    stemPreview:
      'Story 3 — task concentration. Lower-adoption regions skew toward coding; this means…',
    preferredOptionId: 'b',
    options: [
      { id: 'a', label: '(a) Those regions have ceiling on AI use' },
      { id: 'b', label: '(b) Current adoption maturity, not inherent limitation' },
      { id: 'c', label: '(c) Coding is the only viable use case' },
    ],
  },
} satisfies Record<string, Omit<KCMetadata, 'objectiveRef'>>;

/** IC ids as a literal union — keys of IC_METADATA. */
export type ICId = keyof typeof IC_METADATA;
