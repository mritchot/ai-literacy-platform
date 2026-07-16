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
    // Interactive: the page embeds the live ROI calculator and labels
    // itself "Evaluation framework · Interactive" — the hub card tag and
    // CTA verb now match that.
    type: 'Interactive',
    openLabel: 'Open the calculator',
  },
];

// All four polished PDFs ship from `public/evaluation/`. An empty entry
// hides that page's "Download PDF" button so it never points at a 404.
export const ARTIFACT_PDFS: Record<string, string> = {
  'level-1-reaction': 'evaluation/level-1-reaction.pdf',
  'level-2-learning': 'evaluation/level-2-learning.pdf',
  'level-3-behavior': 'evaluation/level-3-behavior.pdf',
  'level-4-results': 'evaluation/level-4-results.pdf',
};

// Long-form blog post that frames the series on ritchot.me. The individual
// series posts were retired 08-07-2026 in favor of a single consolidated
// write-up, which all three series hubs now point at. The hub's write-up link
// stays hidden while this is empty.
export const EVALUATION_WRITEUP_URL =
  'https://ritchot.me/writing/i-built-an-ai-literacy-course/';

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
