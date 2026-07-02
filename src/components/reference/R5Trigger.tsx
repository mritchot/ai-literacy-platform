// R5Trigger — AI Capability Boundary Reference. See R1Trigger.tsx for
// the shared trigger pattern. R5 is the only reference that appears at
// THREE locations (P5, P6, P7 in Module 3) — each Module 3 activity
// teaches one mechanical pillar, and R5 is the integrated map the
// learner can reference at any of those moments.

import { useState } from 'react';
import { ReferencePanel } from './ReferencePanel';
import { ReferenceTriggerButton } from './ReferenceTriggerButton';
import { R5CapabilityBoundary } from './items/R5CapabilityBoundary';

interface R5TriggerProps {
  label?: string;
  variant?: 'inline' | 'tab';
}

export function R5Trigger({
  label = 'Capability Boundary',
  variant = 'inline',
}: R5TriggerProps): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ReferenceTriggerButton
        refId="R5"
        label={label}
        onClick={() => setOpen(true)}
        variant={variant}
      />
      <ReferencePanel
        isOpen={open}
        onClose={() => setOpen(false)}
        id="R5"
        title="AI Capability Boundary Reference"
        pdfPath="reference/r5-capability-boundary-reference.pdf"
        pdfFilename="r5-capability-boundary-reference.pdf"
      >
        <R5CapabilityBoundary />
      </ReferencePanel>
    </>
  );
}
