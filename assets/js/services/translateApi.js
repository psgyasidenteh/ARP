import { TRANSLATE_ENDPOINT, SUBSCRIPTION_HEADER } from "../config.js";

/**
 * @typedef {{ in: string, lang: string }} TranslateRequest
 */

/**
 * POST /v1/translate
 * @param {TranslateRequest} payload
 * @param {string} [subscriptionKey]
 * @returns {Promise<{ ok: boolean, status: number, statusText: string, body: string }>}
 */
export async function postTranslate(payload, subscriptionKey) {
  const headers = { "Content-Type": "application/json" };
  const key = subscriptionKey?.trim();
  if (key) headers[SUBSCRIPTION_HEADER] = key;

  const res = await fetch(TRANSLATE_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      in: payload.in,
      lang: payload.lang.trim(),
    }),
  });

  const body = await res.text();
  return {
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    body,
  };
}
