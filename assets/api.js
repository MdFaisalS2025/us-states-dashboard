// assets/api.js
// External insights from World Bank with graceful fallback

const WB_BASE = 'https://api.worldbank.org/v2/country/USA/indicator';
const GDP_IND  = 'NY.GDP.MKTP.CD';
const POP_IND  = 'SP.POP.TOTL';

async function fetchLatest(indicator) {
  const url = `${WB_BASE}/${indicator}?format=json&per_page=60`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('World Bank API error');
  const json = await res.json();
  const rows = json?.[1] || [];
  // pick the first non-null most recent value
  const row = rows.find(r => r.value !== null);
  if (!row) throw new Error('No data');
  return { value: row.value, year: row.date };
}

export async function getUsaGdpAndPop() {
  try {
    const [gdp, pop] = await Promise.all([
      fetchLatest(GDP_IND),
      fetchLatest(POP_IND)
    ]);
    return {
      source: 'World Bank Open Data',
      gdp, pop
    };
  } catch {
    return {
      source: 'Local fallback',
      gdp: { value: 0, year: new Date().getFullYear() - 1 },
      pop: { value: 0, year: new Date().getFullYear() - 1 }
    };
  }
}
