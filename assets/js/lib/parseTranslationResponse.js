/**
 * Normalizes the POST /translate 200 body per OpenAPI `translationResponse` (JSON string).
 * @param {string} raw
 * @returns {string}
 */
export function parseTranslationResponse(raw) {
  const trimmed = raw.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return raw;
    }
  }
  try {
    const parsed = JSON.parse(trimmed);
    return typeof parsed === "string" ? parsed : raw;
  } catch {
    return raw;
  }
}
