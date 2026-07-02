// R6Trigger — AI Diligence Statement Template. See R1Trigger.tsx for
// the shared trigger pattern.

import { useState } from 'react';
import { ReferencePanel } from './ReferencePanel';
import { ReferenceTriggerButton } from './ReferenceTriggerButton';
import { R6DiligenceTemplate } from './items/R6DiligenceTemplate';

interface R6TriggerProps {
  label?: string;
  variant?: 'inline' | 'tab';
}

export function R6Trigger({
  label = 'Diligence Statement Template',
  variant = 'inline',
}: R6TriggerProps): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ReferenceTriggerButton
        refId="R6"
        label={label}
        onClick={() => setOpen(true)}
        variant={variant}
      />
      <ReferencePanel
        isOpen={open}
        onClose={() => setOpen(false)}
        id="R6"
        title="AI Diligence Statement Template"
        pdfPath="reference/r6-diligence-statement-template.pdf"
        pdfFilename="r6-diligence-statement-template.pdf"
      >
        <R6DiligenceTemplate />
      </ReferencePanel>
    </>
  );
}
