import { getStates, topBy } from './model.js';

let charts = [];

function destroyCharts(){
  charts.forEach(c=>c.destroy());
  charts = [];
}

function donutPopulation(ctx){
  const top = topBy('population', 6);
  const labels = top.map(s=>s.name);
  const data = top.map(s=>Number(s.population)||0);
  return new Chart(ctx, {
    type:'doughnut',
    data:{ labels, datasets:[{ data }]},
    options:{ plugins:{ legend:{ position:'bottom', labels:{color:'#DDECF3'} } }, cutout:'55%' }
  });
}

function barGDP(ctx){
  const top = topBy('gdp', 8).reverse(); // small at top
  const labels = top.map(s=>s.name);
  const data = top.map(s=>Number(s.gdp)||0);
  return new Chart(ctx,{
    type:'bar',
    data:{ labels, datasets:[{ label:'GDP (USD)', data }]},
    options:{
      indexAxis:'y',
      scales:{
        x:{ ticks:{ color:'#CFE3EE', callback:v=>'$'+Number(v).toLocaleString() }, grid:{color:'rgba(255,255,255,.06)'}},
        y:{ ticks:{ color:'#CFE3EE' }, grid:{display:false}}
      },
      plugins:{ legend:{display:false} }
    }
  });
}

function lineArea(ctx){
  const top = topBy('area', 10);
  const labels = top.map(s=>s.name);
  const data = top.map(s=>Number(s.area)||0);
  return new Chart(ctx,{
    type:'line',
    data:{ labels, datasets:[{ label:'Land Area (km²)', data, fill:false, tension:.3 }]},
    options:{
      scales:{
        x:{ ticks:{ color:'#CFE3EE' }, grid:{display:false}},
        y:{ ticks:{ color:'#CFE3EE', callback:v=>Number(v).toLocaleString()+' km²' }, grid:{color:'rgba(255,255,255,.06)'}}
      },
      plugins:{ legend:{ position:'bottom', labels:{color:'#DDECF3'} } }
    }
  });
}

export function renderCharts(){
  const a = document.getElementById('ch-pop');
  const b = document.getElementById('ch-gdp');
  const c = document.getElementById('ch-area');
  if(!a||!b||!c) return;

  destroyCharts();

  // When no data, show placeholders but still render empty charts gracefully
  const haveData = getStates().length > 0;
  charts.push(donutPopulation(a.getContext('2d')));
  charts.push(barGDP(b.getContext('2d')));
  charts.push(lineArea(c.getContext('2d')));

  // Badge under charts indicating live source from local storage (no “demo” banner anymore)
  const info = document.getElementById('chart-source');
  if(info){
    info.textContent = haveData
      ? 'Charts reflect the states you have stored in the Data Table.'
      : 'No records yet. Add states on the Create page to populate charts.';
  }
}

/* Refresh if localStorage changes (other tab or after save-then-open) */
window.addEventListener('storage', (e)=>{
  if(e.key && e.key.endsWith('_v')) renderCharts();
});
