import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  STORAGE_KEYS,
  type Activity,
  type PackingItem,
  type Trip,
} from '../types';
import { loadCollection, saveCollection } from '../storage';

export type TripInput = Omit<Trip, 'id'>;
// Includes tripId: addActivity(input) has to know which trip the activity
// belongs to. The shared contract's `Omit<Activity,'id'|'tripId'>` cannot build a
// valid Activity (tripId is required), so the single argument carries it.
export type ActivityInput = Omit<Activity, 'id'>;

export interface TripStore {
  trips: Trip[];
  activities: Activity[];
  packing: PackingItem[];
  createTrip(input: TripInput): Trip;
  renameTrip(id: string, name: string): void;
  deleteTrip(id: string): void;
  addActivity(input: ActivityInput): Activity;
  updateActivity(id: string, patch: Partial<ActivityInput>): void;
  deleteActivity(id: string): void;
  addPackingItem(tripId: string, name: string): void;
  togglePackingItem(id: string): void;
  removePackingItem(id: string): void;
}

const TripStoreContext = createContext<TripStore | null>(null);

function generateId(): string {
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return cryptoObj.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function TripStoreProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(() =>
    loadCollection<Trip>(STORAGE_KEYS.trips),
  );
  const [activities, setActivities] = useState<Activity[]>(() =>
    loadCollection<Activity>(STORAGE_KEYS.activities),
  );
  const [packing, setPacking] = useState<PackingItem[]>(() =>
    loadCollection<PackingItem>(STORAGE_KEYS.packing),
  );

  useEffect(() => {
    saveCollection(STORAGE_KEYS.trips, trips);
  }, [trips]);

  useEffect(() => {
    saveCollection(STORAGE_KEYS.activities, activities);
  }, [activities]);

  useEffect(() => {
    saveCollection(STORAGE_KEYS.packing, packing);
  }, [packing]);

  const createTrip = useCallback((input: TripInput): Trip => {
    const trip: Trip = { ...input, id: generateId() };
    setTrips((prev) => [...prev, trip]);
    return trip;
  }, []);

  const renameTrip = useCallback((id: string, name: string): void => {
    setTrips((prev) =>
      prev.map((trip) => (trip.id === id ? { ...trip, name } : trip)),
    );
  }, []);

  const deleteTrip = useCallback((id: string): void => {
    setTrips((prev) => prev.filter((trip) => trip.id !== id));
    setActivities((prev) => prev.filter((activity) => activity.tripId !== id));
    setPacking((prev) => prev.filter((item) => item.tripId !== id));
  }, []);

  const addActivity = useCallback((input: ActivityInput): Activity => {
    const activity: Activity = { ...input, id: generateId() };
    setActivities((prev) => [...prev, activity]);
    return activity;
  }, []);

  const updateActivity = useCallback(
    (id: string, patch: Partial<ActivityInput>): void => {
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === id ? { ...activity, ...patch } : activity,
        ),
      );
    },
    [],
  );

  const deleteActivity = useCallback((id: string): void => {
    setActivities((prev) => prev.filter((activity) => activity.id !== id));
  }, []);

  const addPackingItem = useCallback((tripId: string, name: string): void => {
    const item: PackingItem = { id: generateId(), tripId, name, packed: false };
    setPacking((prev) => [...prev, item]);
  }, []);

  const togglePackingItem = useCallback((id: string): void => {
    setPacking((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, packed: !item.packed } : item,
      ),
    );
  }, []);

  const removePackingItem = useCallback((id: string): void => {
    setPacking((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo<TripStore>(
    () => ({
      trips,
      activities,
      packing,
      createTrip,
      renameTrip,
      deleteTrip,
      addActivity,
      updateActivity,
      deleteActivity,
      addPackingItem,
      togglePackingItem,
      removePackingItem,
    }),
    [
      trips,
      activities,
      packing,
      createTrip,
      renameTrip,
      deleteTrip,
      addActivity,
      updateActivity,
      deleteActivity,
      addPackingItem,
      togglePackingItem,
      removePackingItem,
    ],
  );

  return (
    <TripStoreContext.Provider value={value}>
      {children}
    </TripStoreContext.Provider>
  );
}

export function useTripStore(): TripStore {
  const store = useContext(TripStoreContext);
  if (!store) {
    throw new Error('useTripStore must be used within a TripStoreProvider');
  }
  return store;
}
