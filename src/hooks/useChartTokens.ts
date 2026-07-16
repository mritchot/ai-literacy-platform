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
  action: string;
  // Adoption-tier ramp (4C spec §18.2). Four steps off the neutral scale,
  // anchored by --action; each step inverts with the theme so the ladder
  // keeps its ordering on either ground.
  tierLeading: string;
  tierUpperMiddle: string;
  tierLowerMiddle: string;
  tierEmerging: string;
  // Chart-only neutral for marks (dumbbell workforce markers, fallbacks)
  // where the text-contrast floor doesn't apply, so it can sit lighter
  // than --tertiary. Same pairing as tierLowerMiddle.
  tertiaryChart: string;
  // Feedback hues used as chart fills / inline chart text.
  caution: string;
  error: string;
  info: string;
  // 4D competency hues used as chart series fills or value text (P3
  // View C, dashboards' legend swatches). Anything drawn with CSS rather
  // than SVG paint — tab underlines, competency swatches — reads the
  // `--{competency}` variable directly instead of coming through here.
  delegation: string;
  discernment: string;
}

// Both palettes are the resolved hex values of the CSS tokens in
// index.css, regenerated whenever those retune. Each entry mirrors its own
// base token — the neutral steps come off the warm ink scale, the feedback
// and competency hues off their own families.
const LIGHT: ChartTokens = {
  ink: '#1e1c19',
  body: '#57534b',
  secondary: '#635e55',
  tertiary: '#6b665c',
  muted: '#6b665c',
  ghost: '#8a8478',
  action: '#0c6b76',
  // Tier ramp: four descending steps off the neutral scale, anchored by
  // --action at the top. Lower tiers use --ghost / --subtle rather than
  // --tertiary so the four steps stay visually distinct from one another.
  tierLeading: '#0c6b76', // --action
  tierUpperMiddle: '#635e55', // --secondary
  tierLowerMiddle: '#8a8478', // --ghost
  tierEmerging: '#b3ada2', // --subtle
  tertiaryChart: '#8a8478', // same step as tierLowerMiddle
  caution: '#7a6124',
  error: '#8b4a4a',
  info: '#5a6c7b',
  delegation: '#5c7050',
  discernment: '#506579',
};

const DARK: ChartTokens = {
  ink: '#e6e2d9',
  body: '#b3aea2',
  secondary: '#a49f93',
  tertiary: '#948f83',
  muted: '#948f83',
  ghost: '#6e6a60',
  // Action in dark mode is the lighter teal, so series accented with
  // `action` stay visible on the sumi canvas.
  action: '#4cc3d0',
  // Tier ramp mirrored onto the dark scale: the same four token steps,
  // each of which inverts, so the ladder keeps its ordering against the
  // dark ground.
  tierLeading: '#4cc3d0', // --action
  tierUpperMiddle: '#a49f93', // --secondary
  tierLowerMiddle: '#6e6a60', // --ghost
  tierEmerging: '#565248', // --subtle
  tertiaryChart: '#6e6a60', // same step as tierLowerMiddle
  caution: '#c19a45',
  error: '#c98f8f',
  info: '#8caabf',
  // Competency hues at their dark-mode values: same family, readable as
  // fills against the sumi canvas.
  delegation: '#a8bc9a',
  discernment: '#93b0c6',
};

export function useChartTokens(): ChartTokens {
  const { resolved } = useTheme();
  return resolved === 'dark' ? DARK : LIGHT;
}
