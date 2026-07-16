// P5 TokenizerPlayground — predict-then-reveal flow for four guided
// rounds, then a free-exploration mode (4C spec §8). Uses the live
// gpt-tokenizer library so guided and free flows share a single
// tokenization codepath.

import { useEffect, useState } from 'react';
// Leaf entry, not the package root: the root re-exports the o200k_base
// encoding (~2.2 MB of rank data built eagerly at import — the largest
// single contributor to bundle parse/startup cost in the single-file
// build), while every documented token count in this module
// (TokenComparisonDiagram, StickerAnalogyDiagram) was verified against
// cl100k_base. The leaf import halves the payload and makes the live
// playground agree with the documented encoding.
import { decode, encode } from 'gpt-tokenizer/encoding/cl100k_base';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { Icon } from '../../components/shared/Icon';
import { Overline } from '../../components/shared/Overline';
import { R5Trigger } from '../../components/reference/R5Trigger';
import { ReferenceTabRail } from '../../components/reference/ReferenceTabRail';
import { TokenChipList } from './TokenChip';
import { QUICK_LOAD_SAMPLES, ROUNDS } from './tokenizer-rounds';

type StageId = 1 | 2 | 3 | 4 | 'free';

interface RoundResult {
  predicted: number;
  actual: number;
  tokens: string[];
}

function tokenizeText(text: string): string[] {
  if (!text) return [];
  const ids = encode(text);
  return ids.map((id) => decode([id]));
}

function gapColor(gap: number): { color: string; label: string } {
  const abs = Math.abs(gap);
  // Exact match gets distinct positive feedback so a learner who nailed
  // the count isn't told they were merely "close."
  if (abs === 0) {
    return { color: 'rgb(var(--success))', label: 'You got it!' };
  }
  if (abs <= 2) {
    return { color: 'rgb(var(--success))', label: 'Close!' };
  }
  if (abs <= 4) {
    return { color: 'rgb(var(--caution))', label: "Further than you'd expect?" };
  }
  return { color: 'rgb(var(--error))', label: "Significant gap. That's the point." };
}

export function TokenizerPlayground(): JSX.Element {
  const { state, recordKnowledgeCheck } = useLearnerProgress();
  const { track } = useAnalytics();

  // Restore round-completion from persisted state so re-mounting Module 3
  // (e.g., on hash navigation) doesn't reset the learner's progress.
  // Lazy initializer: this runs exactly once, at mount. (It was a useMemo
  // keyed on state.knowledgeChecks, which re-tokenized every completed
  // round on every progress write — and the recomputed value was
  // discarded, since it only ever fed this initial state.)
  const [results, setResults] = useState<Record<number, RoundResult>>(() => {
    const out: Record<number, RoundResult> = {};
    for (const r of ROUNDS) {
      const stored = state.knowledgeChecks[`3.3.p5_round_${r.id}`];
      if (stored) {
        // We re-tokenize on restore rather than persisting tokens (the
        // storage record only carries the prediction outcome).
        const tokens = tokenizeText(r.input);
        out[r.id] = {
          predicted: Number.parseInt(stored.selectedOptionId, 10) || 0,
          actual: tokens.length,
          tokens,
        };
      }
    }
    return out;
  });

  // Start on the first unrevealed round; after Round 4, free mode.
  // `results` here is the freshly-initialized state above — this
  // initializer also runs only at mount.
  const [stage, setStage] = useState<StageId>(() => {
    for (const r of ROUNDS) {
      if (!results[r.id]) return r.id;
    }
    return 'free';
  });

  return (
    <div className="space-y-3">
      {/* R5 supports D3 + D8. P5 teaches the tokenization pillar — R5's
          Boundary Tasks section gives the integrated picture of where
          tokenization causes real errors. The right-edge tab is the
          single entry point. */}
      <ReferenceTabRail>
        <R5Trigger label="Capability Boundaries" />
      </ReferenceTabRail>

      {/* Padding switches by breakpoint. Mobile uses tighter 18/16 so
          the narrow viewport leaves more horizontal room for the
          round-indicator pills and the token chips inside the rounds.
          sm: restores the original 24/26 for desktop reading comfort. */}
      <section
        aria-label="Tokenizer playground"
        className="py-[18px] px-4 sm:py-6 sm:px-[26px]"
        style={{
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border))',
        }}
    >
      <Overline className="mb-2">Practice activity — P5</Overline>
      <h3
        className="m-0 mb-3 font-display text-title font-normal text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        Tokenizer playground
      </h3>
      <p className="m-0 mb-5 font-sans text-body text-body">
        For each text sample, predict how many tokens it will produce — then see the result. The
        gap between your prediction and the actual count is the point. Four guided rounds, then
        free exploration.
      </p>

      <RoundIndicator
        stage={stage}
        results={results}
        onSelect={(s) => setStage(s)}
      />

      <div className="mt-6">
        {stage !== 'free' ? (
          <GuidedRound
            stageId={stage}
            existing={results[stage]}
            onLocked={(predicted, tokens) => {
              const next: RoundResult = { predicted, actual: tokens.length, tokens };
              setResults((prev) => ({ ...prev, [stage]: next }));
              recordKnowledgeCheck(3, 3, `p5_round_${stage}`, {
                selectedOptionId: String(predicted),
                isPreferred: Math.abs(predicted - tokens.length) <= 2,
                timestamp: Date.now(),
              });
              track({
                type: `p5_round_${stage}_predicted`,
                moduleId: 3,
                sectionId: 3,
                payload: { predicted },
              });
              track({
                type: `p5_round_${stage}_revealed`,
                moduleId: 3,
                sectionId: 3,
                payload: { actual: tokens.length, gap: tokens.length - predicted },
              });
            }}
            onAdvance={() => {
              const nextId = stage + 1;
              if (nextId > 4) {
                setStage('free');
                track({ type: 'p5_free_mode_entered', moduleId: 3, sectionId: 3 });
              } else {
                setStage(nextId as StageId);
              }
            }}
          />
        ) : (
          <FreeMode />
        )}
      </div>
      </section>
    </div>
  );
}

