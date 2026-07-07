// Behind the build hub (`/#/build`) — the short landing page that frames the
// eight design and project-management artifacts behind the course and links to
// each. Mirrors src/pages/evaluation/EvaluationHub.tsx; the shared ArtifactHub
// renders the two labeled groups (Design, Project Management) directly from the
// series config. Standalone page inside PlatformShell, reachable in every
// platform mode. Linked from the About (thank-you) page; the artifacts are also
// reached from the series-finale blog post after deploy.

import { ArtifactHub } from './chrome';
import { BUILD_WRITEUP_URL } from './config';

export default function BuildHub(): JSX.Element {
  return (
    <ArtifactHub
      eyebrow="Behind the course"
      title="Behind the build"
      intro={
        <p className="m-0 max-w-reading">
          These eight artifacts are the design and project-management record behind{' '}
          <em className="italic">AI Literacy for the Modern Workforce</em> — the decisions, the plan,
          and the quality system that produced the course and the platform you are reading this on.
          The <strong className="font-semibold text-ink">Design</strong> set traces the learning
          architecture, the visual system, and the technical decisions; the{' '}
          <strong className="font-semibold text-ink">Project Management</strong> set reframes a solo,
          AI-accelerated build as the five-person organizational deployment it models — the timeline,
          responsibilities, budget, stakeholder communications, and QA that implies.
        </p>
      }
      writeupUrl={BUILD_WRITEUP_URL}
      writeupBlurb="The series-finale write-up on how the course and its platform came together."
    />
  );
}
