const euroFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'EUR',
});

/** Formats a number as a euro amount, e.g. 1234.5 -> "€1,234.50". */
export function formatEuro(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return euroFormatter.format(safe);
}
