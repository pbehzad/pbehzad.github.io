import type { ReactNode } from 'react';

type StatusKind = 'empty' | 'loading' | 'error';

type StatusMessageProps = {
  kind: StatusKind;
  children: ReactNode;
};

/**
 * Text-only empty, loading, and error state. Callers supply the wording, so
 * the component never invents copy.
 */
export function StatusMessage({ kind, children }: StatusMessageProps) {
  return (
    <p className="ui-status" data-kind={kind} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}
