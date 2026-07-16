// Design-system token data for the living style guide.
//
// Values mirror src/styles/index.css (the implemented single source of truth)
// and the Phase 3 Design System Document (§1). Where the two differ, the
// IMPLEMENTED value wins: the palette was retuned to the ritchot.me identity
// — washi paper in light mode, sumi ink in dark — and every value was checked
// against WCAG 2.2 AA on the ground it actually sits on. Each token stores
// its light and dark RGB triple — the exact `rgb(var(--token))` format the
// components consume — so the page renders both the swatch grid and the forced
// light/dark preview scopes from this one dataset; they cannot drift apart.
//
// Source: src/styles/index.css; Phase 3 Design System Document §1, §10.

import type { CompetencyKey } from '../../data/program';

export interface TokenSpec {
  /** CSS custom-property name without the leading `--` (e.g. 'ink'). */
  name: string;
  /** Light-mode RGB triple, space-separated (e.g. '45 45 45'). */
  light: string;
  /** Dark-mode RGB triple. */
  dark: string;
  usage: string;
}

export const NEUTRAL_TOKENS: TokenSpec[] = [
  { name: 'ink', light: '30 28 25', dark: '230 226 217', usage: 'Primary body text, headings' },
  { name: 'ink-secondary', light: '46 43 39', dark: '210 206 196', usage: 'Subheadings, emphasized body text' },
  { name: 'body', light: '87 83 75', dark: '179 174 162', usage: 'Standard body text in content areas' },
  { name: 'secondary', light: '99 94 85', dark: '164 159 147', usage: 'Secondary text, descriptions' },
  { name: 'tertiary', light: '107 102 92', dark: '148 143 131', usage: 'Tertiary text, metadata' },
  { name: 'muted', light: '107 102 92', dark: '148 143 131', usage: 'Placeholder, disabled labels' },
  { name: 'subtle', light: '179 173 162', dark: '86 82 72', usage: 'Decorative; currently unused' },
  { name: 'ghost', light: '138 132 120', dark: '110 106 96', usage: 'Lightweight UI strokes (non-text)' },
  { name: 'border', light: '217 211 199', dark: '44 44 52', usage: 'Default card and container borders' },
  { name: 'border-light', light: '227 221 210', dark: '38 38 45', usage: 'Divider lines, section separators' },
  { name: 'surface', light: '238 234 225', dark: '23 23 29', usage: 'Recessed areas, hover dip, sidebar' },
  { name: 'surface-warm', light: '243 240 233', dark: '26 26 33', usage: 'Legend, footer areas' },
  { name: 'canvas', light: '247 244 239', dark: '16 16 20', usage: 'Page ground — washi / sumi' },
  { name: 'white', light: '253 251 247', dark: '29 29 36', usage: 'Raised card surface (never pure white)' },
];

export const FEEDBACK_TOKENS: TokenSpec[] = [
  { name: 'success', light: '71 118 85', dark: '127 174 142', usage: 'Correct feedback borders' },
  { name: 'success-light', light: '232 240 234', dark: '30 43 34', usage: 'Correct feedback backgrounds' },
  { name: 'caution', light: '122 97 36', dark: '193 154 69', usage: '“Consider further” feedback' },
  { name: 'caution-light', light: '245 240 224', dark: '43 38 24', usage: 'Caution feedback backgrounds' },
  { name: 'error', light: '139 74 74', dark: '201 143 143', usage: 'Incorrect feedback borders' },
  { name: 'error-light', light: '245 232 232', dark: '45 30 30', usage: 'Incorrect feedback backgrounds' },
  { name: 'info', light: '90 108 123', dark: '140 170 191', usage: 'Informational callouts, tips' },
  { name: 'info-light', light: '228 235 240', dark: '30 38 44', usage: 'Informational callout backgrounds' },
];

export const ACTION_TOKENS: TokenSpec[] = [
  { name: 'action', light: '12 107 118', dark: '76 195 208', usage: 'Primary button, actionable links' },
  { name: 'action-hover', light: '10 90 99', dark: '99 205 216', usage: 'Primary button hover' },
  { name: 'action-active', light: '8 77 85', dark: '118 212 222', usage: 'Primary button active/pressed' },
  { name: 'focus', light: '199 59 39', dark: '224 85 67', usage: 'Keyboard focus ring — vermilion' },
];

