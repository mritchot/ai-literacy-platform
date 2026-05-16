// Pre-computed logit values + stem 3 outputs for the P6 NextTokenDemo
// (4C spec §9.6, §9.7).
//
// Logits are chosen so that at the default temperature (T=0.7) the
// distributions roughly match the values shown in the module content
// document (Stem 1: Paris dominates ~70-75%; Stem 2: top candidate
// ~15-20%, bottom ~8-10%, narrow spread).

export interface Candidate {
  token: string;
  baseLogit: number;
}

export interface Stem {
  id: 1 | 2 | 3;
  label: string;
  prefix: string;
  candidates: Candidate[];
  // Static residual probability mass to display as "...other tokens".
  // Cosmetic — not part of the softmax calculation.
  residualPct: number;
  residualLabel: string;
  annotation: string;
}

export const STEMS: Stem[] = [
  {
    id: 1,
    label: 'Pattern completion',
    prefix: 'The capital of France is',
    // Calibrated against the spec's target probability of ~72% for
    // Paris at T=0.7 within the 86.8% non-residual mass. With residual
    // 13.2% reserved as cosmetic, Paris at logit 2.7 reproduces ~72%.
    candidates: [
      { token: ' Paris', baseLogit: 2.7 },
      { token: ' the', baseLogit: 1.0 },
      { token: ' a', baseLogit: 0.7 },
      { token: ' located', baseLogit: 0.2 },
      { token: ' known', baseLogit: 0.0 },
      { token: ' one', baseLogit: -0.3 },
    ],
    residualPct: 13.2,
    residualLabel: '…99,994 other tokens',
    annotation:
      'This is the capability zone. The training data contained this fact so many times, from so many sources, that the probability distribution concentrates overwhelmingly on the correct answer. Temperature barely matters here; even at high settings, “Paris” dominates. The model is not “looking up” France’s capital. It is predicting the next token, and the prediction happens to be correct because the pattern is strong. A database lookup is either right or wrong. A prediction is probable or improbable. On well-worn paths, the distinction does not matter. On rarer ones, it matters enormously.',
  },
  {
    id: 2,
    label: 'Factual specificity',
    prefix:
      'According to a 2023 study published in the Journal of Applied Economics, the average cost of employee turnover is',
    candidates: [
      { token: ' $', baseLogit: 1.2 },
      { token: ' approximately', baseLogit: 1.1 },
      { token: ' between', baseLogit: 0.9 },
      { token: ' estimated', baseLogit: 0.8 },
      { token: ' reported', baseLogit: 0.6 },
      { token: ' around', baseLogit: 0.5 },
    ],
    residualPct: 12.0,
    residualLabel: '…99,994 other tokens',
    annotation:
      'This is the fabrication zone. The sentence stem looks like an academic citation, and the model has seen thousands of citation-shaped patterns in its training data. It generates a statistically plausible completion: a dollar figure that resembles a real finding and carries the same confident tone as the Paris answer. But look at the probability distribution. No single completion dominates. The model is not reporting a fact. It is choosing among several equally plausible patterns. The journal name and the statistic may both be fabricated. They satisfy the pattern. Whether they match reality is not something the mechanism can check.',
  },
  {
    id: 3,
    label: 'Variability demonstration',
    prefix:
      'According to a 2023 study published in the Journal of Applied Economics, the average cost of employee turnover is',
    candidates: [],
    residualPct: 0,
    residualLabel: '',
    annotation:
      'Three runs of the same prompt, three different numbers. The model is not reporting a fact that changes; there is no fact being consulted. It is sampling from a probability distribution that was never constrained to accuracy in the first place. At low temperature, it picks the most probable path and produces a single precise-sounding figure. At high temperature, it ventures further into the distribution and produces different figures. Both are equally fabricated. The confident-sounding one is no more reliable than the varied one. It is simply more probable, which is not the same thing.',
  },
];

interface Stem3Output {
  temperature: number;
  label: string;
  text: string;
}

export const STEM_3_OUTPUTS: Stem3Output[] = [
  {
    temperature: 0.2,
    label: 'Conservative',
    text: '$33,251 per employee, representing roughly 16.4% of annual salary across the surveyed sample.',
  },
  {
    temperature: 0.7,
    label: 'Default',
    text: 'approximately $15,000 to $40,000, depending on industry, role, and tenure of the departing employee.',
  },
  {
    temperature: 1.2,
    label: 'Exploratory',
    text: '$21,000 to $58,300, varying significantly by sector — with healthcare and tech reporting the steepest replacement costs.',
  },
];

// Apply softmax-with-temperature to a candidate set. Returns a parallel
// array of probabilities that sum to (1 - residualMass), where the
// residual is the cosmetic "...others" bucket.
export function softmaxWithTemperature(
  candidates: Candidate[],
  temperature: number,
  residualPct: number,
): number[] {
  const t = Math.max(0.05, temperature);
  const scaled = candidates.map((c) => c.baseLogit / t);
  const max = Math.max(...scaled);
  // Subtract max for numerical stability — same final probabilities, no overflow.
  const exps = scaled.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  const remainingMass = 1 - residualPct / 100;
  return exps.map((e) => (e / sum) * remainingMass);
}
