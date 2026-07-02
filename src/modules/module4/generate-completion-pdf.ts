// S10 Competency Profile — R8 landscape PDF.
//
// Two-page US Letter landscape (792 × 612 pt) PDF rendering the
// learner's completed profile per the Claude Design "R8 (Landscape)"
// spec.
//
// Layout summary
//   Page 1 — signature bar, header (eyebrow + display title +
//            R8 gradient tag), section overline rule, 2×2 grid of
//            competency cards (Delegation TL, Description TR,
//            Discernment BL, Diligence BR).
//   Page 2 — signature bar, continued header, section overline rule,
//            two-column layout: milestones card on the left (Diligence-
//            accent), knowledge stat card + dark inverted closing card
//            on the right.
//
// Visual identity
//   • Four-color signature bar (Delegation green → Description tan →
//     Discernment blue → Diligence purple) at the top of every page —
//     a constant identity signal across both pages.
//   • Warm-cream page background (#FAFAF7) gives the document a
//     "paper" feel distinct from the in-app screen.
//   • Card-based layout: white fill, 6pt rounded corners, 3pt left
//     rule in the relevant 4D color for the competency cards (and
//     for the milestones card on page 2).
//   • Surface-warm-tinted "field" boxes inside each card hold the
//     learner's authored content.
//   • Dashed attribution rule above each card's source attribution.
//   • Dark inverted closing card on page 2 — the only block that
//     flips the warm-paper convention.
//
// Typography — the real DM fonts (Sans, Serif Display, Mono) are
// embedded via the font-loader module. Without them the PDF would
// fall back to Helvetica and look generic; with them, headings get
// DM Serif Display's editorial weight, body and labels use DM Sans,
// and tracked overlines use DM Mono.
//
// Constraints still in play
//   • DM Mono only ships up to Medium (500), so what reads as "bold
//     mono" in the design is actually Medium — registered as the
//     normal style of the DMMono family.
//   • Gradient R8 tag is rendered as four flat-edged colored
//     rectangles tiled side-by-side (no native gradients).
//   • No alpha — the faded eyebrow on the dark closing card uses a
//     mid-gray instead of rgba white.
//
// Overflow strategy
//   When a field's content exceeds its line budget, the last fitting
//   line is truncated with an ellipsis rather than reflowing the
//   block. The at-a-glance 2×2 grid is the layout's primary value;
//   protecting it matters more than fitting every word. The on-screen
//   profile retains the full responses.

import { jsPDF } from 'jspdf';
import { registerDMFonts } from './font-loader';

// Font-family identifiers registered by `registerDMFonts(doc)`.
// Used in `doc.setFont(family, style)` throughout.
const FONT = {
  sans: 'DMSans',
  serif: 'DMSerif',
  mono: 'DMMono',
} as const;

// ─── Public type ──────────────────────────────────────────────────

/** One block's pre→post tally. Block names + item counts are fixed
 *  by the instrument spec; never derive them from data (see
 *  `ASSESSMENT_BLOCKS` below). */
export interface AssessmentBlockResult {
  name: 'Usage patterns' | 'Failure modes' | 'Mechanics' | 'Evaluation';
  items: 2 | 3;
  pre: number; // 0..items
  post: number; // 0..items
}

/** Pre/post assessment summary surfaced on page 2. Optional: when
 *  null/undefined, the PDF falls back to the prior knowledge-stat-only
 *  right column (portfolio-review case). */
export interface AssessmentGrowthData {
  preTotal: number; // 0..10
  postTotal: number; // 0..10
  blocks: [
    AssessmentBlockResult,
    AssessmentBlockResult,
    AssessmentBlockResult,
    AssessmentBlockResult,
  ];
}

export interface CompletionProfileData {
  completionDate: string;
  task1: string;
  task2: string;
  p9Product: string;
  p9Process: string;
  p9Performance: string;
  p10Accuracy: number;
  p10Total: number;
  p11Refinement: string;
  p12Statement: string;
  kcCorrect: number;
  kcTotal: number;
  /** Optional pre→post assessment growth. When omitted, page 2's
   *  right column falls back to the standalone knowledge-stat card. */
  growth?: AssessmentGrowthData;
}

// ─── Geometry constants ───────────────────────────────────────────

const PAGE_W = 792;
const PAGE_H = 612;
const MARGIN_LEFT = 40;
const MARGIN_RIGHT = 40;
const CONTENT_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT; // 712

const SIGNATURE_BAR_H = 3;

// 2×2 competency grid (Page 1)
const GRID_TOP = 124;
const GRID_CELL_W = 351;
const GRID_CELL_H = 209;
const GRID_GAP = 10;

// Section overline (text-flanked-by-rules) Y
const SECTION_OVERLINE_Y = 116;

// Page footer
const FOOTER_RULE_Y = 568;
const FOOTER_BASELINE_Y = 582;

// Per-quadrant rhythm (relative to card top)
const CARD_OVERLINE_Y_OFFSET = 18;
const CARD_HEADING_Y_OFFSET = 36;
const CARD_BODY_TOP_OFFSET = 50;
const CARD_ATTRIB_RULE_Y_OFFSET = GRID_CELL_H - 22; // 187
const CARD_ATTRIB_TEXT_Y_OFFSET = GRID_CELL_H - 10; // 199
const CARD_INNER_PAD_X = 14;

// Body line budgets per quadrant — baked from the layout math so we
// can truncate consistently. Each field's body is wrapped by jsPDF
// then truncated to (at most) this many lines with an ellipsis.
const LINES = {
  delegation: 3, // 2 fields, 3 lines each
  description: 2, // 3 fields, 2 lines each
  discernment: 6, // 1 field below the stat line
  diligence: 9, // 1 full statement block
};

// Defensive cap: never even attempt to render more than 800 chars of
// any one field. Anything longer gets hard-truncated before wrapping.
const MAX_FIELD_CHARS = 800;

// CSS letter-spacing emulation: 0.18em → sizeInPt × 0.18 pt of
// additional character space (jsPDF setCharSpace).
const TRACKING_MONO = 0.18;

// ─── Colors ───────────────────────────────────────────────────────

const C = {
  // Competency primaries
  delegation: '#6B7F5E',
  description: '#8B7355',
  discernment: '#5E7080',
  diligence: '#7A6B80',
  // Competency lights (badges, stat-line backgrounds)
  delegationLight: '#E8EDE4',
  descriptionLight: '#F0EAE0',
  discernmentLight: '#E4EBF0',
  diligenceLight: '#EDE4F0',
  // Diligence mid (badge border)
  diligenceMid: '#C2B5C8',
  // Competency text (darker than primary — for field labels)
  delegationText: '#3D4A35',
  descriptionText: '#5A4A37',
  discernmentText: '#354A57',
  diligenceText: '#4A3557',
  // 5th accent — Assessment (meta-measurement of the program).
  // Two stops darker than Discernment slate so the two never read
  // as the same color at a glance.
  assessment: '#44556B',
  assessmentLight: '#E6E9ED',
  assessmentMid: '#B0B9C4',
  assessmentText: '#29323D',
  // Delta semantic colors (Growth card change column + breakdown Δ)
  positive: '#4F7A3D', // success green
  negative: '#9B7B2E', // caution amber (reused as "negative delta")
  neutral: '#888888', // gray for ±0
  // Neutrals
  ink: '#2D2D2D',
  body: '#555555',
  secondary: '#666666',
  tertiary: '#8A8A8A',
  border: '#E0DDD7',
  borderLight: '#EAE7E1',
  surface: '#FAFAF7',
  surfaceWarm: '#FAF8F5',
  white: '#FFFFFF',
};

