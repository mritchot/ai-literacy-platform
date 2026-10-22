// Program metadata — module sequence, sections, and 4D competency emphasis.
// Drives sidebar navigation, landing-page cards, and route definitions.

export type CompetencyKey = 'delegation' | 'description' | 'discernment' | 'diligence';

type SequenceLetter = 'C' | 'E' | 'M' | 'A';

export type SectionState = 'todo' | 'current' | 'done';

interface SectionMeta {
  id: number;
  title: string;
  state: SectionState;
}

export interface ModuleMeta {
  id: 1 | 2 | 3 | 4;
  seq: SequenceLetter;
  label: string; // Sequence label (Context, Evidence, Mechanism, Application)
  title: string;
  duration: string;
  shortDescription: string;
  competencies: CompetencyKey[];
  activities: number;
  objectives: number;
  progress: number; // 0–1
  sections: SectionMeta[];
}

interface CompetencyMeta {
  key: CompetencyKey;
  label: string;
  description: string;
}

export const COMPETENCIES: CompetencyMeta[] = [
  { key: 'delegation', label: 'Delegation', description: 'Deciding whether and how to use AI' },
  { key: 'description', label: 'Description', description: 'Specifying the task clearly' },
  { key: 'discernment', label: 'Discernment', description: 'Judging what comes back' },
  { key: 'diligence', label: 'Diligence', description: 'Owning and disclosing what you ship' },
];

// Module durations (re-timed October 2026 from the final content). Each
// range is reading time at 230 wpm (low) and 200 wpm (high) over the words
// a learner sees: section text and open callouts at first render, check
// stems and options, the feedback for one chosen option per check, and
// what activities reveal (later tabs, debriefs, sample drafts). Collapsed
// evidence notes are left out. On top come allowances per interaction, in
// minutes, low to high: 0.25-0.5 per decision, 0.5-1 per chart or table
// explored, 0.5-1 per short note, 1.5-3 per required reflection, 3-6 per
// authored artifact, 1-2 per open exploration, 0-1.5 per optional
// reflection. Totals are rounded to the nearest five minutes. The landing
// total, the ROI model, and the build hub all read these strings.
export const MODULES: ModuleMeta[] = [
  {
    id: 1,
    seq: 'C',
    label: 'Context',
    title: 'Why AI literacy matters now',
    duration: '35–45 min',
    shortDescription: 'How AI is reshaping knowledge work, and why literacy has to accompany the tool.',
    competencies: ['delegation', 'diligence'],
    activities: 2,
    objectives: 4,
    progress: 0,
    sections: [
      { id: 1, title: 'You already use AI. Can you prove it’s working?', state: 'todo' },
      { id: 2, title: 'The market picture', state: 'todo' },
      { id: 3, title: 'Data narrative — the workforce shift', state: 'todo' },
      { id: 4, title: 'The invisible problem', state: 'todo' },
      { id: 5, title: 'Stigma reflection — a shared vocabulary', state: 'todo' },
      { id: 6, title: 'What this program builds', state: 'todo' },
      { id: 7, title: 'Knowledge check', state: 'todo' },
      { id: 8, title: 'Transition to Module 2', state: 'todo' },
    ],
  },
  {
    id: 2,
    seq: 'E',
    label: 'Evidence',
    title: 'How AI is actually being used at work',
    duration: '45–60 min',
    shortDescription: 'Behavioral evidence vs. self-report, augmentation vs. automation, and where the gaps are.',
    competencies: ['delegation', 'discernment'],
    activities: 2,
    objectives: 4,
    progress: 0,
    sections: [
      { id: 1, title: 'Opening hook', state: 'todo' },
      { id: 2, title: 'What the workforce is actually doing', state: 'todo' },
      { id: 3, title: 'Dashboard — augmentation vs. automation', state: 'todo' },
      { id: 4, title: 'Where the productivity gains concentrate', state: 'todo' },
      { id: 5, title: 'Dashboard — productivity distributions', state: 'todo' },
      { id: 6, title: 'The gap between speed and judgment', state: 'todo' },
      { id: 7, title: 'Knowledge check', state: 'todo' },
      { id: 8, title: 'Transition to Module 3', state: 'todo' },
    ],
  },
  {
    id: 3,
    seq: 'M',
    label: 'Mechanism',
    title: 'Understanding how language models work',
    duration: '50–65 min',
    shortDescription: 'Tokenization, next-token prediction, context windows, and the diagnostic pairs behind workplace AI failures.',
    competencies: ['description', 'discernment'],
    activities: 3,
    objectives: 4,
    progress: 0,
    sections: [
      { id: 1, title: 'Opening hook', state: 'todo' },
      { id: 2, title: 'How text becomes data — tokenization', state: 'todo' },
      { id: 3, title: 'Tokenizer playground', state: 'todo' },
      { id: 4, title: 'How output gets generated — next-token prediction', state: 'todo' },
      { id: 5, title: 'Next-token prediction in action', state: 'todo' },
      { id: 6, title: 'Context windows and working memory', state: 'todo' },
      { id: 7, title: 'Context window scenario', state: 'todo' },
      { id: 8, title: 'Steerability', state: 'todo' },
      { id: 9, title: 'When properties meet', state: 'todo' },
      { id: 10, title: 'Knowledge check', state: 'todo' },
      { id: 11, title: 'Transition to Module 4', state: 'todo' },
    ],
  },
  {
    id: 4,
    seq: 'A',
    label: 'Application',
    title: 'Evaluating AI outputs and working responsibly',
    duration: '70–105 min',
    shortDescription: 'Five practice activities (decompose, reformulate, verify, refine, and document) that combine all four competencies in one workflow.',
    competencies: ['delegation', 'description', 'discernment', 'diligence'],
    activities: 5,
    objectives: 5,
    progress: 0,
    sections: [
      { id: 1, title: 'Opening hook — putting it all together', state: 'todo' },
      { id: 2, title: 'Task decomposition', state: 'todo' },
      { id: 3, title: 'Prompt reformulation', state: 'todo' },
      { id: 4, title: 'Knowledge check — Delegation & Description', state: 'todo' },
      { id: 5, title: 'Output verification', state: 'todo' },
      { id: 6, title: 'Iterative refinement', state: 'todo' },
      { id: 7, title: 'Knowledge check — Discernment & the loop', state: 'todo' },
      { id: 8, title: 'Diligence statement builder', state: 'todo' },
      { id: 9, title: 'Program closing', state: 'todo' },
      { id: 10, title: 'Your competency profile', state: 'todo' },
    ],
  },
];

