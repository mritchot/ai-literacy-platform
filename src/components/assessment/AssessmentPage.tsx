// AssessmentPage — controller for a single assessment (pre or post).
// Owns the simple state machine:
//
//   intro  →  items  →  completion (pre)  |  results (post)
//
// Each step is a distinct sub-screen, rendered inside a single content
// column. The component:
//   • reads/writes the assessment record via LearnerProgressContext
//     (single source of truth, persistent across reloads),
//   • fires analytics for start, per-item answer, and completion,
//   • routes to the next destination from the closing screen,
//   • restores the learner's mid-flow position if they leave and
//     return (the next un-answered item).

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import {
  useLearnerProgress,
  type AssessmentKind,
} from '../../contexts/LearnerProgressContext';
import { PRE_ASSESSMENT_ITEMS, type AssessmentItem as AssessmentItemData } from '../../data/pre-assessment';
import { POST_ASSESSMENT_ITEMS } from '../../data/post-assessment';
import { scrollBehavior } from '../../utils/motion';
import { Icon } from '../shared/Icon';
import { AssessmentCompletion } from './AssessmentCompletion';
import { AssessmentIntro } from './AssessmentIntro';
import { AssessmentItem } from './AssessmentItem';
import { AssessmentProgress } from './AssessmentProgress';
import { AssessmentResults } from './AssessmentResults';

interface AssessmentPageProps {
  kind: AssessmentKind;
}

type Phase = 'intro' | 'items' | 'closing';

