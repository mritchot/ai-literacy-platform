// artifact-series — shared chrome + layouts for the standalone artifact
// page families (needs-analysis, evaluation). Each family binds its
// SeriesConfig once via createArtifactSeries() and re-exports the bound
// components from its own chrome.tsx, so page files keep their imports.
// Extracted from two ~350-line near-identical copies that had already
// begun to drift (eyebrow casing, a dead openLabel branch).

import { Fragment, type ReactNode } from 'react';
import { citedIds, renderMarkdown } from '../../components/shared/render-markdown';
import { SourcesList } from '../../components/shared/CitationNotes';
import { Icon } from '../../components/shared/Icon';
import { Overline } from '../../components/shared/Overline';
import { usePrintMode } from '../../contexts/PrintModeContext';
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
  /** Series accent color, read by the print shell (print-documents.tsx). The
   *  web chrome follows the module pattern and carries no series accent. */
  accent: string;
  /** Canonical reading order — drives hub cards and the footer pager. */
  artifacts: ArtifactMeta[];
  /** slug → PDF href. Empty/missing value hides the download button. */
  pdfs: Record<string, string>;
}

// Nav-link treatment from the module section pager (SectionContainer).
export const TEXT_LINK =
  'inline-flex items-center gap-2 font-sans text-[13.5px] font-semibold text-tertiary no-underline transition-colors duration-[160ms] hover:text-secondary';

// Secondary CTA from the landing page's module cards: bordered, action color.
const ACTION_BUTTON =
  'inline-flex items-center gap-2 font-sans text-[13.5px] font-semibold text-action no-underline transition-colors duration-[160ms] hover:bg-[rgb(var(--action)/0.08)]';

/** Subtitle line under every self-titled artifact page's H1. */
const COURSE_TITLE = 'AI Literacy for the Modern Workforce';

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
}

export type ArtifactWidth = 'reading' | 'interactive';

export interface ArtifactHeaderProps {
  /** Series label, e.g. 'Behind the build · Design'. */
  label: string;
  /** Registry slug; drives the "n of m" position in the breadcrumb. */
  slug: string;
  /** Page H1. */
  title: string;
}

