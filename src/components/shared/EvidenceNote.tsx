// EvidenceNote — a collapsed "evidence behind this" disclosure placed
// between paragraphs (never inside a <p>). Corroborating sources stay one
// tap away while the reading path keeps the claim and one anchoring
// figure. Collapsed by default; the print shell renders it open.
//
// The source count in the label is derived from the <Citation> chips in
// the children, so it cannot drift from the content it describes.

import {
  Children,
  isValidElement,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { usePrintMode } from '../../contexts/PrintModeContext';
import { Citation } from './Citation';
import { Icon } from './Icon';

interface EvidenceNoteProps {
  /** Stable slug. Forms the region id and the analytics payload. */
  id: string;
  moduleId: number;
  sectionId: number;
  label?: string;
  children: ReactNode;
}

const DEFAULT_LABEL = 'The evidence behind this';

type ElementProps = { children?: ReactNode; ids?: string | string[] };

function collectCitationIds(node: ReactNode, into: Set<string>): void {
  Children.forEach(node, (child) => {
    if (!isValidElement<ElementProps>(child)) return;
    if (child.type === Citation) {
      const { ids } = child.props;
      if (ids === undefined) return;
      for (const sourceId of Array.isArray(ids) ? ids : [ids]) into.add(sourceId);
      return;
    }
    collectCitationIds(child.props.children, into);
  });
}

function sourceCountLabel(children: ReactNode): string {
  const ids = new Set<string>();
  collectCitationIds(children, ids);
  if (ids.size === 0) return '';
  return ` · ${ids.size} ${ids.size === 1 ? 'source' : 'sources'}`;
}

export function EvidenceNote({
  id,
  moduleId,
  sectionId,
  label = DEFAULT_LABEL,
  children,
}: EvidenceNoteProps): JSX.Element {
  const printMode = usePrintMode();
  const { track } = useAnalytics();
  const [open, setOpen] = useState(false);
  // One event per mount: the dashboard reads whether a learner consulted
  // the evidence, not how often they toggled it.
  const trackedRef = useRef(false);

  const regionId = `evidence-${id}`;
  const toggleId = `${regionId}-toggle`;
  const heading = `${label}${sourceCountLabel(children)}`;
  const contentClass = 'space-y-2 font-sans text-body-sm text-body';
  const contentStyle = { padding: '0 14px 14px' };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !trackedRef.current) {
      trackedRef.current = true;
      track({ type: 'evidence_note_opened', moduleId, sectionId, payload: { id } });
    }
  };

  if (printMode) {
    return (
      <section className="border border-border-light bg-surface">
        <h4
          className="m-0 font-mono text-[11px] font-normal uppercase text-tertiary"
          style={{ padding: '10px 14px 8px', letterSpacing: '0.08em' }}
        >
          {heading}
        </h4>
        <div className={contentClass} style={contentStyle}>
          {children}
        </div>
      </section>
    );
  }

  return (
    <section className="border border-border-light bg-surface">
      <button
        type="button"
        id={toggleId}
        aria-expanded={open}
        aria-controls={regionId}
        onClick={toggle}
        className="flex min-h-[44px] w-full items-center gap-2 text-left font-mono text-[11px] uppercase text-tertiary transition-colors duration-[160ms] hover:text-secondary"
        style={{ padding: '10px 14px', letterSpacing: '0.08em' }}
      >
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={12} />
        {heading}
      </button>
      {/* The region stays mounted so aria-controls always resolves; its
          content mounts only when open, which keeps collapsed citation
          chips out of the tab order. */}
      <div
        id={regionId}
        role="region"
        aria-labelledby={toggleId}
        hidden={!open}
        className={contentClass}
        style={contentStyle}
      >
        {open && children}
      </div>
    </section>
  );
}
