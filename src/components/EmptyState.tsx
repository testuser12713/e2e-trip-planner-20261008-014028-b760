import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  hint: string;
  children?: ReactNode;
}

/** Centred placeholder that always names the concrete next action. */
export function EmptyState({ title, hint, children }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        ✦
      </span>
      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__hint">{hint}</p>
      {children ? <div className="empty-state__action">{children}</div> : null}
    </div>
  );
}
