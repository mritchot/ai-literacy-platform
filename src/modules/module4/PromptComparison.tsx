// P9 PromptComparison — three-phase prompt reformulation with side-by-side
// output comparison (4B spec §5).

import { useState, type KeyboardEvent } from 'react';
import { BottleneckCallout } from '../../components/shared/BottleneckCallout';
import { Icon } from '../../components/shared/Icon';
import { Overline } from '../../components/shared/Overline';
import { R3Trigger } from '../../components/reference/R3Trigger';
import { ReferenceTabRail } from '../../components/reference/ReferenceTabRail';
import { ReflectionPrompt } from '../../components/shared/ReflectionPrompt';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import {
  P9_ANNOTATIONS,
  P9_IMPROVED_OUTPUT,
  P9_REFLECTION,
  P9_REFORMULATED_PROMPT,
  P9_SCENARIO,
  P9_WEAK_OUTPUT,
  P9_WEAK_PROMPT,
} from './module4-content';
import { renderMarkdownLite } from './render-markdown-lite';

// Static hex for the 3px left-border accent (the saturated "amber" hue)
// — the bg color is fine on both light and dark surfaces because it's
// applied as a thin stroke, not a fill. The tinted *background* and the
// *label text color* must adapt per theme: we route those through the
// CSS variables `--description-light` (bg wash) and `--description-text`
// (label color), which are defined in `src/styles/index.css` for both
// `:root` and `.dark`.
const DESCRIPTION = '#8B7355';

type Phase = 'read' | 'reformulate' | 'compare';
type CompareTab = 'before' | 'after';

const MIN_CHARS = 10;

export function PromptComparison(): JSX.Element {
  const { state, saveReflection, markEngaged } = useLearnerProgress();
  const { track } = useAnalytics();

  const stored = {
    product: state.reflections['4.3.p9_product'] ?? '',
    process: state.reflections['4.3.p9_process'] ?? '',
    performance: state.reflections['4.3.p9_performance'] ?? '',
  };

  const initialPhase: Phase = state.engagedFlags['4.3.phase_compare'] ? 'compare' : 'read';
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [product, setProduct] = useState(stored.product);
  const [processField, setProcessField] = useState(stored.process);
  const [performance, setPerformance] = useState(stored.performance);
  const [compareTab, setCompareTab] = useState<CompareTab>('before');
  const [hasStartedTyping, setHasStartedTyping] = useState(false);

  const allFieldsMet =
    product.trim().length >= MIN_CHARS &&
    processField.trim().length >= MIN_CHARS &&
    performance.trim().length >= MIN_CHARS;

  const onTyping = () => {
    if (hasStartedTyping) return;
    setHasStartedTyping(true);
    track({ type: 'p9_reformulation_started', moduleId: 4, sectionId: 3 });
  };

  const onContinueToReformulate = () => {
    setPhase('reformulate');
  };

  const onSubmitReformulation = () => {
    if (!allFieldsMet) return;
    saveReflection(4, 3, 'p9_product', product);
    saveReflection(4, 3, 'p9_process', processField);
    saveReflection(4, 3, 'p9_performance', performance);
    markEngaged(4, 3, 'phase_compare');
    track({
      type: 'p9_reformulation_submitted',
      moduleId: 4,
      sectionId: 3,
      payload: {
        productChars: product.length,
        processChars: processField.length,
        performanceChars: performance.length,
      },
    });
    setPhase('compare');
    track({ type: 'p9_comparison_viewed', moduleId: 4, sectionId: 3 });
  };

  return (
    <div className="space-y-3">
      {/* R3 supports D5 + D6 (Description sub-components). The three
          input fields below mirror R3's three sections exactly. */}
      <ReferenceTabRail>
        <R3Trigger variant="tab" label="Prompt Template" />
      </ReferenceTabRail>

      <section
        aria-label="Prompt reformulation comparison"
        className="rounded-xl"
        style={{
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border))',
          padding: '24px 26px',
        }}
      >
      <Overline className="mb-2">Practice activity — P9</Overline>
      <h3
        className="m-0 mb-3 font-display text-title font-normal text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        Prompt reformulation
      </h3>

      {phase === 'read' && (
        <PhaseRead onContinue={onContinueToReformulate} />
      )}

      {phase === 'reformulate' && (
        <PhaseReformulate
          product={product}
          processField={processField}
          performance={performance}
          onProductChange={(v) => {
            setProduct(v);
            onTyping();
          }}
          onProcessChange={(v) => {
            setProcessField(v);
            onTyping();
          }}
          onPerformanceChange={(v) => {
            setPerformance(v);
            onTyping();
          }}
          allFieldsMet={allFieldsMet}
          onSubmit={onSubmitReformulation}
        />
      )}

      {phase === 'compare' && (
        <PhaseCompare
          compareTab={compareTab}
          onTabChange={setCompareTab}
          reformulation={{ product, process: processField, performance }}
        />
      )}
      </section>
    </div>
  );
}

