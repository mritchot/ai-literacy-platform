// P4 View A — Sortable occupation table showing time savings, wage, and
// task cost across 22 occupation categories (4A spec §5.3).

import { Fragment, useMemo, useState, type KeyboardEvent } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { formatCurrency, formatPercent } from '../../utils/chart-config';
import { useExpandableSet } from '../../hooks/useExpandableSet';
import { useChartTokens } from '../../hooks/useChartTokens';

interface OccupationRow {
  occupation: string;
  time_without_ai_hours: number;
  avg_wage_per_hour: number;
  avg_task_cost_usd: number;
  time_savings_pct: number;
  representative_tasks?: string[];
}

// Slug an occupation name for use as a DOM id when wiring aria-controls
// from the row's expand button to the disclosure row below it.
const rowSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

type SortKey =
  | 'occupation'
  | 'time_without_ai_hours'
  | 'avg_wage_per_hour'
  | 'avg_task_cost_usd'
  | 'time_savings_pct'
  // Derived column — computed from avg_task_cost_usd and time_savings_pct.
  // Not a field on the source JSON; resolved via withAiCost() for sorting.
  | 'labor_cost_with_ai';

type Direction = 'asc' | 'desc';

interface Column {
  key: SortKey;
  label: string;
  align: 'left' | 'right';
  width?: string;
}

const COLUMNS: Column[] = [
  { key: 'occupation', label: 'Occupation', align: 'left' },
  { key: 'time_without_ai_hours', label: 'Time without AI', align: 'right' },
  { key: 'avg_wage_per_hour', label: 'Avg. wage', align: 'right' },
  { key: 'avg_task_cost_usd', label: 'Labor cost without AI', align: 'right' },
  // Time Savings renders as a left-anchored bar with the percentage
  // text padded from the left edge — so the column's data reads
  // left-to-right. The header alignment matches that reading direction
  // (left-aligned) rather than the numerical convention (right-aligned)
  // the other measure columns use.
  { key: 'time_savings_pct', label: 'Time savings', align: 'left', width: '220px' },
  { key: 'labor_cost_with_ai', label: 'Labor cost with AI', align: 'right' },
];

// Residual labor cost after applying the time savings: cost × (1 − savings).
// Same hourly wage, fewer hours spent — so this is the labor value remaining,
// not a tooling/API cost (we don't have that figure in the source data).
function withAiCost(row: OccupationRow): number {
  return row.avg_task_cost_usd * (1 - row.time_savings_pct / 100);
}

interface ProductivityViewAProps {
  rows: OccupationRow[];
}

