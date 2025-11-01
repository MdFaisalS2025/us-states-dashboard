import { api } from './api.js';

function billions(n){ return Math.round((+n||0)/1e9); }

export function bootCharts(){
  api.init();
  const rows = api.list();

  // Top 10 by population
  const topPop = [...rows].sort((a,b)=>b.population-a.population).slice(0,10);
  makeBar('popChart', 'Top 10 by Population', topPop.map(s=>s.name), topPop.map(s=>s.population));

  // Top 10 by GDP (billions)
  const topGDP = [...rows].sort((a,b)=>b.gdp-a.gdp).slice(0,10);
  makeBar('gdpChart', 'Top 10 — GDP (billions USD)', topGDP.map(s=>s.name), topGDP.map(s=>billions(s.gdp)));

  // Pie — Region share by total population
  const byRegion = rows.reduce((m,s)=>{
    m[s.region]=(m[s.region]||0)+(+s.population||0); return m;
  },{});
  const labels = Object.keys(byRegion);
  const vals   = Object.values(byRegion);
  makePie('regionPie', 'Population Share by Region', labels, vals);
}

function makeBar(id, label, labels, data){
  const ctx = document.getElementById(id);
  new Chart(ctx, {
    type:'bar',
    data:{ labels, datasets:[{ label, data }]},
    options:{ responsive:true, maintainAspectRatio:false }
  });
}
function makePie(id, label, labels, data){
  const ctx = document.getElementById(id);
  new Chart(ctx, {
    type:'pie',
    data:{ labels, datasets:[{ label, data }]},
    options:{ responsive:true, maintainAspectRatio:false }
  });
}
