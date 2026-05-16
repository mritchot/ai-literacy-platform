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
};

export function useChartTokens(): ChartTokens {
  const { resolved } = useTheme();
  return resolved === 'dark' ? DARK : LIGHT;
}
