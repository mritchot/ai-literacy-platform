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
// Footnotes need no special handling: the source uses a literal superscript
// glyph (¹) inline and a separated italic paragraph at the foot of the
// document, so rendering italics + horizontal rules + the glyph reproduces
// them faithfully.

import { type ReactNode } from 'react';

// ─── Inline ────────────────────────────────────────────────────────────
//
// Links `[text](url)`, bold `**text**`, italic `*text*`. Recursive so the
// constructs nest the way the source nests them: Sources entries wrap an
// italic title inside a link (`[*Title*](url)`), and the delivery-note
// footnote is one long italic span that contains a link. A fresh RegExp is
// created per call (not a shared module-level one) so the recursive calls
// don't clobber each other's `lastIndex`.

export function renderInline(text: string, keyBase = 'i'): ReactNode {
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*\n]+)\*/g;
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyBase}-${k++}`;
    if (m[1] !== undefined && m[2] !== undefined) {
      // Scheme allowlist: a stray `[x](javascript:...)` in future markdown
      // must never become an executable anchor. All current content uses
      // https/mailto/#, so rendered output is unchanged; a disallowed
      // scheme renders as a non-navigating anchor (no href).
      const safeHref = /^(https?:|mailto:|#)/i.test(m[2].trim()) ? m[2] : undefined;
      out.push(
        <a
          key={key}
          href={safeHref}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-action underline decoration-1 underline-offset-2 transition-colors hover:text-action-hover"
        >
          {renderInline(m[1], key)}
        </a>,
      );
    } else if (m[3] !== undefined) {
      out.push(
        <strong key={key} className="font-semibold text-ink">
          {renderInline(m[3], key)}
        </strong>,
      );
    } else if (m[4] !== undefined) {
      out.push(
        <em key={key} className="italic">
          {renderInline(m[4], key)}
        </em>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// ─── Block ─────────────────────────────────────────────────────────────

const HR_RE = /^\s*([-*_])\1{2,}\s*$/;
const HEADING_RE = /^\s*(#{1,6})\s+(.*)$/;
const BLOCKQUOTE_RE = /^\s*>\s?/;
const UL_RE = /^\s*[-*•]\s+/;
const OL_RE = /^\s*\d+\.\s+/;
const TABLE_ROW_RE = /^\s*\|.*\|\s*$/;
const TABLE_SEP_RE = /^\s*\|[\s:|-]+\|\s*$/;

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
  if (level === 1)
    return (
      <h1 key={id} className="mb-2 mt-0 font-display text-display font-normal text-ink">
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
    <h4 key={id} className="mb-2 mt-6 font-sans text-h4 font-semibold text-ink-secondary">
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
    const line = lines[i];

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
      blocks.push(heading(h[1].length, h[2].trim(), id++));
      i++;
      continue;
    }

    if (isTableStart(line, lines[i + 1])) {
      const header = splitRow(line);
      i += 2; // header row + separator
      const rows: string[][] = [];
      while (i < lines.length && TABLE_ROW_RE.test(lines[i])) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      const tid = id++;
      blocks.push(
        <div key={tid} className="my-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-body-sm text-body">
            <thead>
              <tr>
                {header.map((c, ci) => (
                  <th
                    key={ci}
                    className="border-b border-border px-3 py-2 align-bottom font-sans text-label font-semibold uppercase tracking-wide text-ink-secondary"
                  >
                    {renderInline(c, `th${tid}-${ci}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td
                      key={ci}
                      className="border-b border-border-light px-3 py-2 align-top"
                    >
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
      while (i < lines.length && BLOCKQUOTE_RE.test(lines[i])) {
        quote.push(lines[i].replace(BLOCKQUOTE_RE, ''));
        i++;
      }
      const qid = id++;
      blocks.push(
        <blockquote
          key={qid}
          className="my-5 rounded-r-md border-l-2 border-border bg-surface px-4 py-3 text-body-sm text-secondary"
        >
          {renderInline(quote.join(' '), `bq${qid}`)}
        </blockquote>,
      );
      continue;
    }

    if (UL_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length && UL_RE.test(lines[i])) {
        items.push(lines[i].replace(UL_RE, ''));
        i++;
      }
      const lid = id++;
      blocks.push(
        <ul key={lid} className="my-4 list-disc space-y-1.5 pl-5 text-body text-body">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, `ul${lid}-${idx}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (OL_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length && OL_RE.test(lines[i])) {
        items.push(lines[i].replace(OL_RE, ''));
        i++;
      }
      const lid = id++;
      blocks.push(
        <ol key={lid} className="my-4 list-decimal space-y-1.5 pl-5 text-body text-body">
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
      !/^\s*$/.test(lines[i]) &&
      !isSpecial(lines[i], lines[i + 1])
    ) {
      para.push(lines[i].trim());
      i++;
    }
    const pid = id++;
    blocks.push(
      <p key={pid} className="my-4 text-body text-body">
        {renderInline(para.join(' '), `p${pid}`)}
      </p>,
    );
  }

  return blocks;
}
