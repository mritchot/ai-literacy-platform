// Page 2 of the S10 Competency Profile PDF — milestones card,
// knowledge/growth card, and the dark inverted closing card (see
// ../generate-completion-pdf.ts for the layout spec).

import type { jsPDF } from 'jspdf';
import type { CompletionProfileData } from '../generate-completion-pdf';
import { C, FONT, MARGIN_LEFT, SECTION_OVERLINE_Y } from './constants';
import {
  drawCardBase,
  drawDashedRule,
  drawHeader,
  drawPageBackground,
  drawRule,
  drawSectionOverline,
  drawSignatureBar,
  fmtDelta,
  resetTracking,
  rgbToHex,
  safe,
  setFillHex,
  setStrokeHex,
  setTextHex,
  setTracked,
} from './primitives';
import { truncateLines } from './text-fit';

// ─── Page 2 ───────────────────────────────────────────────────────

export function drawPage2(doc: jsPDF, data: CompletionProfileData): void {
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
    const m = milestones[i]!; // in bounds per the loop condition
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
    doc.rect(badgeX, badgeY, badgeW, badgeH, 'FD');

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

  // Big stat — Source Serif 4 for both numerator and denominator.
  // "14" at 36pt; " / 16" at 22pt, baseline-aligned.
  const numStr = String(data.kcCorrect);
  doc.setFont(FONT.serif, 'bold');
  doc.setFontSize(36);
  setTextHex(doc, C.ink);
  doc.text(numStr, x + padX, y + padY + 70);
  const numW = doc.getTextWidth(numStr);

  doc.setFont(FONT.serif, 'bold');
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
 * Score numerals render in Source Serif 4 rather than Helvetica
 * (the handoff allows either; Source Serif 4 keeps visual consistency with
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
  doc.rect(x, y, w, h, 'FD');
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
  doc.rect(stripX, stripY, stripW, stripH, 'FD');

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
    const cell = cells[i]!; // in bounds per the loop condition
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

    // Numeral — Source Serif 4 26 pt. For Pre/Post, render numerator
    // and " / 10" as two text calls (different sizes/colors) baseline-
    // aligned. Center the COMBINED string in the cell.
    doc.setFont(FONT.serif, 'bold');
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
  doc.rect(tableX, tableY, tableW, tableH, 'FD');

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
    const block = growth.blocks[i]!; // in bounds per the loop condition
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
    )[0] ?? '';
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
  const kcLabel = safe('KNOWLEDGE CHECKS');
  // Measured here, in the label's own font, size, and tracking
  // (getTextWidth ignores charSpace, so the per-gap tracking is added
  // manually) — the overflow guard below previously measured this label
  // in sans-italic 9.5 and was slightly off.
  const kcLabelW = doc.getTextWidth(kcLabel) + 7.5 * 0.16 * (kcLabel.length - 1);
  doc.text(kcLabel, innerX, kcBaselineY);
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
  const kcRowAvailW = cardRight - (innerX + kcLabelW + 12);
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

  setFillHex(doc, C.sumi);
  doc.rect(x, y, w, h, 'F');

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

  // Closing text — Source Serif 4 italic, off-white, centered.
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
