import { currentData } from './controller.js';
import { fmtInt } from './utils.js';

let chart1, chart2, chart3;

export async function initCharts(){
  const { Chart, registerables } = window.Chart;
  Chart.register(...registerables);

  const data = currentData();

  // Donut: Population share (top 6)
  const topPop = [...data].sort((a,b)=>b.population-a.population).slice(0,6);
  chart1 = new Chart(document.getElementById('c1'), {
    type:'doughnut',
    data:{
      labels: topPop.map(x=>x.name),
      datasets:[{ data: topPop.map(x=>x.population) }]
    },
    options:{
      plugins:{ legend:{ labels:{ color:'#eaf4ff' } } },
      cutout:'55%',
    }
  });

  // Column: GDP by state (top 8)
  const topGdp = [...data].sort((a,b)=>b.gdp-a.gdp).slice(0,8);
  chart2 = new Chart(document.getElementById('c2'), {
    type:'bar',
    data:{
      labels: topGdp.map(x=>x.name),
      datasets:[{ label:'GDP', data: topGdp.map(x=>x.gdp) }]
    },
    options:{
      scales:{
        x:{ ticks:{ color:'#cfe3f7' } },
        y:{ ticks:{ color:'#cfe3f7',
          callback:(v)=>'$'+Intl.NumberFormat('en-US',{notation:'compact'}).format(v) } }
      },
      plugins:{ legend:{ labels:{ color:'#eaf4ff' } } }
    }
  });

  // Line: Land area
  const topArea = [...data].sort((a,b)=>b.area-a.area).slice(0,10);
  chart3 = new Chart(document.getElementById('c3'), {
    type:'line',
    data:{
      labels: topArea.map(x=>x.name),
      datasets:[{ label:'Land Area (km²)', data: topArea.map(x=>x.area), tension:.3 }]
    },
    options:{
      plugins:{ legend:{ labels:{ color:'#eaf4ff' } } },
      scales:{
        x:{ ticks:{ color:'#cfe3f7', maxRotation:0, autoSkip:true } },
        y:{ ticks:{ color:'#cfe3f7', callback:(v)=>fmtInt(v) } }
      }
    }
  });
}
