// SectionIndicator — done/current/todo glyphs for the sidebar section list.
// Filled check, ringed dot, or empty ring. No color is the sole differentiator —
// the icon shape carries the meaning (Section 9.1).

import type { SectionState } from '../../data/program';
import { Icon } from './Icon';

interface SectionIndicatorProps {
  state: SectionState;
}

export function SectionIndicator({ state }: SectionIndicatorProps): JSX.Element {
  if (state === 'done') {
    return (
      <span
        className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-action text-[rgb(var(--white))]"
        aria-label="Completed"
      >
        <Icon name="check" size={10} />
      </span>
    );
  }
  if (state === 'current') {
    return (
      <span
        className="relative mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center"
        aria-label="In progress"
      >
        <span
          className="absolute inset-0 rounded-full opacity-40"
          style={{ border: '1.5px solid rgb(var(--action))' }}
        />
        <span
          className="block rounded-full bg-action"
          style={{ width: 7, height: 7 }}
        />
      </span>
    );
  }
  return (
    <span
      className="mt-0.5 inline-block h-4 w-4 flex-shrink-0 rounded-full"
      style={{ border: '1.5px solid rgb(var(--ghost))' }}
      aria-label="Not started"
    />
  );
}
