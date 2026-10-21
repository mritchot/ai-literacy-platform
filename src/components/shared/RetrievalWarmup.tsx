// RetrievalWarmup — three recall questions at the top of Section 1 in
// Modules 2, 3, and 4. The learner answers from memory, then reveals the
// model answer and the section that taught it. The recap paragraphs
// that follow in Section 1 serve as a second check. Non-gating: the
// section stays autoComplete, and typing is optional. Typed answers
// save as reflections under `${moduleId}.1.warmup_${id}`.

import { useState } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { usePrintMode } from '../../contexts/PrintModeContext';
import { getModule } from '../../data/program';
import { RETRIEVAL_WARMUPS, type WarmupItem, type WarmupModuleId } from '../../data/retrieval-warmups';
import { Overline } from './Overline';

const SECTION_ID = 1;

interface RetrievalWarmupProps {
  moduleId: WarmupModuleId;
}

export function RetrievalWarmup({ moduleId }: RetrievalWarmupProps): JSX.Element {
  const items = RETRIEVAL_WARMUPS[moduleId];
  const headingId = `warmup-m${moduleId}-heading`;
  return (
    <section
      aria-labelledby={headingId}
      className="mb-8 px-4 pb-4 pt-[18px] sm:px-6 sm:pb-5 sm:pt-[22px]"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: '3px solid rgb(var(--info))',
      }}
    >
      <Overline className="mb-1" style={{ color: 'rgb(var(--info))' }}>
        Before you start
      </Overline>
      <h3 id={headingId} className="m-0 mb-1 font-sans text-h3 font-semibold text-ink">
        Recall first
      </h3>
      <p className="m-0 mb-4 font-sans text-body-sm text-secondary">
        Answer from memory before you check. A few words is enough.
      </p>
      <ol className="m-0 list-none space-y-3 p-0">
        {items.map((item, idx) => (
          <WarmupQuestion key={item.id} moduleId={moduleId} item={item} number={idx + 1} />
        ))}
      </ol>
    </section>
  );
}

function WarmupQuestion({
  moduleId,
  item,
  number,
}: {
  moduleId: WarmupModuleId;
  item: WarmupItem;
  number: number;
}): JSX.Element {
  const { getReflection, saveReflection } = useLearnerProgress();
  const { track } = useAnalytics();
  const printMode = usePrintMode();
  const promptId = `warmup_${item.id}`;
  const stored = getReflection(moduleId, SECTION_ID, promptId);
  const [draft, setDraft] = useState(stored);
  const [revealed, setRevealed] = useState(false);
  const [revealTracked, setRevealTracked] = useState(false);

  const fieldId = `warmup-m${moduleId}-${item.id}`;
  const answerId = `${fieldId}-answer`;
  const isOpen = printMode || revealed;
  const taughtModule = getModule(item.taughtIn.moduleId);
  const taughtSection = taughtModule?.sections.find((s) => s.id === item.taughtIn.sectionId);

  const persist = () => {
    // An emptied field is saved too, so a cleared answer stays cleared.
    if (draft === stored || (draft.trim().length === 0 && stored.length === 0)) return;
    saveReflection(moduleId, SECTION_ID, promptId, draft);
  };

  const onToggle = () => {
    persist();
    if (!revealed && !revealTracked) {
      setRevealTracked(true);
      track({
        type: 'warmup_revealed',
        moduleId,
        sectionId: SECTION_ID,
        payload: { itemId: item.id, answeredFirst: draft.trim().length > 0 },
      });
    }
    setRevealed((v) => !v);
  };

  return (
    <li
      className="px-4 py-3"
      style={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border-light))' }}
    >
      <label htmlFor={fieldId} className="mb-2 block font-sans text-body-sm font-semibold text-ink">
        <span className="mr-1.5 font-mono text-[11px] text-tertiary">{number}.</span>
        {item.prompt}
      </label>
      <textarea
        id={fieldId}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={persist}
        rows={2}
        className="block w-full resize-y border border-ghost bg-[rgb(var(--white))] px-3 py-2 font-sans text-body-sm text-ink placeholder:text-muted focus:border-ink"
        style={{ lineHeight: 1.5 }}
        placeholder="Your answer (optional)"
      />
      {!printMode && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={answerId}
          className="mt-2 font-sans text-[12.5px] font-semibold text-action hover:text-action-hover"
        >
          {isOpen ? 'Hide the answer' : 'Check my answer'}
        </button>
      )}
      <div
        id={answerId}
        hidden={!isOpen}
        className="mt-2"
        style={{
          background: 'rgb(var(--white))',
          borderLeft: '3px solid rgb(var(--success))',
          padding: '10px 12px',
        }}
      >
        <Overline className="mb-1" style={{ color: 'rgb(var(--success))' }}>
          Model answer
        </Overline>
        <p className="m-0 font-sans text-body-sm text-body" style={{ lineHeight: 1.55 }}>
          {item.answer}
        </p>
        <p className="m-0 mt-1.5 font-mono text-caption text-tertiary">
          Covered in Module {item.taughtIn.moduleId}, Section {item.taughtIn.sectionId}
          {taughtSection ? `: ${taughtSection.title}` : ''}
        </p>
      </div>
    </li>
  );
}
