// LearnerProgressContext — current module/section, completion (split into
// `scrolled` + `interactionComplete` per 4E spec §11.1), KC responses,
// reflection text, action commitments, and section view-state for completion
// logic. Persisted via useLocalStorage under `ail.progress`.
//
// **Completion model (4E §11.5):** A section is complete when BOTH
// `scrolledSections[key]` AND `interactionCompleteSections[key]` are true.
// For explanatory/transition sections, SectionContainer fires
// `markInteractionComplete` on mount (no interaction required), so scrolling
// 90% of the way down is the only remaining gate. For interactive sections,
// the section's own component fires `markInteractionComplete` when its
// component-spec condition is met, and the scroll sentinel fires the other
// half.

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { MODULES, type ModuleMeta, type SectionState } from '../data/program';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SectionPosition {
  moduleId: number;
  sectionId: number;
}

export interface KnowledgeCheckResult {
  selectedOptionId: string;
  isPreferred: boolean;
  timestamp: number;
}

export interface LearnerProgressState {
  current: SectionPosition | null;
  // 4E §11.1: section completion is split into two bits. `scrolled` is set by
  // the SectionContainer 90% scroll sentinel; `interactionComplete` is set by
  // the section's own component when its completion condition is met (or by
  // SectionContainer on mount for explanatory/transition sections that have
  // no interaction).
  scrolledSections: Record<string, true>; // key: `${moduleId}.${sectionId}`
  interactionCompleteSections: Record<string, true>; // key: `${moduleId}.${sectionId}`
  // Legacy single-bit completion field, retained for backward-compat with any
  // persisted state from before the split. Treated as both `scrolled` and
  // `interactionComplete` by the migration in `state` below — never written.
  completedSections: Record<string, true>;
  knowledgeChecks: Record<string, KnowledgeCheckResult>; // key: `${moduleId}.${sectionId}.${checkId}`
  reflections: Record<string, string>; // key: `${moduleId}.${sectionId}.${promptId}`
  // Section view-state used for tab-coverage completion logic (P3 needs ≥2 of 3
  // tabs viewed; P4 needs ≥1 tab viewed AND a commitment field engaged).
  viewedTabs: Record<string, true>; // key: `${moduleId}.${sectionId}.${tabId}`
  engagedFlags: Record<string, true>; // key: `${moduleId}.${sectionId}.${flagId}`
  // Active reading time per section (ms). Accumulated by the tracker
  // effect below — only ticks while the tab is visible AND the user has
  // shown activity within `IDLE_MS`. Each section is capped at
  // `PER_SECTION_CAP_MS` to bound any walk-away artifact. Key:
  // `${moduleId}.${sectionId}`. Read by the admin dashboard as the
  // honest replacement for the old `max(ts) - min(ts)` session-span.
  activeTimeMs: Record<string, number>;
}

const INITIAL: LearnerProgressState = {
  current: null,
  scrolledSections: {},
  interactionCompleteSections: {},
  completedSections: {},
  knowledgeChecks: {},
  reflections: {},
  viewedTabs: {},
  engagedFlags: {},
  activeTimeMs: {},
};

// ─── Active-time tracker config ─────────────────────────────────────
//
// The tracker only counts a section's time when the tab is visible AND
// the learner has been active within the idle threshold. It runs on a
// fixed heartbeat and adds one heartbeat-worth of time per tick.
//
// Heartbeat 10s + idle 60s + cap 30min is the standard "visibility +
// activity" recipe; see the analytics rationale in
// `course-info/process-journal.md`.
const HEARTBEAT_MS = 10_000;
const IDLE_MS = 60_000;
const PER_SECTION_CAP_MS = 30 * 60_000;
// Only count time when the URL hash points at a real section. Excludes
// the landing page, admin dashboard, thank-you page, and any other
// non-instructional surface — those shouldn't bloat learning-time
// metrics even when `state.current` still holds the last visited
// section's coordinates.
const SECTION_HASH_RE = /^#\/module\/\d+\/section\/\d+/;

