export function fmtInt(n){ return Number(n||0).toLocaleString('en-US') }
export function fmtUSD(n){ return `$${Number(n||0).toLocaleString('en-US')}` }
export function el(sel, root=document){ return root.querySelector(sel) }
export function els(sel, root=document){ return [...root.querySelectorAll(sel)] }
export const LS_KEY = 'us_states_v1';