// ─── Round indicator ───────────────────────────────────────────────

function RoundIndicator({
  stage,
  results,
  onSelect,
}: {
  stage: StageId;
  results: Record<number, RoundResult>;
  onSelect: (s: StageId) => void;
}): JSX.Element {
  const items: { id: StageId; label: string }[] = [
    ...ROUNDS.map((r) => ({ id: r.id as StageId, label: String(r.id) })),
    { id: 'free' as StageId, label: 'Free' },
  ];
  return (
    // Mobile gets a 3-column grid so the 5 pills land in a clean 3+2
    // layout instead of the flex-wrap default of 2+3 with each row a
    // different width. Pills lose their varying intrinsic width (each
    // grid cell is equal share) which makes the row visually
    // consistent. sm:flex restores the original auto-width wrapping
    // flex on desktop where horizontal space is plentiful.
    <div role="group" aria-label="Round indicator" className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center">
      {items.map((item) => {
        const completed = item.id !== 'free' && results[item.id as number];
        const isCurrent = stage === item.id;
        const isFree = item.id === 'free';
        const allRoundsDone = ROUNDS.every((r) => results[r.id]);
        const disabled = isFree && !allRoundsDone;
        const stateLabel = isCurrent
          ? 'current'
          : completed
            ? 'complete'
            : disabled
              ? 'locked'
              : 'available';
        const ariaLabel =
          item.id === 'free'
            ? `Free exploration: ${stateLabel}`
            : `Round ${item.label} of 4: ${stateLabel}`;
        return (
          <button
            key={String(item.id)}
            type="button"
            onClick={() => !disabled && onSelect(item.id)}
            aria-label={ariaLabel}
            aria-current={isCurrent ? 'step' : undefined}
            disabled={disabled}
            className="flex items-center gap-2 font-mono text-[12px] transition-colors duration-[160ms]"
            style={{
              padding: '5px 12px',
              border: `1px solid ${
                isCurrent
                  ? 'rgb(var(--ink))'
                  : completed
                    ? 'rgb(var(--action))'
                    : 'rgb(var(--border))'
              }`,
              background: isCurrent
                ? 'rgb(var(--ink))'
                : completed
                  ? 'rgba(61, 90, 78, 0.08)'
                  : 'rgb(var(--white))',
              color: isCurrent
                ? 'rgb(var(--white))'
                : completed
                  ? 'rgb(var(--action))'
                  : disabled
                    ? 'rgb(var(--muted))'
                    : 'rgb(var(--secondary))',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.55 : 1,
            }}
          >
            <span
              aria-hidden="true"
              className="inline-flex h-3 w-3 items-center justify-center rounded-full"
              style={{
                background: completed ? 'rgb(var(--action))' : 'transparent',
                border: completed ? 'none' : `1px solid currentColor`,
              }}
            >
              {completed && <Icon name="check" size={8} />}
            </span>
            {item.id === 'free' ? 'Free' : `Round ${item.label}`}
          </button>
        );
      })}
    </div>
  );
}

// ─── Guided round panel ────────────────────────────────────────────

