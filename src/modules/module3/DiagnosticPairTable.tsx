// S9 DiagnosticPairTable — static reference table mapping observable
// AI failures to the property pair behind them and a targeted fix
// (4C spec §13). Two row groups: three core diagnostic pairs and two
// extension patterns rendered with a lighter visual weight.

import { Overline } from '../../components/shared/Overline';
import { useViewport } from '../../hooks/useViewport';

interface PairRow {
  failure: string;
  property1: string;
  property2: string;
  fix: string;
}

const CORE_PAIRS: PairRow[] = [
  {
    failure:
      'Fabricated citations, invented statistics, confident claims about nonexistent sources',
    property1: 'Next-token prediction',
    property2: 'Knowledge (sparse)',
    fix:
      'Verify every specific claim against an independent source; use retrieval tools or document grounding.',
  },
  {
    failure:
      'Constraints ignored over a long conversation; tone drifts, format loosens, restrictions reappear',
    property1: 'Context window',
    property2: 'Steerability',
    fix:
      'Start a fresh conversation with key constraints restated at the top; break long projects into shorter sessions.',
  },
  {
    failure:
      'Wrong arithmetic presented with full confidence; character counts off; spelling tasks fail',
    property1: 'Tokenization',
    property2: 'Next-token prediction',
    fix:
      'Offload computation to dedicated tools; ask the model to write code rather than calculate directly.',
  },
];

const EXTENSION_PAIRS: PairRow[] = [
  {
    failure:
      'Incomplete summary of a long document — output looks complete but misses sections',
    property1: 'Context window',
    property2: 'Next-token prediction',
    fix: 'Chunk the document; verify full-source coverage.',
  },
  {
    failure: 'Degrades in non-English languages — more errors, awkward phrasing',
    property1: 'Tokenization',
    property2: 'Knowledge (sparse)',
    fix: 'Extra verification time for non-English output.',
  },
];

