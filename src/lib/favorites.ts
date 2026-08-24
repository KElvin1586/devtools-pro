/** Favorite (pinned) tools — a premium convenience stored locally. */

const FAVORITES_KEY = 'devtools.favorites';

export function getFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

export function isFavorite(toolId: string): boolean {
  return getFavorites().includes(toolId);
}

export function toggleFavorite(toolId: string): string[] {
  const current = getFavorites();
  const next = current.includes(toolId)
    ? current.filter((id) => id !== toolId)
    : [...current, toolId];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}
