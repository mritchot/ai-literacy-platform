// Shared expand/collapse state for stacks of independently expandable
// rows or cards (ADR records, Gantt phases, module cards, occupation
// rows, KC review items). Multi-open by design: a reader comparing two
// entries shouldn't have to close one to open the other.
//
// `allIds` is optional: pass it where the UI offers an "Expand all"
// control (it defines what "all" means for `allOpen`/`setAll(true)`);
// omit it for toggle-only consumers, where `setAll(true)` is a no-op
// and `clear()` is the useful reset.
//
// In print mode (src/contexts/PrintModeContext.tsx) every id reads as
// open and `allOpen` is true, so the PDF render shows each panel without
// the print shell touching the buttons. The toggles still update the set;
// it simply is not consulted until print mode ends.

import { useState } from 'react';
import { usePrintMode } from '../contexts/PrintModeContext';

export function useExpandableSet<T>(allIds?: readonly T[]): {
  isOpen: (id: T) => boolean;
  toggle: (id: T) => void;
  allOpen: boolean;
  setAll: (expanded: boolean) => void;
  clear: () => void;
} {
  const [open, setOpen] = useState<Set<T>>(() => new Set());
  const printMode = usePrintMode();

  const toggle = (id: T): void =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return {
    isOpen: (id: T) => printMode || open.has(id),
    allOpen: printMode || (allIds !== undefined && open.size === allIds.length),
    setAll: (expanded: boolean) =>
      setOpen(expanded && allIds ? new Set(allIds) : new Set()),
    clear: () => setOpen(new Set()),
    toggle,
  };
}
