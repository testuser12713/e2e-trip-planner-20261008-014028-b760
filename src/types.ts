export type ActivityCategory =
  | 'Travel'
  | 'Accommodation'
  | 'Food'
  | 'Activities'
  | 'Shopping'
  | 'Other';

export const ACTIVITY_CATEGORIES: readonly ActivityCategory[] = [
  'Travel',
  'Accommodation',
  'Food',
  'Activities',
  'Shopping',
  'Other',
] as const;

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
}

export interface Activity {
  id: string;
  tripId: string;
  title: string;
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:mm'
  location: string;
  cost: number;
  category: ActivityCategory;
}

export interface PackingItem {
  id: string;
  tripId: string;
  name: string;
  packed: boolean;
}

export const STORAGE_KEYS = {
  trips: 'tripPlanner.trips.v1',
  activities: 'tripPlanner.activities.v1',
  packing: 'tripPlanner.packing.v1',
} as const;
