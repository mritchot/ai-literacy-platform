// ArtifactViewerModal — read-only modal for viewing full learner artifact
// text (reflections, action commitments, diligence statements). 4D §12A.
// Focus moves to Close on open; Escape closes.

import { useEffect, useRef } from 'react';
import { Icon } from '../components/shared/Icon';

interface ArtifactViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export function ArtifactViewerModal({
  isOpen,
  onClose,
  title,
  content,
}: ArtifactViewerModalProps): JSX.Element | null {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = 'artifact-modal-title';
  const bodyId = 'artifact-modal-body';

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = (document.activeElement as HTMLElement) ?? null;
    closeRef.current?.focus();
    return () => {
      previouslyFocused.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Tab') {
        // Single focusable element — keep focus on Close.
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ padding: 16 }}
    >
      <button
        type="button"
        aria-label="Close artifact viewer"
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.3)', cursor: 'default' }}
      />
      <div
        className="relative flex flex-col rounded-xl bg-[rgb(var(--white))]"
        style={{
          maxWidth: 560,
          width: '100%',
          maxHeight: '70vh',
          padding: 24,
          border: '1px solid rgb(var(--border))',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.18)',
        }}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2
            id={titleId}
            className="m-0 font-sans text-h3 font-semibold text-ink"
            style={{ letterSpacing: '-0.005em' }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-2 flex h-9 w-9 items-center justify-center rounded-md text-tertiary hover:bg-surface hover:text-ink"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <div
          id={bodyId}
          className="font-sans text-body text-secondary"
          style={{
            whiteSpace: 'pre-wrap',
            overflowY: 'auto',
            lineHeight: 1.6,
            paddingRight: 4,
          }}
        >
          {content}
        </div>
        <div className="mt-5 flex justify-end">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 font-sans text-[13px] font-semibold text-secondary hover:bg-surface"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
