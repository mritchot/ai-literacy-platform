// ReferenceTriggerButton — shared button used by ReferenceTrigger.
// Renders the folder-tab handle used inside `<ReferenceTabRail>`: a
// rounded-left card flush against the right viewport edge, sticking
// out as a "pull tab" affordance. (An 'inline' variant existed for the
// pre-tab-rail layout; it had no remaining call sites and was removed.)
//
// All trigger buttons share the same content: book icon + reference
// label + small mono R-identifier tag.

import { Icon } from '../shared/Icon';

interface ReferenceTriggerButtonProps {
  /** Two-character reference identifier — "R1" through "R7". */
  refId: string;
  /** Human-readable reference name displayed on the button. */
  label: string;
  /** Click handler — opens the corresponding ReferencePanel. */
  onClick: () => void;
  /** Visual variant; the tab handle is the only remaining treatment. */
  variant?: 'tab';
}

export function ReferenceTriggerButton({
  refId,
  label,
  onClick,
}: ReferenceTriggerButtonProps): JSX.Element {
  return <TabHandle refId={refId} label={label} onClick={onClick} />;
}

// ─── Tab handle ───────────────────────────────────────────────────
//
// Folder-tab handle that sticks out from the right edge of the
// viewport. Container (`ReferenceTabRail`) handles positioning and
// stacking; this component owns only the visual treatment of an
// individual tab.
//
// Visual spec:
//   • Narrow vertical strip (~40px × 156px), oriented like a folder
//     index tab
//   • Rounded-left corners; right side flush against viewport edge
//   • Layout (top → bottom): book icon → rotated reference label →
//     mono R-identifier
//   • Label uses `writing-mode: vertical-rl` + 180° rotation so it
//     reads bottom-to-top — natural to scan with a head-tilt-left,
//     which matches how physical folder tabs are read
//   • Soft outward shadow on the left so the tab reads as "in front of"
//     the page content
//   • On hover: slides 4px left and shadow deepens slightly
// ──────────────────────────────────────────────────────────────────

function TabHandle({
  refId,
  label,
  onClick,
}: Omit<ReferenceTriggerButtonProps, 'variant'>): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${label} reference panel`}
      className="group inline-flex flex-col items-center transition-all duration-200 hover:translate-x-[-4px]"
      style={{
        // Restore pointer events — the parent rail has
        // `pointer-events: none` so its empty space lets clicks through
        // to the page; this button must opt back in.
        pointerEvents: 'auto',
        width: 38,
        // Tall enough that the longest reference label
        // ("Verification Checklist", 22 chars) fits as a single line of
        // vertical text at 11px without overflow.
        minHeight: 210,
        padding: '10px 0',
        color: 'rgb(var(--ink))',
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderRight: 'none',
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        boxShadow: '-3px 2px 10px rgba(0, 0, 0, 0.08)',
        cursor: 'pointer',
        gap: 8,
      }}
    >
      <Icon name="book" size={14} />
      <span
        className="font-sans font-semibold"
        style={{
          // Vertical orientation — reads bottom-to-top so a head-tilt-
          // left scans the label naturally (the convention for folder
          // tabs in Western reading order).
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          flex: 1,
          fontSize: 11,
          letterSpacing: '0.005em',
          lineHeight: 1.2,
          // Single-line vertical text. We deliberately do NOT use
          // `text-overflow: ellipsis` here — the tab is sized to fit
          // every current reference label, so any future overflow
          // should be visible and noticed (so the label can be
          // shortened) rather than silently truncated.
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <span
        className="font-mono text-[10px] font-bold uppercase"
        style={{
          color: 'rgb(var(--tertiary))',
          letterSpacing: '0.08em',
          paddingTop: 4,
          borderTop: '1px solid rgb(var(--border-light))',
          width: '70%',
          textAlign: 'center',
        }}
      >
        {refId}
      </span>
    </button>
  );
}
