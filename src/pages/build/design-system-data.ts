// Design-system token data for the living style guide.
//
// Values mirror src/styles/index.css (the implemented single source of truth)
// and the Phase 3 Design System Document (§1). Where the two differ, the
// IMPLEMENTED value wins: the low-emphasis
// neutrals (tertiary, muted, subtle, ghost) were tightened in the 3B-8 WCAG
// 2.1 AA pass so they clear 4.5:1 against the warm canvas. Each token stores
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
  { name: 'ink', light: '45 45 45', dark: '232 229 224', usage: 'Primary body text, headings' },
  { name: 'ink-secondary', light: '58 58 58', dark: '213 208 200', usage: 'Subheadings, emphasized body text' },
  { name: 'body', light: '85 85 85', dark: '192 186 176', usage: 'Standard body text in content areas' },
  { name: 'secondary', light: '102 102 102', dark: '168 162 154', usage: 'Secondary text, descriptions' },
  { name: 'tertiary', light: '110 110 110', dark: '150 145 137', usage: 'Tertiary text, metadata' },
  { name: 'muted', light: '110 110 110', dark: '149 145 139', usage: 'Placeholder, disabled labels' },
  { name: 'subtle', light: '170 170 170', dark: '86 80 72', usage: 'Divider dots, very low-emphasis' },
  { name: 'ghost', light: '148 148 148', dark: '128 122 112', usage: 'Lightweight UI strokes' },
  { name: 'border', light: '232 230 225', dark: '61 58 53', usage: 'Default card and container borders' },
  { name: 'border-light', light: '224 221 215', dark: '51 48 43', usage: 'Divider lines, section separators' },
  { name: 'surface', light: '250 250 247', dark: '37 35 32', usage: 'Card backgrounds, inset areas' },
  { name: 'surface-warm', light: '250 248 245', dark: '42 40 37', usage: 'Legend, footer areas' },
  { name: 'canvas', light: '245 243 239', dark: '26 25 23', usage: 'Page background behind content' },
  { name: 'white', light: '255 255 255', dark: '45 43 39', usage: 'Card surfaces, input backgrounds' },
];

export const FEEDBACK_TOKENS: TokenSpec[] = [
  { name: 'success', light: '71 118 85', dark: '105 158 118', usage: 'Correct feedback borders' },
  { name: 'success-light', light: '232 240 234', dark: '30 43 34', usage: 'Correct feedback backgrounds' },
  { name: 'caution', light: '133 106 40', dark: '184 148 58', usage: '“Consider further” feedback' },
  { name: 'caution-light', light: '245 240 224', dark: '43 38 24', usage: 'Caution feedback backgrounds' },
  { name: 'error', light: '139 74 74', dark: '189 131 131', usage: 'Incorrect feedback borders' },
  { name: 'error-light', light: '245 232 232', dark: '45 30 30', usage: 'Incorrect feedback backgrounds' },
  { name: 'info', light: '90 108 123', dark: '122 150 168', usage: 'Informational callouts, tips' },
  { name: 'info-light', light: '228 235 240', dark: '30 38 44', usage: 'Informational callout backgrounds' },
];

export const ACTION_TOKENS: TokenSpec[] = [
  { name: 'action', light: '61 90 78', dark: '139 184 168', usage: 'Primary button, actionable links' },
  { name: 'action-hover', light: '52 80 73', dark: '127 170 155', usage: 'Primary button hover' },
  { name: 'action-active', light: '43 70 64', dark: '115 156 142', usage: 'Primary button active/pressed' },
];

// Competency light/text tints, as scope variables (the `bg`/`mid` fills are
// literal hexes handled in COMPETENCY_SWATCHES). Used to drive KnowledgeCheck /
// ReflectionPrompt / CompetencyDot correctly inside the forced preview scopes.
export const COMPETENCY_SCOPE_TOKENS: TokenSpec[] = [
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
  /** `bg` primary — unchanged across modes. */
  bg: string;
  /** `mid` border/accent — unchanged across modes. */
  mid: string;
  /** `light` wash surface — flips by mode. */
  lightHex: { light: string; dark: string };
  /** `text` high-contrast — flips by mode. */
  textHex: { light: string; dark: string };
}

