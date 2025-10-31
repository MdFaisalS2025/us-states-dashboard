import { Model } from './model.js';
import { fmtInt } from './utils.js';

/* Requires Chart.js CDN on data.html */
export function renderCharts(){
  const data = Model.all();
  if(!data.length){
    // if empty, nothing to render; cards already visible
    return;
  }

  // Top 6 population
  const pop = [...data].sort((a,b)=>b.population-a.population).slice(0,6);
  new Chart(document.getElementById('chartPopulation'),{
    type:'doughnut',
    data:{
      labels: pop.map(x=>x.name),
      datasets:[{ data: pop.map(x=>x.population) }]
    },
    options:{ plugins:{ legend:{position:'bottom'} } }
  });

  // Top 8 GDP
  const gdp = [...data].sort((a,b)=>b.gdp-a.gdp).slice(0,8);
  new Chart(document.getElementById('chartGdp'),{
    type:'bar',
    data:{
      labels: gdp.map(x=>x.name),
      datasets:[{ label:'GDP', data:gdp.map(x=>x.gdp) }]
    },
    options:{
      indexAxis:'y',
      plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>'$'+fmtInt(c.raw)}} },
      scales:{ x:{ ticks:{ callback:v=>'$'+fmtInt(v) } } }
    }
  });

  // Top 10 Area
  const area = [...data].sort((a,b)=>b.area-a.area).slice(0,10);
  new Chart(document.getElementById('chartArea'),{
    type:'line',
    data:{ labels: area.map(x=>x.name), datasets:[{ label:'Land Area (km²)', data:area.map(x=>x.area) }] },
    options:{
      plugins:{ legend:{position:'bottom'} },
      elements:{ line:{ tension:.35 } },
      scales:{ y:{ ticks:{ callback:v=>fmtInt(v)} } }
    }
  });
}
