// AssessmentCompletion — pre-assessment-only completion screen. No
// score, no per-item feedback, no "right answer" reveal: the
// pre-assessment is purposely a silent baseline. The screen confirms
// the responses were saved and directs the learner into Module 1.
//
// The post-assessment uses AssessmentResults.tsx instead, which surfaces
// the comparative pre→post growth view.

import { Link } from 'react-router-dom';
import { Icon } from '../shared/Icon';
import { Overline } from '../shared/Overline';

interface AssessmentCompletionProps {
  itemCount: number;
}

export function AssessmentCompletion({
  itemCount,
}: AssessmentCompletionProps): JSX.Element {
  return (
    <div className="mx-auto max-w-reading">
      <Overline className="mb-2">Pre-assessment complete</Overline>
      <h1
        className="m-0 mb-4 font-display text-title font-normal text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        You&rsquo;re ready to begin
      </h1>

      <div
        className="bg-[rgb(var(--white))] p-5 sm:p-6"
        style={{ border: '1px solid rgb(var(--border))' }}
      >
        <p
          className="m-0 mb-3 font-sans text-body text-body"
          style={{ lineHeight: 1.6 }}
        >
          Your {itemCount} responses are saved. The preferred answers stay hidden for now.
          They get revealed at the end, paired with your post-assessment responses, so you
          can see how your reasoning shifted.
        </p>
        <p
          className="m-0 font-sans text-body-sm text-secondary"
          style={{ lineHeight: 1.55 }}
        >
          Module 1 begins with why AI literacy matters now: the shift that makes these
          questions relevant to your daily work.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        <Link
          to="/module/1/section/1"
          className="inline-flex items-center gap-2.5 bg-action px-5 py-3 font-sans text-[14px] font-semibold text-[rgb(var(--white))] dark:text-[rgb(var(--canvas))] no-underline transition-colors duration-[160ms] hover:bg-action-hover"
          style={{ border: '1px solid rgb(var(--action))' }}
        >
          Begin Module 1
          <Icon name="arrowRight" size={14} />
        </Link>
      </div>
    </div>
  );
}
