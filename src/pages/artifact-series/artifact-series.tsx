// artifact-series — shared chrome + layouts for the standalone artifact
// page families (needs-analysis, evaluation). Each family binds its
// SeriesConfig once via createArtifactSeries() and re-exports the bound
// components from its own chrome.tsx, so page files keep their imports.
// Extracted from two ~350-line near-identical copies that had already
// begun to drift (eyebrow casing, a dead openLabel branch).

import type { ReactNode } from 'react';
import { renderMarkdown } from '../../components/shared/render-markdown';
import { useViewport } from '../../hooks/useViewport';

export type ArtifactType = 'Reading' | 'Interactive';

export interface ArtifactMeta {
  /** PDF slug + registry key. */
  slug: string;
  /** Hash route, without the leading `#/`. */
  route: string;
  title: string;
  /** One-line description shown on the hub index. */
  blurb: string;
  type: ArtifactType;
  /**
   * Optional hub grouping label (e.g. 'Design'). When any artifact in a
   * series sets this, the hub renders labeled group card-grids instead of
   * a single flat list. Series without groups (evaluation, needs-analysis)
   * leave it undefined and render exactly as before.
   */
  group?: string;
  /**
   * Optional override for the card's open-link verb. Defaults to "Read"
   * (Reading) / "Open the map" (Interactive) when omitted, preserving the
   * needs-analysis action-map label.
   */
  openLabel?: string;
}

export interface SeriesConfig {
  /** Hub hash route without the leading `#/` (e.g. 'needs-analysis'). */
  hubRoute: string;
  /** Top-bar back-link label (e.g. 'Needs analysis'). */
  hubLabel: string;
  /** Footer fallback label on the first artifact (e.g. 'Back to the needs analysis'). */
  backToSeriesLabel: string;
  /** Eyebrow on reading pages (e.g. 'Needs Analysis · Reading'). */
  readingEyebrow: string;
  /** Series accent color (decorative rules and card top borders only). */
  accent: string;
  /** Canonical reading order — drives hub cards and the footer pager. */
  artifacts: ArtifactMeta[];
  /** slug → PDF href. Empty/missing value hides the download button. */
  pdfs: Record<string, string>;
}

export const TEXT_LINK =
  'inline-flex items-center gap-1.5 font-sans text-[13px] font-medium text-secondary no-underline transition-colors hover:text-ink';

/** Distinct artifact groups in first-seen order (empty when none are grouped). */
function orderedGroups(artifacts: ArtifactMeta[]): string[] {
  const seen: string[] = [];
  for (const a of artifacts) {
    if (a.group && !seen.includes(a.group)) seen.push(a.group);
  }
  return seen;
}

export interface ArtifactHubProps {
  /** Eyebrow label above the title (e.g. 'Behind the course'). */
  eyebrow: string;
  /** Hub h1 (e.g. 'The needs analysis'). */
  title: string;
  /** Series-specific intro copy (one or more <p className="m-0 max-w-reading">). */
  intro: ReactNode;
  /** Blog write-up URL; the link block is hidden while this is empty. */
  writeupUrl: string;
  /** Caption under the write-up link. */
  writeupBlurb: string;
}

