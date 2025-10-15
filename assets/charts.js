// Build charts from the shared store
(function(){
  if (typeof Chart === 'undefined') return; // Only on data.html

  const ctxBar = document.getElementById('barPop');
  const ctxDoughnut = document.getElementById('doughnutGDP');
  const ctxLine = document.getElementById('lineTrend');

  const paletteLight = [
    '#4e79a7','#f28e2b','#e15759','#76b7b2','#59a14f','#edc949','#af7aa1','#ff9da7','#9c755f','#bab0ab'
  ];
  const paletteDark = [
    '#8ab4f8','#f6bf26','#f28b82','#80cbc4','#81c995','#fde293','#c58af9','#faa7b6','#d7ccc8','#e8eaed'
  ];

  function isDark(){ return document.documentElement.classList.contains('dark'); }
  function colors(){ return isDark() ? paletteDark : paletteLight; }

  function buildBar(){
    const top = getStates().slice().sort((a,b)=>b.population-a.population).slice(0,10);
    return new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: top.map(s=>s.name),
        datasets: [{
          label: 'Population',
          data: top.map(s=>s.population),
          backgroundColor: colors(),
          borderRadius: 12,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: { mode:'index', intersect:false },
          legend: { display:false },
          title: { display:false }
        },
        scales: {
          y: { ticks: { callback: v => v.toLocaleString() }, grid: { drawBorder:false } },
          x: { grid: { display:false } }
        }
      }
    });
  }

  function buildDoughnut(){
    const groups = {};
    for (const s of getStates()) groups[s.region] = (groups[s.region]||0) + s.gdp;
    const labels = Object.keys(groups);
    const data = Object.values(groups);
    return new Chart(ctxDoughnut, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors() }] },
      options: {
        cutout: '60%',
        plugins: {
          legend: { position:'bottom' },
          tooltip: { callbacks: { label: (ctx)=> `${ctx.label}: ${ctx.raw.toLocaleString()} B` } }
        }
      }
    });
  }

  function buildLine(){
    // Dummy trend series for FL and TX
    const years = [2019,2020,2021,2022,2023,2024,2025];
    const flBase = getState('FL').gdp;
    const txBase = getState('TX').gdp;
    const jitter = (base, i) => Math.round(base * (0.85 + 0.05*i + (Math.random()*0.04-0.02)));

    return new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Florida GDP (B)',
            data: years.map((_,i)=> jitter(flBase, i)/1),
            tension: 0.35,
            fill: false,
          },
          {
            label: 'Texas GDP (B)',
            data: years.map((_,i)=> jitter(txBase, i)/1),
            tension: 0.35,
            fill: false,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position:'bottom' },
        },
        scales: {
          y: { grid: { drawBorder:false } },
          x: { grid: { display:false } }
        }
      }
    });
  }

  let bar, doughnut, line;
  function renderAll(){
    if (!ctxBar || !ctxDoughnut || !ctxLine) return;
    if (bar) bar.destroy(); if (doughnut) doughnut.destroy(); if (line) line.destroy();
    bar = buildBar();
    doughnut = buildDoughnut();
    line = buildLine();
  }

  // Initial render
  renderAll();

  // Re-render when theme toggles or user clicks refresh
  document.addEventListener('click', (e)=>{
    if (e.target && e.target.id === 'toggleTheme') setTimeout(renderAll, 50);
    if (e.target && e.target.id === 'refreshCharts') renderAll();
  });
})();
