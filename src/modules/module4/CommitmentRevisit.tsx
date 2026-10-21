// Program-closing revisit of the Module 2 action commitment (P4). The
// learner sees what they wrote before Modules 3 and 4, rewrites each
// plan as an if-then plan with the vocabulary those modules added, and
// names one person they will tell. Optional: Section 9 stays
// autoComplete, so skipping this never blocks the competency profile.
// Saved as reflections under section 4.9 (see data/action-commitment.ts);
// the profile, PDF, and refresher show the revised plan when it exists.

import { useEffect, useRef, useState } from 'react';
import { Overline } from '../../components/shared/Overline';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { COMMITMENT_LOCATION, COMMITMENT_PROMPT_IDS } from '../../data/action-commitment';

const MIN_CHARS = 20;
const TELL_MAX_CHARS = 80;
const { original: ORIGINAL, revised: REVISED } = COMMITMENT_LOCATION;

const TASK1_GUIDANCE =
  'Rewrite it as “The next time I [situation], I will [first step with AI].” Name the Description dimension you will specify first (product, process, or performance). Say how you will tell whether the result is better, not only faster.';
const TASK2_GUIDANCE =
  'Rewrite it as “Before I send [output], I will check [element] against [source].” Name the property pair behind the failure you expect. Say whether that element is one to verify or one to flag.';

export function CommitmentRevisit(): JSX.Element {
  const { getReflection, saveReflection, markEngaged } = useLearnerProgress();
  const { track } = useAnalytics();

  const original1 = getReflection(ORIGINAL.moduleId, ORIGINAL.sectionId, COMMITMENT_PROMPT_IDS.task1);
  const original2 = getReflection(ORIGINAL.moduleId, ORIGINAL.sectionId, COMMITMENT_PROMPT_IDS.task2);
  const stored1 = getReflection(REVISED.moduleId, REVISED.sectionId, COMMITMENT_PROMPT_IDS.revisedTask1);
  const stored2 = getReflection(REVISED.moduleId, REVISED.sectionId, COMMITMENT_PROMPT_IDS.revisedTask2);
  const storedTell = getReflection(REVISED.moduleId, REVISED.sectionId, COMMITMENT_PROMPT_IDS.tellWho);

  const [revised1, setRevised1] = useState(stored1);
  const [revised2, setRevised2] = useState(stored2);
  const [tellWho, setTellWho] = useState(storedTell);
  const engagedRef = useRef(false);

  const [showSavedBadge, setShowSavedBadge] = useState(false);
  const badgeTimerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (badgeTimerRef.current !== null) window.clearTimeout(badgeTimerRef.current);
    },
    [],
  );

  const hasSaved = stored1.length >= MIN_CHARS && stored2.length >= MIN_CHARS;
  const isDirty = revised1 !== stored1 || revised2 !== stored2 || tellWho.trim() !== storedTell;
  const canSave =
    revised1.trim().length >= MIN_CHARS && revised2.trim().length >= MIN_CHARS && isDirty;

  const onFocus = () => {
    if (engagedRef.current) return;
    engagedRef.current = true;
    markEngaged(REVISED.moduleId, REVISED.sectionId, 'p4_revisit_engaged');
    track({ type: 'p4_commitment_revisit_engaged', moduleId: 4, sectionId: 9 });
  };

  const onSave = () => {
    if (!canSave) return;
    saveReflection(REVISED.moduleId, REVISED.sectionId, COMMITMENT_PROMPT_IDS.revisedTask1, revised1);
    saveReflection(REVISED.moduleId, REVISED.sectionId, COMMITMENT_PROMPT_IDS.revisedTask2, revised2);
    saveReflection(REVISED.moduleId, REVISED.sectionId, COMMITMENT_PROMPT_IDS.tellWho, tellWho.trim());
    // The name stays on the device; the event records only whether one was given.
    track({
      type: 'p4_commitment_revised_saved',
      moduleId: 4,
      sectionId: 9,
      payload: {
        task1Chars: revised1.length,
        task2Chars: revised2.length,
        namedSomeone: tellWho.trim().length > 0,
      },
    });
    setShowSavedBadge(true);
    if (badgeTimerRef.current !== null) window.clearTimeout(badgeTimerRef.current);
    badgeTimerRef.current = window.setTimeout(() => setShowSavedBadge(false), 3000);
  };

  return (
    <section
      aria-labelledby="commitment-revisit-heading"
      className="bg-[rgb(var(--white))] px-4 pb-4 pt-[18px] sm:px-6 sm:pb-[22px] sm:pt-6"
      style={{
        border: '1px solid rgb(var(--border))',
        borderTop: '3px solid rgb(var(--action))',
      }}
    >
      <Overline className="mb-2">Action commitment · revisit</Overline>
      <h3 id="commitment-revisit-heading" className="m-0 mb-3 font-sans text-h3 font-semibold text-ink">
        Sharpen the plan you wrote in Module 2
      </h3>
      <p className="m-0 mb-5 max-w-reading font-sans text-body text-body">
        Since Module 2 you have learned the property pairs, sorted claims into triage levels
        (include, verify, flag), and written a prompt across the three Description dimensions.
        Rewrite each plan with them. Make it specific enough that you will know the moment to act.
      </p>

      <RevisitField
        idx={1}
        label="Task 1 · a task to try with AI"
        original={original1}
        guidance={TASK1_GUIDANCE}
        value={revised1}
        onChange={setRevised1}
        onFocus={onFocus}
      />

      <div className="h-5" />

      <RevisitField
        idx={2}
        label="Task 2 · a task that needs more oversight"
        original={original2}
        guidance={TASK2_GUIDANCE}
        value={revised2}
        onChange={setRevised2}
        onFocus={onFocus}
      />

      <div className="h-5" />

      <div
        className="px-4 py-4 sm:px-[18px]"
        style={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))' }}
      >
        <label
          htmlFor="commitment-revisit-tell"
          className="mb-1 block font-sans text-[12px] font-semibold uppercase text-tertiary"
          style={{ letterSpacing: '0.06em' }}
        >
          Who will you tell?
        </label>
        <p className="m-0 mb-3 font-sans text-body-sm text-secondary">
          Name one colleague or your manager you will tell about this plan. A role is enough.
          Telling someone makes your AI practice visible to the people you work with, the opposite
          of the hidden use Module 1 described.
        </p>
        <input
          id="commitment-revisit-tell"
          type="text"
          value={tellWho}
          maxLength={TELL_MAX_CHARS}
          onChange={(e) => setTellWho(e.target.value)}
          onFocus={onFocus}
          className="block w-full border border-ghost bg-[rgb(var(--white))] px-3 py-2 font-sans text-body text-ink placeholder:text-muted focus:border-ink"
          placeholder="For example: my manager, or a colleague on my team"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border-light pt-4">
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          aria-disabled={!canSave}
          className="font-sans text-[13px] font-semibold transition-colors duration-[160ms] disabled:cursor-not-allowed"
          style={{
            padding: '10px 22px',
            background: showSavedBadge ? 'transparent' : !canSave ? 'rgb(var(--ghost))' : 'rgb(var(--action))',
            color: showSavedBadge ? 'rgb(var(--success))' : !canSave ? 'rgb(var(--muted))' : 'rgb(var(--white))',
            border: showSavedBadge ? '1px solid rgb(var(--success))' : 'none',
          }}
        >
          {showSavedBadge ? 'Saved ✓' : hasSaved ? 'Update revised plan' : 'Save revised plan'}
        </button>
        <div className="font-mono text-caption text-tertiary" style={{ maxWidth: 360, textAlign: 'right' }}>
          Optional. Your competency profile shows the revised plan in place of the original.
        </div>
      </div>
    </section>
  );
}