// (The canonical block list — name + item count — is declared by the
// caller that constructs the AssessmentGrowthData payload. The
// generator just iterates `data.growth.blocks` and trusts those
// names to be the four canonical strings.)

// ─── Tiny color/font helpers ──────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [0, 0, 0];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

/** Inverse of hexToRgb — used by the Growth card to convert
 *  fmtDelta()'s RGB triple back to a hex string so it plays with
 *  `setTextHex`. */
function rgbToHex(rgb: [number, number, number]): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}

/** Format a signed integer delta with typographic glyphs (U+2212
 *  minus, U+00B1 plus-minus) and a color triple. Used by the Growth
 *  card's Change cell and the breakdown table's Δ column. Helvetica
 *  WinAnsi has both glyphs, so the strings render correctly without
 *  font fallback. */
function fmtDelta(n: number): { text: string; rgb: [number, number, number] } {
  if (n > 0) return { text: `+${n}`, rgb: [79, 122, 61] }; // positive #4F7A3D
  if (n < 0) return { text: `−${Math.abs(n)}`, rgb: [155, 123, 46] }; // negative #9B7B2E
  return { text: '±0', rgb: [136, 136, 136] }; // neutral #888888
}
function setFillHex(doc: jsPDF, hex: string): void {
  const [r, g, b] = hexToRgb(hex);
  doc.setFillColor(r, g, b);
}
function setStrokeHex(doc: jsPDF, hex: string): void {
  const [r, g, b] = hexToRgb(hex);
  doc.setDrawColor(r, g, b);
}
function setTextHex(doc: jsPDF, hex: string): void {
  const [r, g, b] = hexToRgb(hex);
  doc.setTextColor(r, g, b);
}
function setTracked(doc: jsPDF, sizePt: number, factor: number = TRACKING_MONO): void {
  doc.setCharSpace(sizePt * factor);
}
function resetTracking(doc: jsPDF): void {
  doc.setCharSpace(0);
}

// jsPDF's built-in Helvetica is WinAnsi-only. Replace common Unicode
// punctuation with safe equivalents so they render correctly. Em-dash,
// en-dash, smart quotes, and ellipsis are all in WinAnsi.
function safe(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"');
}

// ─── Truncation ───────────────────────────────────────────────────
//
// Take an array of wrapped lines, keep at most `max`, and append an
// ellipsis to the last kept line (trimming trailing punctuation and
// removing trailing words until "last + …" fits the available width).

function truncateLines(
  doc: jsPDF,
  lines: string[],
  max: number,
  maxWidth: number,
): string[] {
  if (lines.length <= max) return lines;
  const out = lines.slice(0, max);
  const lastIdx = out.length - 1;
  let last = out[lastIdx].trimEnd().replace(/[\s.,;:!?\-—]+$/, '');
  let candidate = `${last}…`;
  // Trim word-by-word until the line + ellipsis fits.
  while (doc.getTextWidth(candidate) > maxWidth && last.length > 0) {
    const lastSpace = last.lastIndexOf(' ');
    if (lastSpace < 0) {
      last = last.slice(0, Math.max(0, last.length - 4));
    } else {
      last = last.slice(0, lastSpace).trimEnd();
    }
    candidate = `${last}…`;
  }
  out[lastIdx] = candidate.length > 0 ? candidate : '…';
  return out;
}

// ─── Auto-fit ─────────────────────────────────────────────────────
//
// Try to fit a (possibly multi-paragraph) text block within a line
// budget by progressively shrinking the font size before falling back
// to truncation. The body design size is 9 pt; we'll shrink down to
// 7 pt in 0.5 pt steps. If the text still doesn't fit at 7 pt, we
// truncate with an ellipsis (the old behavior).
//
// Returns the chosen font size, the leading to use, the wrapped lines
// to draw, and a `shrunk`/`truncated` flag for debugging/telemetry.

interface FittedText {
  lines: string[];
  fontSize: number;
  leading: number;
  shrunk: boolean;
  truncated: boolean;
}

interface FitOptions {
  maxSize?: number;
  minSize?: number;
  stepSize?: number;
  /** Leading multiple of font size — CSS body uses ~1.45. */
  lineHeightRatio?: number;
}

// Wrap `text` (possibly with `\n\s*\n` paragraph breaks) at the doc's
// current font size into a flat array of lines, inserting an empty
// string between paragraphs to preserve the visual break.
function wrapParagraphs(doc: jsPDF, text: string, maxWidth: number): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const out: string[] = [];
  for (let i = 0; i < paragraphs.length; i += 1) {
    const para = paragraphs[i].replace(/\n+/g, ' ').trim();
    const wrapped = doc.splitTextToSize(para, maxWidth) as string[];
    out.push(...wrapped);
    if (i < paragraphs.length - 1) out.push('');
  }
  return out;
}

function fitText(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  maxLines: number,
  options: FitOptions = {},
): FittedText {
  const maxSize = options.maxSize ?? 9;
  const minSize = options.minSize ?? 7;
  const stepSize = options.stepSize ?? 0.5;
  const ratio = options.lineHeightRatio ?? 1.45;

  // Walk from largest to smallest. As font shrinks, more text fits
  // per line, so the wrapped line count drops. First size whose
  // wrapped output fits the budget wins.
  for (let size = maxSize; size >= minSize - 0.01; size -= stepSize) {
    doc.setFontSize(size);
    const wrapped = wrapParagraphs(doc, text, maxWidth);
    if (wrapped.length <= maxLines) {
      return {
        lines: wrapped,
        fontSize: size,
        leading: size * ratio,
        shrunk: size < maxSize,
        truncated: false,
      };
    }
  }

  // Even at min size the text won't fit — truncate at min size with
  // an ellipsis. The on-screen profile still shows the full response,
  // so no data loss; this is just the PDF's at-a-glance presentation.
  doc.setFontSize(minSize);
  const wrapped = wrapParagraphs(doc, text, maxWidth);
  const lines = truncateLines(doc, wrapped, maxLines, maxWidth);
  return {
    lines,
    fontSize: minSize,
    leading: minSize * ratio,
    shrunk: true,
    truncated: true,
  };
}

// ─── Page-level primitives ────────────────────────────────────────

function drawPageBackground(doc: jsPDF): void {
  setFillHex(doc, C.surface);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
}

