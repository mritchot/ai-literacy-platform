// Level 2: Learning — reading artifact. Rendered verbatim from the finalized
// markdown (single source of truth, synced from the Cowork canonical).

import MARKDOWN from './content/02_level-2-learning.md?raw';
import { ReadingArtifact } from './ReadingArtifact';

export default function Level2Learning(): JSX.Element {
  return <ReadingArtifact markdown={MARKDOWN} pdfSlug="level-2-learning" />;
}