// Competency scope variables: the accent itself plus its wash and on-wash
// text. Every one of them flips by mode, so the forced preview scopes must
// re-declare all three families or the live components inside them (
// CompetencyDot, KnowledgeCheck, ReflectionPrompt) would read the app's
// real theme instead of the previewed one.
export const COMPETENCY_SCOPE_TOKENS: TokenSpec[] = [
  { name: 'delegation', light: '92 112 80', dark: '168 188 154', usage: 'Delegation accent' },
  { name: 'description', light: '122 99 73', dark: '196 169 127', usage: 'Description accent' },
  { name: 'discernment', light: '80 101 121', dark: '147 176 198', usage: 'Discernment accent' },
  { name: 'diligence', light: '108 91 116', dark: '181 152 194', usage: 'Diligence accent' },
  { name: 'delegation-light', light: '232 237 228', dark: '42 48 37', usage: 'Delegation wash surface' },
  { name: 'description-light', light: '240 234 224', dark: '48 42 34', usage: 'Description wash surface' },
  { name: 'discernment-light', light: '228 235 240', dark: '37 44 50', usage: 'Discernment wash surface' },
  { name: 'diligence-light', light: '237 228 240', dark: '44 37 48', usage: 'Diligence wash surface' },
  { name: 'delegation-text', light: '61 74 53', dark: '181 196 171', usage: 'Delegation text on tint' },
  { name: 'description-text', light: '90 74 55', dark: '201 185 158', usage: 'Description text on tint' },
  { name: 'discernment-text', light: '53 74 87', dark: '168 188 202', usage: 'Discernment text on tint' },
  { name: 'diligence-text', light: '74 53 87', dark: '190 168 201', usage: 'Diligence text on tint' },
];

// ─── 4D competency swatches (design system §1.1, §10.3) ────────────────

export interface CompetencySpec {
  key: CompetencyKey;
  label: string;
  /** The accent itself — flips by mode. */
  bgHex: { light: string; dark: string };
  /** `mid` border/accent tint — a light tone, used as a hairline on washes. */
  mid: string;
  /** `light` wash surface — flips by mode. */
  lightHex: { light: string; dark: string };
  /** `text` high-contrast on the wash — flips by mode. */
  textHex: { light: string; dark: string };
}

export const COMPETENCY_SWATCHES: CompetencySpec[] = [
  { key: 'delegation', label: 'Delegation', bgHex: { light: '#5C7050', dark: '#A8BC9A' }, mid: '#B5C4AB', lightHex: { light: '#E8EDE4', dark: '#2A3025' }, textHex: { light: '#3D4A35', dark: '#B5C4AB' } },
  { key: 'description', label: 'Description', bgHex: { light: '#7A6349', dark: '#C4A97F' }, mid: '#C9B99E', lightHex: { light: '#F0EAE0', dark: '#302A22' }, textHex: { light: '#5A4A37', dark: '#C9B99E' } },
  { key: 'discernment', label: 'Discernment', bgHex: { light: '#506579', dark: '#93B0C6' }, mid: '#A8BCCA', lightHex: { light: '#E4EBF0', dark: '#252C32' }, textHex: { light: '#354A57', dark: '#A8BCCA' } },
  { key: 'diligence', label: 'Diligence', bgHex: { light: '#6C5B74', dark: '#B598C2' }, mid: '#BEA8C9', lightHex: { light: '#EDE4F0', dark: '#2C2530' }, textHex: { light: '#4A3557', dark: '#BEA8C9' } },
];

// Dark-mode competency text hex vars consumed by CompetencyDot's fallback var.
// Derived from COMPETENCY_SWATCHES so the two can't drift. The cast is safe:
// the swatch array enumerates exactly the four CompetencyKey values.
const COMPETENCY_TEXT_HEX = Object.fromEntries(
  COMPETENCY_SWATCHES.map((s) => [s.key, s.textHex]),
) as Record<CompetencyKey, { light: string; dark: string }>;

