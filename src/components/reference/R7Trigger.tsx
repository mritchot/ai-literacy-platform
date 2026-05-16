// R7Trigger — Organizational AI Use Policy Starter. See R1Trigger.tsx
// for the shared trigger pattern. R7 lives at exactly one location:
// M4 S9 (Program Closing) — the handoff tool the learner takes back to
// their team after finishing the program.

import { useState } from 'react';
import { ReferencePanel } from './ReferencePanel';
import { ReferenceTriggerButton } from './ReferenceTriggerButton';
import { R7PolicyStarter } from './items/R7PolicyStarter';

interface R7TriggerProps {
  label?: string;
  variant?: 'inline' | 'tab';
}

export function R7Trigger({
  label = 'Team Policy Starter',
  variant = 'inline',
}: R7TriggerProps): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ReferenceTriggerButton
        refId="R7"
        label={label}
        onClick={() => setOpen(true)}
        variant={variant}
      />
      <ReferencePanel
        isOpen={open}
        onClose={() => setOpen(false)}
        id="R7"
        title="Organizational AI Use Policy Starter"
        pdfPath="/reference/r7-policy-starter.pdf"
        pdfFilename="r7-policy-starter.pdf"
      >
        <R7PolicyStarter />
      </ReferencePanel>
    </>
  );
}
