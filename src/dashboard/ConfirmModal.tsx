// ConfirmModal — reusable confirmation dialog (4D §12). `role="alertdialog"`,
// focus trap, Escape-to-close, return focus to the trigger. Used by Reset
// All Data in ExportControls.

import { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /**
   * Tone for the confirm button. `danger` uses --error coloring; `default`
   * uses --action.
   */
  tone?: 'danger' | 'default';
}

export function ConfirmModal({
  isOpen,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  tone = 'danger',
}: ConfirmModalProps): JSX.Element | null {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const confirmRef = useRef<HTMLButtonElement | null>(null);
  const titleId = 'confirm-modal-title';
  const bodyId = 'confirm-modal-body';
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Capture focus origin so we can return on close.
    previouslyFocused.current = (document.activeElement as HTMLElement) ?? null;
    // Move focus to the safe-default Cancel button.
    cancelRef.current?.focus();
    return () => {
      previouslyFocused.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }
      // Focus trap: Tab cycles between Cancel ↔ Confirm only.
      if (e.key === 'Tab') {
        const cancel = cancelRef.current;
        const confirm = confirmRef.current;
        if (!cancel || !confirm) return;
        const active = document.activeElement;
        if (e.shiftKey) {
          if (active === cancel) {
            e.preventDefault();
            confirm.focus();
          }
        } else {
          if (active === confirm) {
            e.preventDefault();
            cancel.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ padding: 16 }}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.3)', cursor: 'default' }}
      />
      {/* Card */}
      <div
        className="relative bg-[rgb(var(--white))]"
        style={{
          maxWidth: 400,
          width: '100%',
          padding: 24,
          border: '1px solid rgb(var(--border))',
        }}
      >
        <h2
          id={titleId}
          className="m-0 mb-2 font-sans text-h3 font-semibold text-ink"
          style={{ letterSpacing: '-0.005em' }}
        >
          {title}
        </h2>
        <p
          id={bodyId}
          className="m-0 mb-5 font-sans text-body text-secondary"
          style={{ lineHeight: 1.55 }}
        >
          {body}
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="px-4 py-2 font-sans text-[13px] font-semibold text-secondary hover:bg-surface"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 font-sans text-[13px] font-semibold text-[rgb(var(--white))] dark:text-[rgb(var(--canvas))]"
            style={{
              background:
                tone === 'danger' ? 'rgb(var(--error))' : 'rgb(var(--action))',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
