const STORAGE_KEY = "threadline:pulse:v1";
const MAX_ENTRIES = 14;

/**
 * @typedef {{ id: number, lang: string, source: string, result: string }} HistoryEntry
 */

/** @returns {HistoryEntry[]} */
export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** @param {HistoryEntry} entry */
export function pushHistory(entry) {
  const prev = loadHistory();
  const next = [
    {
      id: entry.id ?? Date.now(),
      lang: entry.lang,
      source: entry.source,
      result: entry.result,
    },
    ...prev.filter((e) => e.id !== entry.id),
  ].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

/** @param {number} id */
export function removeHistoryEntry(id) {
  const next = loadHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
