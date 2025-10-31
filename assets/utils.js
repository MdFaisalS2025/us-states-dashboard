export const $ = (sel, ctx=document) => ctx.querySelector(sel);
export const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];

export const fmtInt = (n) => (isNaN(n)||n===null)?'0':Number(n).toLocaleString('en-US');
export const fmtUsd = (n) => '$' + fmtInt(n);

export const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
export const load = (k, d=[]) => {
  try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; }
  catch { return d; }
};

export const on = (el, evt, fn) => el && el.addEventListener(evt, fn);
