// Shared chrome for the evaluation-framework artifact pages — the toolbar,
// the PDF download affordance, the series eyebrow, and the footer back-links.
// Reused across the reading pages and (in part) the hub.

import { ARTIFACTS, ARTIFACT_PDFS, SERIES_ACCENT } from './config';

const TEXT_LINK =
  'inline-flex items-center gap-1.5 font-sans text-[13px] font-medium text-secondary no-underline transition-colors hover:text-ink';

// "Download PDF" — hidden entirely while the per-slug constant is empty, so
// it never points at a 404 before the polished PDF lands.
export function PdfDownload({ slug }: { slug: string }): JSX.Element | null {
  const href = ARTIFACT_PDFS[slug];
  if (!href || href.trim().length === 0) return null;
  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-2 rounded-md font-sans text-[13px] font-semibold text-ink no-underline hover:bg-surface"
      style={{ background: 'transparent', border: '1.5px solid rgb(var(--border))', padding: '8px 16px' }}
    >
      Download PDF
      <span aria-hidden="true">↓</span>
    </a>
  );
}

// Top bar: back-to-hub link on the left, PDF download on the right.
export function ArtifactTopBar({ pdfSlug }: { pdfSlug: string }): JSX.Element {
  return (
    <div className="mb-8 flex items-center justify-between gap-4 border-b border-border-light pb-5">
      <a href="#/evaluation" className={TEXT_LINK}>
        <span aria-hidden="true">←</span> Evaluation framework
      </a>
      <PdfDownload slug={pdfSlug} />
    </div>
  );
}

// Accent tick + category label. The tick uses the series accent only as a
// thin decorative rule (never a competency tag).
export function SeriesEyebrow({ label }: { label: string }): JSX.Element {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="block h-[3px] w-8 rounded-full"
        style={{ background: SERIES_ACCENT }}
      />
      <span
        className="font-mono text-overline font-semibold uppercase text-tertiary"
        style={{ letterSpacing: '0.12em' }}
      >
        {label}
      </span>
    </div>
  );
}

// Footer: a prev/next pager through the series. Left goes to the previous
// artifact, falling back to the series hub on the first one; right goes to
// the next artifact, falling back to "Back to the course" on the last as a
// deliberate end-of-series capstone. The sidebar's program title always
// links home, so the interior pages lose no navigation either way.
export function ArtifactFooter({ currentSlug }: { currentSlug: string }): JSX.Element {
  const idx = ARTIFACTS.findIndex((a) => a.slug === currentSlug);
  const prev = idx > 0 ? ARTIFACTS[idx - 1] : undefined;
  const next = idx >= 0 ? ARTIFACTS[idx + 1] : undefined;
  return (
    <div className="mt-14 flex flex-col gap-3 border-t border-border-light pt-6 sm:flex-row sm:items-center sm:justify-between">
      {prev ? (
        <a href={`#/${prev.route}`} className={TEXT_LINK}>
          <span aria-hidden="true">←</span> Previous: {prev.title}
        </a>
      ) : (
        <a href="#/evaluation" className={TEXT_LINK}>
          <span aria-hidden="true">←</span> Back to the evaluation framework
        </a>
      )}
      {next ? (
        <a href={`#/${next.route}`} className={TEXT_LINK}>
          Next: {next.title} <span aria-hidden="true">→</span>
        </a>
      ) : (
        <a href="#/" className={TEXT_LINK}>
          Back to the course <span aria-hidden="true">→</span>
        </a>
      )}
    </div>
  );
}
