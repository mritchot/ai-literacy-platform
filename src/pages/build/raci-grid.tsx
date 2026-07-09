// RACI interactive grid — 32 activities × 5 roles, color-coded R/A/C/I. Filter
// by phase, select a role to see its definition and totals (its column is
// emphasized, the others dim). Rendered as a semantic <table> (row/column
// header scopes, sr-only caption) inside a horizontally scrollable container;
// every cell carries its letter, so the muted cell color is only ever a
// secondary cue. All counts are computed from ./raci-data, so the grid and its
// annotations cannot disagree.

import { Fragment, useState } from 'react';
import { Overline } from '../../components/shared/Overline';
import { ACTIVITIES, PHASES, RACI, ROLES, countFor, type Assignment } from './raci-data';

// Muted cell styling — earthy green / amber / slate for R/A/C, a neutral for I.
// Deliberately not traffic-light colors; the letter is always shown.
const CELL: Record<Assignment, { bg: string; color: string; weight: number }> = {
  R: { bg: 'rgb(var(--success-light))', color: 'rgb(var(--success))', weight: 700 },
  A: { bg: 'rgb(var(--caution-light))', color: 'rgb(var(--caution))', weight: 700 },
  C: { bg: 'rgb(var(--info-light))', color: 'rgb(var(--info))', weight: 600 },
  I: { bg: 'rgb(var(--surface))', color: 'rgb(var(--tertiary))', weight: 600 },
  '—': { bg: 'transparent', color: 'rgb(var(--ghost))', weight: 400 },
};