// ─── Phase 1: Read the weak prompt + output ───────────────────────

function PhaseRead({ onContinue }: { onContinue: () => void }): JSX.Element {
  return (
    <div className="space-y-5">
      <BottleneckCallout title="Scenario">
        <p className="m-0 mb-2 whitespace-pre-line">{P9_SCENARIO}</p>
        <p className="m-0 font-sans italic text-ink">{P9_WEAK_PROMPT}</p>
      </BottleneckCallout>

      <article
        className="rounded-lg"
        style={{
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border))',
          padding: '18px 20px',
        }}
      >
        <h4 className="m-0 mb-3 font-sans text-h4 font-semibold text-ink">AI Output</h4>
        <div className="font-sans text-body-sm leading-relaxed text-body">
          {renderMarkdownLite(P9_WEAK_OUTPUT)}
        </div>
      </article>

      <div className="space-y-2.5">
        {P9_ANNOTATIONS.map((ann, i) => (
          <article
            key={i}
            className="rounded-md transition-opacity duration-300"
            style={{
              background: 'rgb(var(--description-light))',
              borderLeft: `3px solid ${DESCRIPTION}`,
              padding: '12px 16px',
              animation: `fadeIn 200ms ease-out ${300 + i * 80}ms both`,
            }}
          >
            <div
              className="mb-1 font-mono text-overline font-bold uppercase"
              style={{ color: 'rgb(var(--description-text))', letterSpacing: '0.1em' }}
            >
              {ann.label}
            </div>
            <p className="m-0 font-sans text-body-sm text-body">{ann.text}</p>
          </article>
        ))}
        <style>
          {`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}
        </style>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-md bg-action px-5 py-2.5 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] hover:bg-action-hover"
        >
          Now you try
          <Icon name="arrowRight" size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Phase 2: Reformulate ────────────────────────────────────────

function PhaseReformulate({
  product,
  processField,
  performance,
  onProductChange,
  onProcessChange,
  onPerformanceChange,
  allFieldsMet,
  onSubmit,
}: {
  product: string;
  processField: string;
  performance: string;
  onProductChange: (v: string) => void;
  onProcessChange: (v: string) => void;
  onPerformanceChange: (v: string) => void;
  allFieldsMet: boolean;
  onSubmit: () => void;
}): JSX.Element {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <aside
        className="rounded-md"
        style={{
          background: 'rgb(var(--surface))',
          border: '1px solid rgb(var(--border))',
          padding: '14px 16px',
          opacity: 0.85,
        }}
      >
        <Overline className="mb-2" style={{ fontSize: 11 }}>
          The original prompt
        </Overline>
        <p className="m-0 mb-2 font-sans text-body-sm whitespace-pre-line text-body">
          {P9_SCENARIO}
        </p>
        <p className="m-0 font-sans text-body-sm italic text-ink">{P9_WEAK_PROMPT}</p>
      </aside>

      <div>
        <h4 className="m-0 mb-3 font-sans text-h4 font-semibold text-ink">Rewrite this prompt.</h4>
        <p className="m-0 mb-4 font-sans text-body-sm text-body">
          Use the three Description sub-dimensions as scaffolding. Each field needs at least 10
          characters before you can submit.
        </p>

        <div className="space-y-4">
          <PromptField
            id="p9_product"
            label="Product — What do you want?"
            placeholder="Specify: format, audience, length, level of detail…"
            value={product}
            onChange={onProductChange}
          />
          <PromptField
            id="p9_process"
            label="Process — How should AI approach this?"
            placeholder="Specify: steps, frameworks, constraints, what to include/exclude…"
            value={processField}
            onChange={onProcessChange}
          />
          <PromptField
            id="p9_performance"
            label="Performance — How should AI behave?"
            placeholder="Specify: tone, voice, directness, what to prioritize…"
            value={performance}
            onChange={onPerformanceChange}
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!allFieldsMet}
            aria-disabled={!allFieldsMet}
            className="rounded-md bg-action px-5 py-2.5 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-ghost disabled:text-muted"
          >
            See the Improved Output
          </button>
        </div>
      </div>
    </div>
  );
}

function PromptField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}): JSX.Element {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-mono text-overline font-bold uppercase"
        // Use the theme-aware description-text variable so the label
        // remains legible in dark mode (where the original #8B7355 falls
        // to ~3.57:1 against the dark card surface).
        style={{ color: 'rgb(var(--description-text))', letterSpacing: '0.1em' }}
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="block w-full resize-y rounded-md border border-border bg-[rgb(var(--white))] p-3 font-sans text-body-sm text-ink placeholder:text-muted focus:border-ink"
        style={{ minHeight: 80, lineHeight: 1.55 }}
      />
    </div>
  );
}

// ─── Phase 3: Side-by-side comparison ────────────────────────────

function PhaseCompare({
  compareTab,
  onTabChange,
  reformulation,
}: {
  compareTab: CompareTab;
  onTabChange: (t: CompareTab) => void;
  reformulation: { product: string; process: string; performance: string };
}): JSX.Element {
  return (
    <div className="space-y-5">
      {/* Prompt comparison — two columns, mirrors the output comparison
          grid below. Left: the weak prompt (subdued surface, no accent).
          Right: the reformulated prompt (Description tint + accent
          left-border). Lets the learner see what changed between the
          original and the reformulation without having to remember
          Phase 1. Stacks vertically on mobile. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <aside
          role="note"
          aria-label="The original prompt"
          className="rounded-lg"
          style={{
            background: 'rgb(var(--surface))',
            border: '1px solid rgb(var(--border))',
            padding: '16px 20px',
          }}
        >
          <Overline className="mb-2">The original prompt</Overline>
          <p className="m-0 mb-2 font-sans text-body-sm whitespace-pre-line text-body">
            {P9_SCENARIO}
          </p>
          <p className="m-0 font-sans text-body-sm italic text-ink">{P9_WEAK_PROMPT}</p>
        </aside>

        <aside
          role="note"
          aria-label="Example reformulated prompt"
          className="rounded-lg"
          style={{
            background: 'rgb(var(--description-light))',
            border: '1px solid rgb(var(--border))',
            borderLeft: `3px solid ${DESCRIPTION}`,
            padding: '16px 20px',
          }}
        >
          <Overline className="mb-2" style={{ color: 'rgb(var(--description-text))' }}>
            Example reformulated prompt
          </Overline>
          <p className="m-0 font-sans text-body-sm italic text-ink">{P9_REFORMULATED_PROMPT}</p>
        </aside>
      </div>

      {/* Mobile/tablet: tabs. Desktop: two columns. */}
      <CompareTabs compareTab={compareTab} onTabChange={onTabChange} />

      <div
        className="grid gap-4 lg:grid-cols-2"
        style={{ gridAutoRows: '1fr' }}
      >
        <ComparisonColumn
          ariaLabel="Before — output from the underspecified prompt"
          title="Before: Underspecified Prompt"
          body={P9_WEAK_OUTPUT}
          visibleOnMobile={compareTab === 'before'}
        />
        <ComparisonColumn
          ariaLabel="After — output from the well-specified prompt"
          title="After: Well-Specified Prompt"
          body={P9_IMPROVED_OUTPUT}
          visibleOnMobile={compareTab === 'after'}
        />
      </div>

      {/* Bring the learner's own three-field reformulation forward into
          Phase 3 so they can compare their work against the expert
          example below without scrolling back to Phase 2. Field labels
          and color treatment match the Phase 2 input form exactly so
          the visual identity carries through. */}
      <LearnerReformulationCard reformulation={reformulation} />

      <div className="pt-2">
        <ReflectionPrompt
          moduleId={4}
          sectionId={3}
          promptId="p9_reflection"
          accentColor={DESCRIPTION}
          engagedEvent="p9_reflection_engaged"
          savedEvent="p9_reflection_saved"
          promptText={P9_REFLECTION}
        />
      </div>
    </div>
  );
}

// ─── Learner's submitted reformulation, brought forward into Phase 3 ─

function LearnerReformulationCard({
  reformulation,
}: {
  reformulation: { product: string; process: string; performance: string };
}): JSX.Element {
  const dimensions: { key: 'product' | 'process' | 'performance'; label: string }[] = [
    { key: 'product', label: 'Product — What do you want?' },
    { key: 'process', label: 'Process — How should AI approach this?' },
    { key: 'performance', label: 'Performance — How should AI behave?' },
  ];
  return (
    <aside
      role="note"
      aria-label="Your reformulation"
      className="rounded-lg"
      style={{
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        borderLeft: `3px solid ${DESCRIPTION}`,
        padding: '16px 20px',
      }}
    >
      <Overline className="mb-3" style={{ color: 'rgb(var(--description-text))' }}>
        Your reformulation
      </Overline>
      <div className="space-y-3">
        {dimensions.map(({ key, label }) => {
          const value = reformulation[key].trim();
          return (
            <div key={key}>
              <div
                className="mb-1 font-mono text-overline font-bold uppercase"
                style={{
                  color: 'rgb(var(--description-text))',
                  letterSpacing: '0.1em',
                }}
              >
                {label}
              </div>
              <p
                className="m-0 font-sans text-body-sm text-body"
                style={{ lineHeight: 1.55, color: value ? undefined : 'rgb(var(--muted))' }}
              >
                {value || 'No response recorded.'}
              </p>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function CompareTabs({
  compareTab,
  onTabChange,
}: {
  compareTab: CompareTab;
  onTabChange: (t: CompareTab) => void;
}): JSX.Element {
  const tabs: { id: CompareTab; label: string }[] = [
    { id: 'before', label: 'Before' },
    { id: 'after', label: 'After' },
  ];
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      onTabChange(compareTab === 'before' ? 'after' : 'before');
    }
  };
  return (
    <div
      role="tablist"
      aria-label="Output comparison"
      className="flex lg:hidden"
      style={{ borderBottom: '1px solid rgb(var(--border-light))' }}
    >
      {tabs.map((t) => {
        const active = compareTab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onTabChange(t.id)}
            onKeyDown={onKey}
            className="font-sans text-[13px] transition-colors duration-150"
            style={{
              padding: '12px 18px',
              background: active ? 'rgb(var(--white))' : 'transparent',
              color: active ? 'rgb(var(--ink))' : 'rgb(var(--secondary))',
              fontWeight: active ? 600 : 500,
              borderBottom: active ? '2px solid rgb(var(--ink))' : '2px solid transparent',
              marginBottom: '-1px',
              cursor: 'pointer',
              flex: 1,
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function ComparisonColumn({
  ariaLabel,
  title,
  body,
  visibleOnMobile,
}: {
  ariaLabel: string;
  title: string;
  body: string;
  visibleOnMobile: boolean;
}): JSX.Element {
  return (
    <article
      role="region"
      aria-label={ariaLabel}
      className={`flex h-full flex-col rounded-lg ${visibleOnMobile ? 'block' : 'hidden lg:flex'}`}
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        padding: '16px 18px',
      }}
    >
      <h4 className="m-0 mb-3 font-sans text-h4 font-semibold text-ink">{title}</h4>
      <div className="font-sans text-body-sm leading-relaxed text-body">
        {renderMarkdownLite(body)}
      </div>
    </article>
  );
}
