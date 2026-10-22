// Citation — inline (Author, Year) chip with hover/click/focus popover
// showing full source metadata (Tier B per the citation spec: title,
// authors, publisher, date, optional page reference).
//
// Interaction model — hybrid:
//   • Mouse hover (devices with `(pointer: fine)`): popover opens after
//     a 250ms delay; closes 150ms after the mouse leaves both chip and
//     popover. The delay prevents accidental triggers while reading.
//   • Click / tap: pins the popover open; a second click closes it.
//     Pinned popovers stay open until explicitly dismissed (Esc, outside
//     click, X close, or a second click).
//   • Keyboard focus (Tab): opens the popover; Tab moves on to the next
//     focusable element on the page. Enter or Space pins the popover and
//     moves focus to its close button; Esc closes it; tabbing past either
//     end of the popover closes it and returns focus to the chip.
//
// Visual cue — the chip uses a dotted underline + `cursor: help` so it
// reads as "click for more" without disrupting the reading flow.
//
// Compound citations: pass an array of ids — the popover then lists
// each source as a separate block, matching how academic compound
// citations work ("(Source A; Source B)" → both sources surfaced).
//
// Print: inside the print shell (PrintModeContext) the chip renders as a
// superscript endnote number instead, whatever the Sources toggle says;
// the shell's Notes section lists the sources (CitationNotes.tsx).

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { getCitation, type CitationMeta } from '../../data/citations';
import { useCitations } from '../../hooks/useCitations';
import { usePrintMode } from '../../contexts/PrintModeContext';
import { useNoteNumbers } from '../../contexts/EndnotesContext';
import { noteKey } from '../../utils/citation-notes';

interface CitationProps {
  /** One or more citation IDs from the `CITATIONS` map. */
  ids: string | readonly string[];
  /** Optional key into a citation's `pages` map for a stat-specific
   *  page reference. When supplied with a multi-id citation, it applies
   *  only to the FIRST id. */
  pageKey?: string | undefined;
  /** Per-id page keys, aligned with `ids` (the markdown `{{cite:…}}`
   *  token's form). An entry here wins over `pageKey` for its id. */
  pageKeys?: ReadonlyArray<string | undefined> | undefined;
}

/** Each id's page key: `pageKeys[i]`, else `pageKey` for the first id. */
function resolvePageKeys({ ids, pageKey, pageKeys }: CitationProps): {
  idList: readonly string[];
  keyList: Array<string | undefined>;
} {
  const idList = typeof ids === 'string' ? [ids] : ids;
  const keyList = idList.map((_, i) => pageKeys?.[i] ?? (i === 0 ? pageKey : undefined));
  return { idList, keyList };
}

const HOVER_OPEN_DELAY = 250;
const HOVER_CLOSE_DELAY = 150;

/**
 * Public entry point. Reads the platform-wide citation-visibility
 * preference and either renders nothing (preference 'hidden') or
 * delegates to `CitationChip` (the full interactive chip).
 *
 * This thin wrapper exists so the visibility gate can `return null`
 * with exactly ONE hook (`useCitations`) above it — `CitationChip`
 * itself uses many hooks (`useId`, `useState`, several `useRef`s,
 * `useEffect`, `useLayoutEffect`), and conditionally short-circuiting
 * before those would violate the Rules of Hooks. Keeping the gate in
 * the wrapper means `CitationChip`'s hook count is always constant.
 */
export function Citation(props: CitationProps): JSX.Element | null {
  const printMode = usePrintMode();
  const { showCitations } = useCitations();
  if (printMode) return <CitationNote {...props} />;
  if (!showCitations) return null;
  return <CitationChip {...props} />;
}

/** Print form: a superscript endnote number ("3", or "3,4" for a
 *  compound citation). No leading space, so it sits on the claim. */
function CitationNote(props: CitationProps): JSX.Element {
  const { idList, keyList } = resolvePageKeys(props);
  const keys = idList.map((id, i) => noteKey(id, keyList[i]));
  const numbers = useNoteNumbers(keys);
  return (
    <sup className="cite-note" data-note-keys={JSON.stringify(keys)}>
      {numbers}
    </sup>
  );
}