function drawSignatureBar(doc: jsPDF): void {
  const segW = PAGE_W / 4;
  const segs = [C.delegation, C.description, C.discernment, C.diligence];
  for (let i = 0; i < segs.length; i += 1) {
    setFillHex(doc, segs[i]);
    // Tiny overlap (+0.4) hides any sub-pixel seam between adjacent rects.
    doc.rect(i * segW, 0, segW + 0.4, SIGNATURE_BAR_H, 'F');
  }
}

function drawRule(
  doc: jsPDF,
  x1: number,
  y: number,
  x2: number,
  hex: string,
  weight: number = 0.5,
): void {
  setStrokeHex(doc, hex);
  doc.setLineWidth(weight);
  doc.line(x1, y, x2, y);
}

function drawDashedRule(doc: jsPDF, x1: number, y: number, x2: number, hex: string): void {
  setStrokeHex(doc, hex);
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(x1, y, x2, y);
  doc.setLineDashPattern([], 0);
}

function drawSectionOverline(doc: jsPDF, text: string, y: number): void {
  doc.setFont(FONT.mono, 'normal');
  doc.setFontSize(9.5);
  setTextHex(doc, C.tertiary);
  setTracked(doc, 9.5);
  const labelText = safe(text.toUpperCase());
  const w = doc.getTextWidth(labelText);
  const cx = MARGIN_LEFT + CONTENT_W / 2;
  const textX = cx - w / 2;
  // Rules align with the text's optical midline (~3 pt above baseline)
  drawRule(doc, MARGIN_LEFT, y, textX - 10, C.border);
  drawRule(doc, textX + w + 10, y, PAGE_W - MARGIN_RIGHT, C.border);
  doc.text(labelText, textX, y + 3.3);
  resetTracking(doc);
}

function drawRefTag(doc: jsPDF, x: number, y: number): void {
  // 28 × 14 pt — four 7pt-wide colored strips, "R8" centered in white.
  const tagW = 28;
  const tagH = 14;
  const stripW = tagW / 4;
  const colors = [C.delegation, C.description, C.discernment, C.diligence];
  for (let i = 0; i < 4; i += 1) {
    setFillHex(doc, colors[i]);
    doc.rect(x + i * stripW, y, stripW + 0.4, tagH, 'F');
  }
  doc.setFont(FONT.sans, 'bold');
  doc.setFontSize(8);
  setTextHex(doc, C.white);
  setTracked(doc, 8, 0.08);
  const text = 'R8';
  const w = doc.getTextWidth(text);
  doc.text(text, x + (tagW - w) / 2, y + 9.8);
  resetTracking(doc);
}

function drawHeader(
  doc: jsPDF,
  opts: {
    eyebrow: string;
    title: string;
    subtitle: string;
    metaLines: string[];
    showRefTag: boolean;
  },
): void {
  const top = 32;

  // ── Left side ────────────────────────────────────────────────
  doc.setFont(FONT.mono, 'normal');
  doc.setFontSize(9);
  setTextHex(doc, C.tertiary);
  setTracked(doc, 9);
  doc.text(safe(opts.eyebrow.toUpperCase()), MARGIN_LEFT, top);
  resetTracking(doc);

  // Display title — DM Serif Display gives the document its
  // editorial weight. Bumped to 26pt to match the spec's display
  // size now that we're rendering with a real serif.
  doc.setFont(FONT.serif, 'normal');
  doc.setFontSize(26);
  setTextHex(doc, C.ink);
  doc.text(safe(opts.title), MARGIN_LEFT, top + 30);

  doc.setFont(FONT.sans, 'normal');
  doc.setFontSize(11);
  setTextHex(doc, C.secondary);
  doc.text(safe(opts.subtitle), MARGIN_LEFT, top + 48);

  // ── Right side (meta) ────────────────────────────────────────
  doc.setFont(FONT.mono, 'normal');
  doc.setFontSize(9);
  setTracked(doc, 9, 0.14);
  let metaY = top;
  for (let i = 0; i < opts.metaLines.length; i += 1) {
    setTextHex(doc, i === 0 ? C.tertiary : C.secondary);
    const line = safe(opts.metaLines[i].toUpperCase());
    const w = doc.getTextWidth(line);
    doc.text(line, PAGE_W - MARGIN_RIGHT - w, metaY);
    metaY += 13;
  }
  resetTracking(doc);

  if (opts.showRefTag) {
    drawRefTag(doc, PAGE_W - MARGIN_RIGHT - 28, metaY + 2);
  }
}

function drawPageFooter(
  doc: jsPDF,
  completionDate: string,
  pageNum: number,
  totalPages: number,
): void {
  drawRule(doc, MARGIN_LEFT, FOOTER_RULE_Y, PAGE_W - MARGIN_RIGHT, C.border);
  doc.setFont(FONT.mono, 'normal');
  doc.setFontSize(8);
  setTextHex(doc, C.tertiary);
  setTracked(doc, 8, 0.1);

  doc.text(safe('AI LITERACY FOR THE MODERN WORKFORCE'), MARGIN_LEFT, FOOTER_BASELINE_Y);

  const center = safe(`COMPETENCY PROFILE · COMPLETED ${completionDate.toUpperCase()}`);
  setTracked(doc, 8, 0.14);
  const cw = doc.getTextWidth(center);
  doc.text(center, PAGE_W / 2 - cw / 2, FOOTER_BASELINE_Y);
  setTracked(doc, 8, 0.1);

  const right = safe(`PAGE ${pageNum} OF ${totalPages}`);
  const rw = doc.getTextWidth(right);
  doc.text(right, PAGE_W - MARGIN_RIGHT - rw, FOOTER_BASELINE_Y);

  resetTracking(doc);
}

// ─── Card primitives ──────────────────────────────────────────────

function drawCardBase(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  leftAccent?: string,
): void {
  setFillHex(doc, C.white);
  setStrokeHex(doc, C.border);
  doc.setLineWidth(0.75);
  doc.roundedRect(x, y, w, h, 6, 6, 'FD');
  if (leftAccent) {
    setFillHex(doc, leftAccent);
    // 3pt left rule, inset slightly from rounded corners.
    doc.rect(x, y + 6, 3, h - 12, 'F');
  }
}

