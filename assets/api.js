// assets/api.js
// Reliable external insight with fallback to local DB if network is blocked.
import { DB } from "./model.js";

const WB = "https://api.worldbank.org/v2/country/USA/indicator";
const GDP = "NY.GDP.MKTP.CD";   // GDP (current US$)
const POP = "SP.POP.TOTL";      // Population total

async function latest(code){
  const url = `${WB}/${code}?format=json&per_page=60`;
  const res = await fetch(url, { cache:"no-store" });
  if (!res.ok) throw new Error("api "+res.status);
  const json = await res.json();
  const row = (json?.[1]||[]).find(r => r.value != null);
  return { year: row?.date, value: row?.value };
}

function localFallback(){
  const arr = DB.listStates();
  const popTop = [...arr].sort((a,b)=>b.population-a.population).slice(0,3);
  const gdpTop = [...arr].sort((a,b)=>b.gdp-a.gdp).slice(0,3);
  return `
    <div class="row g-3">
      <div class="col-md-6">
        <h6 class="mb-1">Local Top Population</h6>
        <ul class="mb-0">${popTop.map(s=>`<li>${s.name}: ${Number(s.population).toLocaleString()}</li>`).join("")}</ul>
      </div>
      <div class="col-md-6">
        <h6 class="mb-1">Local Top GDP</h6>
        <ul class="mb-0">${gdpTop.map(s=>`<li>${s.name}: $${Number(s.gdp).toLocaleString()}</li>`).join("")}</ul>
      </div>
    </div>
    <small class="text-muted-2 d-block mt-2">Showing local data because the external API was blocked by the browser/network.</small>
  `;
}

export async function mountInsights(boxId){
  const host = document.getElementById(boxId);
  if (!host) return;

  host.innerHTML = `
    <div class="card p-3">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-1">External Insights</h5>
          <p class="muted mb-0">World Bank (USA) or Local Fallback</p>
        </div>
        <button class="btn btn-outline-light btn-sm" id="insRefresh">Refresh</button>
      </div>
      <div id="insBody" class="mt-2 text-muted-2">Loading…</div>
    </div>
  `;

  async function load(){
    const body = document.getElementById("insBody");
    body.textContent = "Loading…";
    try{
      const [g, p] = await Promise.all([latest(GDP), latest(POP)]);
      body.innerHTML = `
        <div class="row g-3">
          <div class="col-md-6">
            <h6 class="mb-1">USA GDP (current US$)</h6>
            <div class="display-6" style="font-weight:700">$${Number(g.value).toLocaleString()}</div>
            <small class="text-muted-2">Year: ${g.year}</small>
          </div>
          <div class="col-md-6">
            <h6 class="mb-1">USA Population</h6>
            <div class="display-6" style="font-weight:700">${Number(p.value).toLocaleString()}</div>
            <small class="text-muted-2">Year: ${p.year}</small>
          </div>
        </div>
        <small class="text-muted-2 d-block mt-2">Source: World Bank Open Data</small>
      `;
    }catch(e){
      // graceful fallback to local data (never blank)
      body.innerHTML = localFallback();
    }
  }

  document.getElementById("insRefresh").addEventListener("click", load);
  load();
}
