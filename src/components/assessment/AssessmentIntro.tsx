// AssessmentIntro — pre/post framing screen. Renders before the first
// item. The two variants share layout but diverge on framing copy:
//   • Pre: "no feedback shown — this is a baseline" + estimated time +
//     consent-style note.
//   • Post: "comparative results once submitted" + reminder that this
//     mirrors the pre-assessment so growth is measurable.

import { Link } from 'react-router-dom';
import { Icon } from '../shared/Icon';
import { Overline } from '../shared/Overline';
import { useViewport } from '../../hooks/useViewport';

interface AssessmentIntroProps {
  kind: 'pre' | 'post';
  itemCount: number;
  onBegin: () => void;
  /** When the learner has already completed this assessment, the intro
   *  surfaces a "you already finished this" notice and a path back to
   *  wherever they came from. The Begin button is hidden in that
   *  state — re-doing the assessment is not a supported flow. */
  alreadyComplete: boolean;
}

const PRE_HEADLINE = 'Before you begin: a baseline';
const POST_HEADLINE = 'Almost done: your post-program assessment';

export function AssessmentIntro({
  kind,
  itemCount,
  onBegin,
  alreadyComplete,
}: AssessmentIntroProps): JSX.Element {
  const isPre = kind === 'pre';
  const isMobile = useViewport() === 'mobile';
  return (
    <div className="mx-auto max-w-reading">
      <Overline className="mb-2">{isPre ? 'Pre-assessment' : 'Post-assessment'}</Overline>
      <h1
        className="m-0 mb-4 font-display text-title font-normal text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        {isPre ? PRE_HEADLINE : POST_HEADLINE}
      </h1>

      <div
        className="bg-[rgb(var(--white))] p-5 sm:p-6"
        style={{ border: '1px solid rgb(var(--border))' }}
      >
        {isPre ? <PreFraming itemCount={itemCount} /> : <PostFraming itemCount={itemCount} />}
      </div>

      {alreadyComplete ? (
        <AlreadyCompleteNotice kind={kind} />
      ) : (
        // Bottom navigation — a single row at every breakpoint (matching the
        // module-section footer): the Back link sits left, the primary Begin
        // CTA right. On mobile the Back link shortens to "Back" so both stay
        // on one line; the Begin button keeps its size and prominence.
        <div className="mt-8 flex flex-nowrap items-center justify-between gap-3 pb-4 sm:mt-6 sm:pb-0">
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-2 font-sans text-[13.5px] font-semibold text-tertiary no-underline hover:text-secondary"
          >
            <Icon name="arrowLeft" size={14} />
            {isMobile ? 'Back' : 'Back to program home'}
          </Link>
          <button
            type="button"
            onClick={onBegin}
            className="inline-flex shrink-0 items-center justify-center gap-2.5 bg-action px-5 py-3 font-sans text-[14px] font-semibold text-[rgb(var(--white))] dark:text-[rgb(var(--canvas))] transition-colors duration-[160ms] hover:bg-action-hover"
            style={{ border: '1px solid rgb(var(--action))' }}
          >
            {isPre ? 'Begin pre-assessment' : 'Begin post-assessment'}
            <Icon name="arrowRight" size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function PreFraming({ itemCount }: { itemCount: number }): JSX.Element {
  return (
    <div className="space-y-4 font-sans text-body text-body" style={{ lineHeight: 1.6 }}>
      <p className="m-0">
        Before the program starts, take 10 minutes to capture a baseline.
        You&rsquo;ll answer <strong className="text-ink">{itemCount} scenario-based questions</strong>{' '}
        about how AI tools work and where they break down. The items sample the program&rsquo;s
        four core construct areas — usage patterns, failure modes, mechanics, and evaluation —
        rather than every module objective.
      </p>
      <ul className="m-0 list-disc space-y-1.5 pl-5">
        <li>
          <strong className="text-ink">No feedback during the assessment.</strong> Your responses
          are saved as you go, but the answers are held until the end of the program. The goal
          here is to measure what you walk in with.
        </li>
        <li>
          <strong className="text-ink">Answer from intuition.</strong> If you&rsquo;re not sure,
          pick the option that feels closest.
        </li>
        <li>
          <strong className="text-ink">About {Math.max(5, Math.ceil(itemCount * 0.75))}&ndash;
          {Math.ceil(itemCount * 1.25)} minutes.</strong> You can leave and come back; your
          progress is saved in this browser.
        </li>
      </ul>
      <p
        className="m-0 font-sans text-body-sm text-secondary"
        style={{
          background: 'rgb(var(--surface))',
          border: '1px solid rgb(var(--border-light))',
          padding: '10px 14px',
          lineHeight: 1.5,
        }}
      >
        After you finish Module 4, you&rsquo;ll take a parallel post-assessment and see your
        responses side by side.
      </p>
    </div>
  );
}

function PostFraming({ itemCount }: { itemCount: number }): JSX.Element {
  return (
    <div className="space-y-4 font-sans text-body text-body" style={{ lineHeight: 1.6 }}>
      <p className="m-0">
        You&rsquo;ve completed the four program modules. Before you see your competency profile,
        take a <strong className="text-ink">parallel set of {itemCount}{' '}
        scenario-based questions</strong>. Same constructs as the pre-assessment, different
        scenarios.
      </p>
      <ul className="m-0 list-disc space-y-1.5 pl-5">
        <li>
          <strong className="text-ink">Use the vocabulary you&rsquo;ve learned.</strong> Tokenization,
          next-token prediction, context window, augmentation/automation, the 4D framework: all
          of it applies here.
        </li>
        <li>
          <strong className="text-ink">Comparative results when you finish.</strong> Each item is
          paired with the matching pre-assessment item so you can see how your reasoning shifted.
        </li>
        <li>
          <strong className="text-ink">About {Math.max(5, Math.ceil(itemCount * 0.75))}&ndash;
          {Math.ceil(itemCount * 1.25)} minutes.</strong> One submission per item; you can&rsquo;t
          retake it, so the comparison stays honest.
        </li>
      </ul>
    </div>
  );
}

function AlreadyCompleteNotice({ kind }: { kind: 'pre' | 'post' }): JSX.Element {
  const isPre = kind === 'pre';
  return (
    <div
      className="mt-6"
      style={{
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        padding: '18px 20px',
      }}
    >
      <Overline className="mb-1.5">You&rsquo;ve already completed this</Overline>
      <p className="m-0 font-sans text-body-sm text-body" style={{ lineHeight: 1.55 }}>
        {isPre
          ? 'Your pre-assessment responses are recorded. They\'ll be paired with your post-assessment responses after you finish Module 4.'
          : 'Your post-assessment responses are recorded. Your competency profile (M4 S10) shows the comparative results.'}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-sans text-[13.5px] font-semibold text-action no-underline hover:underline"
        >
          Return to program home
          <Icon name="arrowRight" size={14} />
        </Link>
        {!isPre && (
          <Link
            to="/module/4/section/10"
            className="inline-flex items-center gap-2 font-sans text-[13.5px] font-semibold text-action no-underline hover:underline"
          >
            View competency profile
            <Icon name="arrowRight" size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
