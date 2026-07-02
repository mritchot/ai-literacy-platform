// P6 NextTokenDemo — pre-computed logits with real softmax-with-temperature
// redistribution (4C spec §9). Three stems: pattern completion (capability
// zone), factual specificity (fabrication zone), and a side-by-side
// temperature comparison whose outputs are pre-written for pedagogical
// consistency rather than randomly sampled.

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { ReflectionPrompt } from '../../components/shared/ReflectionPrompt';
import { Overline } from '../../components/shared/Overline';
import { R5Trigger } from '../../components/reference/R5Trigger';
import { ReferenceTabRail } from '../../components/reference/ReferenceTabRail';
import { TOKEN_HEX } from '../../utils/chart-config';
import { TokenChip } from './TokenChip';
import { useViewport } from '../../hooks/useViewport';
import {
  STEMS,
  STEM_3_OUTPUTS,
  softmaxWithTemperature,
  type Candidate,
} from './stem-data';

// Generation cap = 1: the pedagogical point is "watch a single next-token
// prediction" — temperature exploration happens via the slider + Reset
// loop, not by sampling a long sequence.
const MAX_GENERATED = 1;

// Sample one candidate index from a probability distribution using
// inverse-CDF on a uniform random draw.
function sampleIndex(probs: number[]): number {
  const total = probs.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < probs.length; i++) {
    r -= probs[i] ?? 0;
    if (r <= 0) return i;
  }
  return probs.length - 1;
}

