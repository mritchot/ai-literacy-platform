// Executive Problem Statement — reading artifact. Content is rendered
// verbatim from the finalized markdown (single source of truth).

import MARKDOWN from '../../../claude-code/needs-analysis-content/01_executive-problem-statement.md?raw';
import { ReadingArtifact } from './ReadingArtifact';

export default function ProblemStatement(): JSX.Element {
  return <ReadingArtifact markdown={MARKDOWN} pdfSlug="executive-problem-statement" />;
}
