// Version of the pre/post item bank. Stored on every assessment response
// and carried in the results code, so data from revised items is never
// pooled with data from the items they replaced. Bump it whenever any
// item's text, options, or key changes.
//
// 2026.11: twelve items per form (task decomposition and disclosure
// added), PRE-1 rewritten as a scenario, PRE-5 and POST-5 revised,
// POST-4 replaced, and post stems no longer name the concept under test.
// Responses without a version belong to the earlier ten-item form.

export const INSTRUMENT_VERSION = '2026.11';

/** True when any stored response was given against an earlier item bank.
 *  Its option letters then sit beside revised wording, so results views
 *  say so. Scores still come from the stored isCorrect, never re-keyed. */
export function answeredBeforeRevision(
  responses: Readonly<Record<string, { instrumentVersion?: string | undefined }>>,
): boolean {
  return Object.values(responses).some((r) => r.instrumentVersion !== INSTRUMENT_VERSION);
}