function Legend(): JSX.Element {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {RACI.map((d) => (
        <div key={d.letter} className="flex items-baseline gap-2">
          <span
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[11px] font-bold"
            style={{ background: CELL[d.letter].bg, color: CELL[d.letter].color }}
          >
            {d.letter}
          </span>
          <span className="font-sans text-[12px] text-body">
            <span className="font-semibold text-ink">{d.name}</span>: {d.meaning}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RaciGrid(): JSX.Element {
  const [phaseFilter, setPhaseFilter] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);

  const shownPhases = PHASES.filter((p) => !phaseFilter || p === phaseFilter);
  const lmAccountable = countFor(0, 'A');

  return (
    <div className="mt-8">
      {/* Accountability / role panel */}
      <div className="mb-6 rounded-lg" style={{ background: 'rgb(var(--surface-warm))', border: '1px solid rgb(var(--border))', padding: '16px 20px' }}>
        {selectedRole === null ? (
          <>
            <Overline className="mb-1.5">Accountability</Overline>
            <p className="m-0 max-w-reading font-sans text-body-sm text-body" style={{ lineHeight: 1.6 }}>
              The <strong className="text-ink">L&amp;D Manager</strong> is Accountable (A) for{' '}
              <strong className="text-ink">{lmAccountable} of {ACTIVITIES.length}</strong> activities, as the program
              owner who approves each deliverable before it advances. The Executive Sponsor is Accountable only at
              the strategic decision points: three phase-gate approvals and the Level-4 ROI model. Select a role
              header to see its definition and totals.
            </p>
          </>
        ) : (
          <>
            <div className="mb-1.5 flex items-center gap-2">
              <Overline as="span">{ROLES[selectedRole]!.abbr}</Overline>
              <span className="font-sans text-body-sm font-semibold text-ink">{ROLES[selectedRole]!.name}</span>
            </div>
            <p className="m-0 mb-3 max-w-reading font-sans text-body-sm text-body" style={{ lineHeight: 1.6 }}>
              {ROLES[selectedRole]!.definition}
            </p>
            <div className="flex flex-wrap gap-2">
              {RACI.map((d) => (
                <span
                  key={d.letter}
                  className="rounded-md font-mono text-[11px] font-semibold"
                  style={{ background: CELL[d.letter].bg, color: CELL[d.letter].color, padding: '3px 9px' }}
                >
                  {d.letter} · {countFor(selectedRole, d.letter)}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="ml-1 font-sans text-[12px] font-semibold text-action hover:text-action-hover"
              >
                Clear
              </button>
            </div>
          </>
        )}
      </div>

      {/* Phase filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[11px] font-semibold uppercase text-tertiary" style={{ letterSpacing: '0.08em' }}>
          Phase
        </span>
        <FilterChip label="All" active={phaseFilter === null} onClick={() => setPhaseFilter(null)} />
        {PHASES.map((p) => (
          <FilterChip key={p} label={p} active={phaseFilter === p} onClick={() => setPhaseFilter((prev) => (prev === p ? null : p))} />
        ))}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left" style={{ minWidth: 640 }}>
          <caption className="sr-only">
            RACI matrix: {ACTIVITIES.length} activities by five roles. Each cell is Responsible, Accountable,
            Consulted, Informed, or not involved.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 font-sans text-label font-semibold uppercase text-ink-secondary" style={{ background: 'rgb(var(--canvas))', padding: '8px 12px', minWidth: 220 }}>
                Activity
              </th>
              {ROLES.map((r, i) => {
                const on = selectedRole === i;
                return (
                  <th key={r.abbr} scope="col" className="text-center" style={{ padding: '4px 6px', minWidth: 64 }}>
                    <button
                      type="button"
                      onClick={() => setSelectedRole((prev) => (prev === i ? null : i))}
                      aria-pressed={on}
                      title={`${r.name}: ${r.definition}`}
                      className="w-full rounded-md font-mono text-[12px] font-bold transition-colors"
                      style={{
                        padding: '8px 4px',
                        background: on ? 'rgb(var(--action))' : 'transparent',
                        color: on ? 'rgb(var(--white))' : 'rgb(var(--ink-secondary))',
                        border: '1px solid ' + (on ? 'rgb(var(--action))' : 'rgb(var(--border))'),
                      }}
                    >
                      {r.abbr}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {shownPhases.map((phase) => (
              <Fragment key={phase}>
                <tr>
                  <th
                    scope="rowgroup"
                    colSpan={ROLES.length + 1}
                    className="font-mono text-overline font-bold uppercase text-tertiary"
                    style={{ background: 'rgb(var(--surface))', padding: '7px 12px', letterSpacing: '0.1em', borderTop: '1px solid rgb(var(--border-light))' }}
                  >
                    {phase}
                  </th>
                </tr>
                {ACTIVITIES.filter((a) => a.phase === phase).map((a) => (
                  <tr key={a.name}>
                    <th
                      scope="row"
                      className="sticky left-0 font-sans text-[13px] font-normal text-ink"
                      style={{ background: 'rgb(var(--white))', padding: '8px 12px', borderBottom: '1px solid rgb(var(--border-light))' }}
                    >
                      {a.name}
                    </th>
                    {a.assignments.map((as, ri) => {
                      const s = CELL[as];
                      const dim = selectedRole !== null && selectedRole !== ri;
                      return (
                        <td key={ROLES[ri]!.abbr} className="text-center" style={{ padding: '5px 6px', borderBottom: '1px solid rgb(var(--border-light))', opacity: dim ? 0.4 : 1 }}>
                          <span
                            className="inline-flex h-7 w-7 items-center justify-center rounded font-mono text-[12px]"
                            style={{ background: s.bg, color: s.color, fontWeight: s.weight }}
                            aria-label={as === '—' ? 'not involved' : as}
                          >
                            {as}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 rounded-lg" style={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border-light))', padding: '14px 18px' }}>
        <Legend />
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="rounded-full font-sans text-[12px] font-semibold transition-colors"
      style={{
        padding: '4px 12px',
        background: active ? 'rgb(var(--action))' : 'transparent',
        color: active ? 'rgb(var(--white))' : 'rgb(var(--secondary))',
        border: '1px solid ' + (active ? 'rgb(var(--action))' : 'rgb(var(--border))'),
      }}
    >
      {label}
    </button>
  );
}
