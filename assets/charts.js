// assets/charts.js
// VIEW LAYER: Chart rendering using Chart.js

let gdpChart;
let populationChart;
let areaChart;

function refreshCharts() {
  const data = StateDataService.getAll();

  const labels = data.map(s => s.name);
  const gdpData = data.map(s => s.gdp);
  const popData = data.map(s => s.population);
  const areaData = data.map(s => s.area);

  // GDP BAR
  const gdpCtx = document.getElementById('gdpChart');
  if (gdpCtx) {
    if (gdpChart) gdpChart.destroy();
    gdpChart = new Chart(gdpCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'GDP (Billions USD)',
          data: gdpData
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // POPULATION PIE
  const popCtx = document.getElementById('populationChart');
  if (popCtx) {
    if (populationChart) populationChart.destroy();
    populationChart = new Chart(popCtx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: 'Population',
          data: popData
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  // AREA LINE
  const areaCtx = document.getElementById('areaChart');
  if (areaCtx) {
    if (areaChart) areaChart.destroy();
    areaChart = new Chart(areaCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Area (sq mi)',
          data: areaData,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } }
      }
    });
  }
}

// expose globally
window.refreshCharts = refreshCharts;
