// Shared expand/collapse state for stacks of independently expandable
// rows or cards (ADR records, Gantt phases, module cards, occupation
// rows, KC review items). Multi-open by design: a reader comparing two
// entries shouldn't have to close one to open the other.
//
// `allIds` is optional: pass it where the UI offers an "Expand all"
// control (it defines what "all" means for `allOpen`/`setAll(true)`);
// omit it for toggle-only consumers, where `setAll(true)` is a no-op
// and `clear()` is the useful reset.

import { useState } from 'react';

export function useExpandableSet<T>(allIds?: readonly T[]): {
  isOpen: (id: T) => boolean;
  toggle: (id: T) => void;
  allOpen: boolean;
  setAll: (expanded: boolean) => void;
  clear: () => void;
} {
  const [open, setOpen] = useState<Set<T>>(() => new Set());

  const toggle = (id: T): void =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return {
    isOpen: (id: T) => open.has(id),
    allOpen: allIds !== undefined && open.size === allIds.length,
    setAll: (expanded: boolean) =>
      setOpen(expanded && allIds ? new Set(allIds) : new Set()),
    clear: () => setOpen(new Set()),
    toggle,
  };
}
