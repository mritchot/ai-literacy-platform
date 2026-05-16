// P12 DiligenceStatement — three-phase constructed-response artifact
// (4B spec §10). Four-section scaffold above a unified text area; on
// save, the exemplar comparison appears alongside the learner's
// statement. Revision is unlimited but unscaffolded after the first save.

import { useEffect, useRef, useState } from 'react';
import { ReferenceTabRail } from '../../components/reference/ReferenceTabRail';
import { BottleneckCallout } from '../../components/shared/BottleneckCallout';
import { Overline } from '../../components/shared/Overline';
import { R1Trigger } from '../../components/reference/R1Trigger';
import { R6Trigger } from '../../components/reference/R6Trigger';
import { Citation } from '../../components/shared/Citation';
import { ReflectionPrompt } from '../../components/shared/ReflectionPrompt';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import {
  P12_EFFECTIVENESS,
  P12_EXEMPLAR,
  P12_REFLECTION,
  P12_SCENARIO,
} from './module4-content';
import { renderMarkdownLite } from './render-markdown-lite';

const DILIGENCE = '#7A6B80';
const DILIGENCE_HOVER = '#6D5F73';

const SECTION = 8;
const MIN_CHARS = 50;

// Four-section scaffold colors — the only place in Module 4 where all
// four 4D competency colors appear together (spec §10.3).
const SCAFFOLD: { label: string; color: string; prompt: string }[] = [
  {
    label: 'Delegation',
    color: '#6B7F5E',
    prompt:
      'Which components of the deliverable were AI-generated, AI-assisted, or human-authored?',
  },
  {
    label: 'Description',
    color: '#8B7355',
    prompt:
      'How was the AI task specified? What constraints, format, or quality standards were included in the prompt?',
  },
  {
    label: 'Discernment',
    color: '#5E7080',
    prompt:
      'What verification was performed on the AI-generated content? What was found and corrected?',
  },
  {
    label: 'Diligence',
    color: '#7A6B80',
    prompt:
      'What limitations remain in the final deliverable? What should the reader be aware of?',
  },
];

