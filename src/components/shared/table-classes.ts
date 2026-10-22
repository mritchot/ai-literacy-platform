// Shared table treatment, taken from the module reference table
// (src/modules/module3/DiagnosticPairTable.tsx): a raised card frame, a
// surface-warm header band, 13px sans cells, and border-light row rules.
// The markdown renderer and the build-series tables use these classes so a
// table reads the same in a module, an artifact document, or a dashboard.
//
// The frame is a class border, not an inline `border:` style, so the print
// stylesheet's keep-whole rule for bordered boxes does not apply and long
// tables still break between rows on paper.

/** Scroll wrapper + card frame. Long tables scroll inside it on phones. */
export const TABLE_FRAME = 'overflow-x-auto border border-border bg-[rgb(var(--white))]';

/** The table itself. The last row drops its rule so it does not double the frame. */
export const TABLE =
  'w-full border-collapse text-left font-sans text-[13px] leading-[1.55] [&>tbody>tr:last-child>*]:border-b-0';

/** Header band. */
export const THEAD = 'bg-surface-warm';

/** Column header cell. */
export const TH =
  'border-b border-border-light px-[14px] py-[10px] text-left align-bottom font-sans text-[13px] font-semibold text-ink';

/** Row header cell (first column of a data row). */
export const TH_ROW =
  'border-b border-border-light px-[14px] py-3 text-left align-top font-sans text-[13px] font-semibold text-ink';

/** Body cell. The color is spelled as an arbitrary value because the
 *  `text-body` utility also sets the 16px body size. */
export const TD = 'border-b border-border-light px-[14px] py-3 align-top text-[rgb(var(--body))]';
