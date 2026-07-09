// P4 Action Commitment — structured constructed response producing a
// revisitable behavioral artifact (4A spec §5.5). Two text areas, each
// requiring ≥20 characters before "Save Commitment" enables. Persists via
// LearnerProgressContext as reflections under section 5 with promptIds
// "p4_task1" / "p4_task2".

import { useEffect, useRef, useState } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { Overline } from '../../components/shared/Overline';

const MIN_CHARS = 20;

const TASK1_PROMPT = 'One task you currently perform without AI that falls into a high-productivity-gain category.';
const TASK1_SUB = 'What is the task? Why haven\'t you used AI for it? Based on the data, what type of savings might be available?';
const TASK2_PROMPT = 'One task you currently delegate to AI that may warrant greater human oversight.';
const TASK2_SUB = 'What is the task? What does your current verification process look like? Based on the data, what\'s the risk if the output goes unverified?';

export function ActionCommitment(): JSX.Element {
  const { saveReflection, getReflection, markEngaged } = useLearnerProgress();
  const { track } = useAnalytics();

  const stored1 = getReflection(2, 5, 'p4_task1');
  const stored2 = getReflection(2, 5, 'p4_task2');

  const [task1, setTask1] = useState(stored1);
  const [task2, setTask2] = useState(stored2);
  const [engaged1, setEngaged1] = useState(false);
  const [engaged2, setEngaged2] = useState(false);

  // "Saved ✓" badge: set by the save handler, cleared by its own timer.
  // (The previous `Date.now() - savedAt < 3000` render check had no timer
  // behind it, so the badge stuck until an unrelated re-render.)
  const [showSavedBadge, setShowSavedBadge] = useState(false);
  const badgeTimerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (badgeTimerRef.current !== null) window.clearTimeout(badgeTimerRef.current);
    },
    [],
  );

  useEffect(() => setTask1(stored1), [stored1]);
  useEffect(() => setTask2(stored2), [stored2]);

  const hasSaved = stored1.length >= MIN_CHARS && stored2.length >= MIN_CHARS;
  const canSave = task1.trim().length >= MIN_CHARS && task2.trim().length >= MIN_CHARS;

  const onSave = () => {
    if (!canSave) return;
    saveReflection(2, 5, 'p4_task1', task1);
    saveReflection(2, 5, 'p4_task2', task2);
    track({
      type: 'p4_commitment_saved',
      moduleId: 2,
      sectionId: 5,
      payload: { task1Chars: task1.length, task2Chars: task2.length },
    });
    setShowSavedBadge(true);
    if (badgeTimerRef.current !== null) window.clearTimeout(badgeTimerRef.current);
    badgeTimerRef.current = window.setTimeout(() => setShowSavedBadge(false), 3000);
  };

  const onFocus1 = () => {
    if (engaged1) return;
    setEngaged1(true);
    markEngaged(2, 5, 'p4_task1_engaged');
    track({ type: 'p4_commitment_task1_engaged', moduleId: 2, sectionId: 5 });
  };

  const onFocus2 = () => {
    if (engaged2) return;
    setEngaged2(true);
    markEngaged(2, 5, 'p4_task2_engaged');
    track({ type: 'p4_commitment_task2_engaged', moduleId: 2, sectionId: 5 });
  };

  return (
    <section
      aria-label="Action commitment: two tasks to reconsider"
      className="rounded-xl bg-[rgb(var(--white))]"
      style={{
        border: '1.5px solid rgb(var(--border))',
        borderTop: '3px solid rgb(var(--action))',
        padding: '24px 24px 22px',
      }}
    >
      <Overline className="mb-2">Action commitment</Overline>
      <h3 className="m-0 mb-3 font-sans text-h3 font-semibold text-ink">Two tasks to reconsider</h3>

      <p className="m-0 mb-5 max-w-reading font-sans text-body text-body">
        Based on what you've explored in this module (the collaboration patterns, the self-report
        gap, and the productivity data), identify two tasks from your own work:
      </p>

      <CommitmentField
        idx={1}
        label="Task 1"
        prompt={TASK1_PROMPT}
        subprompt={TASK1_SUB}
        value={task1}
        onChange={setTask1}
        onFocus={onFocus1}
      />

      <div className="h-5" />

      <CommitmentField
        idx={2}
        label="Task 2"
        prompt={TASK2_PROMPT}
        subprompt={TASK2_SUB}
        value={task2}
        onChange={setTask2}
        onFocus={onFocus2}
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border-light pt-4">
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          aria-disabled={!canSave}
          className="rounded-md font-sans text-[13px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed"
          style={{
            padding: '10px 22px',
            background: showSavedBadge ? 'transparent' : !canSave ? 'rgb(var(--ghost))' : 'rgb(var(--action))',
            color: showSavedBadge ? 'rgb(var(--success))' : !canSave ? 'rgb(var(--muted))' : 'rgb(var(--white))',
            border: showSavedBadge ? '1.5px solid rgb(var(--success))' : 'none',
          }}
        >
          {showSavedBadge ? 'Saved ✓' : hasSaved ? 'Update commitment' : 'Save commitment'}
        </button>
        <div className="font-mono text-caption text-tertiary" style={{ maxWidth: 360, textAlign: 'right' }}>
          This commitment is saved to your progress record. You'll revisit it at the end of the
          program.
        </div>
      </div>
    </section>
  );
}

function CommitmentField({
  idx,
  label,
  prompt,
  subprompt,
  value,
  onChange,
  onFocus,
}: {
  idx: number;
  label: string;
  prompt: string;
  subprompt: string;
  value: string;
  onChange: (v: string) => void;
  onFocus: () => void;
}): JSX.Element {
  const fieldId = `commitment-task-${idx}`;
  return (
    <div
      className="rounded-lg"
      style={{
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        padding: '16px 18px',
      }}
    >
      <div className="mb-1 font-sans text-[12px] font-semibold uppercase text-tertiary" style={{ letterSpacing: '0.06em' }}>
        {label}
      </div>
      <p className="m-0 mb-1.5 font-sans text-body font-semibold text-ink">{prompt}</p>
      <p className="m-0 mb-3 font-sans text-body-sm text-secondary">{subprompt}</p>
      <label className="sr-only" htmlFor={fieldId}>{`${label}: ${prompt}`}</label>
      <textarea
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        rows={4}
        aria-label={`${label} response`}
        className="block w-full resize-y rounded-md border border-border bg-[rgb(var(--white))] p-3 font-sans text-body text-ink placeholder:text-muted focus:border-ink"
        style={{ minHeight: 100, lineHeight: 1.55 }}
        placeholder="Type your response here…"
      />
    </div>
  );
}
