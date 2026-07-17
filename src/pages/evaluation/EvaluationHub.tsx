// Evaluation Framework hub (`/#/evaluation`) — the short landing page that
// frames the four Kirkpatrick-level artifacts and links to each one (and to
// its PDF, when available). Standalone page inside PlatformShell, reachable
// in every platform mode. Linked from the thank-you page; the artifacts are
// also reached directly from the blog after deploy.

import { ArtifactHub } from './chrome';

export default function EvaluationHub(): JSX.Element {
  return (
    <ArtifactHub
      eyebrow="Behind the course"
      title="The evaluation framework"
      intro={
        <p className="m-0 max-w-reading">
          These four documents are the
          evaluation framework behind <em className="italic">AI Literacy for the Modern Workforce</em>,
          built on the four Kirkpatrick levels (reaction, learning, behavior, and results) and
          designed before the modules, so success was defined before anything existed to produce
          it. Level 2 carries real validation data; the other three are instrument designs
          awaiting a first deployment cohort.
        </p>
      }
    />
  );
}
