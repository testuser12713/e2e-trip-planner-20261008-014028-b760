import { useRef, useState, type FormEvent } from 'react';
import { Field } from '../../components/Field';
import { useTripStore } from '../../store/TripStoreContext';
import { validateItemName } from './validation';

export interface PackingListProps {
  tripId: string;
}

function TrashIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 5h12M8 5V3.5h2V5M5.5 5l.7 9h5.6l.7-9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The trip's packing list: progress, an add-item form and one row per item.
 * All state lives in the store, so every change survives a reload.
 */
export function PackingList({ tripId }: PackingListProps) {
  const { packing, addPackingItem, togglePackingItem, removePackingItem } =
    useTripStore();

  const items = packing.filter((item) => item.tripId === tripId);
  const packedCount = items.filter((item) => item.packed).length;
  const total = items.length;
  const percent = total === 0 ? 0 : (packedCount / total) * 100;

  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Neutral until the field was touched or the form submitted (AC-17).
  const error = touched ? validateItemName(name) : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (validateItemName(name)) {
      inputRef.current?.focus();
      return;
    }
    addPackingItem(tripId, name.trim());
    setName('');
    setTouched(false);
    inputRef.current?.focus();
  }

  return (
    <section className="panel" data-od-id="packing-panel">
      <div
        className="packing-progress"
        role="status"
        aria-live="polite"
        data-od-id="packing-progress"
      >
        <span className="packing-progress__text">
          {packedCount} of {total} packed
        </span>
        <div className="packing-progress__track" data-od-id="packing-track">
          <div
            className="packing-progress__fill"
            style={{ width: `${percent}%` }}
            data-od-id="packing-fill"
          />
        </div>
      </div>

      <form className="add-item" noValidate onSubmit={handleSubmit}>
        <Field id="new-item" label="Add an item" error={error}>
          <input
            ref={inputRef}
            className="input"
            type="text"
            name="item"
            placeholder="e.g. Passport"
            autoComplete="off"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setTouched(true);
            }}
          />
        </Field>
        <button type="submit" className="btn btn--secondary btn--responsive">
          Add
        </button>
      </form>

      <ul className="packing-list" data-od-id="packing-list">
        {items.map((item) => (
          <li
            key={item.id}
            className={
              item.packed ? 'packing-item packing-item--packed' : 'packing-item'
            }
          >
            <label className="packing-item__label">
              <input
                type="checkbox"
                className="packing-item__checkbox"
                checked={item.packed}
                onChange={() => togglePackingItem(item.id)}
              />
              <span className="packing-item__text">{item.name}</span>
            </label>
            <button
              type="button"
              className="btn btn--danger-ghost btn--icon"
              aria-label="Delete item"
              onClick={() => removePackingItem(item.id)}
            >
              <TrashIcon />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
