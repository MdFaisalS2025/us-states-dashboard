// World Bank API (read-only) — robust fetch with fallback
const WB_BASE = 'https://api.worldbank.org/v2/country/USA/indicator/';

async function fetchWB(indicator){
  // Pull a small recent range and take the newest non-null value
  const url = `${WB_BASE}${indicator}?format=json&per_page=8&date=2019:2025`;
  const r = await fetch(url, { mode: 'cors', cache: 'no-store' });
  if(!r.ok) throw new Error(`WB HTTP ${r.status}`);
  const j = await r.json();
  const arr = Array.isArray(j?.[1]) ? j[1] : [];
  const row = arr.find(d => d && d.value != null);
  return { value: row?.value ?? null, date: row?.date ?? '—' };
}

export async function loadExternalInsights(){
  try{
    const [gdp, pop] = await Promise.all([
      fetchWB('NY.GDP.MKTP.CD'), // GDP (current US$)
      fetchWB('SP.POP.TOTL')     // Population
    ]);
    return { gdp, pop, source: 'World Bank Open Data' };
  }catch(e){
    return { gdp:{value:null,date:'—'}, pop:{value:null,date:'—'}, source:'World Bank Open Data' };
  }
}
