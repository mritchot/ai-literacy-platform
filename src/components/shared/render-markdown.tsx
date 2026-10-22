// Fuller markdown renderer for the needs-analysis artifact pages. The
// Module 4 outputs use `render-markdown-lite` (paragraphs, bold, lists
// only); the needs-analysis documents use a wider surface — H1–H3, inline
// links, bold + italic (including a whole italic footnote paragraph that
// itself contains a link), pipe tables, blockquotes, ordered/unordered
// lists, and horizontal rules. Rather than extend the lite renderer (and
// risk regressing Module 4) or pull in a markdown dependency (which would
// fight the single-file/self-hosted build), this is a small self-contained
// renderer scoped to exactly the constructs the finalized content uses.
//
// Footnotes: the source uses a literal superscript glyph (¹) inline and a
// separated italic paragraph at the foot of the document, so italics +
// horizontal rules + the glyph reproduce them. A paragraph that opens with
// the glyph is set as a note (smaller, secondary color).
//
// Citations: a `{{cite:…}}` token renders the same <Citation> chip the
// modules use (a superscript endnote number in print). Syntax:
//
//   {{cite:tamkin-mccrory-2025#median-savings-81}}       one source + locator
//   {{cite:lee-2025}}                                     no locator
//   {{cite:handa-2025#aug-auto-split-57-43,appel-mccrory-tamkin-2025#directive-trend-v3}}
//
// Inside the braces: comma-separated registry ids (src/data/citations.ts),
// each optionally followed by `#pageKey` from that entry's `pages` map. No
// spaces. Write the token directly after the claim with no space before it
// (`…an 81% median{{cite:…}}.`): the chip supplies its own leading space,
// and nothing is left behind when the Sources toggle hides chips. The
// double-brace prefix never occurs in prose, and scripts/verify-citations.mjs
// fails the build when a token names an unregistered id or pageKey.

import { type ReactNode } from 'react';
import { Citation } from './Citation';
import { TABLE, TABLE_FRAME, TD, TH, THEAD } from './table-classes';

/** Matches one citation token; group 1 is the comma-separated body. */
export const CITE_TOKEN_SOURCE = String.raw`\{\{cite:([^{}\s]+)\}\}`;

/** Parse a token body ("a#k1,b") into aligned ids and page keys. */
export function parseCiteToken(body: string): { ids: string[]; pageKeys: Array<string | undefined> } {
  const ids: string[] = [];
  const pageKeys: Array<string | undefined> = [];
  for (const part of body.split(',')) {
    const at = part.indexOf('#');
    ids.push(at === -1 ? part : part.slice(0, at));
    pageKeys.push(at === -1 ? undefined : part.slice(at + 1));
  }
  return { ids, pageKeys };
}

/** Registry ids cited by `{{cite:…}}` tokens across `texts`, in order of
 *  first citation, de-duplicated — the input to <SourcesList>. */
export function citedIds(...texts: readonly string[]): string[] {
  const out: string[] = [];
  const re = new RegExp(CITE_TOKEN_SOURCE, 'g');
  for (const text of texts) {
    for (const m of text.matchAll(re)) {
      for (const id of parseCiteToken(m[1]!).ids) if (!out.includes(id)) out.push(id);
    }
  }
  return out;
}

// ─── Inline ────────────────────────────────────────────────────────────
//
// Citation tokens, links `[text](url)`, bold `**text**`, italic `*text*`. Recursive so the
// constructs nest the way the source nests them: Sources entries wrap an
// italic title inside a link (`[*Title*](url)`), and the delivery-note
// footnote is one long italic span that contains a link. A fresh RegExp is
// created per call (not a shared module-level one) so the recursive calls
// don't clobber each other's `lastIndex`.

