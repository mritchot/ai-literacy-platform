// PrintShell — the minimal document frame the `#/print/...` routes render
// inside, in place of PlatformShell. No sidebar, top bar, reference rail,
// or theme toggle: just the content component, a masthead for documents
// that do not title themselves (the reference cards), and the attribution
// colophon. scripts/render-pdfs.mjs opens each print route in headless
// Chromium and prints it to Letter; the running header/footer with page
// numbers is drawn by Playwright's header/footer templates, fed from the
// data attributes this shell exposes on its root.
//
// State forcing, without touching the shared components:
//   - Light theme: the theme store applies `.dark` to <html>; the shell
//     removes it, stamps `data-theme="light"`, and adds `.print-mode`,
//     which scopes every rule in src/styles/print.css.
//   - Disclosures expanded: the expandable cards (ADR records, Gantt
//     phases, learning-architecture modules, R3/R7 sections, the
//     Resources rationale panel) all render a real <button> with
//     `aria-expanded` + `aria-controls`; useExpandableSet keeps their state
//     per page with no external control. The shell clicks every collapsed
//     one after mount, repeating until none remain (nested cards open on a
//     later pass). Selection toggles that carry `aria-expanded` without
//     `aria-controls` (the action map's quadrants) are left alone, so
//     interactive diagrams keep their static state.
//   - Readiness: after the disclosures are open and `document.fonts.ready`
//     resolves, the root gets `data-print-ready="true"`; the render script
//     waits for that marker before calling page.pdf(). A resolver failure
//     sets it to "error" with the reason in `data-print-error` so the
//     script fails loudly rather than printing a blank page.

import { Suspense, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import '../../styles/print.css';

const DISCLOSURE = 'button[aria-expanded="false"][aria-controls]';
const MAX_PASSES = 12;

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

// Clicks are dispatched from inside a React effect, so the resulting
// state updates flush after this task, not inside the click. Each pass
// therefore yields a frame before re-querying; without the yield a second
// pass would re-click the same still-collapsed buttons and toggle them
// shut again.
async function expandDisclosures(root: HTMLElement): Promise<number> {
  let clicked = 0;
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const buttons = root.querySelectorAll<HTMLButtonElement>(DISCLOSURE);
    if (buttons.length === 0) break;
    buttons.forEach((b) => b.click());
    clicked += buttons.length;
    await nextFrame();
  }
  return clicked;
}

// Rendered as the last sibling inside the Suspense boundary so its effect
// runs only once the lazy content has committed.
function ReadyMarker({ rootRef }: { rootRef: React.RefObject<HTMLDivElement> }): null {
  useEffect(() => {
    let cancelled = false;
    const root = rootRef.current;
    if (!root) return;
    (async () => {
      await expandDisclosures(root);
      await document.fonts.ready;
      await nextFrame();
      // A second pass catches panels whose children mounted their own
      // disclosures on the first open.
      await expandDisclosures(root);
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
  /** True when the content renders its own H1 + subtitle. */
  selfTitled: boolean;
  children: ReactNode;
}

export function PrintShell({ title, label, accent, selfTitled, children }: PrintShellProps): JSX.Element {
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
      data-print-title={title}
      data-print-label={label}
      data-print-accent={accent}
    >
      {!selfTitled && (
        <header className="print-masthead">
          <h1 className="m-0 mb-2 font-display text-display font-normal text-ink">{title}</h1>
          <p className="m-0 mb-6 font-sans text-h3 font-normal text-secondary">
            AI Literacy for the Modern Workforce
          </p>
        </header>
      )}
      <main className="print-body">
        <Suspense fallback={null}>
          {children}
          <ReadyMarker rootRef={rootRef} />
        </Suspense>
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
