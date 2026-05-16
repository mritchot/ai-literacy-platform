// Lightweight markdown renderer for Module 4's pre-written outputs.
// Handles only the constructs the content actually uses: paragraph
// breaks (blank line), **bold** runs, and bullet/numbered list lines
// starting with `- ` or `1. `. No nested lists, no code, no headings —
// the content document doesn't need them.

import { type ReactNode } from 'react';

export function renderMarkdownLite(raw: string): ReactNode {
  const blocks = raw.split(/\n\n+/);
  return blocks.map((block, idx) => {
    const lines = block.split('\n');
    if (lines.every((l) => /^\s*[-•]\s+/.test(l))) {
      return (
        <ul key={idx} className="m-0 my-2 list-disc space-y-1 pl-5">
          {lines.map((l, i) => (
            <li key={i}>{renderInline(l.replace(/^\s*[-•]\s+/, ''))}</li>
          ))}
        </ul>
      );
    }
    if (lines.every((l) => /^\s*\d+\.\s+/.test(l))) {
      return (
        <ol key={idx} className="m-0 my-2 list-decimal space-y-1 pl-5">
          {lines.map((l, i) => (
            <li key={i}>{renderInline(l.replace(/^\s*\d+\.\s+/, ''))}</li>
          ))}
        </ol>
      );
    }
    return (
      <p key={idx} className="m-0" style={{ marginBottom: idx === blocks.length - 1 ? 0 : '0.85em' }}>
        {lines.map((l, i) => (
          <span key={i}>
            {renderInline(l)}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
}

function renderInline(text: string): ReactNode {
  // Split on **bold** runs.
  const parts: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(<span key={key++}>{text.slice(lastIdx, match.index)}</span>);
    }
    parts.push(
      <strong key={key++} className="font-semibold text-ink">
        {match[1]}
      </strong>,
    );
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIdx)}</span>);
  }
  return parts;
}
