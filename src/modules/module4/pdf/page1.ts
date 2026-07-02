// Page 1 of the S10 Competency Profile PDF — signature bar, header,
// section overline, and the 2×2 grid of competency cards (see
// ../generate-completion-pdf.ts for the layout spec).

import type { jsPDF } from 'jspdf';
import type { CompletionProfileData } from '../generate-completion-pdf';
import {
  C,
  GRID_CELL_H,
  GRID_CELL_W,
  GRID_GAP,
  GRID_TOP,
  LINES,
  MARGIN_LEFT,
  SECTION_OVERLINE_Y,
} from './constants';
import {
  drawCompetencyCard,
  drawDiligenceStatement,
  drawField,
  drawHeader,
  drawPageBackground,
  drawSectionOverline,
  drawSignatureBar,
  drawStackedFields,
  drawStatLine,
  type Rect,
} from './primitives';

// ─── Page 1 ───────────────────────────────────────────────────────

function gridRect(row: 0 | 1, col: 0 | 1): Rect {
  return {
    x: MARGIN_LEFT + col * (GRID_CELL_W + GRID_GAP),
    y: GRID_TOP + row * (GRID_CELL_H + GRID_GAP),
    w: GRID_CELL_W,
    h: GRID_CELL_H,
  };
}

export function drawPage1(doc: jsPDF, data: CompletionProfileData): void {
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
