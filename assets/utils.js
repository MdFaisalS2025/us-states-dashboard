// Tiny helpers shared across pages
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const fmtNumber = (n) => new Intl.NumberFormat('en-US').format(+n || 0);
export const fmtMoney  = (n) => `$${fmtNumber(+n || 0)}`;

export const getParam = (key) => new URLSearchParams(location.search).get(key);
