import { DB } from "./model.js";
import { fmtNumber, fmtCurrency } from "./utils.js";

// Chart.js v4 required via CDN in pages

let chartPop, chartGDP, chartArea;

function makeChart(ctx, type, data, options){
  return new Chart(ctx, { type, data, options });
}

export function destroyCharts(){
  [chartPop, chartGDP, chartArea].forEach(c => c && c.destroy());
}

export function renderAllCharts(){
  destroyCharts();
  const states = DB.listStates();

  // Population share (doughnut)
  const topPop = [...states].sort((a,b)=>b.population-a.population).slice(0,6);
  chartPop = makeChart(
    document.getElementById("chartPopulation"),
    "doughnut",
    {
      labels: topPop.map(s=>s.name),
      datasets: [{ data: topPop.map(s=>s.population) }]
    },
    {
      plugins: {
        legend: { position: "bottom", labels: { color: "#e6ecf2" } },
        tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fmtNumber(ctx.parsed)} people` } }
      }
    }
  );

  // GDP bar
  const topGDP = [...states].sort((a,b)=>b.gdp-a.gdp).slice(0,8);
  chartGDP = makeChart(
    document.getElementById("chartGDP"),
    "bar",
    {
      labels: topGDP.map(s=>s.name),
      datasets: [{ label: "GDP", data: topGDP.map(s=>s.gdp) }]
    },
    {
      scales: {
        x: { ticks: { color: "#9fb1c5" } },
        y: { ticks: { color: "#9fb1c5", callback: v => `$${Number(v).toLocaleString()}` } }
      },
      plugins: { legend: { labels: { color: "#e6ecf2" } } }
    }
  );

  // Area line
  const sortedArea = [...states].sort((a,b)=>b.area-a.area).slice(0,10);
  chartArea = makeChart(
    document.getElementById("chartArea"),
    "line",
    {
      labels: sortedArea.map(s=>s.name),
      datasets: [{ label: "Land Area (km²)", data: sortedArea.map(s=>s.area), tension: .35 }]
    },
    {
      scales: {
        x: { ticks: { color: "#9fb1c5" } },
        y: { ticks: { color: "#9fb1c5", callback: v => Number(v).toLocaleString() } }
      },
      plugins: { legend: { labels: { color: "#e6ecf2" } } }
    }
  );

  // KPI cards
  const k1 = document.getElementById("kpiTotalPop");
  const k2 = document.getElementById("kpiTotalGDP");
  const k3 = document.getElementById("kpiTotalArea");
  if (k1) k1.textContent = fmtNumber(DB.totalPopulation());
  if (k2) k2.textContent = fmtCurrency(DB.totalGDP());
  if (k3) k3.textContent = fmtNumber(DB.totalArea());
}
