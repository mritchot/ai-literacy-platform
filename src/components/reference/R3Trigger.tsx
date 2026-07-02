// R3Trigger — Prompt Structure Template. See R1Trigger.tsx for the
// shared trigger pattern.

import { useState } from 'react';
import { ReferencePanel } from './ReferencePanel';
import { ReferenceTriggerButton } from './ReferenceTriggerButton';
import { R3PromptTemplate } from './items/R3PromptTemplate';

interface R3TriggerProps {
  label?: string;
  variant?: 'inline' | 'tab';
}

export function R3Trigger({
  label = 'Prompt Structure Template',
  variant = 'inline',
}: R3TriggerProps): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ReferenceTriggerButton
        refId="R3"
        label={label}
        onClick={() => setOpen(true)}
        variant={variant}
      />
      <ReferencePanel
        isOpen={open}
        onClose={() => setOpen(false)}
        id="R3"
        title="Prompt Structure Template"
        pdfPath="reference/r3-prompt-structure-template.pdf"
        pdfFilename="r3-prompt-structure-template.pdf"
      >
        <R3PromptTemplate />
      </ReferencePanel>
    </>
  );
}
