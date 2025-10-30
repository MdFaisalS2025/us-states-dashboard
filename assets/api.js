const DATAUSA_BASE = "https://datausa.io/api/data";

async function fetchJson(url){
  const res = await fetch(url, { cache: "no-store", mode: "cors" });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function fetchLatestPopulation() {
  const url = `${DATAUSA_BASE}?drilldowns=State&measures=Population&year=latest`;
  const data = await fetchJson(url);
  const rows = (data?.data ?? []).sort((a,b)=>b.Population - a.Population).slice(0,5);
  return rows.map(r => ({ state: r.State, population: r.Population, year: r.Year }));
}

export async function fetchLatestGDP() {
  const url = `${DATAUSA_BASE}?drilldowns=State&measures=GDP&year=latest`;
  const data = await fetchJson(url);
  const rows = (data?.data ?? []).sort((a,b)=>b.GDP - a.GDP).slice(0,5);
  return rows.map(r => ({ state: r.State, gdp: r.GDP, year: r.Year }));
}

export async function renderApiInsight(containerId){
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="card p-3">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-1">External Insights</h5>
          <p class="muted mb-2">Top states by latest Population & GDP (DataUSA)</p>
        </div>
        <button class="btn btn-outline-light btn-sm" id="apiRefreshBtn" aria-label="Refresh insights">Refresh</button>
      </div>
      <div id="apiInsightBody" class="mt-2">
        <div class="text-muted-2">Loading…</div>
      </div>
    </div>
  `;

  async function load(){
    const body = document.getElementById("apiInsightBody");
    try {
      body.innerHTML = `<div class="text-muted-2">Loading…</div>`;
      const [pop, gdp] = await Promise.all([fetchLatestPopulation(), fetchLatestGDP()]);
      const popList = pop.map(p=>`<li>${p.state}: <strong>${p.population.toLocaleString()}</strong> <span class="badge badge-soft ms-2">(${p.year})</span></li>`).join("");
      const gdpList = gdp.map(p=>`<li>${p.state}: <strong>$${p.gdp.toLocaleString()}</strong> <span class="badge badge-soft ms-2">(${p.year})</span></li>`).join("");

      body.innerHTML = `
        <div class="row g-3">
          <div class="col-md-6">
            <h6 class="mb-2">Population</h6>
            <ul class="mb-0 ps-3">${popList}</ul>
          </div>
          <div class="col-md-6">
            <h6 class="mb-2">GDP</h6>
            <ul class="mb-0 ps-3">${gdpList}</ul>
          </div>
        </div>
        <small class="d-block mt-3 text-muted-2">Source: datausa.io — fetched dynamically (read-only).</small>
      `;
    } catch (e) {
      body.innerHTML = `
        <div class="alert alert-warning mb-0">
          Couldn’t load insights. This might be a network/privacy-blocker issue.<br/>
          <small class="text-muted">Tip: try clicking “Refresh”, or disable aggressive shields for this page.</small>
        </div>
      `;
    }
  }

  document.getElementById("apiRefreshBtn").addEventListener("click", load);
  await load();
}
