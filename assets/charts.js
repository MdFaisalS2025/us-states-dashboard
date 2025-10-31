/* Chart rendering wired to localStorage "states" */
import { getStates, formatMoney, formatNumber } from './utils.js';

let charts = [];

function destroyCharts(){
  charts.forEach(c => c.destroy());
  charts = [];
}

function pickTop(arr, key, n){
  return [...arr].sort((a,b)=> (b[key]||0)-(a[key]||0)).slice(0,n);
}

function moneyTick(value){ return '$' + formatMoney(value); }

function buildCharts(){
  const states = getStates();

  destroyCharts();

  // ---- Doughnut: Population share (Top 6) ----
  const popTop = pickTop(states,'population',6);
  const popCtx = document.getElementById('chartPop');
  if(popCtx){
    charts.push(new Chart(popCtx, {
      type:'doughnut',
      data:{
        labels: popTop.map(s=>s.name),
        datasets:[{
          data: popTop.map(s=>s.population),
          borderWidth:0,
          hoverOffset:8
        }]
      },
      options:{
        plugins:{
          legend:{position:'bottom', labels:{color:'#dfecee', boxWidth:14}},
          tooltip:{callbacks:{label: c => `${c.label}: ${formatNumber(c.parsed)} people`}}
        },
        cutout:'58%',
      }
    }));
  }

  // ---- Horizontal bar: GDP (Top 8) ----
  const gdpTop = pickTop(states,'gdp',8);
  const gdpCtx = document.getElementById('chartGdp');
  if(gdpCtx){
    charts.push(new Chart(gdpCtx, {
      type:'bar',
      data:{
        labels:gdpTop.map(s=>s.name),
        datasets:[{
          label:'GDP (USD)',
          data:gdpTop.map(s=>s.gdp),
          borderWidth:0,
        }]
      },
      options:{
        indexAxis:'y',
        scales:{
          x:{ticks:{color:'#cfe0e6', callback: moneyTick}, grid:{color:'#254656'}},
          y:{ticks:{color:'#cfe0e6'}, grid:{display:false}}
        },
        plugins:{
          legend:{display:false},
          tooltip:{callbacks:{label: c => moneyTick(c.parsed.x)}}
        }
      }
    }));
  }

  // ---- Line: Land Area (Top 10) ----
  const areaTop = pickTop(states,'area_km2',10).reverse(); // small to large left->right
  const areaCtx = document.getElementById('chartArea');
  if(areaCtx){
    charts.push(new Chart(areaCtx, {
      type:'line',
      data:{
        labels: areaTop.map(s=>s.name),
        datasets:[{
          label:'Land Area (km²)',
          data: areaTop.map(s=>s.area_km2),
          borderWidth:3,
          pointRadius:4,
          tension:.35,
          fill:false
        }]
      },
      options:{
        scales:{
          x:{ticks:{color:'#cfe0e6'}, grid:{color:'#244453'}},
          y:{ticks:{color:'#cfe0e6', callback:v=>formatNumber(v)+' km²'}, grid:{color:'#244453'}}
        },
        plugins:{
          legend:{labels:{color:'#dfecee'}},
          tooltip:{callbacks:{label:c=>`${formatNumber(c.parsed.y)} km²`}}
        }
      }
    }));
  }
}

document.addEventListener('DOMContentLoaded', buildCharts);

// Re-render if other pages modify the dataset and dispatch an event
window.addEventListener('states:updated', buildCharts);