export function renderInline(text: string, keyBase = 'i'): ReactNode {
  const re = new RegExp(
    `${CITE_TOKEN_SOURCE}|\\[([^\\]]+)\\]\\(([^)]+)\\)|\\*\\*([^*]+)\\*\\*|\\*([^*\\n]+)\\*`,
    'g',
  );
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyBase}-${k++}`;
    // Group numbers: 1 cite body, 2–3 link, 4 bold, 5 italic.
    if (m[1] !== undefined) {
      const { ids, pageKeys } = parseCiteToken(m[1]);
      out.push(<Citation key={key} ids={ids} pageKeys={pageKeys} />);
    } else if (m[2] !== undefined && m[3] !== undefined) {
      // Scheme allowlist: a stray `[x](javascript:...)` in future markdown
      // must never become an executable anchor. All current content uses
      // https/mailto/#, so rendered output is unchanged; a disallowed
      // scheme renders as a non-navigating anchor (no href).
      const rawHref = m[3].trim();
      const safeHref = /^(https?:|mailto:|#)/i.test(rawHref) ? m[3] : undefined;
      // Internal hash-route links (`#/...`) navigate within the HashRouter SPA,
      // so they must stay in the same tab. External links (https/mailto) keep
      // opening in a new tab with noopener/noreferrer.
      const isInternal = safeHref !== undefined && rawHref.startsWith('#');
      out.push(
        <a
          key={key}
          href={safeHref}
          {...(isInternal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
          className="font-medium text-action underline decoration-1 underline-offset-2 transition-colors duration-[160ms] hover:text-action-hover"
        >
          {renderInline(m[2], key)}
        </a>,
      );
    } else if (m[4] !== undefined) {
      out.push(
        <strong key={key} className="font-semibold text-ink">
          {renderInline(m[4], key)}
        </strong>,
      );
    } else if (m[5] !== undefined) {
      out.push(
        <em key={key} className="italic">
          {renderInline(m[5], key)}
        </em>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// ─── Block ─────────────────────────────────────────────────────────────
//
// Every block takes the module treatment (SectionContainer and the shared
// module components): IBM Plex Sans body at text-body, the Source Serif
// title for the document H1, sans semibold subheads, the module reference
// table, and the BottleneckCallout frame for blockquotes.

const HR_RE = /^\s*([-*_])\1{2,}\s*$/;
const HEADING_RE = /^\s*(#{1,6})\s+(.*)$/;
const BLOCKQUOTE_RE = /^\s*>\s?/;
const UL_RE = /^\s*[-*•]\s+/;
const OL_RE = /^\s*\d+\.\s+/;
const TABLE_ROW_RE = /^\s*\|.*\|\s*$/;
const TABLE_SEP_RE = /^\s*\|[\s:|-]+\|\s*$/;
const FOOTNOTE_RE = /^[¹²³⁴⁵⁶⁷⁸⁹]/;

function isTableStart(line: string, next: string | undefined): boolean {
  return TABLE_ROW_RE.test(line) && next !== undefined && TABLE_SEP_RE.test(next);
}

function isSpecial(line: string, next: string | undefined): boolean {
  return (
    HEADING_RE.test(line) ||
    HR_RE.test(line) ||
    BLOCKQUOTE_RE.test(line) ||
    UL_RE.test(line) ||
    OL_RE.test(line) ||
    isTableStart(line, next)
  );
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

function heading(level: number, content: string, id: number): ReactNode {
  const inner = renderInline(content, `h${id}`);
  // H1 is the document title: the module section-title treatment. The
  // `doc-title` hook lets the print stylesheet hide it, since the print
  // shell's masthead already sets the title.
  if (level === 1)
    return (
      <h1
        key={id}
        className="doc-title m-0 mb-5 font-display text-title font-normal text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        {inner}
      </h1>
    );
  if (level === 2)
    return (
      <h2 key={id} className="mb-3 mt-10 font-sans text-h2 font-semibold text-ink">
        {inner}
      </h2>
    );
  if (level === 3)
    return (
      <h3 key={id} className="mb-2 mt-8 font-sans text-h3 font-semibold text-ink">
        {inner}
      </h3>
    );
  return (
    <h4 key={id} className="mb-2 mt-6 font-sans text-h4 font-semibold text-ink">
      {inner}
    </h4>
  );
}

export function renderMarkdown(raw: string): ReactNode[] {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let id = 0;

  while (i < lines.length) {
    // The `!` assertions on lines[i] below are justified by the loop
    // bounds (every access is guarded by i < lines.length); the h[1]!/
    // h[2]! pair is guaranteed by HEADING_RE's two capture groups.
    const line = lines[i]!;

    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }

    if (HR_RE.test(line)) {
      blocks.push(<hr key={id++} className="my-8 border-0 border-t border-border-light" />);
      i++;
      continue;
    }

    const h = line.match(HEADING_RE);
    if (h) {
      blocks.push(heading(h[1]!.length, h[2]!.trim(), id++));
      i++;
      continue;
    }

    if (isTableStart(line, lines[i + 1])) {
      const header = splitRow(line);
      i += 2; // header row + separator
      const rows: string[][] = [];
      while (i < lines.length && TABLE_ROW_RE.test(lines[i]!)) {
        rows.push(splitRow(lines[i]!));
        i++;
      }
      const tid = id++;
      blocks.push(
        // `my-6 overflow-x-auto` is also the print stylesheet's hook for
        // markdown tables; keep both classes on the wrapper.
        <div key={tid} className={`my-6 ${TABLE_FRAME}`}>
          <table className={TABLE}>
            <thead className={THEAD}>
              <tr>
                {header.map((c, ci) => (
                  <th key={ci} scope="col" className={TH}>
                    {renderInline(c, `th${tid}-${ci}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td key={ci} className={TD}>
                      {renderInline(c, `td${tid}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (BLOCKQUOTE_RE.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && BLOCKQUOTE_RE.test(lines[i]!)) {
        quote.push(lines[i]!.replace(BLOCKQUOTE_RE, ''));
        i++;
      }
      const qid = id++;
      blocks.push(
        <blockquote
          key={qid}
          className="my-6 border border-border bg-surface-warm font-sans text-body-sm text-body"
          style={{ borderLeft: '3px solid rgb(var(--discernment))', padding: '16px 20px' }}
        >
          {renderInline(quote.join(' '), `bq${qid}`)}
        </blockquote>,
      );
      continue;
    }

    if (UL_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length && UL_RE.test(lines[i]!)) {
        items.push(lines[i]!.replace(UL_RE, ''));
        i++;
      }
      const lid = id++;
      blocks.push(
        <ul key={lid} className="my-4 list-disc space-y-1.5 pl-5 font-sans text-body text-body">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, `ul${lid}-${idx}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (OL_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length && OL_RE.test(lines[i]!)) {
        items.push(lines[i]!.replace(OL_RE, ''));
        i++;
      }
      const lid = id++;
      blocks.push(
        <ol key={lid} className="my-4 list-decimal space-y-1.5 pl-5 font-sans text-body text-body">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, `ol${lid}-${idx}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Paragraph — consume consecutive non-blank, non-special lines.
    const para: string[] = [];
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]!) &&
      !isSpecial(lines[i]!, lines[i + 1])
    ) {
      para.push(lines[i]!.trim());
      i++;
    }
    const pid = id++;
    const text = para.join(' ');
    // A paragraph that opens with a superscript numeral is a footnote
    // (the documents use literal ¹ ² glyphs): set a step down, in the
    // secondary text color the modules use for notes.
    blocks.push(
      <p
        key={pid}
        className={
          FOOTNOTE_RE.test(text)
            ? 'my-3 font-sans text-body-sm text-secondary'
            : 'my-4 font-sans text-body text-body'
        }
      >
        {renderInline(text, `p${pid}`)}
      </p>,
    );
  }

  return blocks;
}
