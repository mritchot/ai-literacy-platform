// Shared configuration for the evaluation-framework artifact pages.
// Public portfolio documents reached from the blog and the course. The
// registry drives the hub index cards and gives each reading page its title
// and PDF slug; the constants gate the "Download PDF" buttons and the hub's
// write-up link until those resources exist.

import type { ArtifactMeta, SeriesConfig } from '../artifact-series/artifact-series';

export type { ArtifactMeta, ArtifactType } from '../artifact-series/artifact-series';

export const ARTIFACTS: ArtifactMeta[] = [
  {
    slug: 'level-1-reaction',
    route: 'evaluation/level-1-reaction',
    title: 'Level 1: Reaction',
    blurb:
      'The post-program reaction survey, designed so every item drives a specific program change rather than collecting unactionable satisfaction.',
    type: 'Reading',
  },
  {
    slug: 'level-2-learning',
    route: 'evaluation/level-2-learning',
    title: 'Level 2: Learning',
    blurb:
      'The scenario-based pre/post assessment, the parallel-form design that resists gaming, and the one tier with real validation data behind it.',
    type: 'Reading',
  },
  {
    slug: 'level-3-behavior',
    route: 'evaluation/level-3-behavior',
    title: 'Level 3: Behavior',
    blurb:
      'Manager evidence review and participant self-assessment at 30, 60, and 90 days, scored on the 4D framework to measure what people do with AI, not how much.',
    type: 'Reading',
  },
  {
    slug: 'level-4-results',
    route: 'evaluation/level-4-results',
    title: 'Level 4: Results',
    blurb:
      'The KPI framework, isolation methodology, and ROI model that connect behavior change to organizational outcomes without the volume-ROI fallacy.',
    type: 'Reading',
  },
];

// Empty until the polished PDFs land in `public/evaluation/`; while empty the
// per-page "Download PDF" button is hidden so it never points at a 404.
// Populate e.g. `level-1-reaction: 'evaluation/level-1-reaction.pdf'`.
export const ARTIFACT_PDFS: Record<string, string> = {
  'level-1-reaction': 'evaluation/level-1-reaction.pdf',
  'level-2-learning': 'evaluation/level-2-learning.pdf',
  'level-3-behavior': 'evaluation/level-3-behavior.pdf',
  'level-4-results': 'evaluation/level-4-results.pdf',
};

// Long-form blog post that frames the series on ritchot.me. Empty until the
// post is published; the hub's write-up link is hidden while empty.
export const EVALUATION_WRITEUP_URL = 'https://ritchot.me/the-evaluation-framework-for-my-ai-literacy-course/';

// Series accent — Discernment slate from the 4D palette. Evaluation is the
// discernment work of the project, so it carries its own quiet accent while
// staying in the same behind-the-scenes home as the needs analysis.
export const SERIES_ACCENT = '#5E7080';

// Bound series configuration consumed by ./chrome (which re-exports the
// shared artifact-series components with this series baked in).
export const SERIES: SeriesConfig = {
  hubRoute: 'evaluation',
  hubLabel: 'Evaluation framework',
  backToSeriesLabel: 'Back to the evaluation framework',
  readingEyebrow: 'Evaluation framework · Reading',
  accent: SERIES_ACCENT,
  artifacts: ARTIFACTS,
  pdfs: ARTIFACT_PDFS,
};