// Pre/post assessment pacing, in minutes per item, timed like the modules:
// the stems and options run about 229 words an item (2026.11 forms), read
// at 230 and 200 wpm, plus 0.25-0.5 minutes to decide. The assessment
// intro screens, the landing total, and the ROI model all use it.
export const ASSESSMENT_MINUTES_PER_ITEM = { low: 1.25, high: 1.65 } as const;

/** Minutes for one assessment form of `itemCount` items, rounded up. */
export function assessmentMinutes(itemCount: number): { low: number; high: number } {
  return {
    low: Math.ceil(itemCount * ASSESSMENT_MINUTES_PER_ITEM.low),
    high: Math.ceil(itemCount * ASSESSMENT_MINUTES_PER_ITEM.high),
  };
}

/** Parse a module duration ("35–45 min" or "20 min") to [low, high]. */
export function parseDurationMinutes(duration: string): [number, number] {
  const range = /(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)/.exec(duration);
  if (range) return [Number(range[1]), Number(range[2])];
  const single = /(\d+(?:\.\d+)?)/.exec(duration);
  if (single) return [Number(single[1]), Number(single[1])];
  // Fail loudly: a silent zero would understate every total built on it.
  throw new Error(`Unparseable module duration: "${duration}"`);
}

/** Sum of the module durations, in minutes. */
export const MODULE_MINUTES = MODULES.reduce(
  (acc, m) => {
    const [low, high] = parseDurationMinutes(m.duration);
    return { low: acc.low + low, high: acc.high + high };
  },
  { low: 0, high: 0 },
);

/** Modules plus one pre and one post form of the given lengths. */
export function programMinutes(
  preItemCount: number,
  postItemCount: number,
): { low: number; high: number } {
  const pre = assessmentMinutes(preItemCount);
  const post = assessmentMinutes(postItemCount);
  return {
    low: MODULE_MINUTES.low + pre.low + post.low,
    high: MODULE_MINUTES.high + pre.high + post.high,
  };
}

export const TOTAL_OBJECTIVES = MODULES.reduce((acc, m) => acc + m.objectives, 0);
export const TOTAL_ACTIVITIES = MODULES.reduce((acc, m) => acc + m.activities, 0);

export function getModule(id: number): ModuleMeta | undefined {
  return MODULES.find((m) => m.id === id);
}

// Throwing variant for the module route roots, where a missing id is a
// routing bug, not a recoverable state.
export function getModuleOrThrow(id: number): ModuleMeta {
  const m = getModule(id);
  if (!m) throw new Error(`Module ${id} not found`);
  return m;
}