// ─── Field renderer ───────────────────────────────────────────────
// Each field is a surface-warm tinted rect with an uppercase mono
// label and a body block of wrapped text. Used for Task 1/2 in the
// Delegation card, Product/Process/Performance in Description, and
// the "Your refinement" block in Discernment.

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function drawField(
  doc: jsPDF,
  rect: Rect,
  label: string,
  body: string,
  accentText: string,
  maxLines: number,
): void {
  setFillHex(doc, C.surfaceWarm);
  setStrokeHex(doc, C.borderLight);
  doc.setLineWidth(0.5);
  doc.roundedRect(rect.x, rect.y, rect.w, rect.h, 5, 5, 'FD');

  const padX = 10;
  const innerX = rect.x + padX;
  const innerW = rect.w - padX * 2;

  // Label
  doc.setFont(FONT.mono, 'normal');
  doc.setFontSize(7.5);
  setTextHex(doc, accentText);
  setTracked(doc, 7.5, 0.16);
  doc.text(safe(label.toUpperCase()), innerX, rect.y + 12);
  resetTracking(doc);

  // Body — auto-fit. Try 9pt first; shrink in 0.5pt steps down to
  // 7pt before resorting to truncation. The 1.45 leading multiplier
  // matches the CSS body line-height.
  const hasBody = body.trim().length > 0;
  const raw = hasBody ? body : 'No response recorded.';
  const capped =
    raw.length > MAX_FIELD_CHARS ? `${raw.slice(0, MAX_FIELD_CHARS).trim()}…` : raw;

  doc.setFont(FONT.sans, 'normal');
  setTextHex(doc, hasBody ? C.body : C.tertiary);

  const fitted = fitText(doc, safe(capped), innerW, maxLines, {
    maxSize: 9,
    minSize: 7,
    stepSize: 0.5,
    lineHeightRatio: 1.45,
  });
  doc.setFontSize(fitted.fontSize);
  let lineY = rect.y + 24;
  for (const line of fitted.lines) {
    doc.text(line, innerX, lineY);
    lineY += fitted.leading;
  }
}

// ─── Competency card (shared shell for all four quadrants) ────────

function drawCompetencyCard(
  doc: jsPDF,
  rect: Rect,
  accent: string,
  label: string,
  heading: string,
  attribution: string,
  drawBody: (innerX: number, innerY: number, innerW: number, innerH: number) => void,
): void {
  drawCardBase(doc, rect.x, rect.y, rect.w, rect.h, accent);

  // Overline (mono uppercase, in accent color)
  doc.setFont(FONT.mono, 'normal');
  doc.setFontSize(9);
  setTextHex(doc, accent);
  setTracked(doc, 9);
  doc.text(safe(label.toUpperCase()), rect.x + CARD_INNER_PAD_X, rect.y + CARD_OVERLINE_Y_OFFSET);
  resetTracking(doc);

  // Heading
  doc.setFont(FONT.sans, 'bold');
  doc.setFontSize(13);
  setTextHex(doc, C.ink);
  doc.text(safe(heading), rect.x + CARD_INNER_PAD_X, rect.y + CARD_HEADING_Y_OFFSET);

  // Body callback
  const innerX = rect.x + CARD_INNER_PAD_X;
  const innerY = rect.y + CARD_BODY_TOP_OFFSET;
  const innerW = rect.w - CARD_INNER_PAD_X * 2;
  const innerH = CARD_ATTRIB_RULE_Y_OFFSET - CARD_BODY_TOP_OFFSET - 6; // ~131 pt
  drawBody(innerX, innerY, innerW, innerH);

  // Dashed attribution rule + italic attribution
  drawDashedRule(
    doc,
    rect.x + CARD_INNER_PAD_X,
    rect.y + CARD_ATTRIB_RULE_Y_OFFSET,
    rect.x + rect.w - CARD_INNER_PAD_X,
    C.border,
  );
  doc.setFont(FONT.sans, 'italic');
  doc.setFontSize(8.5);
  setTextHex(doc, C.tertiary);
  doc.text(safe(attribution), rect.x + CARD_INNER_PAD_X, rect.y + CARD_ATTRIB_TEXT_Y_OFFSET);
}

// Body shape — N stacked fields with 5pt gaps, equal heights.
function drawStackedFields(
  doc: jsPDF,
  fields: { label: string; body: string }[],
  accentText: string,
  innerX: number,
  innerY: number,
  innerW: number,
  innerH: number,
  maxLines: number,
): void {
  const gap = 5;
  const n = fields.length;
  const fieldH = (innerH - gap * (n - 1)) / n;
  for (let i = 0; i < n; i += 1) {
    drawField(
      doc,
      { x: innerX, y: innerY + i * (fieldH + gap), w: innerW, h: fieldH },
      fields[i].label,
      fields[i].body,
      accentText,
      maxLines,
    );
  }
}

// Discernment's stat line — a small pill with label + value + italic
// (all-correct) suffix. Returns the height consumed so the caller can
// position the field below it.
function drawStatLine(
  doc: jsPDF,
  x: number,
  y: number,
  accent: string,
  light: string,
  accentText: string,
  label: string,
  value: string,
  italicSuffix: string | null,
): number {
  // Measure the three text segments at their target sizes.
  doc.setFont(FONT.mono, 'normal');
  doc.setFontSize(7.5);
  setTracked(doc, 7.5, 0.14);
  const labelW = doc.getTextWidth(safe(label.toUpperCase()));
  resetTracking(doc);

  doc.setFont(FONT.sans, 'bold');
  doc.setFontSize(9.5);
  const valueW = doc.getTextWidth(safe(value));

  let suffixW = 0;
  if (italicSuffix) {
    doc.setFont(FONT.sans, 'italic');
    doc.setFontSize(9.5);
    suffixW = doc.getTextWidth(safe(italicSuffix));
  }

  const padX = 10;
  const padY = 5;
  const gap = 7;
  const totalW = labelW + gap + valueW + (italicSuffix ? gap + suffixW : 0);
  const boxW = totalW + padX * 2;
  const boxH = 9.5 + padY * 2 + 4;

  setFillHex(doc, light);
  doc.roundedRect(x, y, boxW, boxH, 4, 4, 'F');

  let cx = x + padX;
  const baseY = y + padY + 10;

  doc.setFont(FONT.mono, 'normal');
  doc.setFontSize(7.5);
  setTextHex(doc, accent);
  setTracked(doc, 7.5, 0.14);
  doc.text(safe(label.toUpperCase()), cx, baseY);
  resetTracking(doc);
  cx += labelW + gap;

  doc.setFont(FONT.sans, 'bold');
  doc.setFontSize(9.5);
  setTextHex(doc, accentText);
  doc.text(safe(value), cx, baseY);
  cx += valueW + gap;

  if (italicSuffix) {
    doc.setFont(FONT.sans, 'italic');
    doc.setFontSize(9.5);
    setTextHex(doc, C.tertiary);
    doc.text(safe(italicSuffix), cx, baseY);
  }

  return boxH;
}

