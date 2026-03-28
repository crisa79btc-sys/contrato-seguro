const STORAGE_KEY = 'contrato-seguro:history';
const MAX_ITEMS = 10;

export type HistoryEntry = {
  contractId: string;
  filename: string;
  contractType: string;
  score: number;
  date: string; // ISO
};

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addToHistory(entry: HistoryEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getHistory().filter((h) => h.contractId !== entry.contractId);
    history.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_ITEMS)));
  } catch {
    // localStorage cheio ou indisponível
  }
}
