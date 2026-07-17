// P7 attention heatmap — 42 page rectangles arranged in 3 rows of 14,
// shaded by approximate model attention. Strong attention (tokens.action)
// at the document boundaries; weak attention (--border-light) in the
// middle. Page 18 (Section 12, the failed clause) outlined in
// tokens.error to mark the failure point. Static / illustrative —
// purely visual; colors resolve through useChartTokens so the cells
// flip with the theme.

import { useChartTokens } from '../../hooks/useChartTokens';

const TOTAL_PAGES = 42;
// Pages 1-5 and 38-42 receive strong attention.
const STRONG_PAGES = new Set<number>();
for (let p = 1; p <= 5; p++) STRONG_PAGES.add(p);
for (let p = 38; p <= 42; p++) STRONG_PAGES.add(p);

const FAILURE_PAGE = 18;

export function AttentionVisualization(): JSX.Element {
  const tokens = useChartTokens();
  const pages = Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1);

  return (
    <figure
      className="m-0"
      aria-labelledby="p7-attention-caption"
      style={{
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        padding: '14px 16px',
      }}
    >
      <div className="mb-3 font-sans text-body-sm font-semibold text-ink">
        Where the model's attention concentrated
      </div>
      <div
        aria-hidden="true"
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(14, 1fr)',
          gap: 4,
          maxWidth: 480,
        }}
      >
        {pages.map((page) => {
          const isStrong = STRONG_PAGES.has(page);
          const isFailure = page === FAILURE_PAGE;
          return (
            <div
              key={page}
              title={`Page ${page}${isFailure ? ' — Section 12 (failed clause)' : isStrong ? ' — strong attention' : ' — weak attention'}`}
              style={{
                aspectRatio: '12 / 16',
                background: isStrong
                  ? tokens.action
                  : 'rgb(var(--border-light))',
                opacity: isStrong ? 1 : 0.45,
                border: isFailure ? `2px solid ${tokens.error}` : 'none',
              }}
            />
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-tertiary">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block"
            style={{ width: 10, height: 10, background: tokens.action }}
          />
          Strong attention
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block"
            style={{ width: 10, height: 10, background: 'rgb(var(--border-light))', opacity: 0.45 }}
          />
          Weak attention
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block"
            style={{
              width: 10,
              height: 10,
              background: 'rgb(var(--border-light))',
              opacity: 0.45,
              border: `2px solid ${tokens.error}`,
              boxSizing: 'border-box',
            }}
          />
          Section 12 — the failed clause
        </span>
      </div>

      <figcaption
        id="p7-attention-caption"
        className="mt-3 font-sans text-body-sm text-body"
      >
        Pages 1–5 and 38–42 received strong model attention. Section 12 (page 18) fell in the
        middle, the zone where attention is weakest. The model generated a plausible-sounding
        clause for that position rather than reporting that the section had not been fully
        processed.
      </figcaption>
    </figure>
  );
}
