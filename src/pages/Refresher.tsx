// Refresher — the spaced-practice page the check-in reminders open
// (`#/refresher?at=30|60|90`). Standalone like ThankYou: inside
// PlatformShell, not in the sidebar's module navigation.
//
// Recall: a short set of knowledge checks answered from memory. Items
// whose latest attempt was missed come first; the rest rotate, least
// recently practiced first, spread across the four modules. Each group
// is interleaved by module. The set is picked from attempts made before
// today, so answering items does not reshuffle it mid-session.
// Attempts save to `refresherResults` (never `knowledgeChecks`), so the
// original answers and the dashboard's knowledge-check counts stay put.
//
// Check-in: the milestone for the interval, the learner's current plan,
// and a place to write the one specific example each check-in asks for.

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { KnowledgeCheck } from '../components/shared/KnowledgeCheck';
import { Overline } from '../components/shared/Overline';
import { nextRadioIndex } from '../components/shared/radio-group-nav';
import { RefresherReminders } from '../components/shared/RefresherReminders';
import { useAnalytics } from '../contexts/AnalyticsContext';
import {
  useLearnerProgress,
  type KnowledgeCheckResult,
  type LearnerProgressState,
} from '../contexts/LearnerProgressContext';
import { currentCommitment } from '../data/action-commitment';
import { KNOWLEDGE_CHECK_CATALOG, type KnowledgeCheckEntry } from '../data/knowledge-check-catalog';
import { usePlatformMode } from '../hooks/usePlatformMode';
import {
  MILESTONES,
  isMilestoneDays,
  milestoneFor,
  type MilestoneDays,
} from '../modules/module4/milestones';

const SET_SIZE = 6;
const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_EXAMPLE_CHARS = 20;

function localDateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Round-robin across groups, keeping each group's internal order.
function roundRobin<T>(groups: T[][]): T[] {
  const out: T[] = [];
  const longest = Math.max(0, ...groups.map((g) => g.length));
  for (let i = 0; i < longest; i += 1) {
    for (const g of groups) {
      const item = g[i];
      if (item !== undefined) out.push(item);
    }
  }
  return out;
}

function byModule(entries: KnowledgeCheckEntry[]): KnowledgeCheckEntry[][] {
  return [1, 2, 3, 4].map((m) => entries.filter((e) => e.moduleId === m));
}

function pickRecallSet(
  original: Record<string, KnowledgeCheckResult>,
  practice: Record<string, KnowledgeCheckResult>,
  today: string,
  includeUnanswered: boolean,
): KnowledgeCheckEntry[] {
  // Most recent attempt per item from before today: the original answer
  // or a refresher attempt, whichever is newer.
  const latest = new Map<string, KnowledgeCheckResult>();
  for (const entry of KNOWLEDGE_CHECK_CATALOG) {
    const r = original[entry.storageKey];
    if (r) latest.set(entry.storageKey, r);
  }
  for (const [key, result] of Object.entries(practice)) {
    const date = key.slice(0, 10);
    if (date >= today) continue;
    const storageKey = key.slice(11);
    const current = latest.get(storageKey);
    if (!current || result.timestamp > current.timestamp) latest.set(storageKey, result);
  }

  const eligible = KNOWLEDGE_CHECK_CATALOG.filter(
    (e) => includeUnanswered || original[e.storageKey] !== undefined,
  );
  const missed = eligible.filter((e) => latest.get(e.storageKey)?.isPreferred === false);
  const oldestFirst = (a: KnowledgeCheckEntry, b: KnowledgeCheckEntry) =>
    (latest.get(a.storageKey)?.timestamp ?? 0) - (latest.get(b.storageKey)?.timestamp ?? 0);
  const rest = roundRobin(
    byModule(eligible.filter((e) => latest.get(e.storageKey)?.isPreferred !== false)).map((g) =>
      [...g].sort(oldestFirst),
    ),
  );
  const missedChosen = missed.slice(0, SET_SIZE);
  const restChosen = rest.slice(0, SET_SIZE - missedChosen.length);
  return [...roundRobin(byModule(missedChosen)), ...roundRobin(byModule(restChosen))];
}

function completionTimestamp(state: LearnerProgressState): number | null {
  const post = state.assessments?.post?.completedAt;
  if (typeof post === 'number') return post;
  let latest = 0;
  for (const r of Object.values(state.knowledgeChecks)) {
    if (r.timestamp > latest) latest = r.timestamp;
  }
  return latest > 0 ? latest : null;
}

