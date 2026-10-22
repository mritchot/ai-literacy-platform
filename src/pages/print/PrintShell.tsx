// PrintShell — the minimal document frame the `#/print/...` routes render
// inside, in place of PlatformShell. No sidebar, top bar, reference rail,
// or theme toggle: just the masthead, the content component, and the
// attribution colophon. The masthead is the same for all four families:
// the series breadcrumb (as on the web page), the Source Serif title, and
// the course name. The content's own title block (ArtifactHeader, a
// markdown document's H1) renders nothing or is hidden in print, so the
// title appears once. scripts/render-pdfs.mjs opens each print route in headless
// Chromium and prints it to Letter; the running header/footer with page
// numbers is drawn by Playwright's header/footer templates, fed from the
// data attributes this shell exposes on its root.
//
// State forcing:
//   - Light theme: the theme store applies `.dark` to <html>; the shell
//     removes it, stamps `data-theme="light"`, and adds `.print-mode`,
//     which scopes every rule in src/styles/print.css.
//   - Print mode: the children render inside PrintModeProvider
//     (src/contexts/PrintModeContext.tsx). The artifact-series chrome
//     (top bar, eyebrow, pager, download links, Expand-all) renders
//     nothing, useExpandableSet and the page-local disclosure flags (ADR
//     records, Gantt phases, learning-architecture modules, R3/R7
//     sections, the Resources rationale panel) report every panel open,
//     and the disclosure chevrons are omitted. The render script still
//     asserts that no `button[aria-expanded="false"][aria-controls]`
//     remains, so a disclosure that does not read the context fails the
//     render rather than printing collapsed. Selection toggles without
//     `aria-controls` (the action map's quadrants) are not disclosures.
//   - Citations: every <Citation> renders as a superscript endnote
//     number, and <PrintNotes> (inside EndnotesProvider) ends the body
//     with the numbered Notes section (src/components/shared/CitationNotes.tsx).
//   - Readiness: once the content has committed and `document.fonts.ready`
//     resolves, the root gets `data-print-ready="true"`; the render script
//     waits for that marker before calling page.pdf(). A resolver failure
//     sets it to "error" with the reason in `data-print-error` so the
//     script fails loudly rather than printing a blank page.

import { Suspense, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { PrintModeProvider } from '../../contexts/PrintModeContext';
import { EndnotesProvider } from '../../contexts/EndnotesContext';
import { PrintNotes } from '../../components/shared/CitationNotes';
import '../../styles/print.css';

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

// Rendered as the last sibling inside the Suspense boundary so its effect
// runs only once the lazy content has committed.
function ReadyMarker({ rootRef }: { rootRef: React.RefObject<HTMLDivElement> }): null {
  useEffect(() => {
    let cancelled = false;
    const root = rootRef.current;
    if (!root) return;
    (async () => {
      await document.fonts.ready;
      // Two frames: layout reflects the web-font swap, and the endnote
      // numbers <PrintNotes> sets after the content commits have rendered.
      await nextFrame();
      await nextFrame();
      if (!cancelled) root.setAttribute('data-print-ready', 'true');
    })();
    return () => {
      cancelled = true;
    };
  }, [rootRef]);
  return null;
}

export interface PrintShellProps {
  title: string;
  /** Series label, e.g. "Behind the build · Design" or "Reference · R1". */
  label: string;
  /** CSS color expression for the series accent (design tokens only). */
  accent: string;
  /** Position in the series ("2 of 4"), shown after the label. */
  position?: string | undefined;
  /** Document family; print.css sets reference cards full width. */
  family: string;
  children: ReactNode;
}

export function PrintShell({ title, label, accent, position, family, children }: PrintShellProps): JSX.Element {
  const [series = label, ...crumbs] = label.split(' · ');
  if (position) crumbs.push(position);
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const previousTitle = document.title;
    const hadDark = html.classList.contains('dark');
    html.classList.remove('dark');
    html.classList.add('print-mode');
    html.setAttribute('data-theme', 'light');
    document.title = `${title} — AI Literacy for the Modern Workforce`;
    return () => {
      html.classList.remove('print-mode');
      html.removeAttribute('data-theme');
      if (hadDark) html.classList.add('dark');
      document.title = previousTitle;
    };
  }, [title]);

  return (
    <div
      ref={rootRef}
      className="print-shell"
      data-print-ready="false"
      data-print-family={family}
      data-print-title={title}
      data-print-label={label}
      data-print-accent={accent}
    >
      <header className="print-masthead">
        <p className="print-masthead-label">
          <span aria-hidden="true" className="print-masthead-rule" style={{ background: accent }} />
          <span className="text-ink">{series}</span>
          {crumbs.map((c) => (
            <span key={c} className="text-tertiary">
              <span aria-hidden="true" className="print-masthead-dot">
                ·
              </span>
              {c}
            </span>
          ))}
        </p>
        <h1 className="print-masthead-title font-display text-ink">{title}</h1>
        <p className="print-masthead-subtitle font-sans text-secondary">AI Literacy for the Modern Workforce</p>
      </header>
      <main className="print-body">
        <PrintModeProvider>
          <EndnotesProvider>
            <Suspense fallback={null}>
              {children}
              <PrintNotes />
              <ReadyMarker rootRef={rootRef} />
            </Suspense>
          </EndnotesProvider>
        </PrintModeProvider>
      </main>
      {/* Attribution — the landing page's AttributionFooter, as a colophon. */}
      <footer className="print-colophon font-sans text-caption text-tertiary">
        <p className="m-0">
          © Michael Ritchot. Code licensed under the MIT License. Instructional content licensed
          under CC BY-NC-SA 4.0.
        </p>
      </footer>
    </div>
  );
}

/** Rendered when a print route does not resolve; the script reads the error. */
export function PrintError({ message }: { message: string }): JSX.Element {
  return (
    <div className="print-shell" data-print-ready="error" data-print-error={message}>
      <p className="font-mono text-body-sm text-error">{message}</p>
    </div>
  );
}
