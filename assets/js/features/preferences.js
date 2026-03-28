const KEY = "threadline:pref:langPair:v1";

/** @param {string} pair e.g. en-tw */
export function getPreferredLangPair() {
  try {
    const v = localStorage.getItem(KEY);
    return typeof v === "string" && v.includes("-") ? v : null;
  } catch {
    return null;
  }
}

/** @param {string} pair */
export function setPreferredLangPair(pair) {
  const t = String(pair).trim();
  if (!t || !t.includes("-")) return;
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* quota / private mode */
  }
}
