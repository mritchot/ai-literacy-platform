// CitationNotes — the two generated source lists that replace hand-kept
// ones, both built from the registry in src/data/citations.ts.
//
//   • Web: <SourcesList ids> ends a document with a "Sources" section that
//     lists every registry entry the document cites, in order of first
//     citation, each title linked to its url. It follows the sidebar
//     Sources toggle the way the chips do: hidden when sources are hidden.
//   • Print: inside the print shell every <Citation> renders as a
//     superscript endnote number (see Citation.tsx), and <PrintNotes> ends
//     the document with a numbered "Notes" section in corporate endnote
//     style: one note per unique source-plus-locator, in order of first
//     appearance, repeat citations reusing their number:
//       Alex Tamkin and Peter McCrory, “Estimating AI Productivity Gains
//       from Claude Conversations,” Anthropic, November 2025, p. 13,
//       Figure 6, https://www.anthropic.com/research/estimating-productivity-gains
//     Print shows citations whatever the toggle says.
//
// Numbering reads the rendered document rather than a separate list, so
// one mechanism serves markdown documents, TSX pages, and the reference
// items alike: each print superscript carries its note keys (a JSON
// array) in `data-note-keys`, and <PrintNotes> collects them in DOM order from the
// print body once the content has committed (a layout effect, so the
// numbers land before the shell's ready marker), then again on any later
// DOM change.

import { Fragment, useContext, useLayoutEffect, useRef, type ReactNode } from 'react';
import { getCitation } from '../../data/citations';
import { NoteKeysContext } from '../../contexts/EndnotesContext';
import { formatNote, splitNoteKey } from '../../utils/citation-notes';
import { useCitations } from '../../hooks/useCitations';
import { usePrintMode } from '../../contexts/PrintModeContext';

function collectKeys(root: HTMLElement): string[] {
  const seen: string[] = [];
  root.querySelectorAll<HTMLElement>('[data-note-keys]').forEach((el) => {
    const keys = JSON.parse(el.dataset['noteKeys'] ?? '[]') as string[];
    for (const k of keys) if (!seen.includes(k)) seen.push(k);
  });
  return seen;
}

/** A URL that wraps only where a style manual breaks one: after the
 *  `//`, and before a slash, period, hyphen, underscore, query or fragment
 *  mark, `&`, or `=`, so the mark starts the next line. Each segment is an
 *  unbreakable span with a <wbr> between segments; the text is unchanged. */
function breakableUrl(url: string): ReactNode {
  const scheme = /^[a-z][a-z0-9+.-]*:\/\//i.exec(url)?.[0] ?? '';
  const parts = url.slice(scheme.length).split(/(?=[/.\-_?#&=])/);
  return parts.map((p, i) => (
    <Fragment key={i}>
      {i > 0 && <wbr />}
      <span className="whitespace-nowrap">
        {i === 0 ? scheme : ''}
        {p}
      </span>
    </Fragment>
  ));
}

/** The print "Notes" section. Rendered after the document content, inside
 *  the same Suspense boundary, as a direct child of the print body. It
 *  finds that body from its own marker element: a parent's ref is not yet
 *  attached when a child's layout effect runs on first mount. */
export function PrintNotes(): JSX.Element | null {
  const ctx = useContext(NoteKeysContext);
  const setKeys = ctx?.setKeys;
  const markerRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const root = markerRef.current?.closest<HTMLElement>('.print-body');
    if (!root || !setKeys) return;
    setKeys(collectKeys(root));
    const observer = new MutationObserver(() => setKeys(collectKeys(root)));
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [setKeys]);

  const marker = <span ref={markerRef} hidden />;
  if (!ctx || ctx.keys.length === 0) return marker;
  return (
    <section className="print-notes" aria-labelledby="print-notes-heading">
      {marker}
      <h2 id="print-notes-heading" className="font-sans text-h3 font-semibold text-ink">
        Notes
      </h2>
      <ol>
        {ctx.keys.map((key) => {
          const { id, locator } = splitNoteKey(key);
          const meta = getCitation(id);
          return (
            <li key={key}>
              {formatNote(meta, locator)}
              {meta.url && (
                <>
                  {', '}
                  <a href={meta.url}>{breakableUrl(meta.url)}</a>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ─── Web Sources list ──────────────────────────────────────────────────

/**
 * Generated "Sources" section for the end of a document: every entry in
 * `ids` (pass them in order of first citation, de-duplicated), each title
 * linked to its url. Renders nothing in print (the Notes replace it) and
 * nothing while the Sources toggle hides citations, matching the chips.
 */
export function SourcesList({ ids }: { ids: readonly string[] }): JSX.Element | null {
  const printMode = usePrintMode();
  const { showCitations } = useCitations();
  if (printMode || !showCitations || ids.length === 0) return null;
  return (
    <section aria-labelledby="document-sources-heading">
      <hr className="my-8 border-0 border-t border-border-light" />
      <h2 id="document-sources-heading" className="mb-3 mt-10 font-sans text-h2 font-semibold text-ink">
        Sources
      </h2>
      <ul className="my-4 list-disc space-y-1.5 pl-5 font-sans text-body text-body">
        {ids.map((id) => {
          const s = getCitation(id);
          // The short publisher form the endnotes use, named once when the
          // publisher is also the author.
          const publisher = s.notePublisher ?? s.publisher;
          const sameAsAuthor = publisher === s.authors || publisher === s.noteAuthors;
          const tail = [sameAsAuthor ? null : publisher, s.date]
            .filter((p): p is string => p !== null)
            .join(', ');
          return (
            <li key={id}>
              <strong className="font-semibold text-ink">{s.authors}</strong>
              {' — '}
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-action underline decoration-1 underline-offset-2 transition-colors duration-[160ms] hover:text-action-hover"
              >
                <em className="italic">{s.title}</em>
              </a>
              {` (${tail})`}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
