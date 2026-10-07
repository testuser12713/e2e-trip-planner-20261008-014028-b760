import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Field } from '../../components/Field';
import { useTripStore } from '../../store/TripStoreContext';
import {
  firstInvalidField,
  validateTripForm,
  type TripFormField,
  type TripFormValues,
} from './validation';

const EMPTY_VALUES: TripFormValues = {
  name: '',
  destination: '',
  startDate: '',
  endDate: '',
};

/**
 * The create-trip form. Validates on submit, reveals a field's error only once
 * that field was touched (blur) or the form was submitted, focuses the first
 * invalid field and persists a valid trip before returning to the list.
 */
export function TripForm() {
  const { createTrip } = useTripStore();
  const navigate = useNavigate();

  const [values, setValues] = useState<TripFormValues>(EMPTY_VALUES);
  const [touched, setTouched] = useState<
    Partial<Record<TripFormField, boolean>>
  >({});
  const [submitted, setSubmitted] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  function focusField(field: TripFormField) {
    const refs = {
      name: nameRef,
      destination: destinationRef,
      startDate: startDateRef,
      endDate: endDateRef,
    };
    refs[field].current?.focus();
  }

  const errors = validateTripForm(values);
  const errorFor = (field: TripFormField): string | undefined =>
    touched[field] || submitted ? errors[field] : undefined;

  function handleChange(field: TripFormField) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setValues((prev) => ({ ...prev, [field]: value }));
    };
  }

  function handleBlur(field: TripFormField) {
    return () => setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    const currentErrors = validateTripForm(values);
    const firstInvalid = firstInvalidField(currentErrors);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    createTrip({
      name: values.name.trim(),
      destination: values.destination.trim(),
      startDate: values.startDate,
      endDate: values.endDate,
    });
    navigate('/');
  }

  return (
    <form
      className="trip-form"
      noValidate
      onSubmit={handleSubmit}
      aria-label="New trip"
    >
      <Field id="trip-name" label="Trip name" error={errorFor('name')}>
        <input
          ref={nameRef}
          className="input"
          type="text"
          name="name"
          autoComplete="off"
          placeholder="e.g. Amalfi Coast"
          value={values.name}
          onChange={handleChange('name')}
          onBlur={handleBlur('name')}
        />
      </Field>

      <Field
        id="trip-destination"
        label="Destination"
        error={errorFor('destination')}
      >
        <input
          ref={destinationRef}
          className="input"
          type="text"
          name="destination"
          autoComplete="off"
          placeholder="e.g. Positano, Italy"
          value={values.destination}
          onChange={handleChange('destination')}
          onBlur={handleBlur('destination')}
        />
      </Field>

      <Field id="trip-start" label="Start date" error={errorFor('startDate')}>
        <input
          ref={startDateRef}
          className="input"
          type="date"
          name="startDate"
          value={values.startDate}
          onChange={handleChange('startDate')}
          onBlur={handleBlur('startDate')}
        />
      </Field>

      <Field id="trip-end" label="End date" error={errorFor('endDate')}>
        <input
          ref={endDateRef}
          className="input"
          type="date"
          name="endDate"
          value={values.endDate}
          onChange={handleChange('endDate')}
          onBlur={handleBlur('endDate')}
        />
      </Field>

      <div className="trip-form__actions">
        <Link to="/" className="btn btn--secondary">
          Cancel
        </Link>
        <button type="submit" className="btn btn--primary">
          Save trip
        </button>
      </div>
    </form>
  );
}