export function DiligenceStatement(): JSX.Element {
  const { state, saveReflection, markEngaged } = useLearnerProgress();
  const { track } = useAnalytics();

  const stored = state.reflections[`4.${SECTION}.p12_statement`] ?? '';
  const exemplarSeen = Boolean(state.engagedFlags[`4.${SECTION}.exemplar_viewed`]);

  const [text, setText] = useState(stored);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const exemplarRef = useRef<HTMLDivElement>(null);

  const phase: 'write' | 'compare' = exemplarSeen ? 'compare' : 'write';
  const canSave = text.trim().length >= MIN_CHARS;

  useEffect(() => {
    track({ type: 'p12_scenario_viewed', moduleId: 4, sectionId: SECTION });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (v: string) => {
    if (!hasStarted && v.length > 0 && stored.length === 0) {
      setHasStarted(true);
      track({ type: 'p12_writing_started', moduleId: 4, sectionId: SECTION });
    }
    setText(v);
  };

  const onSave = () => {
    if (!canSave) return;
    saveReflection(4, SECTION, 'p12_statement', text);
    if (!exemplarSeen) {
      markEngaged(4, SECTION, 'exemplar_viewed');
      track({
        type: 'p12_statement_saved',
        moduleId: 4,
        sectionId: SECTION,
        payload: { chars: text.length },
      });
      setTimeout(() => {
        exemplarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        track({ type: 'p12_exemplar_viewed', moduleId: 4, sectionId: SECTION });
      }, 200);
    } else {
      track({
        type: 'p12_statement_updated',
        moduleId: 4,
        sectionId: SECTION,
        payload: { chars: text.length },
      });
    }
    setSavedAt(Date.now());
  };

  const showSavedBadge = savedAt !== null && Date.now() - savedAt < 2500;
  const buttonLabel = phase === 'write' ? 'Save Statement and See Exemplar' : 'Update Statement';

  return (
    <section aria-label="Diligence statement builder" className="space-y-8">
      {/* R1 + R6 support the diligence-writing moment:
            • R1 — the 4D vocabulary map (naming what each section discusses)
            • R6 — individual diligence statement template
          R7 (team policy starter) lives at S9 (Program Closing) — it's
          the handoff tool the learner takes back to their team after
          finishing the program, not a P12-time job aid. */}
      <ReferenceTabRail>
        <R1Trigger variant="tab" label="4D Reference" />
        <R6Trigger variant="tab" label="Diligence Template" />
      </ReferenceTabRail>

      {/* P12 framing — inlined as JSX rather than a plain string export
          so it can host the inline `<Citation>` for the stigma stat.
          See module4-content.ts for the rationale comment. */}
      <article className="font-sans text-body text-body">
        <p className="m-0" style={{ marginBottom: '0.85em' }}>
          Module 1 opened with a number: 69% of professionals report that social stigma is an
          active barrier
          <Citation ids="anthropic-interviewer-2025" pageKey="stigma-69" /> to disclosing AI use
          at work. Not because they reject the tool, but because they fear how colleagues and
          managers will perceive them for using it. The result is the concealment dynamic:
          individuals getting faster while the institution stays blind.
        </p>
        <p className="m-0" style={{ marginBottom: '0.85em' }}>
          You've now spent four modules building a vocabulary that makes concealment unnecessary.
          Delegation gives you language for which tasks you assigned to AI and why. Description
          gives you language for how you specified the task. Discernment gives you language for
          how you evaluated the output. What remains is the competency that converts private
          practice into visible, accountable professional behavior: Diligence.
        </p>
        <p className="m-0" style={{ marginBottom: '0.85em' }}>
          A diligence statement is a structured document (appended to a deliverable or included
          in a project record) that makes your AI practices legible. It can be as brief as a
          single paragraph for a low-stakes internal draft or as detailed as a full-page
          disclosure for a client-facing report or published analysis. Length scales with the
          stakes and complexity of the deliverable, not with a fixed word count. It does not ask
          for permission. It does not apologize for using AI. It states what happened: which
          components of the deliverable were AI-generated, which were AI-assisted, which were
          human-authored, what verification was performed, and what limitations remain. It uses
          the 4D vocabulary you've learned because that vocabulary is precise enough to be useful
          and professional enough to be taken seriously.
        </p>
        <p className="m-0">
          This is the program's second behavioral output artifact. The first was the action
          commitment in Module 2, where you identified two tasks to change your approach to. That
          artifact addressed what you plan to do differently. This one addresses how you document
          what you've done.
        </p>
      </article>

      <BottleneckCallout title="Your situation">
        <p className="m-0 whitespace-pre-line">{P12_SCENARIO}</p>
      </BottleneckCallout>

      <article
        className="rounded-xl"
        style={{
          background: 'rgb(var(--white))',
          border: '1.5px solid rgb(var(--border))',
          borderTop: `3px solid ${DILIGENCE}`,
          padding: '24px 26px',
        }}
      >
        <Overline className="mb-1">Diligence statement</Overline>
        <h3 className="m-0 mb-4 font-sans text-h3 font-semibold text-ink">
          Document your AI practices
        </h3>

        <fieldset className="m-0 mb-4 border-0 p-0">
          <legend className="sr-only">Diligence Statement Sections</legend>
          <ul
            className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2"
            style={{ gridAutoRows: '1fr' }}
          >
            {SCAFFOLD.map((s) => (
              <li
                key={s.label}
                className="rounded-md"
                style={{
                  background: 'rgb(var(--surface))',
                  border: '1px solid rgb(var(--border))',
                  borderLeft: `3px solid ${s.color}`,
                  padding: '12px 14px',
                }}
              >
                <div
                  className="mb-1 font-mono text-overline font-bold uppercase"
                  // Label text uses the competency *text* CSS variable
                  // (which has a dark-mode override) rather than the raw
                  // DEFAULT hex in `s.color` — so it lightens correctly
                  // in dark mode. The `borderLeft` accent below still
                  // uses the raw hex, which is fine for accents.
                  style={{
                    color: `rgb(var(--${s.label.toLowerCase()}-text))`,
                    letterSpacing: '0.1em',
                  }}
                  id={`p12-section-${s.label.toLowerCase()}`}
                >
                  {s.label}
                </div>
                <p className="m-0 font-sans text-body-sm text-secondary">{s.prompt}</p>
              </li>
            ))}
          </ul>
        </fieldset>

        <label className="sr-only" htmlFor="p12-statement">
          Your diligence statement
        </label>
        <textarea
          id="p12-statement"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby="p12-section-delegation p12-section-description p12-section-discernment p12-section-diligence"
          rows={8}
          placeholder="Write your diligence statement here. Use the four sections above as a guide, but write in your own voice — this should read as a professional document you'd actually append to a deliverable."
          className="block w-full resize-y rounded-md border border-border bg-[rgb(var(--white))] p-3 font-sans text-body text-ink placeholder:text-muted focus:border-ink"
          style={{ minHeight: 200, lineHeight: 1.55 }}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            aria-disabled={!canSave}
            className="rounded-md font-sans text-[13px] font-semibold text-[rgb(var(--white))] transition-colors duration-150 disabled:cursor-not-allowed"
            style={{
              padding: '10px 22px',
              background: showSavedBadge
                ? 'transparent'
                : !canSave
                  ? 'rgb(var(--ghost))'
                  : DILIGENCE,
              color: showSavedBadge
                ? 'rgb(var(--success))'
                : !canSave
                  ? 'rgb(var(--muted))'
                  : '#FFFFFF',
              border: showSavedBadge ? '1.5px solid rgb(var(--success))' : 'none',
            }}
            onMouseEnter={(e) => {
              if (canSave && !showSavedBadge) {
                (e.currentTarget as HTMLButtonElement).style.background = DILIGENCE_HOVER;
              }
            }}
            onMouseLeave={(e) => {
              if (canSave && !showSavedBadge) {
                (e.currentTarget as HTMLButtonElement).style.background = DILIGENCE;
              }
            }}
          >
            {showSavedBadge ? (phase === 'compare' ? 'Updated ✓' : 'Saved ✓') : buttonLabel}
          </button>
          <span
            className="font-mono text-caption text-tertiary"
            style={{ letterSpacing: '0.02em', maxWidth: 360, textAlign: 'right' }}
          >
            This statement is saved to your progress record. It will be referenced in the program’s
            closing assessment and connects to the 30/60/90-day behavioral evaluation.
          </span>
        </div>
      </article>

      {phase === 'compare' && (
        <div ref={exemplarRef} className="space-y-6">
          <ExemplarComparison statement={text || stored} />
          <EffectivenessCallout />
          <ReflectionPrompt
            moduleId={4}
            sectionId={SECTION}
            promptId="p12_reflection"
            accentColor={DILIGENCE}
            engagedEvent="p12_reflection_engaged"
            savedEvent="p12_reflection_saved"
            promptText={P12_REFLECTION}
          />
        </div>
      )}
    </section>
  );
}

function ExemplarComparison({ statement }: { statement: string }): JSX.Element {
  return (
    <div
      className="grid gap-4 lg:grid-cols-2"
      style={{ gridAutoRows: '1fr' }}
    >
      <article
        role="region"
        aria-label="Your diligence statement"
        className="flex h-full flex-col rounded-lg"
        style={{
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border))',
          borderLeft: `3px solid ${DILIGENCE}`,
          padding: '16px 18px',
        }}
      >
        <h4 className="m-0 mb-3 font-sans text-h4 font-semibold text-ink">Your statement</h4>
        <div className="whitespace-pre-wrap font-sans text-body-sm leading-relaxed text-body">
          {statement || <em className="text-muted">No statement saved.</em>}
        </div>
      </article>
      <article
        role="region"
        aria-label="Exemplar diligence statement"
        className="flex h-full flex-col rounded-lg"
        style={{
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border))',
          borderLeft: `3px solid ${DILIGENCE}`,
          padding: '16px 18px',
        }}
      >
        <h4 className="m-0 mb-3 font-sans text-h4 font-semibold text-ink">Exemplar statement</h4>
        <div className="font-sans text-body-sm leading-relaxed text-body">
          {renderMarkdownLite(P12_EXEMPLAR)}
        </div>
      </article>
    </div>
  );
}

function EffectivenessCallout(): JSX.Element {
  const body = P12_EFFECTIVENESS.replace(/^What makes the exemplar effective:\n\n/, '');
  return (
    <aside
      role="note"
      className="rounded-lg"
      style={{
        background: 'rgb(var(--surface-warm))',
        border: '1px solid rgb(var(--border))',
        borderLeft: `3px solid ${DILIGENCE}`,
        padding: '18px 22px',
      }}
    >
      <h4 className="m-0 mb-3 font-sans text-h4 font-semibold text-ink">
        What makes the exemplar effective
      </h4>
      <div className="font-sans text-body-sm leading-relaxed text-body whitespace-pre-line">
        {body}
      </div>
    </aside>
  );
}
