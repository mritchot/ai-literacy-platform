// R2Trigger — Task Delegation Decision Guide. See R1Trigger.tsx for
// the shared trigger pattern.

import { useState } from 'react';
import { ReferencePanel } from './ReferencePanel';
import { ReferenceTriggerButton } from './ReferenceTriggerButton';
import { R2DelegationGuide } from './items/R2DelegationGuide';

interface R2TriggerProps {
  label?: string;
  variant?: 'inline' | 'tab';
}

export function R2Trigger({
  label = 'Delegation Decision Guide',
  variant = 'inline',
}: R2TriggerProps): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ReferenceTriggerButton
        refId="R2"
        label={label}
        onClick={() => setOpen(true)}
        variant={variant}
      />
      <ReferencePanel
        isOpen={open}
        onClose={() => setOpen(false)}
        id="R2"
        title="Task Delegation Decision Guide"
        pdfPath="/reference/r2-task-delegation-guide.pdf"
        pdfFilename="r2-task-delegation-guide.pdf"
      >
        <R2DelegationGuide />
      </ReferencePanel>
    </>
  );
}
