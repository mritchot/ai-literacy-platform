// QA dashboard — three panels rendered from ./quality-data: the ten
// verification passes (a scrollable table), the triple-validation data protocol
// (three passes + the six-file results), and the eight-check capability
// framework. Row/tile content derives from the data arrays; the spelled-out
// counts in the section headings ("Ten…", "Eight-check…") are hardcoded prose
// and must be updated by hand if the arrays change.

import { CheckSources } from '../../components/shared/CheckSources';
import { Overline } from '../../components/shared/Overline';
import { TABLE, TABLE_FRAME, TD, TH, TH_ROW, THEAD } from '../../components/shared/table-classes';
import {
  CAPABILITY_CHECKS,
  QA_PASSES,
  VALIDATED_FILES,
  VALIDATION_PASSES,
  type CapabilityCheck,
} from './quality-data';

function Section({ label, note, children }: { label: string; note?: string; children: React.ReactNode }): JSX.Element {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-2.5">
        <Overline as="span">{label}</Overline>
        <span aria-hidden="true" className="h-px flex-1" style={{ background: 'rgb(var(--border-light))' }} />
      </div>
      {note && (
        <p className="m-0 mb-4 font-sans text-body-sm text-body" style={{ lineHeight: 1.6 }}>
          {note}
        </p>
      )}
      {children}
    </section>
  );
}

function QaPassTable(): JSX.Element {
  return (
    <div className={TABLE_FRAME}>
      <table className={TABLE} style={{ minWidth: 640 }}>
        <thead className={THEAD}>
          <tr>
            {['QA pass', 'Scope · sample', 'Result'].map((h) => (
              <th key={h} scope="col" className={TH}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {QA_PASSES.map((p) => (
            <tr key={p.activity}>
              <th scope="row" className={TH_ROW} style={{ minWidth: 200 }}>
                <span className="block font-sans text-[13px] font-semibold text-ink">{p.activity}</span>
                <span className="mt-0.5 block font-sans text-[12px] font-normal text-tertiary" style={{ lineHeight: 1.45 }}>
                  {p.method}
                </span>
              </th>
              <td className={TD} style={{ minWidth: 150 }}>
                {p.scope}
                <span className="mt-0.5 block font-mono text-[10.5px] text-tertiary">{p.sample}</span>
              </td>
              <td className={TD}>
                {p.result}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TripleValidation(): JSX.Element {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {VALIDATION_PASSES.map((p) => (
          <div key={p.n} style={{ background: 'rgb(var(--white))', border: '1px solid rgb(var(--border))', padding: '14px 16px' }}>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center font-mono text-[11px] font-bold" style={{ background: 'rgb(var(--info-light))', color: 'rgb(var(--info))' }}>
                {p.n}
              </span>
              <span className="font-sans text-[13px] font-semibold text-ink">{p.name}</span>
            </div>
            <p className="m-0 font-sans text-body-sm text-body" style={{ lineHeight: 1.55 }}>
              {p.detail}
            </p>
          </div>
        ))}
      </div>
      <div className={`mt-4 ${TABLE_FRAME}`}>
        <table className={TABLE} style={{ minWidth: 560 }}>
          <thead className={THEAD}>
            <tr>
              {['Data file', 'Source', 'Key content', 'Status'].map((h) => (
                <th key={h} scope="col" className={TH}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VALIDATED_FILES.map((f) => (
              <tr key={f.file}>
                <th scope="row" className={`${TH_ROW} font-mono text-[12px]`} style={{ minWidth: 190 }}>
                  {f.file}
                </th>
                <td className="border-b border-border-light px-[14px] py-3 align-top text-secondary">
                  {f.source}
                  <CheckSources sources={f.sources} />
                </td>
                <td className={TD}>
                  {f.content}
                </td>
                <td className={TD}>
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[10.5px] font-semibold" style={{ background: 'rgb(var(--success-light))', color: 'rgb(var(--success))', border: '1px solid rgb(var(--success))', padding: '3px 9px' }}>
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: 'rgb(var(--success))' }} />
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CheckTypeBadge({ type }: { type: CapabilityCheck['type'] }): JSX.Element {
  const token = type === 'Capability' ? 'info' : 'caution';
  return (
    <span
      className="inline-flex shrink-0 items-center font-mono text-[9.5px] font-bold uppercase"
      style={{ background: `rgb(var(--${token}-light))`, color: `rgb(var(--${token}))`, padding: '2px 7px', letterSpacing: '0.06em' }}
    >
      {type}
    </span>
  );
}

function CapabilityFramework(): JSX.Element {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {CAPABILITY_CHECKS.map((c) => (
        <div key={c.check} style={{ background: 'rgb(var(--white))', border: '1px solid rgb(var(--border))', padding: '13px 16px' }}>
          <div className="mb-1.5 flex items-start justify-between gap-2">
            <span className="font-sans text-[13px] font-semibold text-ink">{c.check}</span>
            <CheckTypeBadge type={c.type} />
          </div>
          <p className="m-0 font-sans text-body-sm text-body" style={{ lineHeight: 1.55 }}>
            {c.criterion}
          </p>
        </div>
      ))}
    </div>
  );
}

export function QualityDashboard(): JSX.Element {
  return (
    <div className="mt-8">
      <Section label="Ten verification passes">
        <QaPassTable />
      </Section>
      <Section label="Triple-validation data protocol" note="Each of the six JSON data files went through three dedicated validation passes, a stricter standard than a single-pass eval, because learners draw conclusions directly from the dashboards this data powers.">
        <TripleValidation />
      </Section>
      <Section label="Eight-check capability framework" note="Each check is Capability (does the output do what it should?) or Risk (what can go wrong that the learner cannot detect?). Risk checks matter most in learning contexts, because learners consume content without an answer key.">
        <CapabilityFramework />
      </Section>
    </div>
  );
}
