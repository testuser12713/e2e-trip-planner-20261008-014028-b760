import {
  ACTIVITY_CATEGORIES,
  type Activity,
  type ActivityCategory,
} from '../../types';

export interface CategoryTotal {
  category: ActivityCategory;
  sum: number;
}

export interface BudgetSummary {
  /** Sum over every activity of the trip, zero-cost ones included. */
  total: number;
  /** Categories in which at least one activity occurs, sorted descending by sum. */
  categories: CategoryTotal[];
  /** The largest category sum, used to scale the bars; 0 without activities. */
  max: number;
}

/**
 * Aggregates a trip's activities into per-category sums.
 *
 * Only categories that actually occur appear in the result — a category with a
 * zero-cost activity is still included (the activity occurs, the sum is 0).
 * Categories with equal sums keep the fixed {@link ACTIVITY_CATEGORIES} order so
 * the chart is deterministic.
 */
export function aggregateBudget(
  activities: readonly Activity[],
): BudgetSummary {
  const sums = new Map<ActivityCategory, number>();
  let total = 0;

  for (const activity of activities) {
    const cost = Number.isFinite(activity.cost) ? activity.cost : 0;
    sums.set(activity.category, (sums.get(activity.category) ?? 0) + cost);
    total += cost;
  }

  const categories: CategoryTotal[] = [];
  for (const category of ACTIVITY_CATEGORIES) {
    const sum = sums.get(category);
    if (sum !== undefined) {
      categories.push({ category, sum });
    }
  }

  categories.sort((a, b) => b.sum - a.sum);

  const max = categories.reduce(
    (peak, entry) => Math.max(peak, entry.sum),
    0,
  );

  return { total, categories, max };
}

/**
 * A category's share of the largest category, in percent (0–100, two decimals).
 * The largest category is therefore exactly 100%; a missing/invalid peak or a
 * non-positive sum yields 0.
 */
export function barWidthPercent(sum: number, max: number): number {
  if (!Number.isFinite(sum) || !Number.isFinite(max) || max <= 0) {
    return 0;
  }
  const percent = (sum / max) * 100;
  return Math.max(0, Math.min(100, Math.round(percent * 100) / 100));
}
