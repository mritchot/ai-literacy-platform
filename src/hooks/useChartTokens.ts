// Theme-aware chart tokens. Recharts cannot consume CSS custom properties
// for SVG `fill` / `stroke` attributes (the SVG spec rejects `var(...)`),
// so chart components have historically hardcoded the light-mode hex
// values from `chart-config.ts`. That breaks dark mode — series fills,
// axis labels, and inline `<text>` value labels all stay in their light-
// mode shades, producing low-contrast output on the dark canvas.
//
// This hook returns the appropriate hex palette for the current resolved
// theme. Each chart component calls it once and uses the returned values
// in place of the previous hardcoded `TOKEN_HEX.*` references.

import { useTheme } from './useTheme';

interface ChartTokens {
  ink: string;
  body: string;
  secondary: string;
  tertiary: string;
  muted: string;
  ghost: string;
  borderLight: string;
  action: string;
  // Adoption-tier ramp (4C spec §18.2). Lower tiers were originally tied
  // to neutral grays — those grays disappear on the dark canvas, so the
  // dark variants ramp lighter for visibility while staying neutral.
  tierLeading: string;
  tierUpperMiddle: string;
  tierLowerMiddle: string;
  tierEmerging: string;
  // Chart-only tertiary — the pre-3B-8 #888888 kept for chart marks
  // (dumbbell workforce markers, pill fallbacks) where the text-contrast
  // pass doesn't apply. Same pairing as tierLowerMiddle.
  tertiaryChart: string;
  // Feedback hues used as chart fills / inline chart text.
  caution: string;
  error: string;
  info: string;
  // 4D competency hues used as chart series fills or value text (P3
  // View C, dashboards' legend swatches). Static brand-accent uses
  // (tab underlines, competency dots) keep the plain TOKEN_HEX values.
  delegation: string;
  discernment: string;
}

const LIGHT: ChartTokens = {
  ink: '#2D2D2D',
  body: '#555555',
  secondary: '#666666',
  tertiary: '#6E6E6E', // post-3B-8 contrast pass
  muted: '#6E6E6E',
  ghost: '#949494',
  borderLight: '#E0DDD7',
  action: '#3D5A4E',
  tierLeading: '#3D5A4E', // --action
  tierUpperMiddle: '#666666', // --secondary
  tierLowerMiddle: '#888888', // --tertiary (chart-only — preserves the original ramp)
  tierEmerging: '#BBBBBB', // --ghost (chart-only)
  tertiaryChart: '#888888', // pre-3B-8 tertiary (matches TOKEN_HEX.tertiary)
  caution: '#9B7B2E',
  error: '#8B4A4A',
  info: '#5E7080',
  delegation: '#6B7F5E',
  discernment: '#5E7080',
};

const DARK: ChartTokens = {
  ink: '#E8E5E0',
  body: '#C0BAB0',
  secondary: '#A8A29A',
  tertiary: '#969189', // post-3B-8 contrast pass
  muted: '#95918B',
  ghost: '#605A52',
  borderLight: '#33302B',
  // Action in dark mode is the inverted lighter teal so series accented
  // with `action` remain visible on the dark canvas.
  action: '#8BB8A8',
  // Tier ramp lightened for the dark canvas. The hue family stays neutral
  // (warm gray on the warm dark canvas) but the ladder reads on the dark
  // background. Each step preserves the same perceptual delta from the
  // canvas (~#1A1917) that the light ramp had from white.
  tierLeading: '#8BB8A8', // dark action — same role
  tierUpperMiddle: '#A8A29A',
  tierLowerMiddle: '#807A72',
  tierEmerging: '#5C564D',
  tertiaryChart: '#807A72', // same step as tierLowerMiddle
  // Feedback hues lifted to their dark-theme CSS-variable values
  // (index.css §10.4) so inline chart fills/text match the rest of the
  // dark UI — e.g. the error chips sit on the dark --error-light wash.
  caution: '#B8943A',
  error: '#BD8383',
  info: '#7A96A8',
  // Competency hues lightened to their established dark-mode text
  // variants (CompetencyDot.textDark / --{competency}-text): same hue
  // family, but readable as fills against the dark canvas (~#1A1917).
  delegation: '#B5C4AB',
  discernment: '#A8BCCA',
};

export function useChartTokens(): ChartTokens {
  const { resolved } = useTheme();
  return resolved === 'dark' ? DARK : LIGHT;
}
