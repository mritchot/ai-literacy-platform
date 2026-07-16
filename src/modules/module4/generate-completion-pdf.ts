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
//   • Card-based layout: white fill, 6pt corners, 3pt left
//     rule in the relevant 4D color for the competency cards (and
//     for the milestones card on page 2).
//   • Surface-warm-tinted "field" boxes inside each card hold the
//     learner's authored content.
//   • Dashed attribution rule above each card's source attribution.
//   • Dark inverted closing card on page 2 — the only block that
//     flips the warm-paper convention.
//
// Typography — the platform's real typefaces are embedded via the
// font-loader module. Without them the PDF would fall back to Helvetica
// and look generic; with them, headings get Source Serif 4's editorial
// weight, body and labels use IBM Plex Sans, and tracked overlines use
// IBM Plex Mono.
//
// Constraints still in play
//   • Only the six (family, style) pairs this document calls are
//     embedded. `setFont` with an unregistered pair falls back to
//     Helvetica silently, so a new pair means a new face in font-loader.
//   • What reads as "bold mono" in the design is Medium (500),
//     registered as the normal style of the PlexMono family.
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
import { registerPdfFonts } from './font-loader';
import { drawPage1 } from './pdf/page1';
import { drawPage2 } from './pdf/page2';
import { drawPageFooter } from './pdf/primitives';

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
  growth?: AssessmentGrowthData | undefined;
}

// (The canonical block list — name + item count — is declared by the
// caller that constructs the AssessmentGrowthData payload. The
// generator just iterates `data.growth.blocks` and trusts those
// names to be the four canonical strings.)

// ─── Main entry ───────────────────────────────────────────────────

export async function generateCompletionPDF(data: CompletionProfileData): Promise<void> {
  const doc = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'landscape' });

  // Embed the typefaces — this is what makes the PDF look like the R8
  // design rather than a generic Helvetica fallback.
  await registerPdfFonts(doc);

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
