// Needs Analysis hub (`/#/needs-analysis`) — the short landing page that
// frames the four artifacts and links to each one (and to its PDF, when
// available). Standalone page inside PlatformShell, reachable in every
// platform mode. Linked from the thank-you page; the artifacts are also
// reached directly from the blog after deploy.

import { ArtifactHub } from './chrome';

export default function NeedsAnalysisHub(): JSX.Element {
  return (
    <ArtifactHub
      eyebrow="Behind the course"
      title="The needs analysis"
      intro={
        <p className="m-0 max-w-reading">
          Before the course existed, there was the case for it. These four documents are the needs
          analysis behind <em className="italic">AI Literacy for the Modern Workforce</em> — the
          problem it addresses, the market gap it fills, the learner it targets, and the map from
          each documented gap to the behavior, practice, and reference that closes it. They are
          reproduced here as they informed the build, evidence and citations intact.
        </p>
      }
    />
  );
}
