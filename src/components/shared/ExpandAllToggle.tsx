// The "Expand all / Collapse all" text button that sits above a stack of
// expandable cards. Pairs with useExpandableSet: pass its `allOpen` and
// call `setAll(next)` from `onToggle`.

interface ExpandAllToggleProps {
  allOpen: boolean;
  onToggle: (next: boolean) => void;
}

export function ExpandAllToggle({ allOpen, onToggle }: ExpandAllToggleProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onToggle(!allOpen)}
      className="font-sans text-[12px] font-semibold text-action hover:text-action-hover"
    >
      {allOpen ? 'Collapse all' : 'Expand all'}
    </button>
  );
}