// The layouts follow the module section (SectionContainer): the same
// viewport padding, a reading (680px) or interactive (960px) column, the
// mono breadcrumb + Source Serif title header, and the section pager.
//
// The top bar, breadcrumb, footer pager, and download links are page
// chrome: in print mode (src/contexts/PrintModeContext.tsx) each renders
// nothing, since the PDF's running header carries the series label and title.
export function createArtifactSeries(series: SeriesConfig): {
  ArtifactPage: (props: { width?: ArtifactWidth; children: ReactNode }) => JSX.Element;
  ArtifactTopBar: (props: { pdfSlug: string }) => JSX.Element | null;
  SeriesEyebrow: (props: { label: string; slug?: string }) => JSX.Element | null;
  ArtifactHeader: (props: ArtifactHeaderProps) => JSX.Element | null;
  ArtifactFooter: (props: { currentSlug: string }) => JSX.Element | null;
  ReadingArtifact: (props: { markdown: string; pdfSlug: string }) => JSX.Element;
  ArtifactHub: (props: ArtifactHubProps) => JSX.Element;
} {
  // "Download PDF" — hidden entirely while the per-slug constant is empty,
  // so it never points at a 404 before the polished PDF lands. `ariaLabel`
  // disambiguates the link on hub pages, where several cards would
  // otherwise expose identical "Download PDF" accessible names. `button`
  // is the bordered CTA (top bar); `link` is the quiet text link (hub cards).
  function PdfDownload({
    slug,
    ariaLabel,
    variant = 'button',
  }: {
    slug: string;
    ariaLabel?: string | undefined;
    variant?: 'button' | 'link';
  }): JSX.Element | null {
    const printMode = usePrintMode();
    const href = series.pdfs[slug];
    if (printMode || !href || href.trim().length === 0) return null;
    if (variant === 'link') {
      return (
        <a href={href} download aria-label={ariaLabel} className={TEXT_LINK}>
          Download PDF
          <Icon name="download" size={14} />
        </a>
      );
    }
    return (
      <a
        href={href}
        download
        aria-label={ariaLabel}
        className={`${ACTION_BUTTON} shrink-0`}
        style={{ padding: '9px 16px', border: '1px solid rgb(var(--action))' }}
      >
        Download PDF
        <Icon name="download" size={14} />
      </a>
    );
  }

  // Page frame: SectionContainer's outer padding and content column. In
  // print the shell resets the outer div; the column drops its max width
  // so the document fills the page box as before.
  function ArtifactPage({
    width = 'reading',
    children,
  }: {
    width?: ArtifactWidth;
    children: ReactNode;
  }): JSX.Element {
    const column = width === 'interactive' ? 'max-w-interactive' : 'max-w-reading';
    return (
      <div className="section-enter mx-auto w-full px-4 py-12 sm:px-8 lg:px-16">
        <div className={`mx-auto ${column} print:max-w-none`}>{children}</div>
      </div>
    );
  }

  // Top bar: back-to-hub link on the left, PDF download on the right.
  function ArtifactTopBar({ pdfSlug }: { pdfSlug: string }): JSX.Element | null {
    if (usePrintMode()) return null;
    return (
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-border-light pb-4">
        <a href={`#/${series.hubRoute}`} className={`${TEXT_LINK} min-w-0`}>
          <Icon name="arrowLeft" size={14} />
          <span className="truncate">{series.hubLabel}</span>
        </a>
        <PdfDownload slug={pdfSlug} />
      </div>
    );
  }

  // Breadcrumb in the module-section pattern: the series name in ink, then
  // the label's remaining parts and the page's position as mono overlines,
  // separated by ghost dots (SectionContainer's "E — Evidence · Module 2 ·
  // Section 1 of 8").
  function SeriesEyebrow({ label, slug }: { label: string; slug?: string }): JSX.Element | null {
    if (usePrintMode()) return null;
    const [name = label, ...rest] = label.split(' · ');
    const idx = slug ? series.artifacts.findIndex((a) => a.slug === slug) : -1;
    const crumbs = idx >= 0 ? [...rest, `${idx + 1} of ${series.artifacts.length}`] : rest;
    return (
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <span
          className="font-mono text-[11px] font-bold uppercase text-ink"
          style={{ letterSpacing: '0.14em' }}
        >
          {name}
        </span>
        {crumbs.map((c) => (
          <Fragment key={c}>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-ghost" />
            <Overline as="span" style={{ fontSize: 11 }}>
              {c}
            </Overline>
          </Fragment>
        ))}
      </div>
    );
  }

  // Header for the self-titled (TSX) pages: breadcrumb, the Source Serif
  // title at the module section-title size, and the course name beneath.
  // In print the shell's masthead carries all three, so this renders nothing.
  function ArtifactHeader({ label, slug, title }: ArtifactHeaderProps): JSX.Element | null {
    if (usePrintMode()) return null;
    return (
      <header className="mb-8">
        <SeriesEyebrow label={label} slug={slug} />
        <h1
          className="m-0 mb-2 font-display text-title font-normal text-ink"
          style={{ letterSpacing: '-0.005em' }}
        >
          {title}
        </h1>
        <p className="m-0 font-sans text-body text-secondary">{COURSE_TITLE}</p>
      </header>
    );
  }

  // Footer: a prev/next pager through the series, in the module section
  // pager's treatment. Left goes to the previous artifact, falling back to
  // the series hub on the first one; right goes to the next artifact,
  // falling back to "Back to the course" on the last as a deliberate
  // end-of-series capstone.
  function ArtifactFooter({ currentSlug }: { currentSlug: string }): JSX.Element | null {
    const printMode = usePrintMode();
    const isMobile = useViewport() === 'mobile';
    if (printMode) return null;
    const idx = series.artifacts.findIndex((a) => a.slug === currentSlug);
    const prev = idx > 0 ? series.artifacts[idx - 1] : undefined;
    const next = idx >= 0 ? series.artifacts[idx + 1] : undefined;
    // Single-row pager at every breakpoint, matching the module-section
    // footer: short labels on mobile keep prev/next on one line; full titles
    // on wider screens. min-w-0 + truncate guards the longest titles.
    const linkBase =
      'flex min-w-0 flex-1 items-center gap-2 py-3 font-sans text-[13.5px] font-semibold no-underline transition-colors duration-[160ms]';
    const backLink = `${linkBase} text-tertiary hover:text-secondary`;
    const forwardLink = `${linkBase} justify-end text-right text-action hover:text-action-hover`;
    return (
      <nav
        aria-label="Series navigation"
        className="mt-12 flex w-full flex-nowrap items-center justify-between gap-4 border-t border-border-light pt-2"
      >
        {prev ? (
          <a href={`#/${prev.route}`} className={backLink}>
            <Icon name="arrowLeft" size={14} />
            <span className="truncate">{isMobile ? 'Previous' : `Previous: ${prev.title}`}</span>
          </a>
        ) : (
          <a href={`#/${series.hubRoute}`} className={backLink}>
            <Icon name="arrowLeft" size={14} />
            <span className="truncate">{isMobile ? 'Back' : series.backToSeriesLabel}</span>
          </a>
        )}
        {next ? (
          <a href={`#/${next.route}`} className={forwardLink}>
            <span className="truncate">{isMobile ? 'Next' : `Next: ${next.title}`}</span>
            <Icon name="arrowRight" size={14} />
          </a>
        ) : (
          <a href="#/" className={forwardLink}>
            <span className="truncate">{isMobile ? 'Course' : 'Back to the course'}</span>
            <Icon name="arrowRight" size={14} />
          </a>
        )}
      </nav>
    );
  }

  // Shared layout for the reading artifacts. Each page is a thin wrapper
  // that imports its finalized markdown via `?raw` and hands it here; this
  // supplies the frame — toolbar, breadcrumb, the rendered document in the
  // module reading column, the generated Sources list (from the document's
  // {{cite:…}} tokens), and the footer pager.
  function ReadingArtifact({
    markdown,
    pdfSlug,
  }: {
    markdown: string;
    pdfSlug: string;
  }): JSX.Element {
    return (
      <ArtifactPage>
        <ArtifactTopBar pdfSlug={pdfSlug} />
        <SeriesEyebrow label={series.readingEyebrow} slug={pdfSlug} />
        {/* The document's own H1 carries the title at the module
            section-title size, flush under the breadcrumb. */}
        <article>
          {renderMarkdown(markdown)}
          <SourcesList ids={citedIds(markdown)} />
        </article>
        <ArtifactFooter currentSlug={pdfSlug} />
      </ArtifactPage>
    );
  }

  // Hub card in the landing page's module-card language (LandingPage.tsx
  // ModuleCard): raised card, mono "01 — Reading" kicker, sans H3 title,
  // a full-bleed rule, then the PDF link and the bordered open CTA.
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
        className="flex h-full flex-col bg-[rgb(var(--white))] transition-colors duration-[160ms] hover:bg-surface"
        style={{ border: '1px solid rgb(var(--border))', padding: '24px 26px 22px' }}
      >
        <div
          className="mb-3.5 font-mono text-[11px] font-bold uppercase"
          style={{ letterSpacing: '0.14em' }}
        >
          <span className="text-ink">{num}</span>
          <span className="mx-2 text-muted">—</span>
          <span className="text-secondary">{type}</span>
        </div>

        <Heading
          className="m-0 mb-3 font-sans text-h3 font-semibold text-ink"
          style={{ letterSpacing: '-0.005em' }}
        >
          <a href={href} className="text-ink no-underline hover:underline">
            {title}
          </a>
        </Heading>

        <p className="m-0 mb-5 font-sans text-body-sm text-body">{blurb}</p>

        {/* The spacer pins the rule and CTA row to the card bottom so, in
            the equal-height grid, the rows align across cards regardless
            of blurb length. */}
        <div className="flex-1" />
        <div className="-mx-[26px] mb-4 h-px bg-border-light" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <PdfDownload slug={slug} ariaLabel={`Download ${title} (PDF)`} variant="link" />
          <a
            href={href}
            className={`${ACTION_BUTTON} ml-auto`}
            style={{ padding: '9px 16px', border: '1px solid rgb(var(--action))' }}
          >
            {openLabel}
            <Icon name="arrowRight" size={14} />
          </a>
        </div>
      </article>
    );
  }

  function CardGrid({ children }: { children: ReactNode }): JSX.Element {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2" style={{ gridAutoRows: '1fr' }}>
        {children}
      </div>
    );
  }

  // The series landing page: frames the artifacts and links to each one
  // (and to its PDF, when available), in the landing page's hero and
  // module-grid treatment. Standalone page inside PlatformShell, reachable
  // in every platform mode.
  function ArtifactHub({ eyebrow, title, intro }: ArtifactHubProps): JSX.Element {
    const groups = orderedGroups(series.artifacts);
    return (
      <div className="section-enter mx-auto max-w-[1160px] px-4 py-12 sm:px-8 lg:px-16">
        <div className="mb-8 border-b border-border-light pb-4">
          <a href="#/thank-you" className={TEXT_LINK}>
            <Icon name="arrowLeft" size={14} /> About this course
          </a>
        </div>

        <section className="mb-10">
          <Overline className="mb-3.5" style={{ fontSize: 11 }}>
            {eyebrow}
          </Overline>
          <h1 className="m-0 mb-4 max-w-[780px] font-display text-display font-semibold text-ink">
            {title}
          </h1>
          <div className="max-w-reading space-y-4 font-sans text-body text-body">{intro}</div>
        </section>

        {groups.length === 0 ? (
          // Flat grid: evaluation and needs-analysis.
          <CardGrid>
            {series.artifacts.map((a, i) => (
              <ArtifactCard key={a.slug} artifact={a} index={i} />
            ))}
          </CardGrid>
        ) : (
          // Labeled grids: the build series' groups.
          <div className="space-y-10">
            {groups.map((group) => (
              <section key={group} aria-label={group}>
                <h2 className="m-0 mb-5">
                  <Overline as="span" style={{ fontSize: 11 }}>
                    {group}
                  </Overline>
                </h2>
                <CardGrid>
                  {series.artifacts
                    .map((a, i) => ({ a, i }))
                    .filter(({ a }) => a.group === group)
                    .map(({ a, i }) => (
                      <ArtifactCard key={a.slug} artifact={a} index={i} headingLevel={3} />
                    ))}
                </CardGrid>
              </section>
            ))}
          </div>
        )}

        <div className="mt-12 border-t border-border-light pt-2">
          <a href="#/" className={`${TEXT_LINK} py-3`}>
            Back to the course <Icon name="arrowRight" size={14} />
          </a>
        </div>
      </div>
    );
  }

  return {
    ArtifactPage,
    ArtifactTopBar,
    SeriesEyebrow,
    ArtifactHeader,
    ArtifactFooter,
    ReadingArtifact,
    ArtifactHub,
  };
}