export function ProductivityViewA({ rows }: ProductivityViewAProps): JSX.Element {
  const { track } = useAnalytics();
  const [sortKey, setSortKey] = useState<SortKey>('time_savings_pct');
  const [direction, setDirection] = useState<Direction>('desc');
  // Click-to-expand state per row. Multi-row open is allowed so a learner
  // can compare task lists across occupations (e.g. Construction vs.
  // Management) without toggling repeatedly.
  const { isOpen: isRowExpanded, toggle: toggleExpanded } = useExpandableSet<string>();

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = sortKey === 'labor_cost_with_ai' ? withAiCost(a) : a[sortKey];
      const bv = sortKey === 'labor_cost_with_ai' ? withAiCost(b) : b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return direction === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return direction === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av);
    });
    return copy;
  }, [rows, sortKey, direction]);

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setDirection('desc');
    }
    track({
      type: 'p4_view_a_sorted',
      moduleId: 2,
      sectionId: 5,
      payload: { column: key, direction: key === sortKey && direction === 'desc' ? 'asc' : 'desc' },
    });
  };

  const onHeaderKey = (e: KeyboardEvent<HTMLButtonElement>, key: SortKey) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSort(key);
    }
  };

  return (
    <div className="space-y-4">
      <p className="m-0 font-sans text-body-sm text-body">
        AI-estimated time savings across 22 occupation categories. Sort any column to scan the
        full set. The two cost columns show the same task before and after AI assistance: Labor
        Cost Without AI is the hourly wage multiplied by the task's unassisted duration; Labor
        Cost With AI is what's left after applying the time savings. The gap between them is the
        savings potential: a $134 task that AI reduces by 87% drops to about $17 per occurrence,
        representing roughly $117 in recovered labor value.
      </p>
      <p className="m-0 font-sans text-body-sm text-body">
        These averages reflect the cognitive, text-based portion of each occupation that people
        brought to AI, not the whole job. Construction's 86.7%, for example, comes from bid
        writing, scheduling, and inspection reports, not concrete work. Click any row to see
        representative AI-assisted tasks for that category.
      </p>

      <div className="overflow-x-auto" style={{ border: '1px solid rgb(var(--border))' }}>
        <table className="w-full border-collapse" role="table">
          <caption className="sr-only">
            Time savings, wages, and labor cost with and without AI by occupation. Click a column
            header to sort.
          </caption>
          <thead style={{ background: 'rgb(var(--surface-warm))' }}>
            <tr>
              {COLUMNS.map((col) => {
                const isActive = col.key === sortKey;
                const ariaSort = isActive
                  ? direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none';
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={ariaSort}
                    style={{
                      textAlign: col.align,
                      padding: '10px 14px',
                      borderBottom: '1px solid rgb(var(--border-light))',
                      width: col.width,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onSort(col.key)}
                      onKeyDown={(e) => onHeaderKey(e, col.key)}
                      className="inline-flex items-center gap-1 font-sans text-[12px] font-semibold uppercase text-tertiary hover:text-ink"
                      style={{
                        letterSpacing: '0.04em',
                        // Right-aligned columns put the sort indicator on
                        // the left of the label so the rightmost edge of
                        // the label aligns with the rightmost edge of the
                        // cell data. Otherwise the indicator's reserved
                        // 12px width pushes the header label inboard from
                        // the data, breaking the alignment.
                        flexDirection: col.align === 'right' ? 'row-reverse' : 'row',
                      }}
                    >
                      {col.label}
                      <span aria-hidden="true" style={{ display: 'inline-flex', width: 12 }}>
                        {isActive ? (direction === 'asc' ? '▲' : '▼') : ''}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const isExpanded = isRowExpanded(row.occupation);
              const hasTasks = (row.representative_tasks?.length ?? 0) > 0;
              const tasksId = `tasks-${rowSlug(row.occupation)}`;
              const isLast = i === sorted.length - 1;
              return (
                <Fragment key={row.occupation}>
                  <tr
                    style={{
                      background: 'rgb(var(--white))',
                      borderBottom:
                        isLast && !isExpanded
                          ? 'none'
                          : '1px solid rgb(var(--border-light))',
                    }}
                  >
                    <td
                      className="font-sans text-body-sm font-medium text-ink"
                      style={{ padding: '11px 14px' }}
                    >
                      {hasTasks ? (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(row.occupation)}
                          aria-expanded={isExpanded}
                          aria-controls={tasksId}
                          className="inline-flex items-start gap-2 text-left hover:text-action"
                        >
                          <span
                            aria-hidden="true"
                            className="inline-block flex-shrink-0 transition-transform"
                            style={{
                              marginTop: 2,
                              fontSize: 10,
                              color: 'rgb(var(--tertiary))',
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            }}
                          >
                            ▸
                          </span>
                          <span>{row.occupation}</span>
                        </button>
                      ) : (
                        row.occupation
                      )}
                    </td>
                    <td
                      className="font-mono text-[13px] text-secondary"
                      style={{ padding: '11px 14px', textAlign: 'right' }}
                    >
                      {row.time_without_ai_hours.toFixed(1)} hrs
                    </td>
                    <td
                      className="font-mono text-[13px] text-secondary"
                      style={{ padding: '11px 14px', textAlign: 'right' }}
                    >
                      {formatCurrency(row.avg_wage_per_hour)}
                    </td>
                    <td
                      className="font-mono text-[13px] text-secondary"
                      style={{ padding: '11px 14px', textAlign: 'right' }}
                    >
                      {formatCurrency(row.avg_task_cost_usd)}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <SavingsBar value={row.time_savings_pct} />
                    </td>
                    <td
                      className="font-mono text-[13px] text-secondary"
                      style={{ padding: '11px 14px', textAlign: 'right' }}
                    >
                      {formatCurrency(withAiCost(row))}
                    </td>
                  </tr>
                  {isExpanded && hasTasks && (
                    <tr
                      id={tasksId}
                      style={{
                        background: 'rgb(var(--surface-warm))',
                        borderBottom: isLast
                          ? 'none'
                          : '1px solid rgb(var(--border-light))',
                      }}
                    >
                      <td
                        colSpan={COLUMNS.length}
                        style={{ padding: '8px 14px 14px 38px' }}
                      >
                        <div
                          className="font-mono text-[10.5px] font-bold uppercase text-tertiary"
                          style={{ letterSpacing: '0.08em', marginBottom: 6 }}
                        >
                          Representative AI-assisted tasks · illustrative O*NET examples
                        </div>
                        <ul className="m-0 list-disc pl-5">
                          {row.representative_tasks!.map((t) => (
                            <li
                              key={t}
                              className="font-sans text-body-sm text-secondary"
                              style={{ padding: '2px 0', lineHeight: 1.45 }}
                            >
                              {t}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="m-0 font-mono text-caption text-muted" style={{ letterSpacing: '0.02em' }}>
        Source: Tamkin & McCrory, Nov 2025, Table 3, pp. 10–11.
      </p>
    </div>
  );
}

function SavingsBar({ value }: { value: number }): JSX.Element {
  const tokens = useChartTokens();
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative h-5 overflow-hidden" style={{ background: 'rgb(var(--border-light))' }}>
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 transition-[width] duration-300"
        style={{ width: `${pct}%`, background: tokens.secondary, opacity: 0.2 }}
      />
      <span
        className="relative z-10 flex h-full items-center font-mono text-[12px] font-semibold text-ink"
        style={{ paddingLeft: 8 }}
      >
        {formatPercent(value, 1)}
      </span>
    </div>
  );
}
