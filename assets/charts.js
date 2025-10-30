// assets/charts.js
import { DB, fmtNumber, fmtCurrency } from "./model.js";

let chartPop, chartGDP, chartArea;

function byId(id){ return document.getElementById(id); }
function mkChart(id, type, data, options){
  const el = byId(id); if (!el) return null;
  const ctx = el.getContext("2d");
  // eslint-disable-next-line no-undef
  return new Chart(ctx, { type, data, options });
}
function destroyAll(){ [chartPop, chartGDP, chartArea].forEach(c => c?.destroy?.()); chartPop=chartGDP=chartArea=null; }

function setKPIs(){
  const p = byId("kpiTotalPop"), g = byId("kpiTotalGDP"), a = byId("kpiTotalArea");
  if (p) p.textContent = fmtNumber(DB.totalPopulation());
  if (g) g.textContent = fmtCurrency(DB.totalGDP());
  if (a) a.textContent = fmtNumber(DB.totalArea());
}

export function renderAllCharts(){
  // Always set KPIs; this must never throw.
  try { setKPIs(); } catch {}

  // Only render charts when canvases exist (charts page)
  const hasAny = byId("chartPopulation") || byId("chartGDP") || byId("chartArea");
  if (!hasAny) return;

  destroyAll();

  const states = DB.listStates();
  if (!states.length) return;

  const commonPlugins = {
    legend: { position: "bottom", labels: { color: "#dfe7ef" } },
    tooltip: { callbacks: { label: (ctx)=> {
      const v = ctx.parsed;
      const title = ctx.dataset.label || ctx.label || "";
      if (/gdp/i.test(title)) return `${ctx.label}: $${Number(v).toLocaleString()}`;
      return `${ctx.label}: ${Number(v).toLocaleString()}`;
    }}}
  };

  // Population Doughnut (Top 6)
  const topPop = [...states].sort((a,b)=>b.population-a.population).slice(0,6);
  chartPop = mkChart("chartPopulation","doughnut",{
    labels: topPop.map(s=>s.name),
    datasets: [{ label:"Population", data: topPop.map(s=>s.population) }]
  }, { plugins: commonPlugins, animation: { duration: 800 } });

  // GDP Bar (Top 8)
  const topGDP = [...states].sort((a,b)=>b.gdp-a.gdp).slice(0,8);
  chartGDP = mkChart("chartGDP","bar",{
    labels: topGDP.map(s=>s.name),
    datasets: [{ label:"GDP", data: topGDP.map(s=>s.gdp) }]
  }, {
    plugins: commonPlugins,
    scales: {
      x: { ticks: { color:"#9fb1c5" } },
      y: { ticks: { color:"#9fb1c5", callback:v=>"$"+Number(v).toLocaleString() } }
    },
    animation:{ duration:800 }
  });

  // Area Line (Top 10)
  const topArea = [...states].sort((a,b)=>b.area-a.area).slice(0,10);
  chartArea = mkChart("chartArea","line",{
    labels: topArea.map(s=>s.name),
    datasets: [{ label:"Land Area (km²)", data: topArea.map(s=>s.area), tension:.35, fill:false }]
  }, {
    plugins: commonPlugins,
    scales: {
      x: { ticks: { color:"#9fb1c5" } },
      y: { ticks: { color:"#9fb1c5", callback:v=>Number(v).toLocaleString() } }
    },
    animation:{ duration:800 }
  });
}
