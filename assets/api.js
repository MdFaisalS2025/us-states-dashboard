// assets/api.js
// World Bank API for reliable external insights (national level)
const WB_BASE = "https://api.worldbank.org/v2/country/USA/indicator";
const GDP_CODE = "NY.GDP.MKTP.CD";   // GDP (current US$)
const POP_CODE = "SP.POP.TOTL";      // Population total
const fmt = (n)=>Number(n||0).toLocaleString();

async function getLatest(code){
  const url = `${WB_BASE}/${code}?format=json&per_page=60`;
  const res = await fetch(url, { cache:"no-store" });
  if(!res.ok) throw new Error("API " + res.status);
  const json = await res.json();
  // json[1] is array of observations, sort by date desc and find first with value
  const row = (json?.[1]||[]).find(r => r.value != null);
  return { date: row?.date, value: row?.value };
}

export async function renderApiInsight(containerId){
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="card p-3">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-1">External Insights (World Bank)</h5>
          <p class="muted mb-2">Latest national GDP & Population for the USA (read-only)</p>
        </div>
        <button id="wbRefresh" class="btn btn-outline-light btn-sm">Refresh</button>
      </div>
      <div id="wbBody" class="mt-2 text-muted-2">Loading…</div>
    </div>
  `;
  async function load(){
    const body = document.getElementById("wbBody");
    body.textContent = "Loading…";
    try{
      const [gdp, pop] = await Promise.all([getLatest(GDP_CODE), getLatest(POP_CODE)]);
      body.innerHTML = `
        <div class="row g-3">
          <div class="col-md-6">
            <h6 class="mb-1">USA GDP (current US$)</h6>
            <div class="display-6">$${fmt(gdp.value)}</div>
            <small class="text-muted-2">Year: ${gdp.date}</small>
          </div>
          <div class="col-md-6">
            <h6 class="mb-1">USA Population</h6>
            <div class="display-6">${fmt(pop.value)}</div>
            <small class="text-muted-2">Year: ${pop.date}</small>
          </div>
        </div>
        <small class="d-block mt-3 text-muted-2">Source: World Bank Open Data (CORS enabled)</small>
      `;
    }catch(e){
      body.innerHTML = `<div class="alert alert-warning">Couldn’t load insights (network or blocker). Try Refresh.</div>`;
    }
  }
  document.getElementById("wbRefresh").addEventListener("click", load);
  load();
}
