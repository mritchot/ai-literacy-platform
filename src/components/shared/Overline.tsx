// Overline — uppercase mono section divider (design system 2.2).

import type { CSSProperties, ReactNode } from 'react';

interface OverlineProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Overline({ children, className = '', style }: OverlineProps): JSX.Element {
  return (
    <div
      className={`font-mono text-overline font-bold uppercase text-tertiary ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
