// R1Trigger — drop-in trigger + panel for the 4D Quick-Reference Card.
// Owns its own open/close state and renders both the button (delegated
// to ReferenceTriggerButton) and the ReferencePanel inline.
//
// Multiple instances on the same page are independent; only one panel
// can be visible at a time anyway because the body scroll lock is
// exclusive.

import { useState } from 'react';
import { ReferencePanel } from './ReferencePanel';
import { ReferenceTriggerButton } from './ReferenceTriggerButton';
import { R1QuickReference } from './items/R1QuickReference';

interface R1TriggerProps {
  /**
   * Override the default trigger label. Defaults to "4D Quick Reference".
   */
  label?: string;
  /**
   * Visual variant — 'inline' (default) for in-flow placement,
   * 'tab' for use inside `<ReferenceTabRail>`.
   */
  variant?: 'inline' | 'tab';
}

export function R1Trigger({
  label = '4D Quick Reference',
  variant = 'inline',
}: R1TriggerProps): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ReferenceTriggerButton
        refId="R1"
        label={label}
        onClick={() => setOpen(true)}
        variant={variant}
      />
      <ReferencePanel
        isOpen={open}
        onClose={() => setOpen(false)}
        id="R1"
        title="4D Competency Quick-Reference Card"
        pdfPath="reference/r1-4d-quick-reference.pdf"
        pdfFilename="r1-4d-quick-reference.pdf"
      >
        <R1QuickReference />
      </ReferencePanel>
    </>
  );
}
