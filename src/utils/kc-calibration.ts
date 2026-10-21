// Confidence ratings on knowledge checks and the calibration summary built
// from them. Stored results come from localStorage, so every read checks the
// rating against the known levels instead of trusting the stored string.

import type { KCConfidence, KnowledgeCheckResult } from '../contexts/LearnerProgressContext';

export const CONFIDENCE_LEVELS: readonly KCConfidence[] = ['guessing', 'fairly', 'certain'];

export const CONFIDENCE_LABEL: Record<KCConfidence, string> = {
  guessing: 'Guessing',
  fairly: 'Fairly sure',
  certain: 'Certain',
};

export function isConfidence(value: unknown): value is KCConfidence {
  return value === 'guessing' || value === 'fairly' || value === 'certain';
}

/** Fewer rated items than this make the per-level ratios meaningless. */
export const MIN_RATED_FOR_CALIBRATION = 4;

export interface CalibrationBand {
  level: KCConfidence;
  rated: number;
  preferred: number;
}

export interface CalibrationSummary {
  /** Highest confidence first, the order a reader compares them in. */
  bands: CalibrationBand[];
  rated: number;
  certainMisses: number;
}

export function computeCalibration(
  results: readonly (KnowledgeCheckResult | undefined)[],
): CalibrationSummary {
  const bands: CalibrationBand[] = [...CONFIDENCE_LEVELS].reverse().map((level) => ({
    level,
    rated: 0,
    preferred: 0,
  }));
  let rated = 0;
  let certainMisses = 0;
  for (const result of results) {
    if (!result || !isConfidence(result.confidence)) continue;
    const band = bands.find((b) => b.level === result.confidence);
    if (!band) continue;
    rated += 1;
    band.rated += 1;
    if (result.isPreferred) band.preferred += 1;
    else if (result.confidence === 'certain') certainMisses += 1;
  }
  return { bands, rated, certainMisses };
}

/** Certain vs. guessing comparison, or null when either level is unrated. */
export function calibrationVerdict(summary: CalibrationSummary): string | null {
  const certain = summary.bands.find((b) => b.level === 'certain');
  const guessing = summary.bands.find((b) => b.level === 'guessing');
  if (!certain?.rated || !guessing?.rated) return null;
  return certain.preferred / certain.rated > guessing.preferred / guessing.rated
    ? 'Answers rated Certain matched the recommended response more often than guesses.'
    : 'Answers rated Certain matched the recommended response no more often than guesses, so confidence is not yet tracking accuracy.';
}
