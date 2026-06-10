// Level 4: Results — reading artifact. Rendered verbatim from the finalized
// markdown (single source of truth, synced from the Cowork canonical).

import MARKDOWN from '../../../claude-code/evaluation-content/04_level-4-results.md?raw';
import { ReadingArtifact } from './ReadingArtifact';

export default function Level4Results(): JSX.Element {
  return <ReadingArtifact markdown={MARKDOWN} pdfSlug="level-4-results" />;
}
