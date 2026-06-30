// Level 3: Behavior — reading artifact. Rendered verbatim from the finalized
// markdown (single source of truth, synced from the Cowork canonical).

import MARKDOWN from '../../../claude-code/evaluation-content/03_level-3-behavior.md?raw';
import { ReadingArtifact } from './ReadingArtifact';

export default function Level3Behavior(): JSX.Element {
  return <ReadingArtifact markdown={MARKDOWN} pdfSlug="level-3-behavior" />;
}