function CitationChip(props: CitationProps): JSX.Element {
  const { idList, keyList } = resolvePageKeys(props);
  const sources = idList.map((id) => getCitation(id));
  const popoverId = useId();

  const [open, setOpen] = useState(false);
  // Tracks whether the open was triggered by hover or focus (so
  // mouseleave and blur can auto-close) vs click (which requires
  // explicit dismissal).
  const stickyRef = useRef(false);
  // State mirror of stickyRef, so the outside-click effect re-subscribes
  // when a click pins a popover that hover or focus already opened.
  const [pinned, setPinned] = useState(false);
  // Set when Enter or Space pins the popover; the effect below then
  // moves focus into it once it has rendered.
  const focusCloseOnPinRef = useRef(false);

  const chipRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  // Computed popover position (viewport-fixed).
  const [pos, setPos] = useState<{
    left: number;
    top: number;
    placement: 'above' | 'below';
  } | null>(null);

  // ─── Open / close helpers ─────────────────────────────────────────
  // cancelTimers/closeNow are stable (refs + a stable state setter only)
  // so effects can list closeNow as a dependency without re-subscribing
  // per render.

  const cancelTimers = useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openNow = (sticky: boolean) => {
    cancelTimers();
    stickyRef.current = sticky;
    setPinned(sticky);
    setOpen(true);
  };

  const closeNow = useCallback(() => {
    cancelTimers();
    setOpen(false);
    stickyRef.current = false;
    setPinned(false);
    focusCloseOnPinRef.current = false;
  }, [cancelTimers]);

  // ─── Mouse hover (open with delay; close on leave) ────────────────

  const handleMouseEnter = () => {
    if (openTimerRef.current !== null) return;
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null;
      // Sticky=false: hover-opened popovers auto-dismiss on mouseleave.
      openNow(false);
    }, HOVER_OPEN_DELAY);
  };

  const handleMouseLeave = () => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
      return;
    }
    if (stickyRef.current) return; // click-opened popovers don't auto-close
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setOpen(false);
    }, HOVER_CLOSE_DELAY);
  };

  // ─── Click / keyboard ─────────────────────────────────────────────

  const handleClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    // Chromium focuses a button on mousedown, so handleFocus has already
    // opened the popover when this click lands. Closing on any open state
    // made the first click a no-op. A click pins an unpinned popover and
    // closes a pinned one.
    if (open && stickyRef.current) {
      closeNow();
      return;
    }
    // detail is 0 when Enter or Space activated the button.
    focusCloseOnPinRef.current = e.detail === 0;
    openNow(true); // click → sticky open
  };

  const handleFocus = () => {
    // Focus opens non-sticky; handleBlur closes it when focus leaves.
    // Esc still works as an explicit dismissal.
    if (!open) openNow(false);
  };

  const handleBlur = (e: ReactFocusEvent<HTMLButtonElement>) => {
    // Tab-away must actually close focus-opened popovers — without
    // this, tabbing through a citation-dense section left every
    // visited chip's popover open. Sticky (click-opened) popovers
    // stay; focus moving into the popover itself doesn't dismiss.
    if (stickyRef.current) return;
    const next = e.relatedTarget as Node | null;
    if (next && (popoverRef.current?.contains(next) || chipRef.current?.contains(next))) {
      return;
    }
    closeNow();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      closeNow();
      chipRef.current?.focus();
    }
  };

  // ─── Outside-click dismissal (sticky popovers only) ────────────────

  useEffect(() => {
    if (!open || !pinned) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (
        target &&
        !chipRef.current?.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        closeNow();
      }
    };
    // Defer so the click that opened the popover doesn't immediately close it.
    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', handler);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [open, pinned, closeNow]);

  // ─── Keyboard pin: move focus into the popover ────────────────────
  // The popover is portalled to <body>, so Tab from the chip would never
  // reach its controls. `pos` gates the render, so wait for it.

  useEffect(() => {
    if (!pinned || pos === null || !focusCloseOnPinRef.current) return;
    focusCloseOnPinRef.current = false;
    closeButtonRef.current?.focus();
  }, [pinned, pos]);

  // ─── Position computation (run on open + on scroll/resize while open) ─

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const compute = () => {
      const chipRect = chipRef.current?.getBoundingClientRect();
      if (!chipRect) return;
      const POPOVER_MAX_WIDTH = 340;
      const ESTIMATED_HEIGHT = 180;
      const GAP = 8;
      const VIEWPORT_PAD = 12;

      const spaceAbove = chipRect.top;
      const spaceBelow = window.innerHeight - chipRect.bottom;
      const placement: 'above' | 'below' =
        spaceBelow >= ESTIMATED_HEIGHT || spaceBelow >= spaceAbove ? 'below' : 'above';

      // Anchor by the chip's left edge but clamp to viewport.
      // On a phone narrower than 364px the popover shrinks to the
      // viewport (see its maxWidth), so clamp against that width.
      const desiredLeft = chipRect.left;
      const popoverWidth = Math.min(POPOVER_MAX_WIDTH, window.innerWidth - 2 * VIEWPORT_PAD);
      const maxLeft = window.innerWidth - popoverWidth - VIEWPORT_PAD;
      const left = Math.max(VIEWPORT_PAD, Math.min(desiredLeft, maxLeft));

      // Above-placement uses the height ESTIMATE; clamp so a popover
      // taller than the estimate can't push its top edge off-screen
      // (it may overlap the chip instead, which stays dismissable).
      const top =
        placement === 'below'
          ? chipRect.bottom + GAP
          : Math.max(VIEWPORT_PAD, chipRect.top - GAP - ESTIMATED_HEIGHT);

      setPos({ left, top, placement });
    };
    compute();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, [open]);

  // ─── Cleanup timers on unmount ────────────────────────────────────

  useEffect(() => () => cancelTimers(), [cancelTimers]);

  // ─── Display label ────────────────────────────────────────────────

  const displayLabel = sources.map((s) => s.shortLabel).join('; ');

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <>
      {/* Leading space is owned by the chip, not the call site. Call
          sites place <Citation> with NO space before it — so when the
          Citation wrapper returns null (sources hidden), no stray space
          is stranded between the preceding word and the following
          punctuation. `{' '}` is an explicit expression, unaffected by
          JSX whitespace collapsing, so it reliably renders one space
          before the chip when visible. */}
      {' '}
      <button
        ref={chipRef}
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-describedby={open ? popoverId : undefined}
        // The ::after inset widens the touch target past the 11px glyphs
        // without changing line layout.
        className="relative inline-flex items-baseline font-mono text-caption text-muted after:absolute after:-inset-x-0.5 after:-inset-y-2 hover:text-tertiary focus-visible:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-1"
        style={{
          // Inherit baseline alignment from surrounding text. The dotted
          // underline + help cursor is the discoverability cue.
          padding: 0,
          background: 'transparent',
          border: 'none',
          borderBottom: '1px dotted currentColor',
          cursor: 'help',
          letterSpacing: 'inherit',
        }}
      >
        ({displayLabel})
      </button>

      {/* The popover is viewport-fixed and portalled to <body>: chips sit
          inside <p> elements, and a <div> rendered in place would be an
          invalid descendant of <p> (React warns; browsers may re-parent). */}
      {open && pos !== null && createPortal(
        <CitationPopover
          ref={popoverRef}
          id={popoverId}
          sources={sources}
          pageKeys={keyList}
          pos={pos}
          closeButtonRef={closeButtonRef}
          onMouseEnter={() => {
            if (closeTimerRef.current !== null) {
              window.clearTimeout(closeTimerRef.current);
              closeTimerRef.current = null;
            }
          }}
          onMouseLeave={handleMouseLeave}
          onClose={() => {
            closeNow();
            chipRef.current?.focus();
          }}
        />,
        document.body,
      )}
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Popover content
// ──────────────────────────────────────────────────────────────────────