export function AssessmentPage({ kind }: AssessmentPageProps): JSX.Element {
  const items: AssessmentItemData[] = useMemo(
    () => (kind === 'pre' ? PRE_ASSESSMENT_ITEMS : POST_ASSESSMENT_ITEMS),
    [kind],
  );
  const total = items.length;

  const {
    startAssessment,
    recordAssessmentResponse,
    completeAssessment,
    isAssessmentComplete,
    getAssessmentResponses,
    getAssessmentRecord,
  } = useLearnerProgress();
  const { track } = useAnalytics();

  const alreadyComplete = isAssessmentComplete(kind);
  const record = getAssessmentRecord(kind);
  const responses = getAssessmentResponses(kind);

  // Initial phase resolution:
  //   • If the learner already completed this assessment, drop them on
  //     the closing screen directly (lets them re-view results for the
  //     post; for the pre, AssessmentCompletion just re-confirms).
  //   • If the learner has a startedAt but no completedAt, they're
  //     mid-flow — drop them on the items step at the first unanswered
  //     question.
  //   • Otherwise, intro.
  const initialPhase: Phase = alreadyComplete
    ? 'closing'
    : record.startedAt
      ? 'items'
      : 'intro';

  const initialIndex = useMemo(() => {
    if (alreadyComplete) return total - 1;
    // First item without a stored response. Defaults to 0 (the first
    // item) when none exist yet.
    const idx = items.findIndex((it) => !responses[it.id]);
    return idx === -1 ? 0 : idx;
  }, [alreadyComplete, items, responses, total]);

  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  // The currently-selected option for the active item. With no in-flight
  // back navigation, the prefill from `responses[currentItem.id]` is a
  // defensive no-op in normal flow: initialIndex always resolves to the
  // first un-answered item, so there's no recorded response to restore.
  // The lookup stays in place as a guard against any edge case where
  // state arrives with an already-answered active item (e.g. a future
  // resume path that lands somewhere other than the next un-answered
  // item).
  const currentItem = items[currentIndex];
  const [selectedOptionId, setSelectedOptionId] = useState<
    'A' | 'B' | 'C' | 'D' | null
  >(() => {
    const existing = responses[currentItem?.id ?? ''];
    return (existing?.selectedOptionId as 'A' | 'B' | 'C' | 'D' | undefined) ?? null;
  });

  // When the active item changes (Next button), reset the selection to
  // whatever's already persisted for the new item (typically nothing,
  // since the flow is forward-only and each new item is un-answered).
  useEffect(() => {
    const existing = responses[currentItem?.id ?? ''];
    setSelectedOptionId(
      (existing?.selectedOptionId as 'A' | 'B' | 'C' | 'D' | undefined) ?? null,
    );
    // We intentionally key off the item id, not the whole responses
    // object — responses changes after each recordAssessmentResponse
    // call and we don't want that to interfere with the in-flight
    // selection state for the *current* item.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItem?.id]);

  // Begin handler — fires when the learner clicks the intro's
  // primary CTA. Idempotent against startAssessment (which guards
  // against double-start), so a quick double-click is safe.
  const handleBegin = useCallback(() => {
    startAssessment(kind);
    track({
      type: kind === 'pre' ? 'pre_assessment_started' : 'post_assessment_started',
      payload: { itemCount: total },
    });
    setPhase('items');
    setCurrentIndex(0);
  }, [kind, startAssessment, track, total]);

  // Next/Submit handler — persists the active item's response, fires
  // the per-item analytics event, then advances. On the last item, it
  // marks the assessment complete and transitions to the closing
  // screen instead of advancing.
  const handleAdvance = useCallback(() => {
    if (!currentItem || !selectedOptionId) return;
    const option = currentItem.options.find((o) => o.id === selectedOptionId);
    if (!option) return;
    recordAssessmentResponse(kind, {
      itemId: currentItem.id,
      selectedOptionId,
      isCorrect: option.isCorrect,
      timestamp: Date.now(),
    });
    track({
      type: 'assessment_item_answered',
      payload: {
        kind,
        itemId: currentItem.id,
        construct: currentItem.constructKey,
        block: currentItem.block,
        selectedOptionId,
        isCorrect: option.isCorrect,
      },
    });
    const isLast = currentIndex >= total - 1;
    if (isLast) {
      completeAssessment(kind);
      track({
        type: kind === 'pre' ? 'pre_assessment_completed' : 'post_assessment_completed',
        payload: { itemCount: total },
      });
      setPhase('closing');
    } else {
      setCurrentIndex((i) => i + 1);
      // Scroll to top of the new item — each item is its own card,
      // and after a long question the next one would otherwise appear
      // mid-scroll on mobile.
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: scrollBehavior() });
      }
    }
  }, [
    currentItem,
    selectedOptionId,
    recordAssessmentResponse,
    kind,
    track,
    currentIndex,
    total,
    completeAssessment,
  ]);

  // (No in-flight back navigation by design.) The assessment is a
  // baseline / outcome measurement. Letting a learner revisit earlier
  // items after seeing later ones would contaminate the construct: they
  // might pick up context or vocabulary from a later scenario and use
  // it to revise a prior answer, which is exactly the signal the
  // pre/post comparison is trying to isolate. So the items phase is
  // strictly forward-only; the only "back" path is closing the tab and
  // re-entering, which resumes at the first un-answered item with no
  // ability to overwrite a recorded response.

  // ── Render ──
  // The page sits inside PlatformShell's <main>, so we apply the same
  // padding/max-width pattern as SectionContainer. `max-w-interactive`
  // (960px) for the items + closing screens so the comparative
  // results have room; `max-w-reading` (680px) inside the intro itself.
  return (
    <article className="section-enter mx-auto w-full px-4 py-12 sm:px-8 lg:px-16">
      {phase === 'intro' && (
        <AssessmentIntro
          kind={kind}
          itemCount={total}
          onBegin={handleBegin}
          alreadyComplete={alreadyComplete}
        />
      )}

      {phase === 'items' && currentItem && (
        <div className="mx-auto max-w-reading">
          <AssessmentProgress
            current={currentIndex + 1}
            total={total}
            kindLabel={kind === 'pre' ? 'Pre-assessment' : 'Post-assessment'}
          />
          <AssessmentItem
            item={currentItem}
            selectedOptionId={selectedOptionId}
            onSelect={setSelectedOptionId}
          />
          {/* Footer nav — Next / Submit on the right. The assessment is
              intentionally forward-only (see handler comment above): a
              Back button would let a learner revise an earlier answer
              after reading later items, which would contaminate the
              baseline / outcome measurement. The disabled-Next gate
              still mirrors SectionContainer's Continue gate so the
              visual language stays consistent. */}
          <nav
            aria-label="Assessment navigation"
            className="mt-6 flex flex-nowrap items-center justify-end gap-4 border-t border-border-light pt-5"
          >
            <button
              type="button"
              onClick={handleAdvance}
              disabled={!selectedOptionId}
              aria-disabled={!selectedOptionId}
              className={[
                'inline-flex items-center gap-2 px-5 py-2.5 font-sans text-[13.5px] font-semibold transition-colors duration-[160ms]',
                selectedOptionId
                  ? 'bg-action text-[rgb(var(--white))] dark:text-[rgb(var(--canvas))] hover:bg-action-hover'
                  : 'cursor-not-allowed bg-ghost text-muted',
              ].join(' ')}
              style={{
                border: selectedOptionId ? '1px solid rgb(var(--action))' : '1px solid rgb(var(--border))',
              }}
            >
              <span>
                {currentIndex >= total - 1
                  ? kind === 'pre'
                    ? 'Submit and finish'
                    : 'Submit and see results'
                  : 'Next'}
              </span>
              <Icon name="arrowRight" size={14} />
            </button>
          </nav>
          {!selectedOptionId && (
            <div
              className="mt-2 text-right font-mono text-[11px] text-muted"
              style={{ letterSpacing: '0.02em' }}
              aria-live="polite"
            >
              Select an option to continue
            </div>
          )}
        </div>
      )}

      {phase === 'closing' && (
        <div className="mx-auto max-w-interactive">
          {/* Pre-assessment's AssessmentCompletion has its own "Begin
              Module 1" CTA. Post-assessment's AssessmentResults
              (standalone variant) has its own "See your competency
              profile" CTA in its footer. The controller doesn't add a
              second exit affordance — that previously caused two
              navigation buttons to appear on the pre-assessment
              thank-you screen ("Begin Module 1" + "Continue"). */}
          {kind === 'pre' ? (
            <AssessmentCompletion itemCount={total} />
          ) : (
            <AssessmentResults variant="standalone" />
          )}
        </div>
      )}
    </article>
  );
}
