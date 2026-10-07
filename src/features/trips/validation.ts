/** Pure validation for the create-trip form. No React, no side effects. */

export interface TripFormValues {
  name: string;
  destination: string;
  startDate: string; // 'YYYY-MM-DD' or ''
  endDate: string; // 'YYYY-MM-DD' or ''
}

export type TripFormField = 'name' | 'destination' | 'startDate' | 'endDate';

export type TripFormErrors = Partial<Record<TripFormField, string>>;

/** Focus order used to move to the first invalid field on submit. */
export const TRIP_FORM_FIELD_ORDER: readonly TripFormField[] = [
  'name',
  'destination',
  'startDate',
  'endDate',
];

export const TRIP_ERROR_MESSAGES = {
  name: 'Please enter a trip name',
  destination: 'Please enter a destination',
  endDate: 'The end date must not be before the start date',
} as const;

/**
 * A trip can only be saved when name and destination are non-empty and the end
 * date is not before the start date. Dates are optional: the range rule only
 * applies once both dates are set (matching the approved mockup).
 */
export function validateTripForm(values: TripFormValues): TripFormErrors {
  const errors: TripFormErrors = {};

  if (values.name.trim() === '') {
    errors.name = TRIP_ERROR_MESSAGES.name;
  }
  if (values.destination.trim() === '') {
    errors.destination = TRIP_ERROR_MESSAGES.destination;
  }
  if (
    values.startDate !== '' &&
    values.endDate !== '' &&
    values.endDate < values.startDate
  ) {
    errors.endDate = TRIP_ERROR_MESSAGES.endDate;
  }

  return errors;
}

/** The first field in visual order that carries an error, if any. */
export function firstInvalidField(
  errors: TripFormErrors,
): TripFormField | undefined {
  return TRIP_FORM_FIELD_ORDER.find((field) => errors[field] !== undefined);
}

export function isTripFormValid(errors: TripFormErrors): boolean {
  return firstInvalidField(errors) === undefined;
}
