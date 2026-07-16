// Shared Recharts configuration tokens (4A spec §11.2).
// All Module 2 chart components consume these to keep tooltip styling, axis
// typography, animation timing, and competency color mappings consistent.

import type { CSSProperties, SVGProps } from 'react';

export const TOOLTIP_STYLE: CSSProperties = {
  background: 'rgb(var(--white))',
  border: '1px solid rgb(var(--border))',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 13,
  fontFamily: '"IBM Plex Sans", system-ui, -apple-system, sans-serif',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.07)',
  color: 'rgb(var(--ink))',
};

// Recharts default tooltip applies the *bar fill color* as the inline `color`
// of each item line. That's redundant for our charts (the series identity is
// conveyed by the item's name label and the chart's legend), and it produces
// low-contrast readouts in dark mode whenever the bar fill is a mid-tone
// (e.g. the geographic chart's Lower Middle / Emerging tiers, or any of the
// neutral grays used by the trend bars). Pass this `itemStyle` to every
// `<Tooltip>` so the value text always reads in `--ink`. The color swatch
// (a small dot before the item label) still uses the bar's fill, so the
// visual identity isn't lost.
export const TOOLTIP_ITEM_STYLE: CSSProperties = {
  color: 'rgb(var(--ink))',
};

// Same fix for the bold category label at the top of the tooltip — a few
// charts pass the X-axis category through `labelFormatter`, and that text
// also needs to be locked to `--ink`.
export const TOOLTIP_LABEL_STYLE: CSSProperties = {
  color: 'rgb(var(--ink))',
  fontWeight: 600,
};

// Recharts passes axis tick objects as SVG attributes onto a <text> element,
// so this needs to be SVGProps-compatible — not a generic CSSProperties bag.
export const AXIS_TICK_STYLE: SVGProps<SVGTextElement> = {
  fontSize: 12,
  fontFamily: '"IBM Plex Sans", system-ui, -apple-system, sans-serif',
  fill: 'rgb(var(--tertiary))',
};

// Augmentation pattern fills (Delegation olive shades) — order matches
// collaboration_patterns.categories[0..2].
export const DELEGATION_COLORS = ['#6B7F5E', '#B5C4AB', '#E8EDE4'] as const;

// Automation pattern fills (Discernment blue-gray shades) — categories[3..4].
export const DISCERNMENT_COLORS = ['#5E7080', '#A8BCCA'] as const;

// Plain hex shorthands for tokens that are referenced by Recharts as fills
// or strokes — Recharts cannot read CSS variables, so we expose hex copies.
//
// NOTE: these are static LIGHT-mode hexes. Chart fills, strokes, and
// inline value text must NOT reference them directly — use the
// theme-resolved `useChartTokens()` hook instead, or dark mode keeps
// light-mode shades on the dark canvas. Remaining legitimate consumers:
//   - AugAutoDashboard / NextTokenDemo tab underlines: `delegation` /
//     `discernment` as static 4D brand accents on borders (mid-tones
//     that read on both canvases — same convention as CompetencyDot).
// Everything else has been migrated to useChartTokens.
export const TOKEN_HEX = {
  action: '#3D5A4E',
  success: '#4A7C59',
  caution: '#9B7B2E',
  error: '#8B4A4A',
  info: '#5E7080',
  delegation: '#6B7F5E',
  description: '#8B7355',
  discernment: '#5E7080',
  diligence: '#7A6B80',
  ink: '#2D2D2D',
  body: '#555555',
  secondary: '#666666',
  tertiary: '#888888',
  muted: '#999999',
  ghost: '#BBBBBB',
  borderLight: '#E0DDD7',
} as const;

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

export function formatCurrency(value: number): string {
  return `$${Math.round(value)}`;
}
