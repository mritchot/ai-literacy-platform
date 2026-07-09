// ReferenceTabRail — fixed-position container that pins one or more
// reference-trigger tabs to the right edge of the viewport. Used at
// every activity that has reference triggers (replaces the previous
// inline trigger row + scroll-driven sticky bar).
//
// Behavior:
//   • Always visible while the rail is mounted (no scroll detection).
//   • Tabs stack vertically, top-to-bottom in DOM order.
//   • Vertical center anchored to viewport mid (top: 50%; translate -50%).
//   • Each child is expected to be an RxTrigger rendered with
//     `variant="tab"` so it produces a tab-handle button.
//   • The rail itself doesn't manage panel state; each RxTrigger child
//     keeps its own open/close state, and on click slides out the
//     associated `ReferencePanel`.
//
// Z-index 30 puts the rail above page content but well below the panel
// overlay (z-100), so when a panel opens it covers the tabs.

import type { ReactNode } from 'react';

interface ReferenceTabRailProps {
  /** One or more `<RxTrigger />` children. */
  children: ReactNode;
  /** Optional label override for screen-reader landmark. */
  ariaLabel?: string;
}

export function ReferenceTabRail({
  children,
  ariaLabel = 'Reference materials',
}: ReferenceTabRailProps): JSX.Element {
  // CRITICAL: do NOT use `transform` on this element. A `transform`
  // creates a new containing block for descendants with `position:
  // fixed`, which would re-anchor `ReferencePanel` (rendered inside
  // each child trigger) to the rail instead of the viewport — breaking
  // the panel's drawer rendering. To vertically center the tabs we use
  // a full-height fixed strip + flex `justifyContent: 'center'`.
  // `pointer-events: none` on the strip lets clicks pass through the
  // empty space; the tab buttons themselves restore `pointer-events:
  // auto` so they remain clickable.
  return (
    <nav
      aria-label={ariaLabel}
      className="fixed z-30 flex flex-col"
      style={{
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {children}
    </nav>
  );
}
