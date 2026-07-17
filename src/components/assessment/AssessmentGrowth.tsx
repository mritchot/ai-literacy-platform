// AssessmentGrowth — wrapper that embeds the comparative pre→post
// view at the top of M4 S10's CompletionSummary. Hands off most of
// the work to AssessmentResults (variant='embedded') and adds a
// title row that frames the section within the competency profile.
//
// Graceful degradation: a portfolio reviewer may land on M4 S10
// without having completed either assessment. In that case the
// inner AssessmentResults renders its IncompletePlaceholder
// (handled inside that component) — this wrapper just surfaces a
// friendlier framing message.

import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { Overline } from '../shared/Overline';
import { AssessmentResults } from './AssessmentResults';

const ASSESSMENT_ACCENT = 'rgb(var(--discernment))';

export function AssessmentGrowth(): JSX.Element {
  const { isAssessmentComplete } = useLearnerProgress();
  const preComplete = isAssessmentComplete('pre');
  const postComplete = isAssessmentComplete('post');
  const bothComplete = preComplete && postComplete;

  return (
    <section
      aria-label="Pre and post assessment comparison"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${ASSESSMENT_ACCENT}`,
        padding: '20px 24px',
      }}
    >
      <Overline
        className="mb-1"
        style={{ color: 'rgb(var(--info))', letterSpacing: '0.1em' }}
      >
        Assessment Growth
      </Overline>
      <h2
        className="m-0 mb-1 font-sans text-h2 font-semibold text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        Where you started vs. where you are now
      </h2>
      <p className="m-0 mb-5 font-sans text-body-sm text-secondary">
        {bothComplete
          ? 'Same constructs, parallel scenarios. Use this to see exactly how your reasoning shifted across the program.'
          : 'A side-by-side comparison appears here once both the pre- and post-assessments are complete.'}
      </p>
      {/* AssessmentResults handles its own incomplete-state placeholder
          (when only pre or only post is recorded), so we can render it
          unconditionally — variant='embedded' suppresses the hero +
          footer chrome that only makes sense on the standalone page. */}
      <AssessmentResults variant="embedded" />
    </section>
  );
}
