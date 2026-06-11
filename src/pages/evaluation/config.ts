// Shared configuration for the evaluation-framework artifact pages.
// Public portfolio documents reached from the blog and the course. The
// registry drives the hub index cards and gives each reading page its title
// and PDF slug; the constants gate the "Download PDF" buttons and the hub's
// write-up link until those resources exist.

export type ArtifactType = 'Reading' | 'Interactive';

export interface ArtifactMeta {
  slug: string;
  route: string;
  title: string;
  blurb: string;
  type: ArtifactType;
}

export const ARTIFACTS: ArtifactMeta[] = [
  {
    slug: 'level-1-reaction',
    route: 'evaluation/level-1-reaction',
    title: 'Level 1: Reaction',
    blurb:
      'The post-program reaction survey, built so every item drives a specific design change rather than collecting unactionable satisfaction.',
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
// Populate e.g. `level-1-reaction: '/evaluation/level-1-reaction.pdf'`.
export const ARTIFACT_PDFS: Record<string, string> = {
  'level-1-reaction': '',
  'level-2-learning': '',
  'level-3-behavior': '',
  'level-4-results': '',
};

// Long-form blog post that frames the series on ritchot.me. Empty until the
// post is published; the hub's write-up link is hidden while empty.
export const EVALUATION_WRITEUP_URL = '';

// Series accent — Discernment slate from the 4D palette. Evaluation is the
// discernment work of the project, so it carries its own quiet accent while
// staying in the same behind-the-scenes home as the needs analysis.
export const SERIES_ACCENT = '#5E7080';
