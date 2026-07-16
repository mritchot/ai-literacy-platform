// CompetencyDot — pill showing a 4D dimension (label + colored dot).
// Background tinted at ~12% opacity over the competency `bg` color;
// text uses the competency `text` token (light) and `mid` token (dark).

import type { CompetencyKey } from '../../data/program';

const HEX: Record<CompetencyKey, { bg: string; text: string; textDark: string; label: string }> = {
  delegation: { bg: '#6B7F5E', text: '#3D4A35', textDark: '#B5C4AB', label: 'Delegation' },
  description: { bg: '#8B7355', text: '#5A4A37', textDark: '#C9B99E', label: 'Description' },
  discernment: { bg: '#5E7080', text: '#354A57', textDark: '#A8BCCA', label: 'Discernment' },
  diligence: { bg: '#7A6B80', text: '#4A3557', textDark: '#BEA8C9', label: 'Diligence' },
};

interface CompetencyDotProps {
  competency: CompetencyKey;
  size?: number;
}

export function CompetencyDot({ competency, size = 9 }: CompetencyDotProps): JSX.Element {
  const c = HEX[competency];
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-medium"
      style={{
        backgroundColor: `${c.bg}1F`,
        padding: '4px 10px 4px 8px',
        letterSpacing: '0.02em',
        color: `var(--competency-text-${competency}, ${c.text})`,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: c.bg,
          flexShrink: 0,
        }}
      />
      {c.label}
    </span>
  );
}

// Single inline rule that flips all four competency text colors in dark mode.
// Rendered once at the top of the App so each dot is a pure component.
export function CompetencyDarkStyles(): JSX.Element {
  return (
    <style>{`
      .dark {
        --competency-text-delegation: ${HEX.delegation.textDark};
        --competency-text-description: ${HEX.description.textDark};
        --competency-text-discernment: ${HEX.discernment.textDark};
        --competency-text-diligence: ${HEX.diligence.textDark};
      }
    `}</style>
  );
}