// Diligence body — a single multi-paragraph statement (no field
// label), inside a surface-warm tinted block.
function drawDiligenceStatement(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  statement: string,
  maxLines: number,
): void {
  setFillHex(doc, C.surfaceWarm);
  setStrokeHex(doc, C.borderLight);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, w, h, 5, 5, 'FD');

  const padX = 11;
  const innerX = x + padX;
  const innerW = w - padX * 2;

  doc.setFont(FONT.sans, 'normal');
  const hasBody = statement.trim().length > 0;
  setTextHex(doc, hasBody ? C.body : C.tertiary);

  const raw = hasBody ? statement : 'No statement recorded.';
  const capped =
    raw.length > MAX_FIELD_CHARS ? `${raw.slice(0, MAX_FIELD_CHARS).trim()}…` : raw;

  // Auto-fit the multi-paragraph statement. Uses a 1.5 line-height
  // ratio (slightly looser than the field bodies) to match the spec's
  // .diligence-statement CSS leading. Paragraph breaks are preserved
  // by `wrapParagraphs` as empty-string lines between paragraphs.
  const fitted = fitText(doc, safe(capped), innerW, maxLines, {
    maxSize: 9,
    minSize: 7,
    stepSize: 0.5,
    lineHeightRatio: 1.5,
  });
  doc.setFontSize(fitted.fontSize);

  let lineY = y + 14;
  for (const line of fitted.lines) {
    if (line.length > 0) {
      doc.text(line, innerX, lineY);
    }
    lineY += fitted.leading;
  }
}

// ─── Page 1 ───────────────────────────────────────────────────────

function gridRect(row: 0 | 1, col: 0 | 1): Rect {
  return {
    x: MARGIN_LEFT + col * (GRID_CELL_W + GRID_GAP),
    y: GRID_TOP + row * (GRID_CELL_H + GRID_GAP),
    w: GRID_CELL_W,
    h: GRID_CELL_H,
  };
}

function drawPage1(doc: jsPDF, data: CompletionProfileData): void {
  drawPageBackground(doc);
  drawSignatureBar(doc);

  drawHeader(doc, {
    eyebrow: 'Competency Profile',
    title: 'AI Literacy for the Modern Workforce',
    subtitle: `Completed ${data.completionDate}`,
    metaLines: ['Your artifacts', 'A keepsake summary'],
    showRefTag: true,
  });

  drawSectionOverline(doc, 'Your authored work, by competency', SECTION_OVERLINE_Y);

  // Delegation — TL
  drawCompetencyCard(
    doc,
    gridRect(0, 0),
    C.delegation,
    'Delegation',
    'What you committed to changing',
    'From Module 2 — Action Commitment',
    (ix, iy, iw, ih) => {
      drawStackedFields(
        doc,
        [
          { label: 'Task 1', body: data.task1 },
          { label: 'Task 2', body: data.task2 },
        ],
        C.delegationText,
        ix,
        iy,
        iw,
        ih,
        LINES.delegation,
      );
    },
  );

  // Description — TR
  drawCompetencyCard(
    doc,
    gridRect(0, 1),
    C.description,
    'Description',
    'How you specified the task',
    'From Module 4 — Prompt Reformulation',
    (ix, iy, iw, ih) => {
      drawStackedFields(
        doc,
        [
          { label: 'Product', body: data.p9Product },
          { label: 'Process', body: data.p9Process },
          { label: 'Performance', body: data.p9Performance },
        ],
        C.descriptionText,
        ix,
        iy,
        iw,
        ih,
        LINES.description,
      );
    },
  );

  // Discernment — BL
  drawCompetencyCard(
    doc,
    gridRect(1, 0),
    C.discernment,
    'Discernment',
    'How you evaluated AI output',
    'From Module 4 — Output Verification + Iterative Refinement',
    (ix, iy, iw, ih) => {
      const allCorrect = data.p10Accuracy === data.p10Total;
      const statH = drawStatLine(
        doc,
        ix,
        iy,
        C.discernment,
        C.discernmentLight,
        C.discernmentText,
        'Triage',
        `${data.p10Accuracy} of ${data.p10Total} correctly triaged`,
        allCorrect ? '(all correct)' : null,
      );
      const fieldY = iy + statH + 6;
      const fieldH = ih - statH - 6;
      drawField(
        doc,
        { x: ix, y: fieldY, w: iw, h: fieldH },
        'Your refinement',
        data.p11Refinement,
        C.discernmentText,
        LINES.discernment,
      );
    },
  );

  // Diligence — BR
  drawCompetencyCard(
    doc,
    gridRect(1, 1),
    C.diligence,
    'Diligence',
    'Your AI practices, documented',
    'From Module 4 — Diligence Statement',
    (ix, iy, iw, ih) => {
      drawDiligenceStatement(doc, ix, iy, iw, ih, data.p12Statement, LINES.diligence);
    },
  );
}

// ─── Page 2 ───────────────────────────────────────────────────────

function drawPage2(doc: jsPDF, data: CompletionProfileData): void {
  const hasGrowth = data.growth != null;

  drawPageBackground(doc);
  drawSignatureBar(doc);

  drawHeader(doc, {
    eyebrow: 'Competency Profile · continued',
    title: 'Where the practice goes next',
    subtitle: hasGrowth
      ? 'Forward commitments and program growth'
      : 'Knowledge checks and forward commitments',
    metaLines: ['Page 2 of 2', 'Forward looking'],
    showRefTag: true,
  });

  drawSectionOverline(
    doc,
    hasGrowth
      ? '30 · 60 · 90 day milestones & assessment growth'
      : '30 · 60 · 90 day milestones & knowledge checks',
    SECTION_OVERLINE_Y,
  );

  drawMilestonesCard(doc, data);

  // Right column: Growth card when both assessments are complete,
  // standalone KC stat card as the portfolio-review fallback.
  if (hasGrowth) {
    drawGrowthCard(doc, data);
  } else {
    drawKnowledgeCard(doc, data);
  }

  // Closing card shrinks + repositions when the Growth card is above
  // it, otherwise keeps its original full-size layout.
  drawClosingCard(doc, hasGrowth);
}

