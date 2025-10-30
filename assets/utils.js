// Query string helpers & DOM utils
export function qs(name, url) {
  const params = new URL(url || window.location.href).searchParams;
  return params.get(name);
}

export function uid(prefix = "ST") {
  // simple unique id for states (e.g., ST-173031489...)
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
}

export function fmtNumber(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "";
  return Number(n).toLocaleString();
}

export function fmtCurrency(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "";
  return `$${Number(n).toLocaleString()}`;
}

export function onReady(fn) {
  if (document.readyState !== "loading") fn();
  else document.addEventListener("DOMContentLoaded", fn);
}

// Simple event bus
export const Bus = new class {
  #target = document.createElement("span");
  on(evt, cb){ this.#target.addEventListener(evt, cb); }
  off(evt, cb){ this.#target.removeEventListener(evt, cb); }
  emit(evt, detail){ this.#target.dispatchEvent(new CustomEvent(evt, { detail })); }
}