interface CitationPopoverProps {
  id: string;
  sources: CitationMeta[];
  pageKeys: ReadonlyArray<string | undefined>;
  pos: { left: number; top: number; placement: 'above' | 'below' };
  closeButtonRef: RefObject<HTMLButtonElement>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}

const CitationPopover = forwardRef<HTMLDivElement, CitationPopoverProps>(
  function CitationPopover(
    { id, sources, pageKeys, pos, closeButtonRef, onMouseEnter, onMouseLeave, onClose },
    ref,
  ): JSX.Element {
    const style: CSSProperties = {
      position: 'fixed',
      left: pos.left,
      top: pos.top,
      // Never wider than the viewport minus its 12px margins, so the
      // close button stays on screen at 320px.
      maxWidth: 'min(340px, calc(100vw - 24px))',
      width: 'max-content',
      minWidth: 'min(240px, calc(100vw - 24px))',
      zIndex: 50,
      background: 'rgb(var(--white))',
      border: '1px solid rgb(var(--border))',
      padding: '12px 14px',
    };

    // The popover sits at the end of <body>, away from its chip in tab
    // order. Leaving it by Tab in either direction closes it and hands
    // focus back to the chip, so sequential reading resumes there.
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const controls = e.currentTarget.querySelectorAll<HTMLElement>('button, a[href]');
      const first = controls[0];
      const last = controls[controls.length - 1];
      const active = document.activeElement;
      if ((e.shiftKey && active === first) || (!e.shiftKey && active === last)) {
        e.preventDefault();
        onClose();
      }
    };

    return (
      <div
        ref={ref}
        id={id}
        // Non-modal dialog, not tooltip: the ARIA tooltip role forbids
        // interactive content, and this popover holds a close button and
        // toggles open on click.
        role="dialog"
        aria-label="Citation details"
        style={style}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onKeyDown={handleKeyDown}
      >
        {/* First in DOM order so a keyboard pin lands on it and Tab then
            walks the source links; it is absolutely positioned, so the
            visual layout is unchanged. */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close citation details"
          className="inline-flex h-6 w-6 items-center justify-center text-tertiary hover:bg-surface hover:text-ink"
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {sources.length > 1 && (
          <div
            className="font-mono text-[10px] font-bold uppercase"
            style={{
              color: 'rgb(var(--tertiary))',
              letterSpacing: '0.1em',
              marginBottom: 8,
            }}
          >
            Sources for this claim
          </div>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: sources.length > 1 ? 12 : 0,
          }}
        >
          {sources.map((s, i) => {
            const key = pageKeys[i];
            return (
              <SourceBlock
                key={`${s.id}-${i}`}
                source={s}
                pageRef={key ? s.pages?.[key] : undefined}
              />
            );
          })}
        </div>
      </div>
    );
  },
);

function SourceBlock({
  source,
  pageRef,
}: {
  source: CitationMeta;
  pageRef?: string | undefined;
}): JSX.Element {
  return (
    <div className="font-sans text-body-sm">
      <div
        className="font-semibold text-ink"
        style={{ lineHeight: 1.3, marginBottom: 2, paddingRight: 24 }}
      >
        {source.title}
      </div>
      <div style={{ color: 'rgb(var(--secondary))', lineHeight: 1.4 }}>
        {source.authors}
      </div>
      <div
        className="font-mono text-caption"
        style={{
          color: 'rgb(var(--tertiary))',
          marginTop: 4,
          letterSpacing: '0.01em',
        }}
      >
        {source.publisher} · {source.date}
        {pageRef && (
          <>
            {' · '}
            <span style={{ color: 'rgb(var(--secondary))' }}>{pageRef}</span>
          </>
        )}
      </div>
      {source.url && (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 inline-block font-sans text-body-sm font-semibold text-action underline hover:text-action-hover"
        >
          View source<span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
    </div>
  );
}
