// assets/charts.js
import { DB } from "./model.js";

let chartPop, chartGDP, chartArea;
const byId = id => document.getElementById(id);
const mk = (id, type, data, options) => {
  const el = byId(id); if (!el) return null;
  // eslint-disable-next-line no-undef
  return new Chart(el.getContext("2d"), { type, data, options });
};
const kill = () => [chartPop, chartGDP, chartArea].forEach(c => c?.destroy?.());

function setKPIs(){
  const p = byId("kpiTotalPop"), g = byId("kpiTotalGDP"), a = byId("kpiTotalArea");
  if (p) p.textContent = DB.totalPopulation().toLocaleString();
  if (g) g.textContent = ("$" + DB.totalGDP().toLocaleString());
  if (a) a.textContent = DB.totalArea().toLocaleString();
}

export function renderAllCharts(){
  // Always update KPIs (home or charts page)
  try { setKPIs(); } catch {}

  // Only make charts if canvases exist
  const have = byId("chartPopulation") || byId("chartGDP") || byId("chartArea");
  if (!have) return;

  const data = DB.listStates();
  if (!data.length) return;

  kill();

  const opts = {
    plugins:{
      legend:{ position:"bottom", labels:{ color:"#e6eef7" } },
      tooltip:{ callbacks:{ label:(ctx)=>{
        const v = ctx.parsed;
        const name = ctx.label || "";
        const isGDP = /gdp/i.test(ctx.dataset.label||"");
        return isGDP ? `${name}: $${Number(v).toLocaleString()}` : `${name}: ${Number(v).toLocaleString()}`;
      }}}
    },
    scales:{
      x:{ ticks:{ color:"#9fb1c5" }, grid:{ color:"rgba(255,255,255,.08)" } },
      y:{ ticks:{ color:"#9fb1c5" }, grid:{ color:"rgba(255,255,255,.08)" } }
    },
    animation:{ duration:800 }
  };

  const pop6 = [...data].sort((a,b)=>b.population-a.population).slice(0,6);
  chartPop = mk("chartPopulation","doughnut",{
    labels: pop6.map(s=>s.name),
    datasets:[{ label:"Population", data: pop6.map(s=>s.population) }]
  }, { plugins:opts.plugins, animation:opts.animation });

  const gdp8 = [...data].sort((a,b)=>b.gdp-a.gdp).slice(0,8);
  chartGDP = mk("chartGDP","bar",{
    labels: gdp8.map(s=>s.name),
    datasets:[{ label:"GDP", data: gdp8.map(s=>s.gdp) }]
  }, opts);

  const area10 = [...data].sort((a,b)=>b.area-a.area).slice(0,10);
  chartArea = mk("chartArea","line",{
    labels: area10.map(s=>s.name),
    datasets:[{ label:"Land Area (km²)", data: area10.map(s=>s.area), tension:.35, fill:false }]
  }, opts);
}
