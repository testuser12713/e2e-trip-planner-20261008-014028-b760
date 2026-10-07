import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

export interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

/**
 * Wraps a single form control with its label and (optional) inline error. The
 * control receives the matching id plus aria-invalid / aria-describedby so the
 * label and error are programmatically linked to it.
 */
export function Field({ id, label, error, children }: FieldProps) {
  const errorId = `${id}-error`;
  let control: ReactNode = children;

  if (isValidElement(children)) {
    const extra: Record<string, unknown> = { id };
    if (error) {
      extra['aria-invalid'] = true;
      extra['aria-describedby'] = errorId;
    }
    control = cloneElement(
      children as ReactElement<Record<string, unknown>>,
      extra,
    );
  }

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {control}
      {error ? (
        <p className="field__error" id={errorId} role="alert">
          <span className="field__error-icon" aria-hidden="true">
            !
          </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}
