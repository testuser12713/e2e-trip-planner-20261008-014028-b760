/**
 * Thin, defensive wrapper around localStorage. Every read falls back to an empty
 * list so a corrupt or unavailable store can never crash the app.
 */

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadCollection<T>(key: string): T[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function saveCollection<T>(key: string, items: T[]): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Storage can be full or disabled (private mode). The in-memory state stays
    // authoritative for this session; there is nothing safe to do here.
  }
}
