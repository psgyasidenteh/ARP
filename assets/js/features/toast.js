let toastHost = null;

function ensureHost() {
  if (!toastHost) {
    toastHost = document.getElementById("toast-host");
  }
  return toastHost;
}

/**
 * @param {string} message
 * @param {"default" | "success"} [variant]
 */
export function showToast(message, variant = "default") {
  const host = ensureHost();
  if (!host) return;

  const el = document.createElement("div");
  el.className = `toast toast--${variant}`;
  el.textContent = message;
  host.append(el);

  requestAnimationFrame(() => el.classList.add("toast--in"));

  window.setTimeout(() => {
    el.classList.remove("toast--in");
    el.classList.add("toast--out");
    window.setTimeout(() => el.remove(), 220);
  }, 2800);
}
