// The ▾ disclosure marker on expandable-card toggle buttons. Decorative
// (the button's aria-expanded carries the state); rotates to point up
// while the panel is open. Omitted in print mode, where every panel is
// open and the header reads as a heading.

import { usePrintMode } from '../../contexts/PrintModeContext';

interface DisclosureChevronProps {
  expanded: boolean;
  /** Extra classes for placement tweaks (e.g. `pt-1` to align with a
   *  taller header row). */
  className?: string;
}

export function DisclosureChevron({ expanded, className }: DisclosureChevronProps): JSX.Element | null {
  if (usePrintMode()) return null;
  return (
    <span
      aria-hidden="true"
      className={className ? `text-tertiary transition-transform ${className}` : 'text-tertiary transition-transform'}
      style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
    >
      ▾
    </span>
  );
}
