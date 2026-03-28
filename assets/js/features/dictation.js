/**
 * Browser speech-to-text (Web Speech API). Best in Chromium; Safari/iOS varies.
 * Not a substitute for Khaya — only fills the textarea before you translate.
 */

export function getSpeechRecognitionConstructor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/**
 * BCP-47 tag for recognition from route like "en-tw" (uses source = segment before '-').
 * @param {string} langPair
 */
export function recognitionLangFromPair(langPair) {
  const first = String(langPair).split("-")[0]?.trim().toLowerCase() || "en";
  const map = {
    en: "en-US",
    tw: "en-GH",
    gaa: "en-GH",
    ee: "en-GH",
    fat: "en-GH",
    dag: "en-GH",
    gur: "en-GH",
    yo: "en-NG",
    ki: "sw-KE",
    luo: "en-KE",
    mer: "en-KE",
    kus: "en-GH",
  };
  return map[first] || "en-US";
}

/**
 * @param {{
 *   lang: string,
 *   onTranscript: (text: string) => void,
 *   onError?: (err: Error) => void,
 *   onEnd?: () => void
 * }} opts
 */
export function startDictation({ lang, onTranscript, onError, onEnd }) {
  const Ctor = getSpeechRecognitionConstructor();
  if (!Ctor) {
    onError?.(
      new Error(
        "Speech recognition is not supported in this browser. Try Chrome or Edge on desktop."
      )
    );
    onEnd?.();
    return null;
  }
  const r = new Ctor();
  r.lang = lang;
  r.interimResults = false;
  r.continuous = false;
  r.maxAlternatives = 1;
  r.onresult = (event) => {
    const text = event.results[0][0].transcript;
    onTranscript(text);
  };
  r.onerror = (event) => {
    if (event.error === "aborted") {
      onEnd?.();
      return;
    }
    if (event.error === "no-speech") {
      onEnd?.();
      return;
    }
    onError?.(new Error(event.error || "Speech recognition failed"));
    onEnd?.();
  };
  r.onend = () => onEnd?.();
  try {
    r.start();
  } catch (e) {
    onError?.(e instanceof Error ? e : new Error(String(e)));
    onEnd?.();
    return null;
  }
  return r;
}
