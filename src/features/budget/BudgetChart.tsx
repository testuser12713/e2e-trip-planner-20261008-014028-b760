import { formatEuro } from '../../lib/format';
import { barWidthPercent, type BudgetSummary } from './aggregate';

export interface BudgetChartProps {
  summary: BudgetSummary;
}

/**
 * Hand-built category chart: plain DOM + CSS, no chart library, canvas or SVG.
 * The 'Total' row sits above one bar per occurring category, ordered descending
 * by sum; each bar's fill width is its share of the largest category.
 */
export function BudgetChart({ summary }: BudgetChartProps) {
  return (
    <>
      <div className="budget-total" data-od-id="budget-total">
        <span className="budget-total__label">Total</span>
        <span className="budget-total__amount">
          {formatEuro(summary.total)}
        </span>
      </div>
      <div className="budget-bars" data-od-id="budget-rows">
        {summary.categories.map(({ category, sum }) => {
          const label = `${category}: ${formatEuro(sum)}`;
          return (
            <div
              key={category}
              className="budget-bar"
              data-od-id={`budget-row-${category.toLowerCase()}`}
            >
              <span className="budget-bar__label">{category}</span>
              <div className="budget-bar__track" title={label}>
                <div
                  className="budget-bar__fill"
                  style={{
                    width: `${barWidthPercent(sum, summary.max)}%`,
                    // DESIGN: the 6px minimum only applies to a positive sum.
                    minWidth: sum > 0 ? undefined : 0,
                  }}
                  role="img"
                  aria-label={label}
                />
              </div>
              <span className="budget-bar__amount">{formatEuro(sum)}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