export function NextTokenDemo(): JSX.Element {
  const { track } = useAnalytics();
  const { markEngaged, markTabViewed, state } = useLearnerProgress();
  const [activeStem, setActiveStem] = useState<1 | 2 | 3>(1);
  const [temperature, setTemperature] = useState<number>(0.7);
  const viewport = useViewport();
  const isMobile = viewport === 'mobile';
  const [generated, setGenerated] = useState<Record<number, string[]>>({});
  const [stem3Generated, setStem3Generated] = useState<boolean>(false);

  // View-tracking + completion signal — fire `p6_stem_N_viewed` whenever
  // the active tab changes and persist the engagement so the section can
  // be marked complete once all three have been visited.
  useEffect(() => {
    track({ type: `p6_stem_${activeStem}_viewed`, moduleId: 3, sectionId: 5 });
    markTabViewed(3, 5, `stem_${activeStem}`);
  }, [activeStem, track, markTabViewed]);

  // Roving tabindex: move DOM focus with the activation, otherwise the
  // keydown target keeps its stale index and Stem 3 is unreachable from
  // Stem 1 by keyboard (viewing all three stems is the completion
  // condition, so this stranded keyboard learners).
  const activateStem = (n: 1 | 2 | 3) => {
    setActiveStem(n);
    document.getElementById(`p6-tab-${n}`)?.focus();
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      activateStem(((idx % 3) + 1) as 1 | 2 | 3);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      activateStem((((idx - 2 + 3) % 3) + 1) as 1 | 2 | 3);
    }
  };

  const stem = STEMS[activeStem - 1]!;
  const probs = useMemo(
    () =>
      stem.candidates.length > 0
        ? softmaxWithTemperature(stem.candidates, temperature, stem.residualPct)
        : [],
    [stem, temperature],
  );

  const generatedTokens = generated[activeStem] ?? [];
  const tokensExhausted = generatedTokens.length >= MAX_GENERATED;

  const generate = () => {
    if (tokensExhausted || activeStem === 3) return;
    const idx = sampleIndex(probs);
    const c = stem.candidates[idx];
    if (!c) return;
    setGenerated((prev) => ({
      ...prev,
      [activeStem]: [...(prev[activeStem] ?? []), c.token],
    }));
    markEngaged(3, 5, `stem_${activeStem}_generated`);
    track({
      type: `p6_stem_${activeStem}_generated`,
      moduleId: 3,
      sectionId: 5,
      payload: { temperature, token: c.token },
    });
  };

  const reset = () => {
    setGenerated((prev) => ({ ...prev, [activeStem]: [] }));
  };

  // Debounced analytics for the slider — the UI updates per step, but
  // one drag across the range would otherwise emit ~19 events; track
  // only the value the learner settles on (same 500ms pattern as the
  // geo chart's search tracking).
  const tempTrackRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (tempTrackRef.current !== null) window.clearTimeout(tempTrackRef.current);
    },
    [],
  );
  const onTemperatureChange = (next: number) => {
    setTemperature(next);
    if (tempTrackRef.current !== null) window.clearTimeout(tempTrackRef.current);
    tempTrackRef.current = window.setTimeout(() => {
      tempTrackRef.current = null;
      track({
        type: 'p6_temperature_adjusted',
        moduleId: 3,
        sectionId: 5,
        payload: { temperature: next },
      });
    }, 500);
  };

  const allStemsViewed =
    Boolean(state.viewedTabs['3.5.stem_1']) &&
    Boolean(state.viewedTabs['3.5.stem_2']) &&
    Boolean(state.viewedTabs['3.5.stem_3']);

  return (
    <div className="space-y-3">
      {/* R5 supports D3 + D8. P6 teaches NTP × Knowledge — R5's
          Specificity Tasks section gives the integrated picture of where
          this generation mechanism produces fabrications. */}
      <ReferenceTabRail>
        <R5Trigger variant="tab" label="Capability Boundaries" />
      </ReferenceTabRail>

      <section
        aria-label="Next-token prediction demonstration"
        className="rounded-xl"
        style={{
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border))',
          padding: '24px 26px',
        }}
    >
      <Overline className="mb-2">Practice activity — P6</Overline>
      <h3
        className="m-0 mb-3 font-display text-title font-normal text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        Next-token prediction in action
      </h3>
      <p className="m-0 mb-5 font-sans text-body text-body">
        You’ve read how the model generates output, one token at a time, chosen by probability.
        For each sentence stem, you’ll see the candidates the model considers at a single
        prediction step, then observe what changes when you adjust the temperature.
      </p>

      {/* Stem tab list. Mobile uses a 3-column grid with short labels
          ("Stem 1") so all three sit in a single row with equal width
          and read as a proper tab control. The full-label flex-wrap
          layout left each tab on its own row on mobile because
          "Stem 1 · Pattern completion" / "Stem 3 · Variability
          demonstration" wouldn't fit horizontally, producing a stacked-
          links look that read as nav rather than a tab switcher.
          Desktop keeps the full labels in the original wrapping flex. */}
      <div
        role="tablist"
        aria-label="Stems"
        className="mb-5 grid grid-cols-3 sm:flex sm:flex-wrap"
        style={{ borderBottom: '1px solid rgb(var(--border-light))' }}
      >
        {([1, 2, 3] as const).map((id, i) => {
          const active = activeStem === id;
          return (
            <button
              key={id}
              role="tab"
              type="button"
              id={`p6-tab-${id}`}
              aria-selected={active}
              aria-controls={`p6-panel-${id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setActiveStem(id)}
              onKeyDown={(e) => onTabKey(e, i + 1)}
              className="font-sans text-[13px] transition-colors duration-150 sm:text-left text-center"
              style={{
                padding: isMobile ? '12px 8px' : '12px 18px',
                background: active ? 'rgb(var(--white))' : 'transparent',
                color: active ? 'rgb(var(--ink))' : 'rgb(var(--secondary))',
                fontWeight: active ? 600 : 500,
                borderBottom: active
                  ? `2px solid ${TOKEN_HEX.discernment}`
                  : '2px solid transparent',
                marginBottom: '-1px',
                cursor: 'pointer',
              }}
            >
              {isMobile ? `Stem ${id}` : `Stem ${id} · ${STEMS[id - 1]?.label}`}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`p6-panel-${activeStem}`}
        aria-labelledby={`p6-tab-${activeStem}`}
      >
        {activeStem === 3 ? (
          <Stem3Panel
            stem={stem}
            generated={stem3Generated}
            onGenerate={() => {
              setStem3Generated(true);
              markEngaged(3, 5, 'stem_3_generated');
              track({ type: 'p6_stem_3_generated', moduleId: 3, sectionId: 5 });
            }}
          />
        ) : (
          <StandardStemPanel
            stem={stem}
            probs={probs}
            temperature={temperature}
            generatedTokens={generatedTokens}
            tokensExhausted={tokensExhausted}
            onGenerate={generate}
            onReset={reset}
            onTemperatureChange={onTemperatureChange}
          />
        )}
      </div>

      {allStemsViewed && (
        <div className="mt-8">
          <ReflectionPrompt
            moduleId={3}
            sectionId={5}
            promptId="p6_reasoning"
            engagedEvent="p6_reasoning_engaged"
            savedEvent="p6_reasoning_submitted"
            promptText="If the model is selecting the next token based on probability, with no database to consult and no way to distinguish real from plausible, what does that mean for how you should treat a specific factual claim in an AI-generated deliverable? Name one type of claim you would verify independently and explain why, in one or two sentences."
          />
        </div>
      )}
      </section>
    </div>
  );
}

// ─── Standard stem panel (Stem 1 + Stem 2) ────────────────────────

function StandardStemPanel({
  stem,
  probs,
  temperature,
  generatedTokens,
  tokensExhausted,
  onGenerate,
  onReset,
  onTemperatureChange,
}: {
  stem: (typeof STEMS)[number];
  probs: number[];
  temperature: number;
  generatedTokens: string[];
  tokensExhausted: boolean;
  onGenerate: () => void;
  onReset: () => void;
  onTemperatureChange: (next: number) => void;
}): JSX.Element {
  return (
    <>
      <SentenceDisplay prefix={stem.prefix} generatedTokens={generatedTokens} />

      <ProbabilityPanel
        candidates={stem.candidates}
        probs={probs}
        residualPct={stem.residualPct}
        residualLabel={stem.residualLabel}
      />

      <TemperatureSlider value={temperature} onChange={onTemperatureChange} />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onGenerate}
          disabled={tokensExhausted}
          aria-disabled={tokensExhausted}
          className="rounded-md bg-action px-5 py-2.5 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-ghost disabled:text-muted"
        >
          Generate next token
        </button>
        {generatedTokens.length > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-md font-sans text-[12.5px] font-semibold text-tertiary hover:text-secondary"
            style={{ padding: '10px 14px' }}
          >
            Reset
          </button>
        )}
      </div>

      {tokensExhausted && (
        <p className="m-0 mt-3 font-sans text-body-sm italic text-secondary">
          Adjust the temperature and click <strong>Reset</strong> to see how the model’s next-token
          choice shifts at the new setting.
        </p>
      )}

      {generatedTokens.length > 0 && (
        <article
          className="mt-6 rounded-md transition-opacity duration-200"
          style={{
            background: 'rgb(var(--surface-warm))',
            border: '1px solid rgb(var(--border))',
            padding: '14px 16px',
          }}
        >
          <p className="m-0 font-sans text-body-sm leading-relaxed text-body">{stem.annotation}</p>
        </article>
      )}
    </>
  );
}

function SentenceDisplay({
  prefix,
  generatedTokens,
}: {
  prefix: string;
  generatedTokens: string[];
}): JSX.Element {
  return (
    <div
      aria-live="polite"
      className="mb-5 rounded-md font-sans text-body text-ink"
      style={{
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        padding: '14px 16px',
      }}
    >
      <span>{prefix}</span>
      {generatedTokens.length === 0 && <span className="text-muted"> ___</span>}
      {generatedTokens.length > 0 && (
        <ol
          className="mt-2 inline-flex flex-wrap items-center p-0"
          style={{ listStyle: 'none', display: 'inline-flex' }}
          aria-label={`Generated sequence: ${generatedTokens.length} tokens`}
        >
          {generatedTokens.map((tok, i) => (
            <TokenChip key={`${i}-${tok}`} text={tok} index={i} animate />
          ))}
        </ol>
      )}
    </div>
  );
}

// ─── Probability panel ────────────────────────────────────────────

function ProbabilityPanel({
  candidates,
  probs,
  residualPct,
  residualLabel,
}: {
  candidates: Candidate[];
  probs: number[];
  residualPct: number;
  residualLabel: string;
}): JSX.Element {
  // Mobile drops the ProbabilityBar column entirely — the desktop
  // grid is `170px 60px 1fr` which leaves only ~30-40 px for the bar
  // on a 358 px viewport, so the bars rendered as near-invisible
  // stubs that didn't communicate the temperature redistribution.
  // Mobile uses a 2-column layout (token name + right-aligned
  // percentage) and relies on the numeric values alone to show the
  // probability distribution. The bars stay on desktop where there's
  // enough horizontal room for them to read as a meaningful chart.
  const viewport = useViewport();
  const isMobile = viewport === 'mobile';
  const gridTemplate = isMobile ? '1fr auto' : '170px 60px 1fr';
  return (
    <section
      aria-label="Probability panel"
      className="mb-5 rounded-lg"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        padding: '14px 16px',
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="font-sans text-body-sm font-semibold text-ink">Candidate tokens</div>
        <div className="font-mono text-caption italic text-muted">Simulated for demonstration</div>
      </div>

      <ul className="m-0 space-y-1.5 list-none p-0">
        {candidates.map((c, i) => {
          const p = probs[i] ?? 0;
          const pct = p * 100;
          return (
            <li
              key={c.token}
              aria-label={`Token ${visualToken(c.token)}, probability ${pct.toFixed(1)} percent`}
              className="grid items-center gap-3"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              <span
                className="font-mono text-[13px] text-ink"
                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {visualToken(c.token)}
              </span>
              <span className="font-mono text-[12px] text-secondary" style={{ textAlign: 'right' }}>
                {pct.toFixed(1)}%
              </span>
              {!isMobile && <ProbabilityBar pct={pct} />}
            </li>
          );
        })}
        {residualPct > 0 && (
          <li
            className="grid items-center gap-3 pt-1"
            style={{ gridTemplateColumns: gridTemplate, color: 'rgb(var(--muted))' }}
          >
            <span className="font-mono text-[12px] italic">{residualLabel}</span>
            <span className="font-mono text-[12px]" style={{ textAlign: 'right' }}>
              {residualPct.toFixed(1)}%
            </span>
            {!isMobile && <span aria-hidden="true" />}
          </li>
        )}
      </ul>
    </section>
  );
}

function ProbabilityBar({ pct }: { pct: number }): JSX.Element {
  const width = Math.max(0, Math.min(100, pct));
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-sm"
      style={{ height: 14, background: 'rgb(var(--border-light))' }}
    >
      <div
        className="h-full rounded-sm transition-[width] duration-300 ease-out"
        style={{ width: `${width}%`, background: TOKEN_HEX.info }}
      />
    </div>
  );
}

// Render leading-space markers in candidate tokens.
function visualToken(token: string): string {
  if (token.startsWith(' ')) return '⎵' + token.slice(1);
  return token;
}

// ─── Temperature slider ───────────────────────────────────────────

function TemperatureSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}): JSX.Element {
  const display = value.toFixed(1);
  let preset = '';
  if (value <= 0.3) preset = ' — very conservative';
  else if (Math.abs(value - 0.7) < 0.05) preset = ' — default';
  else if (value >= 1.5) preset = ' — very exploratory';
  return (
    <div>
      <div className="mb-2 flex items-center justify-between font-sans text-body-sm text-secondary">
        <span>Conservative</span>
        <span>Exploratory</span>
      </div>
      <input
        type="range"
        min={0.1}
        max={2.0}
        step={0.1}
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value))}
        aria-label="Temperature control. Lower values produce more predictable output, higher values produce more varied output."
        aria-valuetext={`${display}${preset}`}
        className="w-full"
        style={{ accentColor: 'rgb(var(--action))' }}
      />
      <div className="mt-1 text-center font-mono text-caption text-tertiary" style={{ letterSpacing: '0.02em' }}>
        Temperature: <strong className="text-ink">{display}</strong>
        {preset}
      </div>
    </div>
  );
}

// ─── Stem 3: side-by-side temperature comparison ─────────────────

function Stem3Panel({
  stem,
  generated,
  onGenerate,
}: {
  stem: (typeof STEMS)[number];
  generated: boolean;
  onGenerate: () => void;
}): JSX.Element {
  return (
    <>
      <div
        className="mb-5 rounded-md font-sans text-body text-ink"
        style={{
          background: 'rgb(var(--surface))',
          border: '1px solid rgb(var(--border))',
          padding: '14px 16px',
        }}
      >
        {stem.prefix} <span className="text-muted">___</span>
      </div>
      <p className="m-0 mb-4 font-sans text-body-sm text-body">
        Generate the same stem at three temperatures simultaneously. The precise-sounding figure at
        low temperature is no more reliable than the varied figures at higher temperature; both are
        sampled from a distribution that was never constrained to accuracy.
      </p>

      <button
        type="button"
        onClick={onGenerate}
        disabled={generated}
        aria-disabled={generated}
        className="mb-5 rounded-md bg-action px-5 py-2.5 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-ghost disabled:text-muted"
      >
        {generated ? 'Generated at all three temperatures' : 'Generate at all three temperatures'}
      </button>

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gridAutoRows: '1fr' }}
      >
        {STEM_3_OUTPUTS.map((out, i) => (
          <article
            key={out.label}
            className="rounded-lg"
            style={{
              background: 'rgb(var(--white))',
              border: '1px solid rgb(var(--border))',
              padding: '14px 16px',
              opacity: generated ? 1 : 0.5,
              transition: 'opacity 300ms ease-out',
              transitionDelay: generated ? `${i * 200}ms` : '0ms',
            }}
          >
            <Overline className="mb-1" style={{ fontSize: 10, color: 'rgb(var(--ink))' }}>
              T = {out.temperature.toFixed(1)}
            </Overline>
            <div className="mb-2 font-mono text-caption text-tertiary" style={{ letterSpacing: '0.02em' }}>
              {out.label}
            </div>
            <p className="m-0 font-sans text-body-sm text-ink">
              {generated ? out.text : '— click to generate —'}
            </p>
          </article>
        ))}
      </div>

      {generated && (
        <article
          className="mt-6 rounded-md"
          style={{
            background: 'rgb(var(--surface-warm))',
            border: '1px solid rgb(var(--border))',
            padding: '14px 16px',
          }}
        >
          <p className="m-0 font-sans text-body-sm leading-relaxed text-body">{stem.annotation}</p>
        </article>
      )}
    </>
  );
}
