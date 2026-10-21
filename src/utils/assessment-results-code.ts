// Results code — a one-line summary of a learner's pre/post responses
// that the learner can choose to paste into the organization's own
// Level 1 survey. Responses never leave the browser on their own, so
// this is the path by which cohort-level Level 2 data reaches an
// organization. Nothing is sent over the network.
//
// The code carries no free text: option letters, instrument versions,
// median response times, and an optional participant code the
// organization assigns, restricted to letters, digits, hyphens, and
// underscores and capped at 24 characters.
//
// Format:
//   AIL|{pre version}/{post version}|PRE:{letters}|POST:{letters}|RT:{pre s}/{post s}|ID:{code}
// One letter per item in instrument order; "-" marks an unanswered item
// or an unrecorded time.

export const RESULTS_CODE_PREFIX = 'AIL';

/** Version label for responses recorded before item versioning. */
export const LEGACY_VERSION = 'legacy';
/** Version label for a form answered partly under two item versions. */
export const MIXED_VERSION = 'mixed';

const MISSING = '-';
const MAX_PARTICIPANT_CODE = 24;

export interface ResultsCode {
  preVersion: string;
  postVersion: string;
  preAnswers: string;
  postAnswers: string;
  preMedianSeconds: number | null;
  postMedianSeconds: number | null;
  /** '' when the learner entered none. */
  participantCode: string;
}

interface LetterResponse {
  selectedOptionId: string;
}

interface VersionedResponse {
  instrumentVersion?: string | undefined;
}

interface TimedResponse {
  responseMs?: number | undefined;
}

export function sanitizeParticipantCode(raw: string): string {
  return raw.replace(/[^A-Za-z0-9_-]/g, '').slice(0, MAX_PARTICIPANT_CODE);
}

export function answerLetters(
  itemIds: readonly string[],
  responses: Readonly<Record<string, LetterResponse>>,
): string {
  return itemIds.map((id) => responses[id]?.selectedOptionId ?? MISSING).join('');
}

/** The item version a form was answered under. */
export function formVersion(responses: Readonly<Record<string, VersionedResponse>>): string {
  const versions = new Set(
    Object.values(responses).map((r) => r.instrumentVersion ?? LEGACY_VERSION),
  );
  if (versions.size === 0) return LEGACY_VERSION;
  if (versions.size > 1) return MIXED_VERSION;
  return [...versions][0] ?? LEGACY_VERSION;
}

export function responseTimesMs(responses: Readonly<Record<string, TimedResponse>>): number[] {
  return Object.values(responses)
    .map((r) => r.responseMs)
    .filter((ms): ms is number => typeof ms === 'number' && ms >= 0);
}

/** Median of the recorded times, in whole seconds; null when none. */
export function medianSeconds(valuesMs: readonly number[]): number | null {
  if (valuesMs.length === 0) return null;
  const sorted = [...valuesMs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 1
      ? (sorted[mid] ?? 0)
      : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
  return Math.round(median / 1000);
}

const secondsField = (s: number | null): string => (s === null ? MISSING : String(s));

export function formatResultsCode(code: ResultsCode): string {
  return [
    RESULTS_CODE_PREFIX,
    `${code.preVersion}/${code.postVersion}`,
    `PRE:${code.preAnswers}`,
    `POST:${code.postAnswers}`,
    `RT:${secondsField(code.preMedianSeconds)}/${secondsField(code.postMedianSeconds)}`,
    `ID:${sanitizeParticipantCode(code.participantCode)}`,
  ].join('|');
}

const VERSION = '[A-Za-z0-9.]+';
const RESULTS_CODE_PATTERN = new RegExp(
  `^${RESULTS_CODE_PREFIX}\\|(${VERSION})/(${VERSION})\\|PRE:([A-D-]+)\\|POST:([A-D-]+)\\|RT:(\\d+|-)/(\\d+|-)\\|ID:([A-Za-z0-9_-]{0,${MAX_PARTICIPANT_CODE}})$`,
);

/** Inverse of `formatResultsCode`, for whoever compiles the survey
 *  responses. Returns null for anything that is not a well-formed code. */
export function parseResultsCode(text: string): ResultsCode | null {
  const m = RESULTS_CODE_PATTERN.exec(text.trim());
  if (!m) return null;
  const [, preVersion, postVersion, preAnswers, postAnswers, preRt, postRt, participantCode] = m;
  const seconds = (field: string | undefined): number | null =>
    field === undefined || field === MISSING ? null : Number(field);
  return {
    preVersion: preVersion ?? '',
    postVersion: postVersion ?? '',
    preAnswers: preAnswers ?? '',
    postAnswers: postAnswers ?? '',
    preMedianSeconds: seconds(preRt),
    postMedianSeconds: seconds(postRt),
    participantCode: participantCode ?? '',
  };
}

interface ExportItem {
  id: string;
  constructKey: string;
}

interface ExportResponse extends LetterResponse, TimedResponse {
  isCorrect: boolean;
}

export interface ResultsExportRow {
  itemId: string;
  constructKey: string;
  selectedOptionId: string | null;
  isCorrect: boolean | null;
  responseSeconds: number | null;
}

/** The downloadable JSON: assessment fields only. Reflections, events,
 *  timestamps, and free text stay out. */
export interface ResultsExport {
  format: 'ai-literacy-assessment-results';
  resultsCode: string;
  participantCode: string;
  instrumentVersion: { pre: string; post: string };
  pre: ResultsExportRow[];
  post: ResultsExportRow[];
}

export function exportRows(
  items: readonly ExportItem[],
  responses: Readonly<Record<string, ExportResponse>>,
): ResultsExportRow[] {
  return items.map((item) => {
    const r = responses[item.id];
    return {
      itemId: item.id,
      constructKey: item.constructKey,
      selectedOptionId: r?.selectedOptionId ?? null,
      isCorrect: r ? r.isCorrect : null,
      responseSeconds: typeof r?.responseMs === 'number' ? Math.round(r.responseMs / 1000) : null,
    };
  });
}