export function DiagnosticPairTable(): JSX.Element {
  // Mobile renders each row as a stacked card (failure heading,
  // property-pair chips, fix). The 4-column desktop table had to
  // horizontally-scroll on mobile to fit and required the learner to
  // pan the table to read fixes — awkward UX that broke the natural
  // top-to-bottom reading flow of the rest of the section. Cards
  // preserve the same data (failure / pair / fix) but give each row
  // the full row width so all three pieces are visible at once.
  const viewport = useViewport();
  const isMobile = viewport === 'mobile';
  return (
    <figure
      className="m-0"
      aria-label="Diagnostic pair reference table"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgb(var(--border-light))' }}>
        <Overline className="mb-1">Diagnostic pairs</Overline>
        <p className="m-0 font-sans text-body-sm text-body">
          Most workplace AI failures are two properties intersecting. Naming the pair turns a vague
          “something is off” into a targeted fix.
        </p>
      </div>

      {isMobile ? (
        <MobilePairList />
      ) : (
        <div className="overflow-x-auto">
          <table
            className="w-full border-collapse font-sans text-body-sm"
            role="table"
          >
            <caption className="sr-only">
              Diagnostic pair reference: failure signature, the two properties that produced it, and
              the targeted fix.
            </caption>
            <thead style={{ background: 'rgb(var(--surface-warm))' }}>
              <tr>
                <Th>Failure you see</Th>
                <Th>Property 1</Th>
                <Th>Property 2</Th>
                <Th>The fix</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} style={cellHeaderStyle}>
                  <span className="font-mono text-overline font-bold uppercase text-tertiary" style={{ letterSpacing: '0.1em' }}>
                    Core pairs
                  </span>
                </td>
              </tr>
              {CORE_PAIRS.map((row, i) => (
                <PairRowEl key={`core-${i}`} row={row} variant="core" />
              ))}
              <tr>
                <td colSpan={4} style={cellHeaderStyle}>
                  <span className="font-mono text-overline font-bold uppercase text-tertiary" style={{ letterSpacing: '0.1em' }}>
                    Other common patterns
                  </span>
                </td>
              </tr>
              {EXTENSION_PAIRS.map((row, i) => (
                <PairRowEl key={`ext-${i}`} row={row} variant="extension" />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}

// Mobile-only rendering of the diagnostic-pair data as stacked cards.
// Two row groups (core + extension) with their existing headers; each
// row card shows the failure as the headline, the property pair as
// small chips, and the fix as body text below.
function MobilePairList(): JSX.Element {
  return (
    <div style={{ padding: '14px 16px' }}>
      <GroupHeader label="Core pairs" />
      <div className="mt-2 space-y-2.5">
        {CORE_PAIRS.map((row, i) => (
          <MobilePairCard key={`core-${i}`} row={row} variant="core" />
        ))}
      </div>
      <div className="mt-5">
        <GroupHeader label="Other common patterns" />
      </div>
      <div className="mt-2 space-y-2.5">
        {EXTENSION_PAIRS.map((row, i) => (
          <MobilePairCard key={`ext-${i}`} row={row} variant="extension" />
        ))}
      </div>
    </div>
  );
}

function GroupHeader({ label }: { label: string }): JSX.Element {
  return (
    <div
      className="font-mono text-overline font-bold uppercase text-tertiary"
      style={{ letterSpacing: '0.1em' }}
    >
      {label}
    </div>
  );
}

function MobilePairCard({
  row,
  variant,
}: {
  row: PairRow;
  variant: 'core' | 'extension';
}): JSX.Element {
  const dim = variant === 'extension';
  return (
    <div
      style={{
        background: dim ? 'rgb(var(--surface))' : 'rgb(var(--white))',
        border: '1px solid rgb(var(--border-light))',
        padding: '12px 14px',
      }}
    >
      <div
        className="mb-3 font-sans text-body-sm font-semibold"
        style={{
          color: dim ? 'rgb(var(--secondary))' : 'rgb(var(--ink))',
          lineHeight: 1.4,
        }}
      >
        {row.failure}
      </div>
      {/* Pair rendered as inline text instead of chips on mobile. Two
          attempts at chips didn't work: inline `PAIR · chip1 · × ·
          chip2` left chip2 wrapping alone with an orphaned × on the
          previous line, and promoting PAIR to its own row still
          didn't fit the widest pair ("Next-token prediction" +
          "Knowledge (sparse)" sum to ~344 px of chip width vs
          ~298 px of card content). Text with a small "PAIR" label
          prefix wraps cleanly if needed and reads more like
          continuous prose, which fits the card's overall reading
          flow anyway. */}
      <div
        className="mb-3 font-sans text-body-sm"
        style={{ color: dim ? 'rgb(var(--secondary))' : 'rgb(var(--body))', lineHeight: 1.5 }}
      >
        <span
          className="font-mono text-[10px] font-semibold uppercase text-tertiary"
          style={{ letterSpacing: '0.08em', marginRight: 6 }}
        >
          Pair
        </span>
        <span className="text-ink">{row.property1}</span>
        <span className="mx-1.5 text-tertiary">×</span>
        <span className="text-ink">{row.property2}</span>
      </div>
      <div className="font-sans text-body-sm" style={{ color: dim ? 'rgb(var(--secondary))' : 'rgb(var(--body))', lineHeight: 1.5 }}>
        <span
          className="font-mono text-[10px] font-semibold uppercase text-tertiary"
          style={{ letterSpacing: '0.08em', marginRight: 6 }}
        >
          Fix
        </span>
        {row.fix}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <th
      scope="col"
      className="font-sans text-h4 font-semibold text-ink"
      style={{
        textAlign: 'left',
        padding: '10px 14px',
        borderBottom: '1px solid rgb(var(--border-light))',
        fontSize: 13,
      }}
    >
      {children}
    </th>
  );
}

const cellHeaderStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: 'rgb(var(--surface))',
  borderTop: '1px solid rgb(var(--border-light))',
  borderBottom: '1px solid rgb(var(--border-light))',
};

function PairRowEl({
  row,
  variant,
}: {
  row: PairRow;
  variant: 'core' | 'extension';
}): JSX.Element {
  const dim = variant === 'extension';
  return (
    <tr style={{ borderBottom: '1px solid rgb(var(--border-light))' }}>
      <td style={cellStyle(dim)}>
        <span className="text-ink">{row.failure}</span>
      </td>
      <td style={cellStyle(dim)}>{row.property1}</td>
      <td style={cellStyle(dim)}>{row.property2}</td>
      <td style={cellStyle(dim)}>{row.fix}</td>
    </tr>
  );
}

function cellStyle(dim: boolean): React.CSSProperties {
  return {
    padding: '12px 14px',
    verticalAlign: 'top',
    color: dim ? 'rgb(var(--secondary))' : 'rgb(var(--body))',
    background: dim ? 'rgb(var(--surface))' : 'rgb(var(--white))',
    fontSize: 13,
  };
}
