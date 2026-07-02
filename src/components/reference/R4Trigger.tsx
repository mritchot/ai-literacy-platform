// R4Trigger — Output Verification Checklist. See R1Trigger.tsx for the
// shared trigger pattern.
//
// R4 differs from the other RxTriggers: the panel body has interactive
// checkboxes that the learner toggles as they verify an output. Earlier
// the state lived inside R4VerificationChecklist itself, which made it
// reset on every panel close (the panel unmounts its children). The
// learner needed checks to persist while moving between the panel and
// the activity below — so the state is now lifted here. R4Trigger
// stays mounted as long as the learner is on P10, so checks persist
// across open/close cycles within an activity visit, and naturally
// reset when the learner navigates away.

import { useCallback, useState } from 'react';
import { ReferencePanel } from './ReferencePanel';
import { ReferenceTriggerButton } from './ReferenceTriggerButton';
import { R4VerificationChecklist } from './items/R4VerificationChecklist';

interface R4TriggerProps {
  label?: string;
  variant?: 'inline' | 'tab';
}

export function R4Trigger({
  label = 'Verification Checklist',
  variant = 'inline',
}: R4TriggerProps): JSX.Element {
  const [open, setOpen] = useState(false);
  // Lifted state — keyed by `${sectionId}-${itemIndex}` (e.g.,
  // "product-3"). Survives panel close/reopen for the lifetime of this
  // R4Trigger instance.
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggle = useCallback((key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <>
      <ReferenceTriggerButton
        refId="R4"
        label={label}
        onClick={() => setOpen(true)}
        variant={variant}
      />
      <ReferencePanel
        isOpen={open}
        onClose={() => setOpen(false)}
        id="R4"
        title="Output Verification Checklist"
        pdfPath="reference/r4-output-verification-checklist.pdf"
        pdfFilename="r4-output-verification-checklist.pdf"
      >
        <R4VerificationChecklist checked={checked} onToggle={toggle} />
      </ReferencePanel>
    </>
  );
}
