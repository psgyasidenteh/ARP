import {
  MAX_INPUT_LENGTH,
  SUBSCRIPTION_KEY,
  APP_VERSION,
} from "./config.js";
import { postTranslate } from "./services/translateApi.js";
import { parseTranslationResponse } from "./lib/parseTranslationResponse.js";
import { parseApiError } from "./lib/parseApiError.js";
import { swapLangPair } from "./lib/swapLangPair.js";
import {
  loadHistory,
  pushHistory,
  removeHistoryEntry,
  clearHistory,
} from "./features/translationHistory.js";
import { STARTER_PHRASES } from "./features/starterPhrases.js";
import {
  getSpeechRecognitionConstructor,
  recognitionLangFromPair,
  startDictation,
} from "./features/dictation.js";
import { getPreferredLangPair, setPreferredLangPair } from "./features/preferences.js";
import { QUICK_ROUTES } from "./features/quickRoutes.js";
import { showToast } from "./features/toast.js";

const PLACEHOLDER =
  "Translation lands here — keep the thread going.";

function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
}

function setStatus(el, text, variant) {
  el.textContent = text;
  el.className = `status-pill status-pill--${variant}`;
}

async function init() {
  const verEl = document.getElementById("product-version");
  if (verEl) verEl.textContent = `v${APP_VERSION}`;

  const hasClientKey = Boolean(String(SUBSCRIPTION_KEY).trim());
  let hasServerKey = false;
  let healthOk = false;
  const connEl = $("conn-status");
  setStatus(connEl, "Checking connection…", "neutral");

  try {
    const r = await fetch("/api/health", { cache: "no-store" });
    healthOk = r.ok;
    if (r.ok) {
      const data = await r.json();
      hasServerKey = Boolean(data?.subscriptionConfigured);
    }
  } catch {
    healthOk = false;
  }

  if (!healthOk) {
    setStatus(
      connEl,
      "Run npm run dev for API proxy",
      "bad"
    );
  } else if (hasClientKey || hasServerKey) {
    setStatus(connEl, "API key configured", "ok");
  } else {
    setStatus(connEl, "Add subscription key", "warn");
  }

  const keyBanner = $("key-banner");
  keyBanner.classList.toggle("hidden", hasClientKey || hasServerKey);

  const form = $("translate-form");
  const langInput = $("language-pair");
  const textInput = $("source-text");
  const countEl = $("char-count");
  const maxEl = $("char-max");
  const outEl = $("translation-output");
  const loadingEl = $("translation-loading");
  const errEl = $("error-banner");
  const submitBtn = $("submit-translate");
  const swapBtn = $("swap-lang");
  const dictateBtn = $("dictate-btn");
  const chipHost = $("starter-chips");
  const quickRoutesHost = $("quick-routes");
  const copyBtn = $("copy-out");
  const speakBtn = $("speak-out");
  const pulseList = $("pulse-list");
  const pulseEmpty = $("pulse-empty");
  const clearPulseBtn = $("clear-pulse");

  let lastTranslation = "";

  const savedPair = getPreferredLangPair();
  if (savedPair) langInput.value = savedPair;

  textInput.maxLength = MAX_INPUT_LENGTH;
  maxEl.textContent = String(MAX_INPUT_LENGTH);

  function syncQuickRouteChips() {
    const cur = langInput.value.trim().toLowerCase();
    quickRoutesHost.querySelectorAll(".chip").forEach((btn) => {
      const pair = btn.dataset.pair?.toLowerCase() || "";
      btn.classList.toggle("is-active", pair === cur);
    });
  }

  function setLoading(on) {
    loadingEl.classList.toggle("hidden", !on);
    outEl.classList.toggle("hidden", on);
    loadingEl.setAttribute("aria-hidden", on ? "false" : "true");
  }

  function setOutputPlaceholder() {
    setLoading(false);
    outEl.textContent = PLACEHOLDER;
    outEl.classList.add("translation--placeholder");
    lastTranslation = "";
    copyBtn.disabled = true;
    speakBtn.disabled = true;
  }

  function setOutput(text) {
    setLoading(false);
    outEl.textContent = text;
    outEl.classList.remove("translation--placeholder");
    lastTranslation = text;
    copyBtn.disabled = !text;
    speakBtn.disabled = !text || !window.speechSynthesis;
  }

  function hideError() {
    errEl.classList.remove("is-visible");
    errEl.innerHTML = "";
  }

  function showError(type, message) {
    errEl.innerHTML =
      '<div class="error-banner__type"></div><div class="error-banner__message"></div>';
    errEl.querySelector(".error-banner__type").textContent = type || "Error";
    errEl.querySelector(".error-banner__message").textContent = message || "";
    errEl.classList.add("is-visible");
  }

  function renderPulse() {
    const entries = loadHistory();
    pulseList.innerHTML = "";
    pulseEmpty.classList.toggle("hidden", entries.length > 0);

    for (const e of entries) {
      const li = document.createElement("li");
      li.className = "pulse-item";

      const main = document.createElement("button");
      main.type = "button";
      main.className = "pulse-item__btn";
      main.addEventListener("click", () => {
        langInput.value = e.lang;
        textInput.value = e.source;
        countEl.textContent = String(textInput.value.length);
        syncQuickRouteChips();
        setOutput(e.result);
        hideError();
      });

      const route = document.createElement("div");
      route.className = "pulse-item__route";
      route.textContent = e.lang;

      const src = document.createElement("div");
      src.className = "pulse-item__src";
      src.textContent = e.source;

      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "pulse-item__rm";
      rm.setAttribute("aria-label", "Remove from pulse");
      rm.textContent = "×";
      rm.addEventListener("click", (ev) => {
        ev.stopPropagation();
        removeHistoryEntry(e.id);
        renderPulse();
      });

      main.append(route, src, rm);
      li.append(main);
      pulseList.append(li);
    }
  }

  for (const r of QUICK_ROUTES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.dataset.pair = r.pair;
    b.textContent = r.label;
    b.title = r.pair;
    b.addEventListener("click", () => {
      langInput.value = r.pair;
      setPreferredLangPair(r.pair);
      syncQuickRouteChips();
      langInput.focus();
    });
    quickRoutesHost.append(b);
  }

  for (const s of STARTER_PHRASES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = s.label;
    b.title = s.text;
    b.addEventListener("click", () => {
      textInput.value = s.text;
      countEl.textContent = String(textInput.value.length);
      textInput.focus();
    });
    chipHost.append(b);
  }

  syncQuickRouteChips();

  langInput.addEventListener("input", () => syncQuickRouteChips());
  langInput.addEventListener("blur", () => {
    setPreferredLangPair(langInput.value);
  });

  swapBtn.addEventListener("click", () => {
    langInput.value = swapLangPair(langInput.value);
    setPreferredLangPair(langInput.value);
    syncQuickRouteChips();
    langInput.focus();
  });

  clearPulseBtn.addEventListener("click", () => {
    if (!loadHistory().length) return;
    if (!window.confirm("Clear all threads from Pulse on this device?")) return;
    clearHistory();
    renderPulse();
    showToast("Pulse history cleared", "success");
  });

  if (!getSpeechRecognitionConstructor()) {
    dictateBtn.disabled = true;
    dictateBtn.title =
      "Speech recognition is not available in this browser (try Chrome or Edge).";
  }

  dictateBtn.addEventListener("click", () => {
    if (dictateBtn.disabled && dictateBtn.textContent === "Listening…") return;
    hideError();
    const prev = dictateBtn.textContent;
    dictateBtn.disabled = true;
    dictateBtn.textContent = "Listening…";
    startDictation({
      lang: recognitionLangFromPair(langInput.value),
      onTranscript: (t) => {
        const chunk = t.trim();
        if (!chunk) return;
        const cur = textInput.value.trim();
        textInput.value = cur
          ? `${cur} ${chunk}`.slice(0, MAX_INPUT_LENGTH)
          : chunk.slice(0, MAX_INPUT_LENGTH);
        countEl.textContent = String(textInput.value.length);
      },
      onError: (err) => {
        showError("Dictation", err.message);
      },
      onEnd: () => {
        dictateBtn.disabled = !getSpeechRecognitionConstructor();
        dictateBtn.textContent = prev;
      },
    });
  });

  copyBtn.addEventListener("click", async () => {
    if (!lastTranslation) return;
    try {
      await navigator.clipboard.writeText(lastTranslation);
      showToast("Copied to clipboard", "success");
    } catch {
      showError("Copy", "Clipboard not available in this context.");
    }
  });

  speakBtn.addEventListener("click", () => {
    if (!lastTranslation || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(lastTranslation);
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  });

  textInput.addEventListener("input", () => {
    countEl.textContent = String(textInput.value.length);
  });

  form.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideError();
    setLoading(true);
    submitBtn.disabled = true;
    submitBtn.textContent = "Threading…";

    const lang = langInput.value;
    const source = textInput.value;
    setPreferredLangPair(lang);

    try {
      const result = await postTranslate(
        { in: source, lang },
        SUBSCRIPTION_KEY
      );

      if (result.ok) {
        const translated = parseTranslationResponse(result.body);
        setOutput(translated);
        pushHistory({
          id: Date.now(),
          lang: lang.trim(),
          source,
          result: translated,
        });
        renderPulse();
        showToast("Translation ready", "success");
      } else {
        const { type, message } = parseApiError(
          result.status,
          result.statusText,
          result.body
        );
        showError(type, message);
        setOutputPlaceholder();
      }
    } catch (err) {
      showError(
        "Network",
        err instanceof Error ? err.message : String(err)
      );
      setOutputPlaceholder();
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Run translation";
    }
  });

  renderPulse();
  setOutputPlaceholder();
}

init().catch(() => {
  /* non-fatal */
});
