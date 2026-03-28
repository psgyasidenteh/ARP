/**
 * Swaps a `from-to` pair to `to-from` (e.g. en-tw → tw-en).
 * @param {string} pair
 * @returns {string}
 */
export function swapLangPair(pair) {
  const raw = pair.trim();
  const i = raw.indexOf("-");
  if (i <= 0 || i === raw.length - 1) return raw;
  const from = raw.slice(0, i);
  const to = raw.slice(i + 1);
  if (!from || !to) return raw;
  return `${to}-${from}`;
}
