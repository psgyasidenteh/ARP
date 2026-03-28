/**
 * Maps a non-OK response body to OpenAPI `responseError` fields when possible.
 * @param {number} status
 * @param {string} statusText
 * @param {string} rawBody
 * @returns {{ type: string, message: string }}
 */
export function parseApiError(status, statusText, rawBody) {
  let type = `${status} ${statusText}`;
  let message = rawBody;
  try {
    const data = JSON.parse(rawBody);
    if (data && typeof data === "object" && "message" in data) {
      type = data.type || type;
      message = String(data.message);
    }
  } catch {
    /* keep defaults */
  }
  return { type, message };
}
