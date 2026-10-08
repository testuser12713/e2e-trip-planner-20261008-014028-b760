import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Field } from '../../components/Field';
import { useTripStore } from '../../store/TripStoreContext';
import type { Trip } from '../../types';

export interface TripHeaderActionsProps {
  trip: Trip;
}

interface DialogFrameProps {
  role: 'dialog' | 'alertdialog';
  labelledBy: string;
  /** Called when the dialog wants to close (Esc, overlay click, Cancel). */
  onClose: () => void;
  /** Focused once the dialog is mounted; defaults to the dialog panel. */
  initialFocus?: () => void;
  children: ReactNode;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Minimal modal frame shared by the rename and delete dialogs. It renders an
 * overlay + panel, moves focus into the panel, keeps Tab inside it, closes on
 * Esc and locks background scrolling while open (see DESIGN.md ConfirmDialog).
 */
function DialogFrame({
  role,
  labelledBy,
  onClose,
  initialFocus,
  children,
}: DialogFrameProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Keep the latest callback without re-running the focus effect on every
  // render (re-selecting on each keystroke would swallow typed characters).
  const initialFocusRef = useRef(initialFocus);
  initialFocusRef.current = initialFocus;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const focus = initialFocusRef.current;
    if (focus) {
      focus();
    } else {
      panelRef.current?.focus();
    }
  }, []);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab' || !panelRef.current) {
      return;
    }
    const focusables = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    );
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="confirm-overlay"
      onKeyDown={handleKeyDown}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        className="confirm-dialog"
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
}

const EMPTY_NAME_ERROR = 'Please enter a trip name';

/**
 * Trip-level actions for the detail header: Rename (dialog with an inline
 * validated field) and Delete trip (confirmation dialog). Both write through
 * the shared store, so the new name is visible everywhere a render reads it.
 */
export function TripHeaderActions({ trip }: TripHeaderActionsProps) {
  const { renameTrip, deleteTrip } = useTripStore();
  const navigate = useNavigate();

  const renameButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);

  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [name, setName] = useState(trip.name);
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nameError = name.trim() === '' ? EMPTY_NAME_ERROR : undefined;
  // Neutral until the field was touched or the form submitted.
  const showNameError = (submitted || touched) && nameError;

  function openRename() {
    setName(trip.name);
    setTouched(false);
    setSubmitted(false);
    setRenameOpen(true);
  }

  function closeRename() {
    setRenameOpen(false);
    renameButtonRef.current?.focus();
  }

  function handleRenameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (nameError) {
      nameInputRef.current?.focus();
      return;
    }
    renameTrip(trip.id, name.trim());
    closeRename();
  }

  function openDelete() {
    setDeleteOpen(true);
  }

  function closeDelete() {
    setDeleteOpen(false);
    deleteButtonRef.current?.focus();
  }

  function confirmDelete() {
    setDeleteOpen(false);
    deleteTrip(trip.id);
    navigate('/');
  }

  return (
    <>
      <button
        ref={renameButtonRef}
        type="button"
        className="btn btn--ghost"
        onClick={openRename}
      >
        Rename
      </button>
      <button
        ref={deleteButtonRef}
        type="button"
        className="btn btn--ghost btn--danger-ghost"
        onClick={openDelete}
      >
        Delete
      </button>

      {renameOpen ? (
        <DialogFrame
          role="dialog"
          labelledBy="rename-trip-title"
          onClose={closeRename}
          initialFocus={() => {
            nameInputRef.current?.focus();
            nameInputRef.current?.select();
          }}
        >
          <h2 className="confirm-dialog__title" id="rename-trip-title">
            Rename trip
          </h2>
          <form onSubmit={handleRenameSubmit} noValidate>
            <Field
              id="rename-trip-name"
              label="Trip name"
              error={showNameError ? nameError : undefined}
            >
              <input
                ref={nameInputRef}
                className="input"
                type="text"
                value={name}
                autoComplete="off"
                onChange={(event) => setName(event.target.value)}
                onBlur={() => setTouched(true)}
              />
            </Field>
            <div className="confirm-dialog__actions" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={closeRename}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn--primary">
                Save
              </button>
            </div>
          </form>
        </DialogFrame>
      ) : null}

      {deleteOpen ? (
        <DialogFrame
          role="alertdialog"
          labelledBy="delete-trip-title"
          onClose={closeDelete}
          initialFocus={() => cancelDeleteRef.current?.focus()}
        >
          <h2 className="confirm-dialog__title" id="delete-trip-title">
            Delete trip?
          </h2>
          <p className="confirm-dialog__body">
            This deletes the trip and all of its activities and packing items.
          </p>
          <div className="confirm-dialog__actions">
            <button
              ref={cancelDeleteRef}
              type="button"
              className="btn btn--secondary"
              onClick={closeDelete}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={confirmDelete}
            >
              Delete trip
            </button>
          </div>
        </DialogFrame>
      ) : null}
    </>
  );
}
