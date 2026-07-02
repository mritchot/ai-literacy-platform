// scatter-data — pure regression math behind the GDP correlation
// scatter (P1). Extracted from GDPCorrelationScatter.tsx so the OLS
// derivation is unit-testable without mounting Recharts; the component
// keeps thin useMemo wrappers over these functions.

import type { GeoCountry } from './GeographicAdoptionChart';

// Power-law fit parameters from the source paper (Appel, McCrory &
// Tamkin, Sep 2025, Figure 2.4). Slope and R² are published constants;
// intercept is derived at runtime from the data centroid so the line
// passes through (mean(lnGDP), mean(lnAUI)) — the OLS property that
// guarantees residuals sum to zero and points distribute evenly above
// and below the trendline.
export const BETA = 0.69;
export const R_SQUARED = 0.709;

export const TIER_NAMES = ['Leading', 'Upper Middle', 'Lower Middle', 'Emerging'] as const;
export type TierName = (typeof TIER_NAMES)[number];

export interface ScatterPoint {
  iso3: string;
  country: string;
  tier: TierName;
  aui: number;
  gdpPerWorkingAgeCap: number;
  lnAui: number;
  lnGdp: number;
  /** Residual in log space (lnAui − predicted). */
  residualLn: number;
  /** Plain-language % difference between actual AUI and the AUI that
   *  the regression would predict from income alone. Positive = above
   *  the line (adopting faster than predicted). */
  pctVsPredicted: number;
}

export interface ScatterData {
  seriesByTier: Record<TierName, ScatterPoint[]>;
  /** Standard error of log-space residuals (n−2 dof) — drawn as the
   *  prediction band. */
  residualSE: number;
  allPoints: ScatterPoint[];
  intercept: number;
}

// Compute scatter points + residuals + SE in a single pass. SE is
// used to draw the prediction band; pctVsPredicted is shown in the
// tooltip in plain language.
export function computeScatterData(countries: GeoCountry[]): ScatterData {
  // First pass: compute means of lnAUI and lnGDP to derive the OLS
  // intercept (the line must pass through the centroid).
  let sumLnAui = 0;
  let sumLnGdp = 0;
  let count = 0;
  for (const c of countries) {
    const tier = c.tier as TierName;
    if (!TIER_NAMES.includes(tier)) continue;
    if (c.aui <= 0 || c.gdpPerWorkingAgeCap <= 0) continue;
    sumLnAui += Math.log(c.aui);
    sumLnGdp += Math.log(c.gdpPerWorkingAgeCap);
    count += 1;
  }
  const intercept = count > 0 ? sumLnAui / count - BETA * (sumLnGdp / count) : -5.99;

  // Second pass: compute residuals and scatter points.
  const points: ScatterPoint[] = [];
  let sumSq = 0;
  let n = 0;
  for (const c of countries) {
    const tier = c.tier as TierName;
    if (!TIER_NAMES.includes(tier)) continue;
    if (c.aui <= 0 || c.gdpPerWorkingAgeCap <= 0) continue;
    const lnAui = Math.log(c.aui);
    const lnGdp = Math.log(c.gdpPerWorkingAgeCap);
    const predictedLn = BETA * lnGdp + intercept;
    const residualLn = lnAui - predictedLn;
    const predictedAui = Math.exp(predictedLn);
    const pctVsPredicted = ((c.aui - predictedAui) / predictedAui) * 100;
    points.push({
      iso3: c.iso3,
      country: c.country,
      tier,
      aui: c.aui,
      gdpPerWorkingAgeCap: c.gdpPerWorkingAgeCap,
      lnAui,
      lnGdp,
      residualLn,
      pctVsPredicted,
    });
    sumSq += residualLn * residualLn;
    n += 1;
  }
  // Standard error of residuals, n-2 degrees of freedom (one each for
  // slope and intercept). Unexplained scatter around the regression.
  const residualSE = Math.sqrt(sumSq / Math.max(n - 2, 1));
  const seriesByTier: Record<TierName, ScatterPoint[]> = {
    Leading: [],
    'Upper Middle': [],
    'Lower Middle': [],
    Emerging: [],
  };
  for (const p of points) seriesByTier[p.tier].push(p);
  return { seriesByTier, residualSE, allPoints: points, intercept };
}

// The N countries adopting fastest relative to what income alone would
// predict (positive residual, above the regression line) and the N
// adopting slowest (negative residual, below the line).
export function computeOutliers(
  allPoints: ScatterPoint[],
  n = 5,
): { fasterOutliers: ScatterPoint[]; slowerOutliers: ScatterPoint[] } {
  const sortedDesc = [...allPoints].sort((a, b) => b.pctVsPredicted - a.pctVsPredicted);
  return {
    fasterOutliers: sortedDesc.slice(0, n),
    slowerOutliers: sortedDesc.slice(-n).reverse(),
  };
}
