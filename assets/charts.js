import * as model from './model.js';

let pie, bar, line;
document.addEventListener('DOMContentLoaded', () => {
  model.seedIfEmpty();
  render();
  window.addEventListener('storage', render); // reflect cross-tab changes
});

function render(){
  const rows = model.list();

  /* guard: empty -> clear canvases & show passive band (keeps page pretty) */
  const empty = !rows || rows.length === 0;
  const band = document.querySelector('#emptyBand');
  if (band){ band.style.display = empty ? 'block' : 'none'; }

  const topPop = rows.slice().sort((a,b)=>b.population-a.population).slice(0,6);
  const topGDP = rows.slice().sort((a,b)=>b.gdp-b.gdp).slice(0,8);
  const topArea= rows.slice().sort((a,b)=>b.area-b.area).slice(0,10);

  /* Pie: population share */
  pie = draw(pie, '#pie', {
    type:'doughnut',
    data:{
      labels: topPop.map(x=>x.name),
      datasets:[{ data: topPop.map(x=>x.population) }]
    },
    options: baseOptions('Population Share (Top 6)')
  });

  /* Bar: GDP */
  bar = draw(bar, '#bar', {
    type:'bar',
    data:{
      labels: topGDP.map(x=>x.name),
      datasets:[{ data: topGDP.map(x=>x.gdp) }]
    },
    options: baseOptions('GDP by State (Top 8)', {xTicks: true, format:'currency'})
  });

  /* Line: land area */
  line = draw(line, '#line', {
    type:'line',
    data:{
      labels: topArea.map(x=>x.name),
      datasets:[{ data: topArea.map(x=>x.area), fill:false, tension:.35, pointRadius:3 }]
    },
    options: baseOptions('Land Area (Top 10)', {yLabel:'km²'})
  });
}

function draw(instance, selector, cfg){
  const ctx = document.querySelector(selector)?.getContext('2d');
  if (!ctx) return instance;
  if (instance) instance.destroy();
  const opts = cfg.options||{};
  return new Chart(ctx, {
    ...cfg,
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{ labels:{ color:'#d9edf4' } },
        title:{ display:true, text:opts.title || '', color:'#d9edf4', font:{weight:'bold', size:16} },
        tooltip:{ callbacks:{
          label: (c)=>{
            const v = c.parsed;
            return opts.format==='currency'
              ? `$${Intl.NumberFormat('en-US').format(v)}`
              : Intl.NumberFormat('en-US').format(v) + (opts.yLabel?` ${opts.yLabel}`:'');
          }
        }}
      },
      scales:{
        x:{ ticks:{ color:'#cfe4eb' }, grid:{ color:'rgba(205,233,240,.10)'} },
        y:{ ticks:{ color:'#cfe4eb', callback:(v)=> opts.format==='currency' ? `$${Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(v)}` : Intl.NumberFormat('en-US').format(v) }, grid:{ color:'rgba(205,233,240,.10)' } }
      }
    }
  });
}

function baseOptions(title, extra={}){
  return { title, ...extra };
}
