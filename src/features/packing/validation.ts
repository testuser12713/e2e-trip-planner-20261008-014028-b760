/** Message shown when a packing item is submitted without a name. */
export const ITEM_NAME_REQUIRED = 'Please enter an item name';

/**
 * Validates a packing item name. Returns the error message for an empty (or
 * whitespace-only) name and `undefined` when the name is usable.
 */
export function validateItemName(name: string): string | undefined {
  return name.trim() === '' ? ITEM_NAME_REQUIRED : undefined;
}
