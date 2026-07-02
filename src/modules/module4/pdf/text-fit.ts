// Text truncation and auto-fit helpers for the S10 Competency Profile
// PDF (see ../generate-completion-pdf.ts for the overflow strategy).

import type { jsPDF } from 'jspdf';

// ─── Truncation ───────────────────────────────────────────────────
//
// Take an array of wrapped lines, keep at most `max`, and append an
// ellipsis to the last kept line (trimming trailing punctuation and
// removing trailing words until "last + …" fits the available width).

export function truncateLines(
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

export interface FittedText {
  lines: string[];
  fontSize: number;
  leading: number;
  shrunk: boolean;
  truncated: boolean;
}

export interface FitOptions {
  maxSize?: number;
  minSize?: number;
  stepSize?: number;
  /** Leading multiple of font size — CSS body uses ~1.45. */
  lineHeightRatio?: number;
}

// Wrap `text` (possibly with `\n\s*\n` paragraph breaks) at the doc's
// current font size into a flat array of lines, inserting an empty
// string between paragraphs to preserve the visual break.
export function wrapParagraphs(doc: jsPDF, text: string, maxWidth: number): string[] {
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

export function fitText(
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
