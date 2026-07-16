// Level 4: Results — the evaluation series' interactive artifact. The prose
// renders verbatim from the finalized markdown (single source of truth,
// synced from the Cowork canonical), but the static ROI model block — the
// formula code block, variable table, and worked-example table between the
// two markers below — is replaced on the web by the live RoiCalculator. The
// canonical markdown keeps the full static model, so the PDF is unaffected.

import MARKDOWN from './content/04_level-4-results.md?raw';
import { renderMarkdown } from '../../components/shared/render-markdown';
import { ArtifactFooter, ArtifactTopBar, SeriesEyebrow } from './chrome';
import { RoiCalculator, RoiFormulaFigure } from './RoiCalculator';

// Split markers mirror the canonical section boundaries. Part A ends just
// before the static model's lead-in line; Part B resumes at the timeline
// heading. The content between them is web-omitted (PDF-only).
const CALC_START =
  'The model calculates two independently attributed benefit streams against total program cost:';
const RESUME_HEADING = '## Timeline, and the full chain';

// If the canonical markers ever drift, fall back to rendering the full
// document (calculator appended) so content is never silently dropped —
// the re-sync verification loop catches the drift.
function split(md: string): { partA: string; partB: string } {
  const a = md.indexOf(CALC_START);
  const b = md.indexOf(RESUME_HEADING);
  if (a === -1 || b === -1 || b < a) return { partA: md, partB: '' };
  return { partA: md.slice(0, a), partB: md.slice(b) };
}

const { partA, partB } = split(MARKDOWN);

export default function Level4Results(): JSX.Element {
  return (
    <div className="mx-auto max-w-interactive px-4 py-12 sm:px-8 lg:px-16 lg:py-14">
      <ArtifactTopBar pdfSlug="level-4-results" />
      <SeriesEyebrow label="Evaluation framework · Interactive" />
      <article className="prose-longform max-w-reading">{renderMarkdown(partA)}</article>
      <RoiFormulaFigure />
      <RoiCalculator />
      {partB.length > 0 && (
        <article className="prose-longform mt-10 max-w-reading">{renderMarkdown(partB)}</article>
      )}
      <ArtifactFooter currentSlug="level-4-results" />
    </div>
  );
}