// ─── Typography scale (design system §2.2) ─────────────────────────────

export interface TypeSpec {
  /** Tailwind fontSize token / class suffix. */
  token: string;
  /** Tailwind class stack for the specimen line. */
  className: string;
  family: 'Source Serif 4' | 'IBM Plex Sans' | 'IBM Plex Mono';
  spec: string;
  sample: string;
}

export const TYPE_SPECS: TypeSpec[] = [
  { token: 'display', className: 'font-display text-display font-normal text-ink', family: 'Source Serif 4', spec: '32 / 1.2 / -0.01em', sample: 'AI Literacy for the Modern Workforce' },
  { token: 'title', className: 'font-display text-title font-normal text-ink', family: 'Source Serif 4', spec: '26 / 1.25 / -0.005em', sample: 'Evaluating AI outputs and working responsibly' },
  { token: 'h2', className: 'font-sans text-h2 font-semibold text-ink', family: 'IBM Plex Sans', spec: '22 / 1.3 / 600', sample: 'How AI is actually being used at work' },
  { token: 'h3', className: 'font-sans text-h3 font-semibold text-ink', family: 'IBM Plex Sans', spec: '18 / 1.35 / 600', sample: 'Component headers and card titles' },
  { token: 'h4', className: 'font-sans text-h4 font-semibold text-ink-secondary', family: 'IBM Plex Sans', spec: '16 / 1.4 / 600', sample: 'Sub-component and sidebar module titles' },
  { token: 'body', className: 'font-sans text-body text-body', family: 'IBM Plex Sans', spec: '16 / 1.65 / 400', sample: 'Main reading text, capped at a 680px measure for a comfortable line length.' },
  { token: 'body-sm', className: 'font-sans text-body-sm text-body', family: 'IBM Plex Sans', spec: '14 / 1.55 / 400', sample: 'Secondary text, captions, and sidebar section labels.' },
  { token: 'label', className: 'font-sans text-label font-semibold uppercase text-secondary', family: 'IBM Plex Sans', spec: '12 / 1.4 / 600 / 0.02em', sample: 'Pill text · Tag labels · Button text' },
  { token: 'caption', className: 'font-mono text-caption text-tertiary', family: 'IBM Plex Mono', spec: '11 / 1.5 / 400', sample: 'Data annotations · chart axis labels · timestamps' },
  { token: 'overline', className: 'font-mono text-overline font-bold uppercase text-tertiary', family: 'IBM Plex Mono', spec: '10 / 1.4 / 700 / 0.1em', sample: 'Section dividers · ring labels' },
];

// ─── Preview-scope CSS ─────────────────────────────────────────────────

/** Triple "r g b" → uppercase hex, for swatch labels. */
export function tripleToHex(triple: string): string {
  const [r = 0, g = 0, b = 0] = triple.trim().split(/\s+/).map(Number);
  const h = (n: number): string => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

/**
 * The scoped stylesheet that lets the preview surface render either mode
 * regardless of the app's global theme. Both `.ds-preview[data-theme="light"]`
 * and `[data-theme="dark"]` re-declare every token the gallery's live
 * components consume, generated from the datasets above.
 */
export function previewScopeCss(): string {
  const all = [...NEUTRAL_TOKENS, ...FEEDBACK_TOKENS, ...ACTION_TOKENS, ...COMPETENCY_SCOPE_TOKENS];
  const decl = (mode: 'light' | 'dark'): string => {
    const vars = all.map((t) => `--${t.name}: ${t[mode]};`).join(' ');
    // CompetencyDot reads the hex fallback var `--competency-text-{c}`.
    const compHex = COMPETENCY_SWATCHES.map((c) => `--competency-text-${c.key}: ${COMPETENCY_TEXT_HEX[c.key][mode]};`).join(' ');
    return `.ds-preview[data-theme="${mode}"] { ${vars} ${compHex} background: rgb(var(--canvas)); color: rgb(var(--ink)); }`;
  };
  return `${decl('light')}\n${decl('dark')}`;
}
