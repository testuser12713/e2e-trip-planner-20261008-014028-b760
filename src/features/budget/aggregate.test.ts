import { describe, expect, it } from 'vitest';
import { aggregateBudget, barWidthPercent } from './aggregate';
import type { Activity, ActivityCategory } from '../../types';

function activity(
  category: ActivityCategory,
  cost: number,
  id = `${category}-${cost}`,
): Activity {
  return {
    id,
    tripId: 'trip-1',
    title: 'Sample',
    date: '2025-05-12',
    time: '10:00',
    location: '',
    cost,
    category,
  };
}

describe('aggregateBudget', () => {
  it('sums the activities per category and the trip total', () => {
    const summary = aggregateBudget([
      activity('Accommodation', 400),
      activity('Accommodation', 240),
      activity('Travel', 270),
      activity('Food', 130.5),
    ]);

    expect(summary.total).toBeCloseTo(1040.5, 2);
    expect(summary.max).toBe(640);
    expect(summary.categories).toEqual([
      { category: 'Accommodation', sum: 640 },
      { category: 'Travel', sum: 270 },
      { category: 'Food', sum: 130.5 },
    ]);
  });

  it('only reports categories in which an activity occurs', () => {
    const summary = aggregateBudget([activity('Food', 12)]);
    expect(summary.categories.map((entry) => entry.category)).toEqual(['Food']);
  });

  it('keeps a zero-cost category because the activity still occurs', () => {
    const summary = aggregateBudget([
      activity('Activities', 0),
      activity('Travel', 50),
    ]);
    const zero = summary.categories.find(
      (entry) => entry.category === 'Activities',
    );
    expect(zero).toEqual({ category: 'Activities', sum: 0 });
    expect(summary.total).toBe(50);
  });

  it('sorts categories descending by sum', () => {
    const summary = aggregateBudget([
      activity('Shopping', 10),
      activity('Food', 90),
      activity('Travel', 50),
    ]);
    expect(summary.categories.map((entry) => entry.sum)).toEqual([90, 50, 10]);
  });

  it('returns an empty summary without activities', () => {
    expect(aggregateBudget([])).toEqual({
      total: 0,
      categories: [],
      max: 0,
    });
  });
});

describe('barWidthPercent', () => {
  it('makes the largest category a full-width bar', () => {
    expect(barWidthPercent(640, 640)).toBe(100);
  });

  it('scales a smaller category to its share of the largest', () => {
    expect(barWidthPercent(270, 640)).toBeCloseTo(42.19, 2);
  });

  it('returns 0 when there is no peak to scale against', () => {
    expect(barWidthPercent(0, 0)).toBe(0);
    expect(barWidthPercent(50, 0)).toBe(0);
  });

  it('never exceeds 100 percent', () => {
    expect(barWidthPercent(900, 640)).toBe(100);
  });
});