function drawMilestonesCard(doc: jsPDF, data: CompletionProfileData): void {
  const x = MARGIN_LEFT;
  const y = 124;
  const w = 412;
  const h = 428;

  drawCardBase(doc, x, y, w, h, C.diligence);

  const padX = 18;
  const padY = 20;

  // Overline
  doc.setFont(FONT.mono, 'normal');
  doc.setFontSize(9);
  setTextHex(doc, C.diligence);
  setTracked(doc, 9);
  doc.text(safe('WHERE THE PRACTICE GOES NEXT'), x + padX, y + padY + 2);
  resetTracking(doc);

  // Title
  doc.setFont(FONT.sans, 'bold');
  doc.setFontSize(15);
  setTextHex(doc, C.ink);
  doc.text(safe('Three commitments to carry forward'), x + padX, y + padY + 22);

  // Connection excerpts (quote learner artifacts where available).
  // Ellipsis only when text was actually truncated — mirrors the
  // on-screen truncateToLines behavior.
  const quoteExcerpt = (raw: string): string => {
    const compact = raw.replace(/\s+/g, ' ').trim();
    return compact.length <= 130
      ? `"${compact}"`
      : `"${compact.slice(0, 130).trimEnd()}…"`;
  };
  const task1Excerpt =
    data.task1.trim().length > 0
      ? quoteExcerpt(data.task1)
      : 'Complete the action commitment to see your commitment here.';
  const p12Excerpt =
    data.p12Statement.trim().length > 0
      ? quoteExcerpt(data.p12Statement)
      : 'Complete the diligence statement builder to see your template here.';

  const rowTop = y + padY + 50;
  const rowAreaH = h - (rowTop - y) - padY;
  const rowH = rowAreaH / 3;

  const milestones = [
    {
      days: '30',
      target:
        'Produce a diligence statement for at least one AI-assisted deliverable in your actual work.',
      refLabel: 'YOUR STATEMENT →',
      connection: p12Excerpt,
    },
    {
      days: '60',
      target:
        'Apply the delegation framework to a new task category beyond the two you identified.',
      refLabel: 'YOUR TASK 1 →',
      connection: task1Excerpt,
    },
    {
      days: '90',
      target:
        'Initiate a team-level conversation about AI use practices using the 4D vocabulary.',
      refLabel: 'YOUR TOOL →',
      connection: 'R7 Team AI Policy Starter (available in the reference panel).',
    },
  ];

  for (let i = 0; i < milestones.length; i += 1) {
    const m = milestones[i];
    const rowY = rowTop + i * rowH;

    // Separator (skip for first row)
    if (i > 0) {
      drawRule(doc, x + padX, rowY - 4, x + w - padX, C.borderLight, 0.5);
    }

    // Badge — tinted Diligence-light with mid-tone border
    const badgeX = x + padX;
    const badgeY = rowY + 4;
    const badgeW = 52;
    const badgeH = 38;
    setFillHex(doc, C.diligenceLight);
    setStrokeHex(doc, C.diligenceMid);
    doc.setLineWidth(0.5);
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, 'FD');

    doc.setFont(FONT.sans, 'bold');
    doc.setFontSize(16);
    setTextHex(doc, C.diligenceText);
    const numW = doc.getTextWidth(m.days);
    doc.text(m.days, badgeX + (badgeW - numW) / 2, badgeY + 19);

    doc.setFont(FONT.mono, 'normal');
    doc.setFontSize(7.5);
    setTracked(doc, 7.5, 0.1);
    const daysW = doc.getTextWidth('DAYS');
    doc.text('DAYS', badgeX + (badgeW - daysW) / 2, badgeY + 31);
    resetTracking(doc);

    // Target text
    const bodyX = badgeX + badgeW + 14;
    const bodyW = w - (bodyX - x) - padX;
    doc.setFont(FONT.sans, 'bold');
    doc.setFontSize(11);
    setTextHex(doc, C.ink);
    const targetLines = doc.splitTextToSize(safe(m.target), bodyW) as string[];
    const targetClamped = targetLines.slice(0, 2);
    let ty = rowY + 14;
    for (const line of targetClamped) {
      doc.text(line, bodyX, ty);
      ty += 14;
    }

    // Connection — bold mono ref label, italic body
    doc.setFont(FONT.mono, 'normal');
    doc.setFontSize(8.5);
    setTextHex(doc, C.diligence);
    setTracked(doc, 8.5, 0.1);
    const refLabelW = doc.getTextWidth(safe(m.refLabel));
    doc.text(safe(m.refLabel), bodyX, ty + 4);
    resetTracking(doc);

    doc.setFont(FONT.sans, 'italic');
    doc.setFontSize(9.5);
    setTextHex(doc, C.tertiary);
    const connX = bodyX + refLabelW + 6;
    const connW = bodyW - refLabelW - 6;
    const connLines = doc.splitTextToSize(safe(m.connection), connW) as string[];
    const connClamped = truncateLines(doc, connLines, 2, connW);
    let cy = ty + 4;
    for (const line of connClamped) {
      doc.text(line, connX, cy);
      cy += 12;
    }
  }
}

function drawKnowledgeCard(doc: jsPDF, data: CompletionProfileData): void {
  const x = 464;
  const y = 124;
  const w = 288;
  const h = 170;

  drawCardBase(doc, x, y, w, h);

  const padX = 20;
  const padY = 22;

  // Eyebrow
  doc.setFont(FONT.mono, 'normal');
  doc.setFontSize(9);
  setTextHex(doc, C.tertiary);
  setTracked(doc, 9);
  doc.text(safe('KNOWLEDGE CHECKS'), x + padX, y + padY);
  resetTracking(doc);

  // Title
  doc.setFont(FONT.sans, 'bold');
  doc.setFontSize(13);
  setTextHex(doc, C.ink);
  doc.text(safe('Across all modules'), x + padX, y + padY + 18);

  // Big stat — DM Serif Display for both numerator and denominator.
  // "14" at 36pt; " / 16" at 22pt, baseline-aligned.
  const numStr = String(data.kcCorrect);
  doc.setFont(FONT.serif, 'normal');
  doc.setFontSize(36);
  setTextHex(doc, C.ink);
  doc.text(numStr, x + padX, y + padY + 70);
  const numW = doc.getTextWidth(numStr);

  doc.setFont(FONT.serif, 'normal');
  doc.setFontSize(22);
  setTextHex(doc, C.tertiary);
  doc.text(` / ${data.kcTotal}`, x + padX + numW, y + padY + 70);

  // Caption
  doc.setFont(FONT.sans, 'italic');
  doc.setFontSize(11);
  setTextHex(doc, C.secondary);
  doc.text(safe('preferred responses'), x + padX, y + padY + 92);
}

/**
 * Page 2 right column — Assessment Growth card.
 *
 * Replaces the standalone Knowledge-stat card with a richer card that
 * shows pre→post assessment scores, a per-block breakdown table, a
 * framing line, and the KC stat folded in at the bottom.
 *
 * All coordinates and dimensions come from the Claude Design handoff
 * (Option A). Origin (464, 124), 288 × 348 pt. The card uses the new
 * 5th-accent "Assessment" palette (#44556B + light/mid/text variants).
 *
 * Score numerals render in DM Serif Display rather than Helvetica
 * (the handoff allows either; DM Serif keeps visual consistency with
 * the existing big-number treatment on the prior KC card).
 */
