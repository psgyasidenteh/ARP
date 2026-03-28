/**
 * Translation URL.
 * Default: same-origin proxy (server.mjs) avoids browser CORS to Ghana NLP.
 * Direct (no proxy): set to `https://translation-api.ghananlp.org/v1/translate`.
 */
export const API_ORIGIN = "https://translation-api.ghananlp.org";
export const API_BASE_PATH = "/v1";

/** @type {string} */
export const TRANSLATE_ENDPOINT = "/api/v1/translate";

/** OpenAPI security: apiKeyHeader */
export const SUBSCRIPTION_HEADER = "Ocp-Apim-Subscription-Key";

/**
 * Ghana NLP primary subscription key (sent as Ocp-Apim-Subscription-Key).
 * This is visible to anyone who can open the site or DevTools — fine for local/hackathon use;
 * for production, use your own backend or a secret store instead.
 */
export const SUBSCRIPTION_KEY = "";

export const MAX_INPUT_LENGTH = 1000;

/** Shown in footer; keep in sync with package.json when you ship. */
export const APP_VERSION = "0.1.0";
