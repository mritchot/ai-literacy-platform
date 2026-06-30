// Level 1: Reaction — reading artifact. Rendered verbatim from the finalized
// markdown (single source of truth, synced from the Cowork canonical).

import MARKDOWN from '../../../claude-code/evaluation-content/01_level-1-reaction.md?raw';
import { ReadingArtifact } from './ReadingArtifact';

export default function Level1Reaction(): JSX.Element {
  return <ReadingArtifact markdown={MARKDOWN} pdfSlug="level-1-reaction" />;
}
