// ========== charts.js — build charts from current local dataset ==========
/* Expects each state record:
   { id:'CA', name:'California', region:'West', capital:'Sacramento',
     population: 39500000, gdp: 3100000000000, area: 423967, cities: 482 }
*/

const LS_KEY = 'states';

function readStates(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  }catch(e){ console.warn('readStates error', e); return []; }
}

function fmtMoney(n){
  if (n >= 1e12) return `$${(n/1e12).toFixed(1)}T`;
  if (n >= 1e9)  return `$${(n/1e9).toFixed(1)}B`;
  if (n >= 1e6)  return `$${(n/1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function mountChart(ctx, config){
  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();
  return new Chart(ctx, config);
}

function palette(n){
  // pleasant hues; chart.js will auto cycle if fewer than data points
  const base = [
    '#57c7ff','#7be39e','#ffd166','#f77f9f',
    '#c7a6ff','#9be0e8','#f3b683','#91e1c4'
  ];
  const out = [];
  for (let i=0;i<n;i++) out.push(base[i % base.length]);
  return out;
}

function topBy(arr, key, k){
  return [...arr].sort((a,b)=> (b[key]||0)-(a[key]||0)).slice(0,k);
}

function buildCharts(){
  const data = readStates();
  const emptyBanner = document.getElementById('empty-note');
  if (emptyBanner){
    emptyBanner.style.display = data.length ? 'none' : 'block';
  }
  if(!data.length){
    // still clear canvases so they don’t show stale drawings
    ['piePop','barGDP','lineArea'].forEach(id=>{
      const c = document.getElementById(id);
      const inst = c ? Chart.getChart(c) : null;
      if (inst) inst.destroy();
    });
    return;
  }

  // 1) Donut — Top 6 by population
  const topPop = topBy(data, 'population', 6);
  mountChart(document.getElementById('piePop'), {
    type:'doughnut',
    data:{
      labels: topPop.map(s=>s.name),
      datasets:[{
        data: topPop.map(s=> s.population || 0),
        backgroundColor: palette(topPop.length),
        borderWidth: 0
      }]
    },
    options:{
      plugins:{
        legend:{ position:'bottom', labels:{ color:'#e7f0f4' } },
        title:{ display:true, text:'Population Share (Top 6)', color:'#d9f4ff', font:{ weight:'bold' } },
        tooltip:{ callbacks:{ label:(ctx)=> `${ctx.label}: ${ctx.parsed.toLocaleString()}` } }
      },
      cutout:'56%'
    }
  });

  // 2) Horizontal bar — Top 8 by GDP
  const topGDP = topBy(data, 'gdp', 8);
  mountChart(document.getElementById('barGDP'), {
    type:'bar',
    data:{
      labels: topGDP.map(s=>s.name),
      datasets:[{
        label:'GDP (USD)',
        data: topGDP.map(s=> s.gdp || 0),
        backgroundColor: '#57c7ff'
      }]
    },
    options:{
      indexAxis:'y',
      scales:{
        x: { ticks:{ color:'#cfe9f1', callback:(v)=> fmtMoney(v) }, grid:{ color:'rgba(200,230,255,.08)' } },
        y: { ticks:{ color:'#cfe9f1' }, grid:{ color:'rgba(200,230,255,.08)' } }
      },
      plugins:{
        legend:{ display:false },
        title:{ display:true, text:'GDP by State (Top 8)', color:'#d9f4ff', font:{ weight:'bold' } },
        tooltip:{ callbacks:{ label:(ctx)=> fmtMoney(ctx.raw) } }
      }
    }
  });

  // 3) Line — Top 10 by Area
  const topArea = topBy(data, 'area', 10);
  mountChart(document.getElementById('lineArea'), {
    type:'line',
    data:{
      labels: topArea.map(s=>s.name),
      datasets:[{
        label:'Land Area (km²)',
        data: topArea.map(s=> s.area || 0),
        fill:false,
        borderWidth:2,
        pointRadius:3
      }]
    },
    options:{
      scales:{
        x: { ticks:{ color:'#cfe9f1' }, grid:{ color:'rgba(200,230,255,.06)' } },
        y: { ticks:{ color:'#cfe9f1' }, grid:{ color:'rgba(200,230,255,.08)' } }
      },
      plugins:{
        legend:{ labels:{ color:'#e7f0f4' } },
        title:{ display:true, text:'Land Area (Top 10)', color:'#d9f4ff', font:{ weight:'bold' } },
        tooltip:{ callbacks:{ label:(ctx)=> `${ctx.dataset.label}: ${ctx.raw.toLocaleString()} km²` } }
      },
      tension:.3
    }
  });
}

/* Public: let controller trigger a refresh after CRUD */
export function refreshCharts(){ buildCharts(); }

/* Auto-init when found on page */
document.addEventListener('DOMContentLoaded', ()=>{
  const needsCharts = document.getElementById('piePop') || document.getElementById('barGDP') || document.getElementById('lineArea');
  if (needsCharts) buildCharts();
});
