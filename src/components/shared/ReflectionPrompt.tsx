// ReflectionPrompt — Diligence-accented private reflection block (design
// system §5.8). Auto-saves to LearnerProgressContext on blur with ≥20
// characters, plus an explicit Save button.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import type { CompetencyKey } from '../../data/program';
import { Overline } from './Overline';

interface ReflectionPromptProps {
  moduleId: number;
  sectionId: number;
  promptId: string;
  promptText: string;
  engagedEvent?: string;
  savedEvent?: string;
  // Anchor competency for the accent. Defaults to Diligence; overridden
  // when the prompt's pedagogical function is anchored to a different
  // competency — e.g., P7's reasoning prompt uses Delegation because the
  // question is about delegation judgment, not reflection diligence.
  accent?: CompetencyKey;
}

const MIN_CHARS = 20;
const BADGE_MS = 4000;

// Border keeps the static brand hex (a decorative stroke that reads on
// both themes); the label text uses the theme-adaptive `--*-text` token —
// the static hex lands at ~3:1 on the dark card surface, below AA.
const ACCENT_HEX: Record<CompetencyKey, string> = {
  delegation: '#6B7F5E',
  description: '#8B7355',
  discernment: '#5E7080',
  diligence: '#7A6B80',
};

export function ReflectionPrompt({
  moduleId,
  sectionId,
  promptId,
  promptText,
  engagedEvent,
  savedEvent,
  accent = 'diligence',
}: ReflectionPromptProps): JSX.Element {
  const { saveReflection, getReflection } = useLearnerProgress();
  const { track } = useAnalytics();
  const stored = getReflection(moduleId, sectionId, promptId);
  const [draft, setDraft] = useState(stored);
  const [hasEngaged, setHasEngaged] = useState(false);

  // "Saved ✓" badge: shown by the save handler, cleared by its own
  // timer. (The previous `Date.now() - savedAt < 4000` render check had
  // no timer behind it, so the badge stuck until an unrelated re-render.)
  const [showSavedBadge, setShowSavedBadge] = useState(false);
  const badgeTimerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (badgeTimerRef.current !== null) window.clearTimeout(badgeTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    setDraft(stored);
  }, [stored]);

  const persist = useCallback(() => {
    if (draft.trim().length < MIN_CHARS) return;
    if (draft === stored) return;
    saveReflection(moduleId, sectionId, promptId, draft);
    setShowSavedBadge(true);
    if (badgeTimerRef.current !== null) window.clearTimeout(badgeTimerRef.current);
    badgeTimerRef.current = window.setTimeout(() => setShowSavedBadge(false), BADGE_MS);
    if (savedEvent) {
      track({ type: savedEvent, moduleId, sectionId, payload: { chars: draft.length } });
    }
  }, [draft, stored, saveReflection, moduleId, sectionId, promptId, savedEvent, track]);

  const onFocus = () => {
    if (hasEngaged) return;
    setHasEngaged(true);
    if (engagedEvent) {
      track({ type: engagedEvent, moduleId, sectionId });
    }
  };

  return (
    <section
      className="mt-8 rounded-lg bg-[rgb(var(--white))]"
      style={{
        borderLeft: `3px solid ${ACCENT_HEX[accent]}`,
        border: '1px solid rgb(var(--border))',
        borderLeftWidth: 3,
        borderLeftColor: ACCENT_HEX[accent],
        padding: '20px 22px',
      }}
    >
      <Overline className="mb-2" style={{ color: `rgb(var(--${accent}-text))` }}>
        Reflection
      </Overline>
      <p className="m-0 mb-4 font-sans text-body italic text-ink">{promptText}</p>
      <label className="sr-only" htmlFor={`reflection-${promptId}`}>
        Your reflection
      </label>
      <textarea
        id={`reflection-${promptId}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={onFocus}
        onBlur={persist}
        rows={5}
        aria-label={`Reflection text area for prompt ${promptId}`}
        className="block w-full resize-y rounded-md border border-border bg-[rgb(var(--white))] p-3 font-sans text-body text-ink placeholder:text-muted focus:border-ink"
        style={{ minHeight: 120, lineHeight: 1.55 }}
        placeholder="Type your response here. Saved privately to your progress."
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={persist}
          disabled={draft.trim().length < MIN_CHARS || draft === stored}
          aria-disabled={draft.trim().length < MIN_CHARS || draft === stored}
          className="rounded-md font-sans text-[12.5px] font-semibold text-tertiary disabled:cursor-not-allowed disabled:opacity-50 hover:text-ink"
          style={{ padding: '6px 12px' }}
        >
          {showSavedBadge ? 'Saved ✓' : 'Save'}
        </button>
        <span className="font-mono text-caption text-muted">Private — not graded</span>
      </div>
    </section>
  );
}
