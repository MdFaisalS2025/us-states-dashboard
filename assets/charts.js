import { api } from './api.js';

export function bootCharts(){
  api.init();
  const data = api.list().sort((a,b)=>b.population-a.population).slice(0,10);
  const labels = data.map(s=>s.name);
  const pop = data.map(s=>s.population);
  const gdp = data.map(s=>Math.round(s.gdp/1e9)); // billions

  new Chart(document.getElementById('popChart'),{
    type:'bar',
    data:{ labels, datasets:[{ label:'Population', data:pop }]},
    options:{responsive:true, plugins:{legend:{display:true}}}
  });

  new Chart(document.getElementById('gdpChart'),{
    type:'line',
    data:{ labels, datasets:[{ label:'GDP (billions USD)', data:gdp }]},
    options:{responsive:true, plugins:{legend:{display:true}}}
  });
}
