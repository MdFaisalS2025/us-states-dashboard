import { DB } from "./model.js";
import { fmtNumber, fmtCurrency } from "./utils.js";

// Chart instances (if we create them)
let chartPop, chartGDP, chartArea;

function makeChart(canvasId, type, data, options){
  const el = document.getElementById(canvasId);
  if (!el) return null; // <-- guard: no canvas on this page
  const ctx = el.getContext("2d");
  // eslint-disable-next-line no-undef
  return new Chart(ctx, { type, data, options });
}

export function destroyCharts(){
  [chartPop, chartGDP, chartArea].forEach(c => c && c.destroy && c.destroy());
  chartPop = chartGDP = chartArea = null;
}

function setKPIs(){
  const k1 = document.getElementById("kpiTotalPop");
  const k2 = document.getElementById("kpiTotalGDP");
  const k3 = document.getElementById("kpiTotalArea");
  if (k1) k1.textContent = fmtNumber(DB.totalPopulation());
  if (k2) k2.textContent = fmtCurrency(DB.totalGDP());
  if (k3) k3.textContent = fmtNumber(DB.totalArea());
}

export function renderAllCharts(){
  // Always set KPIs (works on any page)
  setKPIs();

  // Only try charts if canvases exist (charts page)
  destroyCharts();
  const states = DB.listStates();
  if (!states.length) return;

  // Better palettes/tooltips/animations but still default colors (assignment safe)
  const commonPlugins = {
    legend: { position: "bottom", labels: { color: "#e6ecf2" } },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const v = ctx.parsed;
          const label = ctx.dataset.label || ctx.label || "";
          if (label.includes("GDP") || ctx.dataset.label === "GDP") return `${ctx.label}: $${Number(v).toLocaleString()}`;
          return `${ctx.label}: ${Number(v).toLocaleString()}`;
        }
      }
    }
  };

  // Population (doughnut)
  const topPop = [...states].sort((a,b)=>b.population-a.population).slice(0,6);
  chartPop = makeChart("chartPopulation", "doughnut", {
    labels: topPop.map(s=>s.name),
    datasets: [{ label: "Population", data: topPop.map(s=>s.population) }]
  }, { plugins: commonPlugins, animation: { duration: 900 } });

  // GDP (bar)
  const topGDP = [...states].sort((a,b)=>b.gdp-a.gdp).slice(0,8);
  chartGDP = makeChart("chartGDP", "bar", {
    labels: topGDP.map(s=>s.name),
    datasets: [{ label: "GDP", data: topGDP.map(s=>s.gdp) }]
  }, {
    plugins: commonPlugins,
    scales: {
      x: { ticks: { color: "#9fb1c5", maxRotation: 45, minRotation: 0 } },
      y: { ticks: { color: "#9fb1c5", callback: v => `$${Number(v).toLocaleString()}` }, grid: { color: "rgba(255,255,255,.08)" } }
    },
    animation: { duration: 900 }
  });

  // Area (line)
  const sortedArea = [...states].sort((a,b)=>b.area-a.area).slice(0,10);
  chartArea = makeChart("chartArea", "line", {
    labels: sortedArea.map(s=>s.name),
    datasets: [{ label: "Land Area (km²)", data: sortedArea.map(s=>s.area), tension: .35, fill: false }]
  }, {
    plugins: commonPlugins,
    scales: {
      x: { ticks: { color: "#9fb1c5" }, grid: { color: "rgba(255,255,255,.06)" } },
      y: { ticks: { color: "#9fb1c5", callback: v => Number(v).toLocaleString() }, grid: { color: "rgba(255,255,255,.06)" } }
    },
    animation: { duration: 900 }
  });
}