function RevisitField({
  idx,
  label,
  original,
  guidance,
  value,
  onChange,
  onFocus,
}: {
  idx: number;
  label: string;
  original: string;
  guidance: string;
  value: string;
  onChange: (v: string) => void;
  onFocus: () => void;
}): JSX.Element {
  const fieldId = `commitment-revisit-task-${idx}`;
  const hasOriginal = original.trim().length > 0;
  return (
    <div
      className="px-4 py-4 sm:px-[18px]"
      style={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))' }}
    >
      <div className="mb-2 font-sans text-[12px] font-semibold uppercase text-tertiary" style={{ letterSpacing: '0.06em' }}>
        {label}
      </div>
      {hasOriginal ? (
        <figure className="m-0 mb-3">
          <figcaption className="mb-1 font-mono text-overline font-bold uppercase text-tertiary" style={{ letterSpacing: '0.1em' }}>
            What you wrote in Module 2
          </figcaption>
          <blockquote
            className="m-0 font-sans text-body-sm italic text-body"
            style={{
              background: 'rgb(var(--white))',
              border: '1px solid rgb(var(--border-light))',
              padding: '10px 12px',
              lineHeight: 1.55,
              overflowWrap: 'anywhere',
              whiteSpace: 'pre-wrap',
            }}
          >
            {original}
          </blockquote>
        </figure>
      ) : (
        <p className="m-0 mb-3 font-sans text-body-sm italic text-muted">
          You did not save this task in Module 2. Write the plan here.
        </p>
      )}
      <p className="m-0 mb-3 font-sans text-body-sm text-secondary">{guidance}</p>
      <label className="sr-only" htmlFor={fieldId}>{`${label}: revised plan`}</label>
      <textarea
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        rows={3}
        className="block w-full resize-y border border-ghost bg-[rgb(var(--white))] p-3 font-sans text-body text-ink placeholder:text-muted focus:border-ink"
        style={{ minHeight: 88, lineHeight: 1.55 }}
        placeholder="Type your revised plan here…"
      />
    </div>
  );
}
