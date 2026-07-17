// Shared Recharts configuration tokens (4A spec §11.2).
// All Module 2 chart components consume these to keep tooltip styling, axis
// typography, animation timing, and competency color mappings consistent.

import type { CSSProperties, SVGProps } from 'react';

export const TOOLTIP_STYLE: CSSProperties = {
  background: 'rgb(var(--white))',
  border: '1px solid rgb(var(--border))',
  borderRadius: 0,
  padding: '8px 12px',
  fontSize: 13,
  // Tooltips read as data, not prose: mono keeps the figures aligned
  // column-to-column as they update under the cursor.
  fontFamily: '"IBM Plex Mono", ui-monospace, Menlo, monospace',
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
  fontSize: 11,
  fontFamily: '"IBM Plex Mono", ui-monospace, Menlo, monospace',
  fill: 'rgb(var(--tertiary))',
};

// Augmentation pattern fills (Delegation shades) — order matches
// collaboration_patterns.categories[0..2]. Regenerated from the retuned
// --delegation base; the mid and wash steps are the competency's -text
// (dark) and -light (light) tint values, which the retune left alone.
export const DELEGATION_COLORS = ['#5c7050', '#B5C4AB', '#E8EDE4'] as const;

// Automation pattern fills (Discernment shades) — categories[3..4].
export const DISCERNMENT_COLORS = ['#506579', '#A8BCCA'] as const;

// Plain hex shorthands for tokens that Recharts would reference as fills
// or strokes — Recharts cannot read CSS variables, so we expose hex copies.
//
// NOTE: these are static LIGHT-mode hexes. Chart fills, strokes, and
// inline value text must NOT reference them directly — use the
// theme-resolved `useChartTokens()` hook instead, or dark mode keeps
// light-mode shades on the sumi canvas.
//
// This table currently has no consumers: the last two (the AugAutoDashboard
// and NextTokenDemo tab underlines) moved onto `rgb(var(--…))` directly,
// since they are CSS borders and don't need the hex round-trip that SVG
// paint does. Kept as the canonical light-mode reference for the chart
// layer; delete it if nothing claims it.
// Regenerated from the retuned light-mode tokens. Each entry mirrors its
// own base rather than a neighbour's: `info` previously carried the old
// discernment accent rather than --info, so it now moves to the real
// --info value.
export const TOKEN_HEX = {
  action: '#0c6b76',
  success: '#477655',
  caution: '#7a6124',
  error: '#8b4a4a',
  info: '#5a6c7b',
  delegation: '#5c7050',
  description: '#7a6349',
  discernment: '#506579',
  diligence: '#6c5b74',
  ink: '#1e1c19',
  body: '#57534b',
  secondary: '#635e55',
  tertiary: '#6b665c',
  muted: '#6b665c',
  ghost: '#8a8478',
  borderLight: '#e3ddd2',
} as const;

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

export function formatCurrency(value: number): string {
  return `$${Math.round(value)}`;
}
