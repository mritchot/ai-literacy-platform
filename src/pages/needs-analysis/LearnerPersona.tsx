// Evidence-Based Learner Persona — reading artifact. Content is rendered
// verbatim from the finalized markdown (single source of truth).

import MARKDOWN from '../../../claude-code/needs-analysis-content/03_learner-persona.md?raw';
import { ReadingArtifact } from './ReadingArtifact';

export default function LearnerPersona(): JSX.Element {
  return <ReadingArtifact markdown={MARKDOWN} pdfSlug="learner-persona" />;
}
