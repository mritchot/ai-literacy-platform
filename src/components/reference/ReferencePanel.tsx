// ReferencePanel — generic slide-out drawer used by every R1–R7 reference
// item. The container is content-agnostic: it owns the drawer mechanics
// (Escape to close, click backdrop to close, focus management, scroll
// containment, Download-PDF button) and renders whatever children the
// caller passes inside the scrollable body.
//
// Usage pattern (see `items/R1QuickReference.tsx` and `R1Trigger.tsx`):
//
//   <ReferencePanel
//     isOpen={open}
//     onClose={() => setOpen(false)}
//     id="R1"
//     title="4D Competency Quick-Reference Card"
//     pdfPath="/reference/r1-4d-quick-reference.pdf"
//     pdfFilename="r1-4d-quick-reference.pdf"
//   >
//     <R1QuickReference />
//   </ReferencePanel>
//
// Visual: slides in from the right at desktop/tablet (~520px wide); on
// mobile it expands to nearly full viewport width. Backdrop dims the
// page behind it. The whole thing is rendered with a fixed-position
// portal-like wrapper, so it sits above the sidebar and the section
// content. No actual React portal is used — fixed-position elements
// escape parent stacking contexts well enough for this app's z-index
// budget.

import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from '../shared/Icon';
import { Overline } from '../shared/Overline';

interface ReferencePanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Reference identifier — e.g., "R1", "R2". Rendered as a small mono
   *  label next to the title. */
  id: string;
  /** Full title shown in the drawer header. */
  title: string;
  /** Public path to the downloadable PDF. Served from `public/`. */
  pdfPath: string;
  /** Filename suggested when the user downloads the PDF. */
  pdfFilename: string;
  /** Reference-card body. */
  children: ReactNode;
}

export function ReferencePanel({
  isOpen,
  onClose,
  id,
  title,
  pdfPath,
  pdfFilename,
  children,
}: ReferencePanelProps): JSX.Element | null {
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const titleId = `ref-panel-${id}-title`;

  // On open, capture focus origin and move focus to the close button so
  // a keyboard user lands in a predictable place. Restore focus on close.
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = (document.activeElement as HTMLElement) ?? null;
    closeBtnRef.current?.focus();
    return () => {
      previouslyFocused.current?.focus();
    };
  }, [isOpen]);

  // Escape closes; lightweight focus trap that keeps Tab inside the drawer.
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusable = drawer.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock background scroll while the drawer is open. The panel itself
  // scrolls internally; preventing the underlying page from scrolling
  // keeps the reading experience anchored.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[100]"
      // The panel may be rendered as a descendant of `ReferenceTabRail`,
      // which sets `pointer-events: none` on itself so the empty strip
      // doesn't block clicks on page content. Without this explicit
      // `auto`, the panel inherits `none` and the backdrop, Close
      // button, and scroll wheel all stop responding (only Escape works
      // because keyboard events bypass pointer-events). This restores
      // pointer interaction for the panel and its children.
      style={{ pointerEvents: 'auto' }}
    >
      {/* Backdrop — clicking it closes the drawer. The button element is
          aria-labelled so SR users get a coherent close affordance. */}
      <button
        type="button"
        aria-label={`Close ${title}`}
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.32)', cursor: 'default' }}
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className="absolute right-0 top-0 flex h-full flex-col rounded-l-xl"
        style={{
          width: 'min(560px, 100vw)',
          background: 'rgb(var(--white))',
          borderLeft: '1px solid rgb(var(--border))',
          boxShadow: '-12px 0 36px rgba(0, 0, 0, 0.18)',
        }}
      >
        {/* Header */}
        <header
          className="flex items-start justify-between gap-3"
          style={{
            padding: '20px 22px 14px',
            borderBottom: '1px solid rgb(var(--border-light))',
          }}
        >
          <div className="min-w-0 flex-1">
            <Overline className="mb-1.5" style={{ fontSize: 10 }}>
              Reference · {id}
            </Overline>
            <h2
              id={titleId}
              className="m-0 font-display text-h3 font-normal text-ink"
              style={{ letterSpacing: '-0.005em', lineHeight: 1.25 }}
            >
              {title}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-tertiary hover:bg-surface hover:text-ink"
          >
            <Icon name="close" size={18} />
          </button>
        </header>

        {/* Body — scrollable. `min-h-0` is required: a flex child defaults
            to `min-height: auto`, which would keep this div from shrinking
            below its content height, so `overflow-y-auto` would never engage. */}
        <div
          className="min-h-0 flex-1 overflow-y-auto"
          style={{ padding: '20px 22px 24px' }}
        >
          {children}
        </div>

        {/* Footer — Download PDF action */}
        <footer
          className="flex items-center justify-between gap-3"
          style={{
            padding: '14px 22px',
            borderTop: '1px solid rgb(var(--border-light))',
            background: 'rgb(var(--surface-warm))',
          }}
        >
          <span
            className="font-mono text-[11px] text-tertiary"
            style={{ letterSpacing: '0.02em' }}
          >
            Esc · click outside · or use Close to dismiss
          </span>
          <a
            href={pdfPath}
            download={pdfFilename}
            className="inline-flex items-center gap-2 rounded-md font-sans text-[12.5px] font-semibold text-ink hover:bg-[rgb(var(--white))]"
            style={{
              padding: '8px 14px',
              background: 'rgb(var(--white))',
              border: '1px solid rgb(var(--border))',
            }}
          >
            <Icon name="download" size={14} />
            Download PDF
          </a>
        </footer>
      </aside>
    </div>
  );
}
