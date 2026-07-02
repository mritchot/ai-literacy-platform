// R4Trigger — Output Verification Checklist. Deliberately NOT a thin
// wrapper over the registry-driven ReferenceTrigger like its siblings:
// the panel body has interactive checkboxes the learner toggles while
// verifying an output, and that state is lifted here so checks persist
// across panel close/reopen for the lifetime of this instance (the
// panel unmounts its children on close). Checks naturally reset when
// the learner navigates away from the activity.

import { useCallback, useState } from 'react';
import { ReferencePanel } from './ReferencePanel';
import { ReferenceTriggerButton } from './ReferenceTriggerButton';
import { R4VerificationChecklist } from './items/R4VerificationChecklist';

interface R4TriggerProps {
  label?: string;
  variant?: 'tab';
}

export function R4Trigger({
  label = 'Verification Checklist',
  variant,
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