function drawGrowthCard(doc: jsPDF, data: CompletionProfileData): void {
  const growth = data.growth;
  if (!growth) return; // Caller should have routed to drawKnowledgeCard.

  const x = 464;
  const y = 124;
  const w = 288;
  const h = 348;

  // Card base — white fill, light border, 3pt left accent rule in
  // Assessment slate.
  setFillHex(doc, C.white);
  setStrokeHex(doc, C.border);
  doc.setLineWidth(0.6);
  doc.roundedRect(x, y, w, h, 6, 6, 'FD');
  setFillHex(doc, C.assessment);
  doc.rect(x, y, 3, h, 'F');

  // Inner padding — header lives at the same column as the rest of
  // the card content.
  const innerX = x + 18; // 482
  const cardRight = x + w - 18; // 734
  const innerW = cardRight - innerX; // 252

  // ── Overline + title ──
  doc.setFont(FONT.mono, 'normal');
  doc.setFontSize(9);
  setTextHex(doc, C.assessment);
  setTracked(doc, 9);
  doc.text(safe('ASSESSMENT GROWTH'), innerX, y + 20);
  resetTracking(doc);

  doc.setFont(FONT.sans, 'bold');
  doc.setFontSize(14);
  setTextHex(doc, C.ink);
  doc.text(safe('Pre → post measurement'), innerX, y + 38);

  // ── Scores strip — three cells (Pre / Post / Change) ──
  const stripX = innerX;
  const stripY = y + 50;
  const stripW = innerW;
  const stripH = 56;

  setFillHex(doc, C.assessmentLight);
  setStrokeHex(doc, C.assessmentMid);
  doc.setLineWidth(1);
  doc.roundedRect(stripX, stripY, stripW, stripH, 5, 5, 'FD');

  // Two vertical dividers split the strip into thirds.
  const cellW = stripW / 3;
  setStrokeHex(doc, C.assessmentMid);
  doc.setLineWidth(1);
  doc.line(stripX + cellW, stripY + 4, stripX + cellW, stripY + stripH - 4);
  doc.line(stripX + cellW * 2, stripY + 4, stripX + cellW * 2, stripY + stripH - 4);

  type ScoreCell = {
    label: string;
    numText: string;
    denomText?: string;
    numHex: string;
    denomHex?: string;
  };
  const delta = growth.postTotal - growth.preTotal;
  const deltaFmt = fmtDelta(delta);
  const cells: ScoreCell[] = [
    {
      label: 'PRE',
      numText: String(growth.preTotal),
      denomText: ' / 10',
      numHex: C.assessmentText,
      denomHex: C.tertiary,
    },
    {
      label: 'POST',
      numText: String(growth.postTotal),
      denomText: ' / 10',
      numHex: C.assessmentText,
      denomHex: C.tertiary,
    },
    {
      label: 'CHANGE',
      numText: deltaFmt.text,
      numHex: rgbToHex(deltaFmt.rgb),
    },
  ];

  for (let i = 0; i < cells.length; i += 1) {
    const cell = cells[i];
    const cellLeft = stripX + i * cellW;
    const cellCenter = cellLeft + cellW / 2;

    // Cell label (top of cell)
    doc.setFont(FONT.mono, 'normal');
    doc.setFontSize(7.5);
    setTextHex(doc, C.assessment);
    setTracked(doc, 7.5, 0.16);
    const labelW = doc.getTextWidth(safe(cell.label));
    doc.text(safe(cell.label), cellCenter - labelW / 2, stripY + 16);
    resetTracking(doc);

    // Numeral — DM Serif Display 26 pt. For Pre/Post, render numerator
    // and " / 10" as two text calls (different sizes/colors) baseline-
    // aligned. Center the COMBINED string in the cell.
    doc.setFont(FONT.serif, 'normal');
    doc.setFontSize(26);
    const numW = doc.getTextWidth(cell.numText);
    let denomW = 0;
    if (cell.denomText) {
      doc.setFontSize(16);
      denomW = doc.getTextWidth(cell.denomText);
      doc.setFontSize(26); // restore so combined-width math uses correct num size
    }
    const combinedW = numW + denomW;
    const startX = cellCenter - combinedW / 2;
    const baselineY = stripY + 46;

    doc.setFontSize(26);
    setTextHex(doc, cell.numHex);
    doc.text(cell.numText, startX, baselineY);

    if (cell.denomText && cell.denomHex) {
      doc.setFontSize(16);
      setTextHex(doc, cell.denomHex);
      doc.text(cell.denomText, startX + numW, baselineY);
    }
  }

  // ── Breakdown label + table ──
  doc.setFont(FONT.mono, 'normal');
  doc.setFontSize(7.5);
  setTextHex(doc, C.tertiary);
  setTracked(doc, 7.5, 0.16);
  doc.text(safe('BY ASSESSMENT BLOCK'), innerX, y + 130);
  resetTracking(doc);

  const tableX = innerX;
  const tableY = y + 142;
  const tableW = innerW;
  const tableH = 96;

  setFillHex(doc, C.surfaceWarm);
  setStrokeHex(doc, C.borderLight);
  doc.setLineWidth(0.5);
  doc.roundedRect(tableX, tableY, tableW, tableH, 5, 5, 'FD');

  // Column geometry — Block label takes ~half the width, the three
  // numeric columns split the rest. All numeric values right-align
  // with 9 pt right padding.
  const colBlockRight = tableX + 138; // block column ends here
  const colPreRight = tableX + 178;
  const colPostRight = tableX + 218;
  const colDeltaRight = tableX + tableW - 9; // right-aligned numeric col

  // ── Header row ──
  const headerH = 22;
  const headerBaselineY = tableY + 14;

  doc.setFont(FONT.mono, 'normal');
  doc.setFontSize(7);
  setTextHex(doc, C.tertiary);
  setTracked(doc, 7, 0.14);

  doc.text(safe('BLOCK'), tableX + 9, headerBaselineY);
  // Right-aligned numeric headers
  const preHdr = safe('PRE');
  const postHdr = safe('POST');
  const deltaHdr = safe('Δ'); // Δ
  doc.text(preHdr, colPreRight - doc.getTextWidth(preHdr), headerBaselineY);
  doc.text(postHdr, colPostRight - doc.getTextWidth(postHdr), headerBaselineY);
  doc.text(deltaHdr, colDeltaRight - doc.getTextWidth(deltaHdr), headerBaselineY);
  resetTracking(doc);

  // Header bottom rule
  setStrokeHex(doc, C.borderLight);
  doc.setLineWidth(0.5);
  doc.line(tableX, tableY + headerH, tableX + tableW, tableY + headerH);

  // ── Data rows ──
  const rowH = 18;
  for (let i = 0; i < growth.blocks.length; i += 1) {
    const block = growth.blocks[i];
    const rowY = tableY + headerH + i * rowH;
    const baselineY = rowY + 13;

    // Row separator (skip first)
    if (i > 0) {
      setStrokeHex(doc, C.borderLight);
      doc.setLineWidth(0.5);
      doc.line(tableX, rowY, tableX + tableW, rowY);
    }

    // Block name — Helvetica Bold (Sans Bold) 9.5 pt, ink
    doc.setFont(FONT.sans, 'bold');
    doc.setFontSize(9.5);
    setTextHex(doc, C.ink);
    // Truncate block name to fit in column (defensive — canonical
    // names all fit comfortably).
    const blockNameMaxW = colBlockRight - (tableX + 9);
    const blockName = truncateLines(
      doc,
      doc.splitTextToSize(safe(block.name), blockNameMaxW) as string[],
      1,
      blockNameMaxW,
    )[0];
    doc.text(blockName, tableX + 9, baselineY);

    // Pre / Post / Δ — Helvetica Bold for delta, regular for counts
    doc.setFont(FONT.sans, 'normal');
    doc.setFontSize(10);
    setTextHex(doc, C.body);
    const preStr = `${block.pre} / ${block.items}`;
    const postStr = `${block.post} / ${block.items}`;
    doc.text(preStr, colPreRight - doc.getTextWidth(preStr), baselineY);
    doc.text(postStr, colPostRight - doc.getTextWidth(postStr), baselineY);

    const rowDelta = fmtDelta(block.post - block.pre);
    doc.setFont(FONT.sans, 'bold');
    doc.setFontSize(10);
    setTextHex(doc, rgbToHex(rowDelta.rgb));
    doc.text(rowDelta.text, colDeltaRight - doc.getTextWidth(rowDelta.text), baselineY);
  }

  // ── Dashed rule + framing text + dashed rule + KC fold-in ──
  const framingRuleY = y + 244;
  drawDashedRule(doc, innerX, framingRuleY, cardRight, C.border);

  doc.setFont(FONT.serif, 'italic');
  doc.setFontSize(10.5);
  setTextHex(doc, C.secondary);
  const framingText = safe(
    'Same constructs, parallel scenarios. The pre side measured your intuition; the post side measured your reasoning after the four modules.',
  );
  const framingLines = doc.splitTextToSize(framingText, innerW) as string[];
  const framingClamped = framingLines.slice(0, 3);
  let fy = y + 256;
  for (const line of framingClamped) {
    doc.text(line, innerX, fy);
    fy += 14.5;
  }

  const kcRuleY = y + 298;
  drawDashedRule(doc, innerX, kcRuleY, cardRight, C.border);

  // KC fold-in row — label left, value right
  const kcBaselineY = y + 312;
  doc.setFont(FONT.mono, 'normal');
  doc.setFontSize(7.5);
  setTextHex(doc, C.tertiary);
  setTracked(doc, 7.5, 0.16);
  doc.text(safe('KNOWLEDGE CHECKS'), innerX, kcBaselineY);
  resetTracking(doc);

  // Value: "{n} / {t}" in Sans Bold 11, then italic caption tail in
  // 9.5 pt tertiary. Right-aligned as a single visual block.
  doc.setFont(FONT.sans, 'bold');
  doc.setFontSize(11);
  const kcValueStr = `${data.kcCorrect} / ${data.kcTotal}`;
  const kcValueW = doc.getTextWidth(kcValueStr);

  doc.setFont(FONT.sans, 'italic');
  doc.setFontSize(9.5);
  const kcCaptionStr = ' preferred responses across program checks';
  const kcCaptionW = doc.getTextWidth(kcCaptionStr);

  // Total width = value + caption. Right-align the combined block.
  const kcCombinedW = kcValueW + kcCaptionW;
  // If the combined width would overflow the row, drop the caption.
  const kcRowAvailW = cardRight - (innerX + doc.getTextWidth(safe('KNOWLEDGE CHECKS')) + 12);
  const renderCaption = kcCombinedW <= kcRowAvailW;
  const renderStartX = cardRight - (renderCaption ? kcCombinedW : kcValueW);

  doc.setFont(FONT.sans, 'bold');
  doc.setFontSize(11);
  setTextHex(doc, C.ink);
  doc.text(kcValueStr, renderStartX, kcBaselineY);

  if (renderCaption) {
    doc.setFont(FONT.sans, 'italic');
    doc.setFontSize(9.5);
    setTextHex(doc, C.tertiary);
    doc.text(kcCaptionStr, renderStartX + kcValueW, kcBaselineY);
  }
}

