// Chrome for the evaluation artifact pages — the shared artifact-series
// components bound to this series' configuration. The implementations
// live in src/pages/artifact-series/artifact-series.tsx.

import { createArtifactSeries } from '../artifact-series/artifact-series';
import { SERIES } from './config';

export { TEXT_LINK } from '../artifact-series/artifact-series';
export const {
  ArtifactTopBar,
  SeriesEyebrow,
  ArtifactFooter,
  ReadingArtifact,
  ArtifactHub,
} = createArtifactSeries(SERIES);