interface LearnerProgressValue {
  state: LearnerProgressState;
  // 4E §11.5 split API. Each section's two completion bits are tracked
  // independently — the section is "complete" when both are true.
  markScrolled: (moduleId: number, sectionId: number) => void;
  markInteractionComplete: (moduleId: number, sectionId: number) => void;
  setCurrentSection: (moduleId: number, sectionId: number) => void;
  recordKnowledgeCheck: (
    moduleId: number,
    sectionId: number,
    checkId: string,
    result: KnowledgeCheckResult,
  ) => void;
  saveReflection: (moduleId: number, sectionId: number, promptId: string, text: string) => void;
  markTabViewed: (moduleId: number, sectionId: number, tabId: string) => void;
  markEngaged: (moduleId: number, sectionId: number, flagId: string) => void;
  // Add `ms` to a section's accumulated active reading time, capped at
  // `PER_SECTION_CAP_MS`. Used by the tracker effect; not normally
  // called directly by components.
  addActiveTime: (moduleId: number, sectionId: number, ms: number) => void;
  isSectionComplete: (moduleId: number, sectionId: number) => boolean;
  isSectionScrolled: (moduleId: number, sectionId: number) => boolean;
  isSectionInteractionComplete: (moduleId: number, sectionId: number) => boolean;
  getKnowledgeCheck: (
    moduleId: number,
    sectionId: number,
    checkId: string,
  ) => KnowledgeCheckResult | undefined;
  getReflection: (moduleId: number, sectionId: number, promptId: string) => string;
  getViewedTabCount: (moduleId: number, sectionId: number) => number;
  isEngaged: (moduleId: number, sectionId: number, flagId: string) => boolean;
}

const LearnerProgressContext = createContext<LearnerProgressValue | null>(null);

const k = (moduleId: number, sectionId: number, leaf?: string): string =>
  leaf === undefined ? `${moduleId}.${sectionId}` : `${moduleId}.${sectionId}.${leaf}`;

