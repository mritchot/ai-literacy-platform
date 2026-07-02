// Page- and card-level drawing primitives for the S10 Competency
// Profile PDF (see ../generate-completion-pdf.ts for the layout spec).

import type { jsPDF } from 'jspdf';
import {
  C,
  CARD_ATTRIB_RULE_Y_OFFSET,
  CARD_ATTRIB_TEXT_Y_OFFSET,
  CARD_BODY_TOP_OFFSET,
  CARD_HEADING_Y_OFFSET,
  CARD_INNER_PAD_X,
  CARD_OVERLINE_Y_OFFSET,
  CONTENT_W,
  FONT,
  FOOTER_BASELINE_Y,
  FOOTER_RULE_Y,
  MARGIN_LEFT,
  MARGIN_RIGHT,
  MAX_FIELD_CHARS,
  PAGE_H,
  PAGE_W,
  SIGNATURE_BAR_H,
  TRACKING_MONO,
} from './constants';
import { fitText } from './text-fit';

// ─── Tiny color/font helpers ──────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [0, 0, 0];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

/** Inverse of hexToRgb — used by the Growth card to convert
 *  fmtDelta()'s RGB triple back to a hex string so it plays with
 *  `setTextHex`. */
export function rgbToHex(rgb: [number, number, number]): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}

/** Format a signed integer delta with typographic glyphs (U+2212
 *  minus, U+00B1 plus-minus) and a color triple. Used by the Growth
 *  card's Change cell and the breakdown table's Δ column. Helvetica
 *  WinAnsi has both glyphs, so the strings render correctly without
 *  font fallback. */
export function fmtDelta(n: number): { text: string; rgb: [number, number, number] } {
  if (n > 0) return { text: `+${n}`, rgb: [79, 122, 61] }; // positive #4F7A3D
  if (n < 0) return { text: `−${Math.abs(n)}`, rgb: [155, 123, 46] }; // negative #9B7B2E
  return { text: '±0', rgb: [136, 136, 136] }; // neutral #888888
}
export function setFillHex(doc: jsPDF, hex: string): void {
  const [r, g, b] = hexToRgb(hex);
  doc.setFillColor(r, g, b);
}
export function setStrokeHex(doc: jsPDF, hex: string): void {
  const [r, g, b] = hexToRgb(hex);
  doc.setDrawColor(r, g, b);
}
export function setTextHex(doc: jsPDF, hex: string): void {
  const [r, g, b] = hexToRgb(hex);
  doc.setTextColor(r, g, b);
}
export function setTracked(doc: jsPDF, sizePt: number, factor: number = TRACKING_MONO): void {
  doc.setCharSpace(sizePt * factor);
}
export function resetTracking(doc: jsPDF): void {
  doc.setCharSpace(0);
}

// jsPDF's built-in Helvetica is WinAnsi-only. Replace common Unicode
// punctuation with safe equivalents so they render correctly. Em-dash,
// en-dash, smart quotes, and ellipsis are all in WinAnsi.
export function safe(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"');
}

// ─── Page-level primitives ────────────────────────────────────────

export function drawPageBackground(doc: jsPDF): void {
  setFillHex(doc, C.surface);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
}

export function drawSignatureBar(doc: jsPDF): void {
  const segW = PAGE_W / 4;
  const segs = [C.delegation, C.description, C.discernment, C.diligence];
  for (let i = 0; i < segs.length; i += 1) {
    setFillHex(doc, segs[i]);
    // Tiny overlap (+0.4) hides any sub-pixel seam between adjacent rects.
    doc.rect(i * segW, 0, segW + 0.4, SIGNATURE_BAR_H, 'F');
  }
}

export function drawRule(
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

export function drawDashedRule(doc: jsPDF, x1: number, y: number, x2: number, hex: string): void {
  setStrokeHex(doc, hex);
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(x1, y, x2, y);
  doc.setLineDashPattern([], 0);
}

export function drawSectionOverline(doc: jsPDF, text: string, y: number): void {
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

export function drawHeader(
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

export function drawPageFooter(
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

export function drawCardBase(
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

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function drawField(
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

export function drawCompetencyCard(
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
export function drawStackedFields(
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
export function drawStatLine(
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
export function drawDiligenceStatement(
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
