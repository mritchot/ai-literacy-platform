// Shared configuration for the "Behind the build" artifact pages.
//
// Public portfolio documents reached from the About page and, after deploy,
// from the series-finale blog post. The registry below drives the hub's two
// grouped card grids (Design, Project Management) and gives each page its
// title, blurb, and series ordering (which the footer pager threads through).
// Mirrors src/pages/evaluation/config.ts. The build series ships seven
// artifact PDFs in public/build/ (every page except the Design System, whose
// living style guide stays interactive-only); ARTIFACT_PDFS below wires each
// page's "Download PDF" button to its file.

import type { ArtifactMeta, SeriesConfig } from '../artifact-series/artifact-series';

export type { ArtifactMeta, ArtifactType } from '../artifact-series/artifact-series';

// Canonical reading order: the three design artifacts, then the five
// project-management artifacts. `group` drives the hub's labeled grids;
// `openLabel` overrides the card verb for the interactive pages.
export const ARTIFACTS: ArtifactMeta[] = [
  {
    slug: 'learning-architecture',
    route: 'build/learning-architecture',
    title: 'Learning Architecture',
    blurb:
      'The four-module map: competency emphasis, practice activities, performance objectives, and the assessment tiers that feed the Kirkpatrick evaluation, with every module expandable down to its objectives and activities.',
    type: 'Interactive',
    group: 'Design',
    openLabel: 'Explore',
  },
  {
    slug: 'design-system',
    route: 'build/design-system',
    title: 'Design System',
    blurb:
      'The living style guide rendered from the platform’s own tokens: 4D competency, neutral, feedback, and action swatches, the Source Serif 4 / IBM Plex type scale, and a component gallery in both light and dark modes.',
    type: 'Interactive',
    group: 'Design',
    openLabel: 'Open',
  },
  {
    slug: 'architecture',
    route: 'build/architecture',
    title: 'Architecture Decisions',
    blurb:
      'Every technical decision behind the platform (framework, routing, styling, charting, state, data, deployment) as an expandable record, including the two hosts evaluated and declined.',
    type: 'Interactive',
    group: 'Design',
    openLabel: 'Browse',
  },
  {
    slug: 'timeline',
    route: 'build/timeline',
    title: 'Project Timeline',
    blurb:
      'The ~8-week solo build set against a 24–33-week five-person organizational plan, led by effort: ~210 focused hours against a ~735-hour industry baseline for comparable e-learning.',
    type: 'Interactive',
    group: 'Project Management',
    openLabel: 'View',
  },
  {
    slug: 'raci',
    route: 'build/raci',
    title: 'RACI Matrix',
    blurb:
      'Thirty-two activities across six phases against five roles, color-coded R/A/C/I and filterable: the responsibility model a team would run, compared against a solo build.',
    type: 'Interactive',
    group: 'Project Management',
    openLabel: 'Open',
  },
  {
    slug: 'resources',
    route: 'build/resources',
    title: 'Resource & Budget Plan',
    blurb:
      'The $260 solo direct cost against a $190K–258K organizational budget, the per-role FTE allocation, and the custom-platform-versus-Articulate rationale.',
    type: 'Interactive',
    group: 'Project Management',
    openLabel: 'View',
  },
  {
    slug: 'communications',
    route: 'build/communications',
    title: 'Stakeholder Communications',
    blurb:
      'Two annotated samples in the L&D-Manager voice (a weekly status update and a design-review summary), framed as organizational-context exemplars.',
    type: 'Reading',
    group: 'Project Management',
  },
  {
    slug: 'quality',
    route: 'build/quality',
    title: 'QA Dashboard',
    blurb:
      'The quality-assurance system: the ten-pass verification record, the triple-validation data protocol, and the eight-check capability framework.',
    type: 'Interactive',
    group: 'Project Management',
    openLabel: 'Open',
  },
];

// Seven polished artifact PDFs in public/build/, one per page except the
// Design System (the living style guide stays interactive-only). A slug's
// presence here reveals its "Download PDF" button; absence hides it (same
// conditional-render contract as the other two series).
export const ARTIFACT_PDFS: Record<string, string> = {
  'learning-architecture': 'build/learning-architecture.pdf',
  'architecture': 'build/architecture.pdf',
  'timeline': 'build/timeline.pdf',
  'raci': 'build/raci.pdf',
  'resources': 'build/resources.pdf',
  'communications': 'build/communications.pdf',
  'quality': 'build/quality.pdf',
};

// Series accent — Description bronze from the 4D palette. Each behind-the-
// scenes series carries one quiet 4D accent used only as a thin decorative
// rule / card top-border (never as a competency tag): evaluation uses
// Discernment slate, needs-analysis uses Diligence purple, and the build
// series uses Description bronze — the "specify it precisely" competency,
// fitting for the design-and-project-management work of the build.
export const SERIES_ACCENT = 'rgb(var(--description))';

// Bound series configuration consumed by ./chrome (which re-exports the
// shared artifact-series components with this series baked in).
export const SERIES: SeriesConfig = {
  hubRoute: 'build',
  hubLabel: 'Behind the build',
  backToSeriesLabel: 'Back to the build',
  readingEyebrow: 'Behind the build · Reading',
  accent: SERIES_ACCENT,
  artifacts: ARTIFACTS,
  pdfs: ARTIFACT_PDFS,
};
