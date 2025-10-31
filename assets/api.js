// World Bank snapshots (cached) for Home page insights
import { $, fmtInt } from './utils.js';

async function getGDP(){ // USA current US$ GDP
  const url = 'https://api.worldbank.org/v2/country/USA/indicator/NY.GDP.MKTP.CD?format=json';
  const r = await fetch(url); const j = await r.json();
  const row = j?.[1]?.find(x=>x.value!=null) || null;
  return row ? {value: row.value, year: row.date} : null;
}
async function getPop(){
  const url = 'https://api.worldbank.org/v2/country/USA/indicator/SP.POP.TOTL?format=json';
  const r = await fetch(url); const j = await r.json();
  const row = j?.[1]?.find(x=>x.value!=null) || null;
  return row ? {value: row.value, year: row.date} : null;
}

export async function hydrateInsights(){
  const btn = $('#refresh-insights');
  if(btn){ btn.disabled = true; btn.textContent = 'Refreshing…'; }
  try{
    const [g,p] = await Promise.all([getGDP(), getPop()]);
    if(g){
      $('#gdp-val').textContent = `$${fmtInt(g.value)} (Year: ${g.year})`;
    }
    if(p){
      $('#pop-val').textContent = `${fmtInt(p.value)} (Year: ${p.year})`;
    }
  }catch(e){
    console.error(e);
  }finally{
    if(btn){ btn.disabled = false; btn.textContent = 'Refresh'; }
  }
}