function GuidedRound({
  stageId,
  existing,
  onLocked,
  onAdvance,
}: {
  stageId: 1 | 2 | 3 | 4;
  existing?: RoundResult | undefined;
  onLocked: (predicted: number, tokens: string[]) => void;
  onAdvance: () => void;
}): JSX.Element {
  const [prediction, setPrediction] = useState<string>(
    existing ? String(existing.predicted) : '',
  );
  const [locked, setLocked] = useState<boolean>(Boolean(existing));
  const [tokens, setTokens] = useState<string[]>(existing?.tokens ?? []);

  // Reset local state when the active round changes.
  useEffect(() => {
    setPrediction(existing ? String(existing.predicted) : '');
    setLocked(Boolean(existing));
    setTokens(existing?.tokens ?? []);
  }, [existing, stageId]);

  // Looked up after the hooks so the hook order is identical on
  // every render (Rules of Hooks); stageId is typed 1|2|3|4 so the
  // guard is defensive only.
  const round = ROUNDS.find((r) => r.id === stageId);
  if (!round) return <p>Unknown round.</p>;

  const lock = () => {
    const n = Number.parseInt(prediction, 10);
    if (Number.isNaN(n) || n <= 0) return;
    const t = tokenizeText(round.input);
    setTokens(t);
    setLocked(true);
    onLocked(n, t);
  };

  const gap = locked ? tokens.length - (existing?.predicted ?? Number.parseInt(prediction, 10)) : 0;
  const gapMeta = locked ? gapColor(gap) : null;

  return (
    <article
      aria-label={`Round ${stageId}: ${round.title}`}
      style={{
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        padding: '20px 22px',
      }}
    >
      <Overline className="mb-2" style={{ fontSize: 11 }}>
        Round {stageId} of 4 · {round.title}
      </Overline>

      <div
        className="mb-4 font-sans text-body"
        style={{
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border))',
          padding: '12px 14px',
          color: 'rgb(var(--ink))',
          whiteSpace: 'pre-wrap',
          fontFamily: stageId === 4 ? '"IBM Plex Mono", "Courier New", monospace' : undefined,
          fontSize: stageId === 4 ? 14 : 16,
        }}
      >
        {round.input}
      </div>
      {round.translation && (
        <p className="m-0 mb-4 font-sans text-body-sm italic text-secondary">
          {round.translation}
        </p>
      )}

      {!locked ? (
        <PredictionInput
          stageId={stageId}
          promptHint={round.promptHint}
          value={prediction}
          onChange={setPrediction}
          onLock={lock}
        />
      ) : (
        <RevealPanel
          tokens={tokens}
          predicted={existing?.predicted ?? Number.parseInt(prediction, 10)}
          gap={gap}
          gapColor={gapMeta?.color ?? 'rgb(var(--ink))'}
          gapLabel={gapMeta?.label ?? ''}
          explanation={round.explanation}
          onAdvance={onAdvance}
          isLast={stageId === 4}
        />
      )}
    </article>
  );
}

function PredictionInput({
  stageId,
  promptHint,
  value,
  onChange,
  onLock,
}: {
  stageId: number;
  promptHint: string;
  value: string;
  onChange: (v: string) => void;
  onLock: () => void;
}): JSX.Element {
  const isValid = value.length > 0 && Number.parseInt(value, 10) > 0;
  return (
    <>
      <p className="m-0 mb-3 font-sans text-body-sm text-body">{promptHint}</p>
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={`p5-prediction-${stageId}`}
          className="font-sans text-body-sm text-secondary"
        >
          I predict
        </label>
        <input
          id={`p5-prediction-${stageId}`}
          type="number"
          inputMode="numeric"
          min={1}
          max={500}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Your prediction: number of tokens"
          className="border border-border bg-[rgb(var(--white))] px-3 py-2 font-mono text-[14px] text-ink focus:border-ink"
          style={{ width: 80 }}
        />
        <span className="font-sans text-body-sm text-secondary">tokens</span>
        <button
          type="button"
          onClick={onLock}
          disabled={!isValid}
          aria-disabled={!isValid}
          className="bg-action px-4 py-2 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] dark:text-[rgb(var(--canvas))] hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-ghost disabled:text-muted"
        >
          Lock prediction
        </button>
      </div>
    </>
  );
}

