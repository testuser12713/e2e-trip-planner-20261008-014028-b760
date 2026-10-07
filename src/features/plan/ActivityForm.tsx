import { useRef, useState, type FormEvent } from 'react';
import {
  ACTIVITY_CATEGORIES,
  type Activity,
  type ActivityCategory,
} from '../../types';
import { useTripStore } from '../../store/TripStoreContext';
import { Field } from '../../components/Field';

export interface ActivityFormProps {
  tripId: string;
  date: string;
  /** When present the form edits this activity; otherwise it creates a new one. */
  activity?: Activity;
  /** Hides the form again (collapse back to the 'Add activity' button). */
  onClose: () => void;
}

interface FormValues {
  title: string;
  time: string;
  location: string;
  cost: string;
  category: ActivityCategory;
}

function initialValues(activity?: Activity): FormValues {
  return {
    title: activity?.title ?? '',
    time: activity?.time ?? '',
    location: activity?.location ?? '',
    cost: activity ? String(activity.cost) : '',
    category: activity?.category ?? 'Activities',
  };
}

/**
 * Inline form used both to create and (prefilled) to edit an activity. It
 * validates on touch/submit only and writes through the shared trip store.
 */
export function ActivityForm({
  tripId,
  date,
  activity,
  onClose,
}: ActivityFormProps) {
  const { addActivity, updateActivity } = useTripStore();
  const [values, setValues] = useState<FormValues>(() => initialValues(activity));
  const [touched, setTouched] = useState({ title: false, cost: false });
  const [submitted, setSubmitted] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const costRef = useRef<HTMLInputElement>(null);

  const titleError = values.title.trim() === '' ? 'Please enter a title' : undefined;

  const costValue = values.cost.trim() === '' ? 0 : Number(values.cost);
  const costError =
    !Number.isFinite(costValue) || costValue < 0
      ? 'Please enter a cost of 0 or more'
      : undefined;

  const showTitleError = (submitted || touched.title) && titleError;
  const showCostError = (submitted || touched.cost) && costError;

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (titleError || costError) {
      if (titleError) {
        titleRef.current?.focus();
      } else {
        costRef.current?.focus();
      }
      return;
    }

    const payload = {
      tripId,
      date,
      title: values.title.trim(),
      time: values.time || '00:00',
      location: values.location.trim(),
      cost: costValue,
      category: values.category,
    };

    if (activity) {
      updateActivity(activity.id, payload);
    } else {
      addActivity(payload);
    }
    onClose();
  }

  return (
    <form className="activity-form" onSubmit={handleSubmit} noValidate>
      <h3 className="activity-form__title">
        {activity ? 'Edit activity' : 'Add activity'}
      </h3>

      <Field
        id="activity-title"
        label="Title"
        error={showTitleError ? titleError : undefined}
      >
        <input
          ref={titleRef}
          className="input"
          type="text"
          value={values.title}
          placeholder="e.g. Dinner at Da Vincenzo"
          autoComplete="off"
          onChange={(event) => update('title', event.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
        />
      </Field>

      <Field id="activity-time" label="Time">
        <input
          className="input"
          type="time"
          value={values.time}
          onChange={(event) => update('time', event.target.value)}
        />
      </Field>

      <Field id="activity-location" label="Location">
        <input
          className="input"
          type="text"
          value={values.location}
          placeholder="Optional"
          autoComplete="off"
          onChange={(event) => update('location', event.target.value)}
        />
      </Field>

      <Field
        id="activity-cost"
        label="Cost (€)"
        error={showCostError ? costError : undefined}
      >
        <input
          ref={costRef}
          className="input"
          type="number"
          min={0}
          step={0.01}
          inputMode="decimal"
          placeholder="0.00"
          value={values.cost}
          onChange={(event) => update('cost', event.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, cost: true }))}
        />
      </Field>

      <Field id="activity-category" label="Category">
        <select
          className="select"
          value={values.category}
          onChange={(event) =>
            update('category', event.target.value as ActivityCategory)
          }
        >
          {ACTIVITY_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </Field>

      <div className="activity-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary">
          {activity ? 'Save changes' : 'Save activity'}
        </button>
      </div>
    </form>
  );
}
