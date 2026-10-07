import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PackingList } from './PackingList';
import { TripStoreProvider } from '../../store/TripStoreContext';
import { STORAGE_KEYS, type PackingItem } from '../../types';

const TRIP_ID = 'trip-1';

function renderPacking() {
  return render(
    <TripStoreProvider>
      <PackingList tripId={TRIP_ID} />
    </TripStoreProvider>,
  );
}

function readStoredPacking(): PackingItem[] {
  const raw = window.localStorage.getItem(STORAGE_KEYS.packing);
  return raw ? (JSON.parse(raw) as PackingItem[]) : [];
}

async function addItem(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.type(screen.getByLabelText('Add an item'), name);
  await user.click(screen.getByRole('button', { name: 'Add' }));
}

describe('PackingList', () => {
  it('shows an empty list as 0 of 0 packed', () => {
    renderPacking();

    expect(screen.getByRole('status')).toHaveTextContent('0 of 0 packed');
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('adds an item and counts it as unpacked', async () => {
    const user = userEvent.setup();
    renderPacking();

    await addItem(user, 'Passport');

    expect(screen.getByText('Passport')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 of 1 packed');
    expect(readStoredPacking()).toHaveLength(1);
    expect(readStoredPacking()[0]).toMatchObject({
      tripId: TRIP_ID,
      name: 'Passport',
      packed: false,
    });
  });

  it('ticks and unticks an item and follows the counter', async () => {
    const user = userEvent.setup();
    renderPacking();

    await addItem(user, 'Passport');
    await addItem(user, 'Charger');

    const passport = screen.getByRole('checkbox', { name: 'Passport' });
    await user.click(passport);

    expect(passport).toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('1 of 2 packed');
    expect(
      screen.getByText('Passport').closest('.packing-item'),
    ).toHaveClass('packing-item--packed');

    await user.click(passport);

    expect(passport).not.toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('0 of 2 packed');
    expect(
      screen.getByText('Passport').closest('.packing-item'),
    ).not.toHaveClass('packing-item--packed');
  });

  it('deletes an item and updates the counter', async () => {
    const user = userEvent.setup();
    renderPacking();

    await addItem(user, 'Passport');
    await addItem(user, 'Charger');

    const passportRow = screen
      .getByText('Passport')
      .closest('.packing-item') as HTMLElement;
    await user.click(
      within(passportRow).getByRole('button', { name: 'Delete item' }),
    );

    expect(screen.queryByText('Passport')).not.toBeInTheDocument();
    expect(screen.getByText('Charger')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 of 1 packed');
    expect(readStoredPacking()).toHaveLength(1);
  });

  it('rejects an empty name at the field and stores nothing', async () => {
    const user = userEvent.setup();
    renderPacking();

    // An untouched form is neutral: no error before the user acts.
    expect(screen.queryByText('Please enter an item name')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(
      screen.getByText('Please enter an item name'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Add an item'),
    ).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('0 of 0 packed');
    expect(readStoredPacking()).toHaveLength(0);
  });

  it('rejects a whitespace-only name', async () => {
    const user = userEvent.setup();
    renderPacking();

    await addItem(user, '   ');

    expect(screen.getByRole('status')).toHaveTextContent('0 of 0 packed');
    expect(readStoredPacking()).toHaveLength(0);
  });

  it('survives a fresh mount with the packed state intact', async () => {
    const user = userEvent.setup();
    const first = renderPacking();

    await addItem(user, 'Passport');
    await user.click(screen.getByRole('checkbox', { name: 'Passport' }));
    first.unmount();

    renderPacking();

    expect(screen.getByText('Passport')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Passport' })).toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('1 of 1 packed');
  });
});
