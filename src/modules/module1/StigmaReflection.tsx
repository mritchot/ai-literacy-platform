// P2: StigmaReflection — private reflection prompt with the Delegation
// accent (4C spec §4.2). The card mirrors the shared ReflectionPrompt
// pattern but: (1) uses --delegation as the left accent (Delegation
// judgment about disclosure, not Diligence), (2) shows a "Continue"
// primary button rather than a Save ghost button, (3) never blocks
// progression — the textarea is a private thinking space.

import { useEffect, useRef, useState } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { scrollBehavior } from '../../utils/motion';
import { Icon } from '../../components/shared/Icon';
import { Overline } from '../../components/shared/Overline';

const DELEGATION = '#6B7F5E';

interface StigmaReflectionProps {
  // Element to smooth-scroll to when the learner clicks Continue. Defaults
  // to scrolling to the section nav at the bottom of the page.
  scrollTargetId?: string;
}

export function StigmaReflection({ scrollTargetId }: StigmaReflectionProps): JSX.Element {
  const { saveReflection, getReflection } = useLearnerProgress();
  const { track } = useAnalytics();
  const stored = getReflection(1, 5, 'p2_reflection');
  const [draft, setDraft] = useState(stored);
  const [hasViewed, setHasViewed] = useState(false);
  const articleRef = useRef<HTMLElement>(null);

  // Fire viewed event once when the card enters the viewport.
  useEffect(() => {
    if (hasViewed) return;
    const el = articleRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasViewed) {
            setHasViewed(true);
            track({ type: 'p2_reflection_viewed', moduleId: 1, sectionId: 5 });
            obs.disconnect();
          }
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasViewed, track]);

  useEffect(() => setDraft(stored), [stored]);

  const persist = () => {
    if (draft.trim().length === 0 || draft === stored) return;
    saveReflection(1, 5, 'p2_reflection', draft);
  };

  const onContinue = () => {
    persist();
    track({ type: 'p2_reflection_continued', moduleId: 1, sectionId: 5 });
    if (scrollTargetId) {
      const el = document.getElementById(scrollTargetId);
      if (el) {
        el.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
        return;
      }
    }
    // Default fallback — scroll to bottom of viewport.
    window.scrollBy({ top: window.innerHeight * 0.7, behavior: scrollBehavior() });
  };

  return (
    <article
      ref={articleRef}
      aria-label="Private reflection prompt"
      className="rounded-lg"
      style={{
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        borderLeft: `3px solid ${DELEGATION}`,
        padding: '20px 22px',
      }}
    >
      <Overline className="mb-2" style={{ color: 'rgb(var(--delegation-text))' }}>
        Reflection
      </Overline>

      <p className="m-0 mb-3 font-sans text-body italic text-ink">Think about your own experience for a moment.</p>
      <p className="m-0 mb-3 font-sans text-body italic text-body">
        Have you ever used AI for a work task and chosen not to mention it to a colleague or
        manager? If so, what drove that decision? If not, have you noticed others being reluctant
        to discuss their AI use?
      </p>
      <p className="m-0 mb-4 font-sans text-body-sm text-secondary">
        There’s no right answer here, and your response stays with you. It won’t be submitted or
        reviewed.
      </p>

      <label className="sr-only" htmlFor="p2-reflection-textarea">
        Your reflection (private)
      </label>
      <textarea
        id="p2-reflection-textarea"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={persist}
        rows={5}
        aria-label="Private reflection text area"
        placeholder="Your reflection (private, not submitted)"
        className="block w-full resize-y rounded-md border border-border bg-[rgb(var(--white))] p-3 font-sans text-body text-ink placeholder:text-muted focus:border-ink"
        style={{ minHeight: 120, lineHeight: 1.55 }}
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="font-mono text-caption text-muted" style={{ letterSpacing: '0.02em' }}>
          Private, not submitted
        </span>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-md bg-action px-5 py-2.5 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] transition-colors duration-150 hover:bg-action-hover"
        >
          Continue
          <Icon name="arrowRight" size={14} />
        </button>
      </div>
    </article>
  );
}
