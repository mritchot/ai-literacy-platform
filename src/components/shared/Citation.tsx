// Citation — inline (Author, Year) chip with hover/click/focus popover
// showing full source metadata (Tier B per the citation spec: title,
// authors, publisher, date, optional page reference).
//
// Interaction model — hybrid:
//   • Mouse hover (devices with `(pointer: fine)`): popover opens after
//     a 250ms delay; closes 150ms after the mouse leaves both chip and
//     popover. The delay prevents accidental triggers while reading.
//   • Click / tap: toggles the popover open. Click-opened popovers stay
//     open until explicitly dismissed (Esc, outside click, or X close).
//   • Keyboard focus (Tab): opens the popover; Esc closes; Tab moves to
//     the next focusable element on the page.
//
// Visual cue — the chip uses a dotted underline + `cursor: help` so it
// reads as "click for more" without disrupting the reading flow.
//
// Compound citations: pass an array of ids — the popover then lists
// each source as a separate block, matching how academic compound
// citations work ("(Source A; Source B)" → both sources surfaced).

import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { getCitation, type CitationMeta } from '../../data/citations';
import { useCitations } from '../../hooks/useCitations';

interface CitationProps {
  /** One or more citation IDs from the `CITATIONS` map. */
  ids: string | string[];
  /** Optional key into a citation's `pages` map for a stat-specific
   *  page reference. When supplied with a multi-id citation, it applies
   *  only to the FIRST id. */
  pageKey?: string;
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
  const { showCitations } = useCitations();
  if (!showCitations) return null;
  return <CitationChip {...props} />;
}

function CitationChip({ ids, pageKey }: CitationProps): JSX.Element {
  const idList = Array.isArray(ids) ? ids : [ids];
  const sources = idList.map((id) => getCitation(id));
  const popoverId = useId();

  const [open, setOpen] = useState(false);
  // Tracks whether the open was triggered by hover (so mouseleave can
  // auto-close) vs click/focus (which require explicit dismissal).
  const stickyRef = useRef(false);

  const chipRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  // Computed popover position (viewport-fixed).
  const [pos, setPos] = useState<{
    left: number;
    top: number;
    placement: 'above' | 'below';
  } | null>(null);

  // ─── Open / close helpers ─────────────────────────────────────────

  const cancelTimers = () => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openNow = (sticky: boolean) => {
    cancelTimers();
    stickyRef.current = sticky;
    setOpen(true);
  };

  const closeNow = () => {
    cancelTimers();
    setOpen(false);
    stickyRef.current = false;
  };

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

  const handleClick = () => {
    if (open) closeNow();
    else openNow(true); // click → sticky open
  };

  const handleFocus = () => {
    // Focus opens but is non-sticky; pressing Tab away closes naturally
    // via blur. Esc still works as an explicit dismissal.
    if (!open) openNow(false);
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
    if (!open || !stickyRef.current) return;
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
  }, [open]);

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
      const desiredLeft = chipRect.left;
      const maxLeft = window.innerWidth - POPOVER_MAX_WIDTH - VIEWPORT_PAD;
      const left = Math.max(VIEWPORT_PAD, Math.min(desiredLeft, maxLeft));

      const top =
        placement === 'below'
          ? chipRect.bottom + GAP
          : chipRect.top - GAP - ESTIMATED_HEIGHT;

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

  useEffect(() => () => cancelTimers(), []);

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
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-describedby={open ? popoverId : undefined}
        className="inline-flex items-baseline font-mono text-caption text-muted hover:text-tertiary focus-visible:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-1"
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

      {open && pos !== null && (
        <CitationPopover
          ref={popoverRef}
          id={popoverId}
          sources={sources}
          pageKey={pageKey}
          pos={pos}
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
        />
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
  pageKey?: string;
  pos: { left: number; top: number; placement: 'above' | 'below' };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}

const CitationPopover = forwardRef<HTMLDivElement, CitationPopoverProps>(
  function CitationPopover(
    { id, sources, pageKey, pos, onMouseEnter, onMouseLeave, onClose },
    ref,
  ): JSX.Element {
    const style: CSSProperties = {
      position: 'fixed',
      left: pos.left,
      top: pos.top,
      maxWidth: 340,
      width: 'max-content',
      minWidth: 240,
      zIndex: 50,
      background: 'rgb(var(--white))',
      border: '1px solid rgb(var(--border))',
      borderRadius: 8,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      padding: '12px 14px',
    };

    return (
      <div
        ref={ref}
        id={id}
        role="tooltip"
        style={style}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
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
          {sources.map((s, i) => (
            <SourceBlock
              key={s.id}
              source={s}
              pageRef={i === 0 && pageKey ? s.pages?.[pageKey] : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close citation details"
          className="inline-flex h-6 w-6 items-center justify-center rounded text-tertiary hover:bg-surface hover:text-ink"
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
      </div>
    );
  },
);

function SourceBlock({
  source,
  pageRef,
}: {
  source: CitationMeta;
  pageRef?: string;
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
    </div>
  );
}