/**
 * Page 2 dark closing card. Two layouts:
 *   • compact: when the Growth card occupies the top 348 pt of the
 *     right column, the closing card sits at (464, 478, 288, 74).
 *     Bottom edge aligns with the milestones card (y=552) for a
 *     balanced two-column footer; 6 pt gap above lets it breathe
 *     from the Growth card. 13 pt italic body, smaller eyebrow.
 *     Per the handoff, if the copy ever overflows 2 lines, drop the
 *     eyebrow before shrinking the body type.
 *   • full: when the standalone KC stat card occupies the top of the
 *     right column (growth data absent — portfolio-review fallback),
 *     the closing card keeps its original (464, 306, 288, 246) size
 *     and 14 pt italic body.
 */
function drawClosingCard(doc: jsPDF, compact: boolean): void {
  const x = 464;
  const y = compact ? 478 : 306;
  const w = 288;
  const h = compact ? 74 : 246;
  const eyebrowSize = compact ? 8 : 8.5;
  const bodySize = compact ? 13 : 14;
  const bodyLineH = compact ? 16 : 19;

  setFillHex(doc, C.ink);
  doc.roundedRect(x, y, w, h, 6, 6, 'F');

  const closing = safe(
    'This profile is a snapshot of where you are now. The milestones above are where the practice goes next.',
  );

  // Wrap the body first so we can decide whether to render the eyebrow
  // (compact card drops the eyebrow if the body needs more than 2 lines).
  doc.setFont(FONT.serif, 'italic');
  doc.setFontSize(bodySize);
  const wrap = doc.splitTextToSize(closing, w - 36) as string[];
  const showEyebrow = compact ? wrap.length <= 2 : true;

  // Eyebrow — faded (no alpha in jsPDF; use mid-gray as approximation
  // of 50% white on dark fill).
  if (showEyebrow) {
    doc.setFont(FONT.mono, 'normal');
    doc.setFontSize(eyebrowSize);
    doc.setTextColor(140, 140, 140);
    setTracked(doc, eyebrowSize, 0.22);
    const eyebrow = 'A SNAPSHOT OF NOW';
    const eyebrowW = doc.getTextWidth(safe(eyebrow));
    const eyebrowY = compact ? y + 18 : y + 36;
    doc.text(safe(eyebrow), x + (w - eyebrowW) / 2, eyebrowY);
    resetTracking(doc);
  }

  // Closing text — DM Serif Display italic, off-white, centered.
  doc.setFont(FONT.serif, 'italic');
  doc.setFontSize(bodySize);
  doc.setTextColor(250, 248, 245);
  const totalH = wrap.length * bodyLineH;
  // Compact layout: when an eyebrow is shown the body sits just
  // below it; when the eyebrow is dropped (3+ line body), the body
  // vertically centers in the card. Full layout always centers.
  let ly = compact
    ? (showEyebrow ? y + 32 : y + h / 2 - totalH / 2 + bodyLineH - 2)
    : y + h / 2 - totalH / 2 + 12;
  for (const line of wrap) {
    const lw = doc.getTextWidth(line);
    doc.text(line, x + (w - lw) / 2, ly);
    ly += bodyLineH;
  }
}

// ─── Main entry ───────────────────────────────────────────────────

export async function generateCompletionPDF(data: CompletionProfileData): Promise<void> {
  const doc = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'landscape' });

  // Embed the DM font family — this is what makes the PDF look like
  // the R8 design rather than a generic Helvetica fallback.
  await registerDMFonts(doc);

  drawPage1(doc, data);
  doc.addPage();
  drawPage2(doc, data);

  // Footers run last so we know the total page count up front.
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p += 1) {
    doc.setPage(p);
    drawPageFooter(doc, data.completionDate, p, total);
  }

  doc.save('ai-literacy-competency-profile.pdf');
}