function resolveInterval(param: string | null, completedAt: number | null): MilestoneDays {
  const fromLink = Number(param);
  if (isMilestoneDays(fromLink)) return fromLink;
  if (completedAt !== null) {
    const days = (Date.now() - completedAt) / DAY_MS;
    if (days >= 75) return 90;
    if (days >= 45) return 60;
  }
  return 30;
}

export default function Refresher(): JSX.Element {
  const { state, recordRefresherResult } = useLearnerProgress();
  const { track } = useAnalytics();
  const { mode } = usePlatformMode();
  const [searchParams] = useSearchParams();
  const [today] = useState(() => localDateKey(new Date()));
  const [intervalDays, setIntervalDays] = useState<MilestoneDays>(() =>
    resolveInterval(searchParams.get('at'), completionTimestamp(state)),
  );

  const practice = state.refresherResults ?? {};
  // pickRecallSet ignores today's attempts, so recomputing after an
  // answer returns the same set.
  const recallSet = useMemo(
    () =>
      pickRecallSet(state.knowledgeChecks, state.refresherResults ?? {}, today, mode === 'portfolio'),
    [state.knowledgeChecks, state.refresherResults, today, mode],
  );

  const todaysResult = (entry: KnowledgeCheckEntry) => practice[`${today}.${entry.storageKey}`];
  const answeredToday = recallSet.filter((e) => todaysResult(e) !== undefined);
  const preferredToday = answeredToday.filter((e) => todaysResult(e)?.isPreferred).length;

  const viewedRef = useRef(false);
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    track({ type: 'refresher_viewed', payload: { intervalDays, setSize: recallSet.length } });
  }, [track, intervalDays, recallSet.length]);

  return (
    <div className="mx-auto max-w-reading px-4 py-14 sm:px-8 lg:px-16 lg:py-16">
      <Overline className="mb-2">Refresher</Overline>
      <h1 className="m-0 mb-3 font-sans text-h2 font-semibold text-ink">Recall what you practiced</h1>
      <p className="m-0 mb-10 font-sans text-body text-body">
        Answer each knowledge check from memory before you look anything up. The set starts with
        any you missed on your last try and mixes the four modules. Your original answers stay as
        they were.
      </p>

      <section aria-labelledby="refresher-recall-heading" className="mb-12">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="refresher-recall-heading" className="m-0 font-sans text-h3 font-semibold text-ink">
            Recall
          </h2>
          {recallSet.length > 0 && (
            <span className="font-mono text-caption text-tertiary" aria-live="polite">
              {answeredToday.length} of {recallSet.length} answered today · {preferredToday} preferred
            </span>
          )}
        </div>
        {recallSet.length === 0 ? (
          <p className="m-0 font-sans text-body-sm text-secondary">
            The refresher draws on the knowledge checks you have answered. Finish a module’s
            knowledge check, and its items will appear here.
          </p>
        ) : (
          <ul className="m-0 list-none space-y-8 p-0">
            {recallSet.map((entry, idx) => (
              <li key={entry.storageKey}>
                <KnowledgeCheck
                  moduleId={entry.moduleId}
                  sectionId={entry.sectionId}
                  item={entry.item}
                  itemNumber={idx + 1}
                  totalItems={recallSet.length}
                  storedOverride={todaysResult(entry)}
                  onRecord={(result) => {
                    recordRefresherResult(today, entry.moduleId, entry.sectionId, entry.item.id, result);
                    track({
                      type: 'refresher_kc_submitted',
                      moduleId: entry.moduleId,
                      sectionId: entry.sectionId,
                      payload: {
                        kcId: entry.item.id,
                        optionId: result.selectedOptionId,
                        isPreferred: result.isPreferred,
                        intervalDays,
                      },
                    });
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <CheckIn intervalDays={intervalDays} onIntervalChange={setIntervalDays} />

      <section aria-label="Check-in reminders" className="mt-10 border-t border-border-light pt-6">
        <RefresherReminders placement="refresher" />
      </section>

      <div className="mt-8">
        <Link
          to="/module/4/section/10"
          className="font-sans text-body-sm font-medium text-action no-underline hover:underline"
        >
          Back to your competency profile →
        </Link>
      </div>
    </div>
  );
}

// ─── Check-in ─────────────────────────────────────────────────────

function CheckIn({
  intervalDays,
  onIntervalChange,
}: {
  intervalDays: MilestoneDays;
  onIntervalChange: (days: MilestoneDays) => void;
}): JSX.Element {
  const { state } = useLearnerProgress();
  const milestone = milestoneFor(intervalDays);
  const { task1, task2 } = currentCommitment(state.reflections);

  const onRadioKey = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    const next = nextRadioIndex(e.key, idx, MILESTONES.length);
    if (next === null) return;
    e.preventDefault();
    const target = MILESTONES[next];
    if (!target) return;
    onIntervalChange(target.days);
    document.getElementById(`refresher-interval-${target.days}`)?.focus();
  };

  return (
    <section
      aria-labelledby="refresher-checkin-heading"
      className="px-4 pb-4 pt-[18px] sm:px-6 sm:pb-5 sm:pt-[22px]"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: '3px solid rgb(var(--diligence))',
      }}
    >
      <Overline className="mb-1" style={{ color: 'rgb(var(--diligence-text))' }}>
        Check-in
      </Overline>
      <h2 id="refresher-checkin-heading" className="m-0 mb-3 font-sans text-h3 font-semibold text-ink">
        Your milestone
      </h2>
      <div role="radiogroup" aria-label="Check-in interval" className="mb-4 flex flex-wrap gap-2">
        {MILESTONES.map((m, idx) => {
          const active = m.days === intervalDays;
          return (
            <button
              key={m.days}
              id={`refresher-interval-${m.days}`}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onIntervalChange(m.days)}
              onKeyDown={(e) => onRadioKey(e, idx)}
              className="font-mono text-[11px] font-bold uppercase"
              style={{
                padding: '6px 10px',
                letterSpacing: '0.05em',
                border: '1px solid rgb(var(--diligence))',
                background: active ? 'rgb(var(--diligence))' : 'transparent',
                color: active ? 'rgb(var(--white))' : 'rgb(var(--diligence-text))',
              }}
            >
              {m.days} days
            </button>
          );
        })}
      </div>
      <p className="m-0 mb-4 font-sans text-body text-ink" style={{ lineHeight: 1.55 }}>
        {milestone.target}
      </p>
      {(task1.trim().length > 0 || task2.trim().length > 0) && (
        <dl className="m-0 mb-5 space-y-2 font-sans text-body-sm">
          {task1.trim().length > 0 && <PlanLine label="Task 1" text={task1} />}
          {task2.trim().length > 0 && <PlanLine label="Task 2" text={task2} />}
        </dl>
      )}
      <ExampleField key={intervalDays} intervalDays={intervalDays} />
    </section>
  );
}

function PlanLine({ label, text }: { label: string; text: string }): JSX.Element {
  return (
    <div
      style={{
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border-light))',
        padding: '8px 12px',
      }}
    >
      <dt className="font-mono text-overline font-bold uppercase text-tertiary" style={{ letterSpacing: '0.1em' }}>
        {label}
      </dt>
      <dd className="m-0 text-body" style={{ lineHeight: 1.55, overflowWrap: 'anywhere' }}>
        {text}
      </dd>
    </div>
  );
}