export function createArtifactSeries(series: SeriesConfig): {
  ArtifactTopBar: (props: { pdfSlug: string }) => JSX.Element;
  SeriesEyebrow: (props: { label: string }) => JSX.Element;
  ArtifactFooter: (props: { currentSlug: string }) => JSX.Element;
  ReadingArtifact: (props: { markdown: string; pdfSlug: string }) => JSX.Element;
  ArtifactHub: (props: ArtifactHubProps) => JSX.Element;
} {
  // "Download PDF" — hidden entirely while the per-slug constant is empty,
  // so it never points at a 404 before the polished PDF lands. `ariaLabel`
  // disambiguates the link on hub pages, where several cards would
  // otherwise expose identical "Download PDF" accessible names.
  function PdfDownload({ slug, ariaLabel }: { slug: string; ariaLabel?: string | undefined }): JSX.Element | null {
    const href = series.pdfs[slug];
    if (!href || href.trim().length === 0) return null;
    return (
      <a
        href={href}
        download
        aria-label={ariaLabel}
        className="inline-flex items-center gap-2 rounded-md font-sans text-[13px] font-semibold text-ink no-underline hover:bg-surface"
        style={{ background: 'transparent', border: '1.5px solid rgb(var(--border))', padding: '8px 16px' }}
      >
        Download PDF
        <span aria-hidden="true">↓</span>
      </a>
    );
  }

  // Top bar: back-to-hub link on the left, PDF download on the right.
  function ArtifactTopBar({ pdfSlug }: { pdfSlug: string }): JSX.Element {
    return (
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-border-light pb-5">
        <a href={`#/${series.hubRoute}`} className={TEXT_LINK}>
          <span aria-hidden="true">←</span> {series.hubLabel}
        </a>
        <PdfDownload slug={pdfSlug} />
      </div>
    );
  }

  // Accent tick + category label. The tick uses the series accent only as
  // a thin decorative rule (never a competency tag).
  function SeriesEyebrow({ label }: { label: string }): JSX.Element {
    return (
      <div className="mb-5 flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="block h-[3px] w-8 rounded-full"
          style={{ background: series.accent }}
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

  // Footer: a prev/next pager through the series. Left goes to the
  // previous artifact, falling back to the series hub on the first one;
  // right goes to the next artifact, falling back to "Back to the course"
  // on the last as a deliberate end-of-series capstone.
  function ArtifactFooter({ currentSlug }: { currentSlug: string }): JSX.Element {
    const isMobile = useViewport() === 'mobile';
    const idx = series.artifacts.findIndex((a) => a.slug === currentSlug);
    const prev = idx > 0 ? series.artifacts[idx - 1] : undefined;
    const next = idx >= 0 ? series.artifacts[idx + 1] : undefined;
    // Single-row pager at every breakpoint, matching the module-section
    // footer: short labels on mobile keep prev/next on one line; full titles
    // on wider screens. min-w-0 + truncate guards the longest titles.
    const linkBase =
      'flex min-w-0 flex-1 items-center gap-1.5 font-sans text-[13px] font-medium text-secondary no-underline transition-colors hover:text-ink';
    return (
      <nav
        aria-label="Series navigation"
        className="mt-14 flex w-full flex-nowrap items-center justify-between gap-4 border-t border-border-light pt-6"
      >
        {prev ? (
          <a href={`#/${prev.route}`} className={linkBase}>
            <span aria-hidden="true">←</span>
            <span className="truncate">{isMobile ? 'Previous' : `Previous: ${prev.title}`}</span>
          </a>
        ) : (
          <a href={`#/${series.hubRoute}`} className={linkBase}>
            <span aria-hidden="true">←</span>
            <span className="truncate">{isMobile ? 'Back' : series.backToSeriesLabel}</span>
          </a>
        )}
        {next ? (
          <a href={`#/${next.route}`} className={`${linkBase} justify-end`}>
            <span className="truncate">{isMobile ? 'Next' : `Next: ${next.title}`}</span>
            <span aria-hidden="true">→</span>
          </a>
        ) : (
          <a href="#/" className={`${linkBase} justify-end`}>
            <span className="truncate">{isMobile ? 'Course' : 'Back to the course'}</span>
            <span aria-hidden="true">→</span>
          </a>
        )}
      </nav>
    );
  }

  // Shared layout for the reading artifacts. Each page is a thin wrapper
  // that imports its finalized markdown via `?raw` and hands it here; this
  // supplies the "artifact treatment" frame — toolbar, series eyebrow, the
  // rendered document at reading width, and the footer links.
  function ReadingArtifact({
    markdown,
    pdfSlug,
  }: {
    markdown: string;
    pdfSlug: string;
  }): JSX.Element {
    return (
      <div className="mx-auto max-w-reading px-4 py-12 sm:px-8 lg:px-16 lg:py-14">
        <ArtifactTopBar pdfSlug={pdfSlug} />
        <SeriesEyebrow label={series.readingEyebrow} />
        {/* The document's own H1/H2 carry the title; the renderer zeroes the
            first heading's top margin so it sits flush under the eyebrow. */}
        <article>{renderMarkdown(markdown)}</article>
        <ArtifactFooter currentSlug={pdfSlug} />
      </div>
    );
  }

  function ArtifactCard({
    artifact,
    index,
    headingLevel = 2,
  }: {
    artifact: ArtifactMeta;
    index: number;
    /** 2 in the flat hub; 3 when the card sits under a group's <h2>. */
    headingLevel?: 2 | 3;
  }): JSX.Element {
    const { slug, route, title, blurb, type } = artifact;
    const href = `#/${route}`;
    // Interactive artifacts default to "Open the map" (the needs-analysis
    // action map); any artifact may override with its own verb.
    const openLabel = artifact.openLabel ?? (type === 'Interactive' ? 'Open the map' : 'Read');
    const num = String(index + 1).padStart(2, '0');
    const Heading = headingLevel === 3 ? 'h3' : 'h2';

    return (
      <article
        className="flex h-full flex-col rounded-lg bg-[rgb(var(--white))] transition-colors hover:bg-surface"
        style={{ border: '1px solid rgb(var(--border))', borderTop: `3px solid ${series.accent}`, padding: '20px 22px' }}
      >
        <div className="mb-2 flex items-center gap-2.5">
          <span className="font-mono text-[11px] font-bold text-tertiary">{num}</span>
          <span
            className="font-mono text-overline font-semibold uppercase text-tertiary"
            style={{ letterSpacing: '0.1em' }}
          >
            {type}
          </span>
        </div>

        <Heading className="m-0 mb-2 font-sans text-h3 font-semibold" style={{ letterSpacing: '-0.005em' }}>
          <a href={href} className="text-ink no-underline hover:underline">
            {title}
          </a>
        </Heading>

        <p className="m-0 mb-4 font-sans text-body-sm text-body" style={{ lineHeight: 1.6 }}>
          {blurb}
        </p>

        {/* mt-auto pins the CTA row to the card bottom so, in the hub's
            equal-height grid, the open-link / Download-PDF rows align across
            cards regardless of blurb length. No-op in the flat single-column
            hubs (needs-analysis, evaluation), where cards size to content. */}
        <div className="mt-auto flex flex-wrap items-center gap-3">
          <a
            href={href}
            className="inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold text-action no-underline hover:underline"
          >
            {openLabel} <span aria-hidden="true">→</span>
          </a>
          <PdfDownload slug={slug} ariaLabel={`Download ${title} (PDF)`} />
        </div>
      </article>
    );
  }

  // The series landing page: frames the artifacts and links to each one
  // (and to its PDF, when available). Standalone page inside PlatformShell,
  // reachable in every platform mode.
  function ArtifactHub({ eyebrow, title, intro, writeupUrl, writeupBlurb }: ArtifactHubProps): JSX.Element {
    const showWriteup = writeupUrl.trim().length > 0;
    return (
      <div className="mx-auto max-w-[820px] px-4 py-12 sm:px-8 lg:px-16 lg:py-14">
        <div className="mb-8 border-b border-border-light pb-5">
          <a href="#/thank-you" className={TEXT_LINK}>
            <span aria-hidden="true">←</span> About this course
          </a>
        </div>

        <div className="mb-5 flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="block h-[3px] w-8 rounded-full"
            style={{ background: series.accent }}
          />
          <span
            className="font-mono text-overline font-semibold uppercase text-tertiary"
            style={{ letterSpacing: '0.12em' }}
          >
            {eyebrow}
          </span>
        </div>

        <h1 className="m-0 mb-4 font-display text-display font-normal text-ink">{title}</h1>

        <div className="space-y-4 font-sans text-body text-body">{intro}</div>

        {showWriteup && (
          <div className="mt-7">
            <a
              href={writeupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md font-sans text-[13px] font-semibold text-ink no-underline hover:bg-surface"
              style={{ background: 'transparent', border: '1.5px solid rgb(var(--border))', padding: '9px 18px' }}
            >
              Read the write-up <span aria-hidden="true">→</span>
            </a>
            <p className="m-0 mt-2.5 font-sans text-caption text-tertiary" style={{ lineHeight: 1.5 }}>
              {writeupBlurb}
            </p>
          </div>
        )}

        {(() => {
          const groups = orderedGroups(series.artifacts);
          // Flat list — evaluation and needs-analysis (output unchanged).
          if (groups.length === 0) {
            return (
              <div className="mt-10 space-y-4">
                {series.artifacts.map((a, i) => (
                  <ArtifactCard key={a.slug} artifact={a} index={i} />
                ))}
              </div>
            );
          }
          // Grouped card grids — the build series' labeled groups.
          return (
            <div className="mt-10 space-y-10">
              {groups.map((group) => (
                <section key={group} aria-label={group}>
                  <h2
                    className="mb-4 font-mono text-overline font-semibold uppercase text-tertiary"
                    style={{ letterSpacing: '0.12em' }}
                  >
                    {group}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {series.artifacts
                      .map((a, i) => ({ a, i }))
                      .filter(({ a }) => a.group === group)
                      .map(({ a, i }) => (
                        <ArtifactCard key={a.slug} artifact={a} index={i} headingLevel={3} />
                      ))}
                  </div>
                </section>
              ))}
            </div>
          );
        })()}

        <div className="mt-12 border-t border-border-light pt-6">
          <a href="#/" className={TEXT_LINK}>
            Back to the course <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    );
  }

  return { ArtifactTopBar, SeriesEyebrow, ArtifactFooter, ReadingArtifact, ArtifactHub };
}
