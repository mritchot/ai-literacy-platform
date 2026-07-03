// Overline — uppercase mono section divider (design system 2.2).

import type { CSSProperties, ReactNode } from 'react';

interface OverlineProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Rendered element. Use 'span' when the Overline sits inside a
   *  heading — a div inside <h2> violates the heading content model.
   *  Both render block-level (span gets `block`), so visuals match. */
  as?: 'div' | 'span';
}

export function Overline({
  children,
  className = '',
  style,
  as: Tag = 'div',
}: OverlineProps): JSX.Element {
  return (
    <Tag
      className={`${Tag === 'span' ? 'block ' : ''}font-mono text-overline font-bold uppercase text-tertiary ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
}
