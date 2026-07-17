// Shared configuration for the needs-analysis artifact pages.
//
// These are public portfolio documents reached from the blog and from the
// thank-you page. The registry below drives the hub index cards and gives
// each reading page its title and PDF slug; the constants gate the
// "Download PDF" buttons and the hub's blog write-up link until those
// resources exist (same conditional-render pattern as STRIPE_TIP_URL /
// WRITEUP_URL in ThankYou.tsx).

import type { ArtifactMeta, SeriesConfig } from '../artifact-series/artifact-series';

export type { ArtifactMeta, ArtifactType } from '../artifact-series/artifact-series';

// Canonical reading order.
export const ARTIFACTS: ArtifactMeta[] = [
  {
    slug: 'executive-problem-statement',
    route: 'needs-analysis/problem-statement',
    title: 'Executive Problem Statement',
    blurb:
      'The workforce problem the program addresses, in one page: AI tools are available, the judgment to use them well is not.',
    type: 'Reading',
  },
  {
    slug: 'capability-gap-analysis',
    route: 'needs-analysis/capability-gap',
    title: 'Market-Level Capability Gap Analysis',
    blurb:
      'The market evidence — adoption without competency — and why existing AI training measures completion rather than judgment.',
    type: 'Reading',
  },
  {
    slug: 'learner-persona',
    route: 'needs-analysis/learner-persona',
    title: 'Evidence-Based Learner Persona',
    blurb:
      'Who the program is for: a research-composite of the mid-career knowledge professional, built from documented behavior, not assumption.',
    type: 'Reading',
  },
  {
    slug: 'action-map',
    route: 'needs-analysis/action-map',
    title: 'Action Map',
    blurb:
      'The interactive map tracing every target behavior to a practice activity and reference, organized by the 4D competency framework.',
    type: 'Interactive',
  },
];

// Polished PDFs are produced separately (Claude Design) and dropped into
// `public/needs-analysis/`, mirroring the `public/reference/*.pdf`
// convention that `vite-plugin-singlefile` leaves as standalone files in
// `dist/`. Each value is the href to that PDF; while it is empty the page's
// "Download PDF" button is hidden so it never points at a 404. Populate a
// slug with e.g. `needs-analysis/executive-problem-statement.pdf` (relative
// to index.html, matching the `reference/...` links elsewhere — relative so
// downloads work over file:// and sub-path hosting).
export const ARTIFACT_PDFS: Record<string, string> = {
  'executive-problem-statement': 'needs-analysis/executive-problem-statement.pdf',
  'capability-gap-analysis': 'needs-analysis/capability-gap-analysis.pdf',
  'learner-persona': 'needs-analysis/learner-persona.pdf',
  'action-map': 'needs-analysis/action-map.pdf',
};

// Long-form blog post that frames the needs-analysis series on ritchot.me.
// The individual series posts were retired 08-07-2026 in favor of a single
// consolidated write-up, which all three series hubs now point at. The hub's
// write-up link stays hidden while this is empty.
export const NEEDS_ANALYSIS_WRITEUP_URL =
  'https://ritchot.me/writing/i-built-an-ai-literacy-course/';

// Series accent — the diligence purple already used on the thank-you page's
// "artifact" cards. The needs analysis is part of the same behind-the-scenes
// home, so it carries the same quiet accent to tie the set together. Used
// only as a thin decorative rule/border, never as a competency tag.
export const SERIES_ACCENT = 'rgb(var(--diligence))';

// Bound series configuration consumed by ./chrome (which re-exports the
// shared artifact-series components with this series baked in).
export const SERIES: SeriesConfig = {
  hubRoute: 'needs-analysis',
  hubLabel: 'Needs analysis',
  backToSeriesLabel: 'Back to the needs analysis',
  readingEyebrow: 'Needs Analysis · Reading',
  accent: SERIES_ACCENT,
  artifacts: ARTIFACTS,
  pdfs: ARTIFACT_PDFS,
};
