// ReferenceTrigger — registry-driven trigger + panel for the stateless
// reference items (R1–R3, R5–R7). Owns its own open/close state and
// renders both the button (delegated to ReferenceTriggerButton) and the
// ReferencePanel inline. Replaces six near-identical RxTrigger
// components; those files remain as one-line wrappers so existing call
// sites keep working. R4 is NOT in the registry — its checklist state
// is lifted into R4Trigger so checks survive panel close/reopen.
//
// Multiple instances on the same page are independent; only one panel
// can be visible at a time anyway because the body scroll lock is
// exclusive.

import { useState, type ComponentType } from 'react';
import { ReferencePanel } from './ReferencePanel';
import { ReferenceTriggerButton } from './ReferenceTriggerButton';
import { R1QuickReference } from './items/R1QuickReference';
import { R2DelegationGuide } from './items/R2DelegationGuide';
import { R3PromptTemplate } from './items/R3PromptTemplate';
import { R5CapabilityBoundary } from './items/R5CapabilityBoundary';
import { R6DiligenceTemplate } from './items/R6DiligenceTemplate';
import { R7PolicyStarter } from './items/R7PolicyStarter';

export type ReferenceId = 'R1' | 'R2' | 'R3' | 'R5' | 'R6' | 'R7';

interface ReferenceMeta {
  defaultLabel: string;
  title: string;
  pdfPath: string;
  pdfFilename: string;
  Content: ComponentType;
}

const REFERENCE_ITEMS: Record<ReferenceId, ReferenceMeta> = {
  R1: {
    defaultLabel: '4D Quick Reference',
    title: '4D Competency Quick-Reference Card',
    pdfPath: 'reference/r1-4d-quick-reference.pdf',
    pdfFilename: 'r1-4d-quick-reference.pdf',
    Content: R1QuickReference,
  },
  R2: {
    defaultLabel: 'Delegation Decision Guide',
    title: 'Task Delegation Decision Guide',
    pdfPath: 'reference/r2-task-delegation-guide.pdf',
    pdfFilename: 'r2-task-delegation-guide.pdf',
    Content: R2DelegationGuide,
  },
  R3: {
    defaultLabel: 'Prompt Structure Template',
    title: 'Prompt Structure Template',
    pdfPath: 'reference/r3-prompt-structure-template.pdf',
    pdfFilename: 'r3-prompt-structure-template.pdf',
    Content: R3PromptTemplate,
  },
  R5: {
    defaultLabel: 'Capability Boundary',
    title: 'AI Capability Boundary Reference',
    pdfPath: 'reference/r5-capability-boundary-reference.pdf',
    pdfFilename: 'r5-capability-boundary-reference.pdf',
    Content: R5CapabilityBoundary,
  },
  R6: {
    defaultLabel: 'Diligence Statement Template',
    title: 'AI Diligence Statement Template',
    pdfPath: 'reference/r6-diligence-statement-template.pdf',
    pdfFilename: 'r6-diligence-statement-template.pdf',
    Content: R6DiligenceTemplate,
  },
  R7: {
    defaultLabel: 'Team Policy Starter',
    title: 'Organizational AI Use Policy Starter',
    pdfPath: 'reference/r7-policy-starter.pdf',
    pdfFilename: 'r7-policy-starter.pdf',
    Content: R7PolicyStarter,
  },
};

export interface ReferenceTriggerProps {
  refId: ReferenceId;
  /** Override the registry's default trigger label. */
  label?: string;
}

export function ReferenceTrigger({ refId, label }: ReferenceTriggerProps): JSX.Element {
  const meta = REFERENCE_ITEMS[refId];
  const [open, setOpen] = useState(false);
  return (
    <>
      <ReferenceTriggerButton
        refId={refId}
        label={label ?? meta.defaultLabel}
        onClick={() => setOpen(true)}
      />
      <ReferencePanel
        isOpen={open}
        onClose={() => setOpen(false)}
        id={refId}
        title={meta.title}
        pdfPath={meta.pdfPath}
        pdfFilename={meta.pdfFilename}
      >
        <meta.Content />
      </ReferencePanel>
    </>
  );
}
