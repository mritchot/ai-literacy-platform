// CompetencyDot — a 4D dimension rendered as a square swatch plus its
// label. The pill it used to live in (tinted capsule, rounded dot) is
// retired: the swatch is a hard 8px square in the competency accent, the
// label is tracked mono uppercase in the competency `-text` token, and
// the two sit in a bare inline-flex with no background of their own.
// Both colors resolve through CSS variables, so the mark follows the
// theme without this component needing to know which one is active.

import type { CompetencyKey } from '../../data/program';

const LABEL: Record<CompetencyKey, string> = {
  delegation: 'Delegation',
  description: 'Description',
  discernment: 'Discernment',
  diligence: 'Diligence',
};

interface CompetencyDotProps {
  competency: CompetencyKey;
  /** Swatch edge in px. 8 is the system default; callers rendering the
   *  mark inside dense rows step it down to sit on the text baseline. */
  size?: number;
}

export function CompetencyDot({ competency, size = 8 }: CompetencyDotProps): JSX.Element {
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-medium uppercase"
      style={{
        letterSpacing: '0.02em',
        color: `rgb(var(--${competency}-text))`,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          backgroundColor: `rgb(var(--${competency}))`,
          flexShrink: 0,
        }}
      />
      {LABEL[competency]}
    </span>
  );
}