export function LearnerProgressProvider({ children }: { children: ReactNode }): JSX.Element {
  const [rawState, setState] = useLocalStorage<LearnerProgressState>('ail.progress', INITIAL);

  // Migration: any keys present in the legacy `completedSections` map (from
  // the pre-split model) are promoted to BOTH `scrolledSections` AND
  // `interactionCompleteSections`, so persisted progress doesn't silently
  // regress. New writes go to the split maps only.
  const state = useMemo<LearnerProgressState>(() => {
    const legacyCompleted = rawState.completedSections ?? {};
    const scrolledMerged = {
      ...legacyCompleted,
      ...(rawState.scrolledSections ?? {}),
    };
    const interactionMerged = {
      ...legacyCompleted,
      ...(rawState.interactionCompleteSections ?? {}),
    };
    return {
      ...INITIAL,
      ...rawState,
      scrolledSections: scrolledMerged,
      interactionCompleteSections: interactionMerged,
      completedSections: legacyCompleted,
      knowledgeChecks: { ...INITIAL.knowledgeChecks, ...rawState.knowledgeChecks },
      reflections: { ...INITIAL.reflections, ...rawState.reflections },
      viewedTabs: { ...INITIAL.viewedTabs, ...(rawState.viewedTabs ?? {}) },
      engagedFlags: { ...INITIAL.engagedFlags, ...(rawState.engagedFlags ?? {}) },
      activeTimeMs: { ...INITIAL.activeTimeMs, ...(rawState.activeTimeMs ?? {}) },
    };
  }, [rawState]);

  // ── Stable setters ── never reference `state` directly, so their identity
  // stays referentially equal across re-renders even when state changes.
  // Effects that depend on these don't re-fire on every state mutation.
  const markScrolled = useCallback(
    (moduleId: number, sectionId: number) =>
      setState((prev) => {
        const key = k(moduleId, sectionId);
        if (prev.scrolledSections?.[key]) return prev;
        return {
          ...prev,
          scrolledSections: { ...(prev.scrolledSections ?? {}), [key]: true },
        };
      }),
    [setState],
  );

  const markInteractionComplete = useCallback(
    (moduleId: number, sectionId: number) =>
      setState((prev) => {
        const key = k(moduleId, sectionId);
        if (prev.interactionCompleteSections?.[key]) return prev;
        return {
          ...prev,
          interactionCompleteSections: {
            ...(prev.interactionCompleteSections ?? {}),
            [key]: true,
          },
        };
      }),
    [setState],
  );

  const setCurrentSection = useCallback(
    (moduleId: number, sectionId: number) =>
      setState((prev) => {
        if (
          prev.current &&
          prev.current.moduleId === moduleId &&
          prev.current.sectionId === sectionId
        ) {
          return prev;
        }
        return { ...prev, current: { moduleId, sectionId } };
      }),
    [setState],
  );

  const recordKnowledgeCheck = useCallback(
    (moduleId: number, sectionId: number, checkId: string, result: KnowledgeCheckResult) =>
      setState((prev) => ({
        ...prev,
        knowledgeChecks: {
          ...prev.knowledgeChecks,
          [k(moduleId, sectionId, checkId)]: result,
        },
      })),
    [setState],
  );

  const saveReflection = useCallback(
    (moduleId: number, sectionId: number, promptId: string, text: string) =>
      setState((prev) => ({
        ...prev,
        reflections: {
          ...prev.reflections,
          [k(moduleId, sectionId, promptId)]: text,
        },
      })),
    [setState],
  );

  const markTabViewed = useCallback(
    (moduleId: number, sectionId: number, tabId: string) =>
      setState((prev) => {
        const key = k(moduleId, sectionId, tabId);
        if (prev.viewedTabs?.[key]) return prev;
        return { ...prev, viewedTabs: { ...(prev.viewedTabs ?? {}), [key]: true } };
      }),
    [setState],
  );

  const markEngaged = useCallback(
    (moduleId: number, sectionId: number, flagId: string) =>
      setState((prev) => {
        const key = k(moduleId, sectionId, flagId);
        if (prev.engagedFlags?.[key]) return prev;
        return { ...prev, engagedFlags: { ...(prev.engagedFlags ?? {}), [key]: true } };
      }),
    [setState],
  );

  const addActiveTime = useCallback(
    (moduleId: number, sectionId: number, ms: number) =>
      setState((prev) => {
        const key = k(moduleId, sectionId);
        const cur = prev.activeTimeMs?.[key] ?? 0;
        const next = Math.min(cur + ms, PER_SECTION_CAP_MS);
        // Idempotent at the cap — skip the state update so the cap
        // doesn't generate a write per tick once reached.
        if (next === cur) return prev;
        return {
          ...prev,
          activeTimeMs: { ...(prev.activeTimeMs ?? {}), [key]: next },
        };
      }),
    [setState],
  );

  // ── Active-time tracker ─────────────────────────────────────────
  //
  // Heartbeats every HEARTBEAT_MS while: (a) `state.current` points at
  // a real section, (b) the URL hash matches that section (so the
  // landing/admin/thank-you pages don't accumulate even though
  // `state.current` is stale across navigation), (c) the tab is
  // visible (`document.visibilityState`), and (d) the learner has
  // shown activity within IDLE_MS. The effect re-runs only when the
  // current section *changes* (the section's identity, not the rest of
  // state — the setter spread preserves the `current` object
  // reference), so the listeners and interval are stable across
  // ticks.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const current = state.current;
    if (!current) return;

    let lastActivityAt = Date.now();
    let throttled = false;
    const onActivity = () => {
      if (throttled) return;
      throttled = true;
      lastActivityAt = Date.now();
      window.setTimeout(() => {
        throttled = false;
      }, 1000);
    };
    const activityEvents: Array<keyof WindowEventMap> = [
      'mousemove',
      'scroll',
      'keydown',
      'touchstart',
      'pointerdown',
    ];
    for (const e of activityEvents) {
      window.addEventListener(e, onActivity, { passive: true });
    }

    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastActivityAt > IDLE_MS) return;
      if (!SECTION_HASH_RE.test(window.location.hash)) return;
      addActiveTime(current.moduleId, current.sectionId, HEARTBEAT_MS);
    };
    const intervalId = window.setInterval(tick, HEARTBEAT_MS);

    return () => {
      window.clearInterval(intervalId);
      for (const e of activityEvents) {
        window.removeEventListener(e, onActivity);
      }
    };
  }, [state.current, addActiveTime]);

  // ── Reactive getters ── new identity on each state change is fine because
  // they're called inside render or memoized effects that depend on `state`.
  const value = useMemo<LearnerProgressValue>(
    () => ({
      state,
      markScrolled,
      markInteractionComplete,
      setCurrentSection,
      recordKnowledgeCheck,
      saveReflection,
      markTabViewed,
      markEngaged,
      addActiveTime,
      isSectionComplete: (moduleId, sectionId) => {
        const key = k(moduleId, sectionId);
        return Boolean(
          state.scrolledSections[key] && state.interactionCompleteSections[key],
        );
      },
      isSectionScrolled: (moduleId, sectionId) =>
        Boolean(state.scrolledSections[k(moduleId, sectionId)]),
      isSectionInteractionComplete: (moduleId, sectionId) =>
        Boolean(state.interactionCompleteSections[k(moduleId, sectionId)]),
      getKnowledgeCheck: (moduleId, sectionId, checkId) =>
        state.knowledgeChecks[k(moduleId, sectionId, checkId)],
      getReflection: (moduleId, sectionId, promptId) =>
        state.reflections[k(moduleId, sectionId, promptId)] ?? '',
      getViewedTabCount: (moduleId, sectionId) => {
        const prefix = `${moduleId}.${sectionId}.`;
        return Object.keys(state.viewedTabs).filter((key) => key.startsWith(prefix)).length;
      },
      isEngaged: (moduleId, sectionId, flagId) =>
        Boolean(state.engagedFlags[k(moduleId, sectionId, flagId)]),
    }),
    [
      state,
      markScrolled,
      markInteractionComplete,
      setCurrentSection,
      recordKnowledgeCheck,
      saveReflection,
      markTabViewed,
      markEngaged,
      addActiveTime,
    ],
  );

  return (
    <LearnerProgressContext.Provider value={value}>{children}</LearnerProgressContext.Provider>
  );
}