export const COMPETENCY_SWATCHES: CompetencySpec[] = [
  { key: 'delegation', label: 'Delegation', bg: '#6B7F5E', mid: '#B5C4AB', lightHex: { light: '#E8EDE4', dark: '#2A3025' }, textHex: { light: '#3D4A35', dark: '#B5C4AB' } },
  { key: 'description', label: 'Description', bg: '#8B7355', mid: '#C9B99E', lightHex: { light: '#F0EAE0', dark: '#302A22' }, textHex: { light: '#5A4A37', dark: '#C9B99E' } },
  { key: 'discernment', label: 'Discernment', bg: '#5E7080', mid: '#A8BCCA', lightHex: { light: '#E4EBF0', dark: '#252C32' }, textHex: { light: '#354A57', dark: '#A8BCCA' } },
  { key: 'diligence', label: 'Diligence', bg: '#7A6B80', mid: '#BEA8C9', lightHex: { light: '#EDE4F0', dark: '#2C2530' }, textHex: { light: '#4A3557', dark: '#BEA8C9' } },
];

// Dark-mode competency text hex vars consumed by CompetencyDot's fallback var.
const COMPETENCY_TEXT_HEX: Record<CompetencyKey, { light: string; dark: string }> = {
  delegation: { light: '#3D4A35', dark: '#B5C4AB' },
  description: { light: '#5A4A37', dark: '#C9B99E' },
  discernment: { light: '#354A57', dark: '#A8BCCA' },
  diligence: { light: '#4A3557', dark: '#BEA8C9' },
};

// ─── Typography scale (design system §2.2) ─────────────────────────────

export interface TypeSpec {
  /** Tailwind fontSize token / class suffix. */
  token: string;
  /** Tailwind class stack for the specimen line. */
  className: string;
  family: 'DM Serif Display' | 'DM Sans' | 'DM Mono';
  spec: string;
  sample: string;
}

export const TYPE_SPECS: TypeSpec[] = [
  { token: 'display', className: 'font-display text-display font-normal text-ink', family: 'DM Serif Display', spec: '32 / 1.2 / -0.01em', sample: 'AI Literacy for the Modern Workforce' },
  { token: 'title', className: 'font-display text-title font-normal text-ink', family: 'DM Serif Display', spec: '26 / 1.25 / -0.005em', sample: 'Evaluating AI outputs and working responsibly' },
  { token: 'h2', className: 'font-sans text-h2 font-semibold text-ink', family: 'DM Sans', spec: '22 / 1.3 / 600', sample: 'How AI is actually being used at work' },
  { token: 'h3', className: 'font-sans text-h3 font-semibold text-ink', family: 'DM Sans', spec: '18 / 1.35 / 600', sample: 'Component headers and card titles' },
  { token: 'h4', className: 'font-sans text-h4 font-semibold text-ink-secondary', family: 'DM Sans', spec: '16 / 1.4 / 600', sample: 'Sub-component and sidebar module titles' },
  { token: 'body', className: 'font-sans text-body text-body', family: 'DM Sans', spec: '16 / 1.65 / 400', sample: 'Main reading text, capped at a 680px measure for a comfortable line length.' },
  { token: 'body-sm', className: 'font-sans text-body-sm text-body', family: 'DM Sans', spec: '14 / 1.55 / 400', sample: 'Secondary text, captions, and sidebar section labels.' },
  { token: 'label', className: 'font-sans text-label font-semibold uppercase text-secondary', family: 'DM Sans', spec: '12 / 1.4 / 600 / 0.02em', sample: 'Pill text · Tag labels · Button text' },
  { token: 'caption', className: 'font-mono text-caption text-tertiary', family: 'DM Mono', spec: '11 / 1.5 / 400', sample: 'Data annotations · chart axis labels · timestamps' },
  { token: 'overline', className: 'font-mono text-overline font-bold uppercase text-tertiary', family: 'DM Mono', spec: '10 / 1.4 / 700 / 0.1em', sample: 'Section dividers · ring labels' },
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
