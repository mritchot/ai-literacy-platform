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

// Dark-mode competency text colors. These duplicate the `.dark`
// `--{competency}-text` values in index.css, and exist only to back the
// `--competency-text-*` custom properties the landing page's legend
// reads. CompetencyDot itself uses the index.css tokens directly.
const TEXT_DARK: Record<CompetencyKey, string> = {
  delegation: '#B5C4AB',
  description: '#C9B99E',
  discernment: '#A8BCCA',
  diligence: '#BEA8C9',
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

// Single inline rule that flips all four competency text colors in dark mode.
// Rendered once at the top of the App so each dot is a pure component.
export function CompetencyDarkStyles(): JSX.Element {
  return (
    <style>{`
      .dark {
        --competency-text-delegation: ${TEXT_DARK.delegation};
        --competency-text-description: ${TEXT_DARK.description};
        --competency-text-discernment: ${TEXT_DARK.discernment};
        --competency-text-diligence: ${TEXT_DARK.diligence};
      }
    `}</style>
  );
}
