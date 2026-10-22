// Endnote keys and formatting for the print Notes section
// (src/components/shared/CitationNotes.tsx). Pure functions over the
// citation registry, kept out of the component file for fast refresh.

import { getCitation, type CitationMeta } from '../data/citations';

// ─── Note keys ─────────────────────────────────────────────────────────

/** One endnote per source-plus-locator: the key is the id and the
 *  resolved locator text ("id#p. 13, Figure 6"; "id#" without one), so two
 *  page keys that resolve to the same pages share a note. */
export function noteKey(id: string, pageKey: string | undefined): string {
  const locator = pageKey ? getCitation(id).pages?.[pageKey] : undefined;
  return `${id}#${locator ?? ''}`;
}

export function splitNoteKey(key: string): { id: string; locator: string | undefined } {
  const at = key.indexOf('#');
  const locator = key.slice(at + 1);
  return { id: key.slice(0, at), locator: locator.length > 0 ? locator : undefined };
}

// ─── Endnote formatting ────────────────────────────────────────────────

// "November 5, 2025" → "November 2025"; any other form is kept as written.
function noteDate(date: string): string {
  const m = /^([A-Z][a-z]+) \d{1,2}, (\d{4})$/.exec(date);
  return m ? `${m[1]} ${m[2]}` : date;
}

/** The note text before the URL, without a trailing separator:
 *  Authors, “Title,” Publisher, Date, locator. An organization that is
 *  both author and publisher is written once. */
export function formatNote(meta: CitationMeta, locator: string | undefined): string {
  const authors = meta.noteAuthors ?? meta.authors;
  const publisher = meta.notePublisher ?? meta.publisher;
  // The comma sits inside the closing quote unless the title already
  // ends in its own punctuation.
  const title = /[?!]$/.test(meta.title) ? `“${meta.title}”` : `“${meta.title},”`;
  const tail = [authors === publisher ? null : publisher, noteDate(meta.date), locator]
    .filter((p): p is string => p !== null && p !== undefined && p.length > 0)
    .join(', ');
  return `${authors}, ${title} ${tail}`;
}
