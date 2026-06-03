// Market-Level Capability Gap Analysis — reading artifact. Content is
// rendered verbatim from the finalized markdown (single source of truth).

import MARKDOWN from '../../../claude-code/needs-analysis-content/02_capability-gap-analysis.md?raw';
import { ReadingArtifact } from './ReadingArtifact';

export default function CapabilityGap(): JSX.Element {
  return <ReadingArtifact markdown={MARKDOWN} pdfSlug="capability-gap-analysis" />;
}