export function useLearnerProgress(): LearnerProgressValue {
  const ctx = useContext(LearnerProgressContext);
  if (!ctx) throw new Error('useLearnerProgress must be used within LearnerProgressProvider');
  return ctx;
}

// Resolves the static MODULES list with live completion data from the
// LearnerProgressContext. Each section's `state` becomes 'done' | 'current'
// | 'todo' based on the AND of `scrolledSections` + `interactionCompleteSections`
// and `current`, and each module's `progress` becomes (done / total).
// Consumers (Sidebar, LandingPage) call this instead of importing MODULES
// directly so completion ticks live.
export function useResolvedModules(): ModuleMeta[] {
  const { state } = useLearnerProgress();
  return useMemo(() => {
    const scrolled = state.scrolledSections;
    const interacted = state.interactionCompleteSections;
    const current = state.current;
    return MODULES.map((m) => {
      const total = m.sections.length;
      let doneCount = 0;
      const sections = m.sections.map((s) => {
        const key = `${m.id}.${s.id}`;
        const isDone = Boolean(scrolled[key] && interacted[key]);
        const isCurrent =
          !isDone && current?.moduleId === m.id && current.sectionId === s.id;
        if (isDone) doneCount += 1;
        const resolvedState: SectionState = isDone
          ? 'done'
          : isCurrent
            ? 'current'
            : 'todo';
        return { ...s, state: resolvedState };
      });
      const progress = total === 0 ? 0 : doneCount / total;
      return { ...m, sections, progress };
    });
  }, [state.scrolledSections, state.interactionCompleteSections, state.current]);
}
