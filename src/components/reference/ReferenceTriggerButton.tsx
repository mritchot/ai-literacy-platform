// ReferenceTriggerButton — shared button used by every RxTrigger. The
// `variant` prop controls visual treatment:
//   • 'inline' — original treatment (small ghost button that sat above
//      the activity in flow). Currently unused at any call site after
//      the tab-rail redesign, but kept available so consumers outside
//      of the activity layout (e.g., a future docs index) can still
//      embed a reference trigger inline.
//   • 'tab' — used by `ReferenceTabRail` only. Rounded-left card that
//      sits flush against the right edge of the viewport, ~140px × 38px,
//      sticking out as a "pull tab" affordance.
//
// All trigger buttons share the same content: book icon + reference
// label + small mono R-identifier tag. Centralizing the rendering here
// means visual changes apply once (rather than across seven RxTrigger
// files).

import { Icon } from '../shared/Icon';

interface ReferenceTriggerButtonProps {
  /** Two-character reference identifier — "R1" through "R7". */
  refId: string;
  /** Human-readable reference name displayed on the button. */
  label: string;
  /** Click handler — opens the corresponding ReferencePanel. */
  onClick: () => void;
  /** Visual variant. Defaults to 'inline'. */
  variant?: 'inline' | 'tab';
}

export function ReferenceTriggerButton({
  refId,
  label,
  onClick,
  variant = 'inline',
}: ReferenceTriggerButtonProps): JSX.Element {
  if (variant === 'tab') return <TabHandle refId={refId} label={label} onClick={onClick} />;
  return <InlineButton refId={refId} label={label} onClick={onClick} />;
}

// ─── Inline variant ────────────────────────────────────────────────

function InlineButton({
  refId,
  label,
  onClick,
}: Omit<ReferenceTriggerButtonProps, 'variant'>): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${label} reference panel`}
      className="inline-flex items-center gap-1.5 rounded-md font-sans text-[12px] font-semibold transition-colors duration-150"
      style={{
        padding: '5px 10px',
        color: 'rgb(var(--secondary))',
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
      }}
    >
      <Icon name="book" size={13} />
      <span>{label}</span>
      <span
        className="font-mono text-[10px] font-bold uppercase"
        style={{
          color: 'rgb(var(--tertiary))',
          letterSpacing: '0.08em',
          paddingLeft: 4,
          borderLeft: '1px solid rgb(var(--border))',
          marginLeft: 4,
        }}
      >
        {refId}
      </span>
    </button>
  );
}

// ─── Tab variant ──────────────────────────────────────────────────
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
