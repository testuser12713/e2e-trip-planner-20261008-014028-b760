import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TripStoreProvider } from '../../store/TripStoreContext';
import { ADD_ACTIVITY_EVENT, ActivityList } from './ActivityList';

const TRIP_ID = 'trip-1';
const DATE = '2025-05-12';

function renderList() {
  return render(
    <TripStoreProvider>
      <ActivityList tripId={TRIP_ID} date={DATE} />
    </TripStoreProvider>,
  );
}

function dispatchAddActivity(detail: { tripId: string; date: string }) {
  fireEvent(
    window,
    new CustomEvent(ADD_ACTIVITY_EVENT, { detail }),
  );
}

/** The create form is open when its submit button (not the trigger) exists. */
function formIsOpen(): boolean {
  return screen.queryByRole('button', { name: 'Save activity' }) !== null;
}

describe('ActivityList add-activity handshake', () => {
  it('opens the activity form when the event targets its own day', () => {
    renderList();
    expect(formIsOpen()).toBe(false);

    dispatchAddActivity({ tripId: TRIP_ID, date: DATE });

    expect(formIsOpen()).toBe(true);
  });

  it('stays closed when the event targets a different trip', () => {
    renderList();

    dispatchAddActivity({ tripId: 'other-trip', date: DATE });

    expect(formIsOpen()).toBe(false);
    expect(
      screen.getByRole('button', { name: 'Add activity' }),
    ).toBeInTheDocument();
  });

  it('stays closed when the event targets a different day', () => {
    renderList();

    dispatchAddActivity({ tripId: TRIP_ID, date: '2025-05-13' });

    expect(formIsOpen()).toBe(false);
    expect(
      screen.getByRole('button', { name: 'Add activity' }),
    ).toBeInTheDocument();
  });
});