function RevealPanel({
  tokens,
  predicted,
  gap,
  gapColor,
  gapLabel,
  explanation,
  onAdvance,
  isLast,
}: {
  tokens: string[];
  predicted: number;
  gap: number;
  gapColor: string;
  gapLabel: string;
  explanation: string;
  onAdvance: () => void;
  isLast: boolean;
}): JSX.Element {
  const sign = gap > 0 ? '+' : '';
  return (
    <>
      <div className="mb-3">
        <TokenChipList
          tokens={tokens}
          animate
          ariaLabel={`Tokenization result: ${tokens.length} tokens`}
        />
      </div>

      <div
        aria-live="polite"
        className="mb-4 flex flex-wrap items-baseline gap-3 font-sans"
      >
        <span className="font-mono text-[14px] font-semibold text-ink">
          {tokens.length} tokens
        </span>
        <span className="text-body-sm text-secondary">
          — you predicted <span className="font-mono font-semibold text-ink">{predicted}</span>
        </span>
        <span
          className="font-mono text-[12px] font-semibold"
          style={{ color: gapColor }}
        >
          ({sign}
          {gap}) {gapLabel}
        </span>
      </div>

      <div
        className="transition-opacity duration-300"
        style={{
          background: 'rgb(var(--surface-warm))',
          border: '1px solid rgb(var(--border))',
          padding: '14px 16px',
        }}
      >
        <p className="m-0 font-sans text-body-sm leading-relaxed text-body">{explanation}</p>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onAdvance}
          className="inline-flex items-center gap-2 bg-action px-5 py-2.5 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] dark:text-[rgb(var(--canvas))] hover:bg-action-hover"
        >
          {isLast ? 'Continue to free exploration' : 'Next round'}
          <Icon name="arrowRight" size={14} />
        </button>
      </div>
    </>
  );
}

// ─── Free exploration mode ─────────────────────────────────────────

function FreeMode(): JSX.Element {
  const [text, setText] = useState<string>('');
  const [tokens, setTokens] = useState<string[]>([]);
  const { track } = useAnalytics();

  const tokenize = () => {
    if (!text.trim()) return;
    const t = tokenizeText(text);
    setTokens(t);
    track({
      type: 'p5_free_tokenized',
      moduleId: 3,
      sectionId: 3,
      payload: { chars: text.length, tokens: t.length },
    });
  };

  const onQuickLoad = (sample: { label: string; text: string }) => {
    setText(sample.text);
    setTokens(tokenizeText(sample.text));
    track({
      type: 'p5_quickload_used',
      moduleId: 3,
      sectionId: 3,
      payload: { label: sample.label },
    });
  };

  const compressionRatio =
    tokens.length > 0 ? (text.length / tokens.length).toFixed(1) : '—';

  return (
    <article
      aria-label="Free exploration mode"
      style={{
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        padding: '20px 22px',
      }}
    >
      <Overline className="mb-2" style={{ fontSize: 11 }}>
        Free exploration
      </Overline>
      <p className="m-0 mb-4 font-sans text-body-sm text-body">
        Now try your own text. Type or paste anything (a sentence from a recent email, a paragraph
        from a report, a formula, a phrase in another language) and see how it tokenizes. The
        pattern to watch for: where do the token boundaries fall relative to the meaningful units
        in your text?
      </p>

      <label htmlFor="p5-free-input" className="sr-only">
        Text to tokenize
      </label>
      <textarea
        id="p5-free-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        aria-label="Text to tokenize"
        placeholder="Paste or type any text…"
        className="block w-full resize-y border border-border bg-[rgb(var(--white))] p-3 font-sans text-body text-ink placeholder:text-muted focus:border-ink"
        style={{ minHeight: 80, lineHeight: 1.55 }}
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={tokenize}
          disabled={!text.trim()}
          aria-disabled={!text.trim()}
          className="bg-action px-5 py-2.5 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] dark:text-[rgb(var(--canvas))] hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-ghost disabled:text-muted"
        >
          Tokenize
        </button>
        <span className="font-mono text-caption text-tertiary" style={{ letterSpacing: '0.02em' }}>
          Try one of these
        </span>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {QUICK_LOAD_SAMPLES.map((sample) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => onQuickLoad(sample)}
            className="text-left font-sans text-[12.5px] font-semibold text-secondary transition-colors duration-[160ms] hover:bg-surface-warm hover:text-ink"
            style={{
              border: '1px solid rgb(var(--border))',
              padding: '8px 12px',
              background: 'rgb(var(--white))',
            }}
          >
            {sample.label}
          </button>
        ))}
      </div>

      {tokens.length > 0 && (
        <div className="mt-5">
          <div className="mb-3">
            <TokenChipList
              tokens={tokens}
              animate
              ariaLabel={`Free-mode tokenization result: ${tokens.length} tokens`}
            />
          </div>
          <div
            aria-live="polite"
            className="font-mono text-caption text-tertiary"
            style={{ letterSpacing: '0.02em' }}
          >
            <strong className="text-ink">{tokens.length}</strong> tokens from{' '}
            <strong className="text-ink">{text.length}</strong> characters · compression ratio{' '}
            <strong className="text-ink">{compressionRatio}</strong>:1
          </div>
        </div>
      )}
    </article>
  );
}
