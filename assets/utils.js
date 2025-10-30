// assets/utils.js
export const fmt = {
  int(n) {
    if (n === null || n === undefined) return '0';
    return Number(n).toLocaleString('en-US');
  },
  money(n) {
    return `$${fmt.int(n)}`;
  },
  bigAbbrev(n) {
    if (!n) return '0';
    const abs = Math.abs(n);
    const units = [
      { v: 1e12, s: 'T' },
      { v: 1e9,  s: 'B' },
      { v: 1e6,  s: 'M' },
      { v: 1e3,  s: 'K' },
    ];
    for (const u of units) {
      if (abs >= u.v) return (n / u.v).toFixed(1).replace(/\.0$/,'') + u.s;
    }
    return String(n);
  }
};

export function bindNavActive() {
  const href = location.pathname.split('/').pop();
  document.querySelectorAll('nav a').forEach(a => {
    const is = a.getAttribute('href') === href;
    a.classList.toggle('active', is);
  });
}