function ExampleField({ intervalDays }: { intervalDays: MilestoneDays }): JSX.Element {
  const { state, saveRefresherExample } = useLearnerProgress();
  const { track } = useAnalytics();
  const stored = state.refresherExamples?.[String(intervalDays)] ?? '';
  const [draft, setDraft] = useState(stored);
  const [saved, setSaved] = useState(false);
  const canSave = draft.trim().length >= MIN_EXAMPLE_CHARS && draft !== stored;
  const fieldId = `refresher-example-${intervalDays}`;

  const onSave = () => {
    if (!canSave) return;
    saveRefresherExample(intervalDays, draft);
    setSaved(true);
    track({ type: 'refresher_example_saved', payload: { intervalDays, chars: draft.length } });
  };

  return (
    <div>
      <label htmlFor={fieldId} className="mb-1 block font-sans text-body-sm font-semibold text-ink">
        Your {intervalDays}-day example
      </label>
      <p className="m-0 mb-2 font-sans text-body-sm text-secondary">
        Write one specific example from your work since the program: the situation, what you did,
        and what happened.
      </p>
      <textarea
        id={fieldId}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setSaved(false);
        }}
        rows={4}
        className="block w-full resize-y border border-ghost bg-[rgb(var(--white))] p-3 font-sans text-body text-ink placeholder:text-muted focus:border-ink"
        style={{ lineHeight: 1.55 }}
        placeholder="Situation, what you did, what happened…"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          aria-disabled={!canSave}
          className="bg-action px-4 py-2 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] transition-colors duration-[160ms] hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-ghost disabled:text-muted dark:text-[rgb(var(--canvas))]"
        >
          {saved ? 'Saved ✓' : stored.length > 0 ? 'Update example' : 'Save example'}
        </button>
        <span className="font-mono text-caption text-muted">
          Saved to your progress record. Your profile shows it beside the milestone.
        </span>
      </div>
    </div>
  );
}
