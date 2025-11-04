import { api } from './api.js';

function billions(n){ return Math.round((+n||0)/1e9); }

export function bootCharts(){
  api.init();
  const rows = api.list();

  // Bar: Top 10 by Population
  const popTop = [...rows].sort((a,b)=>b.population-a.population).slice(0,10);
  makeBar('popChart', 'Top 10 by Population', popTop.map(s=>s.name), popTop.map(s=>s.population));

  // Line: Top 10 by GDP (billions)
  const gdpTop = [...rows].sort((a,b)=>b.gdp-a.gdp).slice(0,10).reverse(); // reverse for nicer left->right climb
  makeLine('gdpLine', 'Top 10 by GDP (billions USD)', gdpTop.map(s=>s.name), gdpTop.map(s=>billions(s.gdp)));

  // Pie: Population share by Region
  const byRegion = rows.reduce((m,s)=>{ m[s.region]=(m[s.region]||0)+(+s.population||0); return m; },{});
  makePie('regionPie', 'Population Share by Region', Object.keys(byRegion), Object.values(byRegion));
}

function makeBar(id,label,labels,data){
  new Chart(document.getElementById(id), {
    type:'bar',
    data:{ labels, datasets:[{ label, data }]},
    options:{ responsive:true, maintainAspectRatio:false }
  });
}
function makeLine(id,label,labels,data){
  new Chart(document.getElementById(id), {
    type:'line',
    data:{ labels, datasets:[{ label, data, tension:0.25, fill:false }]},
    options:{ responsive:true, maintainAspectRatio:false }
  });
}
function makePie(id,label,labels,data){
  new Chart(document.getElementById(id), {
    type:'pie',
    data:{ labels, datasets:[{ label, data }]},
    options:{ responsive:true, maintainAspectRatio:false }
  });
}
