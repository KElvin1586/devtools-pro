/** Tool usage history (premium feature). Stored locally, never sent anywhere. */

export interface HistoryEntry {
  id: string;
  toolId: string;
  toolName: string;
  action: string;
  preview: string;
  timestamp: number;
}

const HISTORY_KEY = 'devtools.history';
const MAX_ENTRIES = 100;

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  try {
    const history = getHistory();
    history.unshift({
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_ENTRIES)));
  } catch {
    // storage full/unavailable — history is best-effort
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}
