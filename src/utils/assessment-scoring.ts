// assessment-scoring — pre/post scoring shared by the results screen,
// the competency profile and its PDF, and the analytics dashboard, so
// every surface reports the same numbers from the same rules.
//
// Two rules need one home:
//   • A learner whose pre-assessment predates the twelve-item form has
//     no pre responses for the constructs added later. Those constructs
//     are scored on the post side but left out of the change, so the
//     change compares like with like.
//   • A short form has a ceiling, so a raw change cannot separate 8→10
//     from 4→6. Normalized gain, (post − pre) ÷ (max − pre), reports the
//     share of the available improvement achieved (Hake, 1998).

import type { AssessmentBlock } from '../data/pre-assessment';

interface ScoredResponse {
  isCorrect: boolean;
}

type ScoredResponses = Readonly<Record<string, ScoredResponse>>;

interface PairableItem {
  id: string;
  construct: string;
  constructKey: string;
  block: AssessmentBlock;
}

interface PairablePostItem extends PairableItem {
  parallelPreId: string;
}

/** A pre score at or above this share of the compared constructs reads
 *  as a strong baseline when the score does not change. */
export const STRONG_BASELINE_SHARE = 0.8;

/** Answers given faster than this are flagged as possible rapid guesses
 *  (response-time effort; Wise & Kong, 2005). Mobile timing is noisy,
 *  so the flag prompts a look at engagement and never changes a score. */
export const RAPID_RESPONSE_MS = 10_000;

export interface ConstructOutcome {
  constructKey: string;
  construct: string;
  block: AssessmentBlock;
  preItemId: string;
  postItemId: string;
  /** null when the pre record has no response for this construct. */
  pre: boolean | null;
  /** null when the post record has no response for this construct. */
  post: boolean | null;
}

/** Join the two forms by `parallelPreId`, in post-form order, and attach
 *  the learner's correctness on each side. */
export function constructOutcomes(
  preItems: readonly PairableItem[],
  postItems: readonly PairablePostItem[],
  preResponses: ScoredResponses,
  postResponses: ScoredResponses,
): ConstructOutcome[] {
  const outcomes: ConstructOutcome[] = [];
  for (const post of postItems) {
    const pre = preItems.find((p) => p.id === post.parallelPreId);
    if (!pre) continue;
    outcomes.push({
      constructKey: post.constructKey,
      construct: post.construct,
      block: post.block,
      preItemId: pre.id,
      postItemId: post.id,
      pre: preResponses[pre.id]?.isCorrect ?? null,
      post: postResponses[post.id]?.isCorrect ?? null,
    });
  }
  return outcomes;
}

export interface GrowthSummary {
  /** Correct pre responses, over `preAnswered`. */
  preCorrect: number;
  preAnswered: number;
  /** Correct post responses, over `postAnswered`. */
  postCorrect: number;
  /** Post responses recorded. Below `postTotal` only when the post was
   *  taken on the earlier ten-item form. */
  postAnswered: number;
  /** Items on the current post form. */
  postTotal: number;
  /** Constructs answered on both forms. The change and the normalized
   *  gain are computed over these alone. */
  compared: number;
  comparedPreCorrect: number;
  comparedPostCorrect: number;
  change: number;
  /** null when the baseline already scored every compared construct. */
  normalizedGain: number | null;
  /** Constructs with a post response but no pre response. */
  notInBaseline: ConstructOutcome[];
}

export function summarizeGrowth(outcomes: readonly ConstructOutcome[]): GrowthSummary {
  const answeredPre = outcomes.filter((o) => o.pre !== null);
  const compared = outcomes.filter((o) => o.pre !== null && o.post !== null);
  const comparedPreCorrect = compared.filter((o) => o.pre === true).length;
  const comparedPostCorrect = compared.filter((o) => o.post === true).length;
  const change = comparedPostCorrect - comparedPreCorrect;
  return {
    preCorrect: answeredPre.filter((o) => o.pre === true).length,
    preAnswered: answeredPre.length,
    postCorrect: outcomes.filter((o) => o.post === true).length,
    postAnswered: outcomes.filter((o) => o.post !== null).length,
    postTotal: outcomes.length,
    compared: compared.length,
    comparedPreCorrect,
    comparedPostCorrect,
    change,
    normalizedGain:
      comparedPreCorrect < compared.length ? change / (compared.length - comparedPreCorrect) : null,
    notInBaseline: outcomes.filter((o) => o.pre === null && o.post !== null),
  };
}

export type GrowthReading = 'gain' | 'drop' | 'held-strong' | 'held-stalled';

export function readGrowth(summary: GrowthSummary): GrowthReading {
  if (summary.change > 0) return 'gain';
  if (summary.change < 0) return 'drop';
  // With no construct answered on both forms there is no baseline to hold.
  if (summary.compared === 0) return 'held-stalled';
  return summary.comparedPreCorrect >= STRONG_BASELINE_SHARE * summary.compared
    ? 'held-strong'
    : 'held-stalled';
}

/** Label for a zero change, which depends on where the learner started. */
export function heldLabel(summary: GrowthSummary): string {
  return readGrowth(summary) === 'held-strong' ? 'Strong baseline held' : 'No change yet';
}

/** The normalized-gain sentence shown under the raw change. Omitted for
 *  a zero or negative change, where the raw number says enough. */
export function gainSentence(summary: GrowthSummary): string | null {
  if (summary.compared > 0 && summary.normalizedGain === null) return 'Full score at baseline';
  if (summary.normalizedGain === null || summary.change <= 0) return null;
  return `You closed ${Math.round(summary.normalizedGain * 100)}% of the gap between your baseline and a full score`;
}

export interface BlockOutcome {
  block: AssessmentBlock;
  preCorrect: number;
  preAnswered: number;
  postCorrect: number;
  postAnswered: number;
  postTotal: number;
  /** Over the block's constructs answered on both forms. */
  change: number;
}

export function blockOutcomes(outcomes: readonly ConstructOutcome[]): BlockOutcome[] {
  const order: AssessmentBlock[] = ['usage', 'failure', 'mechanics', 'evaluation'];
  return order
    .map((block) => {
      const inBlock = outcomes.filter((o) => o.block === block);
      const summary = summarizeGrowth(inBlock);
      return {
        block,
        preCorrect: summary.preCorrect,
        preAnswered: summary.preAnswered,
        postCorrect: summary.postCorrect,
        postAnswered: summary.postAnswered,
        postTotal: summary.postTotal,
        change: summary.change,
      };
    })
    .filter((b) => b.postTotal > 0);
}
