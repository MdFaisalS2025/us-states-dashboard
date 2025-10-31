/* charts.js — robust Chart.js setup with graceful fallback
   - Reads state data from localStorage using common keys
   - If empty, uses a small demo dataset and shows a notice
   - Renders three charts: population doughnut, GDP bar, area line
*/

(function () {
  // Try multiple common keys to find your stored states
  const STORAGE_KEYS = ['US_STATES_DATA', 'us_states', 'states'];

  const DEMO_STATES = [
    { id: 'CA', name: 'California', population: 39_500_000, gdp: 3_100_000_000_000, area: 423_967 },
    { id: 'TX', name: 'Texas',      population: 30_000_000, gdp: 2_800_000_000_000, area: 268_596 },
    { id: 'FL', name: 'Florida',    population: 22_000_000, gdp: 1_200_000_000_000, area: 170_312 },
    { id: 'NY', name: 'New York',   population: 19_700_000, gdp: 2_500_000_000_000, area: 54_555 },
    { id: 'IL', name: 'Illinois',   population: 12_500_000, gdp: 870_000_000_000,   area: 149_995 },
    { id: 'PA', name: 'Pennsylvania',population: 12_900_000, gdp: 950_000_000_000,  area: 119_280 },
    { id: 'OH', name: 'Ohio',       population: 11_800_000, gdp: 820_000_000_000,   area: 116_098 },
    { id: 'GA', name: 'Georgia',    population: 10_900_000, gdp: 680_000_000_000,   area: 153_910 },
    { id: 'NC', name: 'North Carolina', population: 10_800_000, gdp: 750_000_000_000, area: 139_391 },
    { id: 'MI', name: 'Michigan',   population: 10_000_000, gdp: 680_000_000_000,   area: 250_487 },
    { id: 'WA', name: 'Washington', population: 7_900_000,  gdp: 820_000_000_000,   area: 184_661 }
  ];

  function loadStatesFromStorage() {
    for (const key of STORAGE_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch (_) {}
    }
    return [];
  }

  function topBy(states, field, n) {
    return [...states].sort((a, b) => (b[field] || 0) - (a[field] || 0)).slice(0, n);
  }

  function formatBillions(x) {
    return '$' + (x / 1_000_000_000).toLocaleString();
  }

  // Ensure Chart.js is present
  function requireChart() {
    if (!window.Chart) {
      console.error('Chart.js not loaded.');
      return false;
    }
    return true;
  }

  function renderCharts() {
    if (!requireChart()) return;

    let states = loadStatesFromStorage();
    const usingDemo = states.length === 0;
    if (usingDemo) {
      states = DEMO_STATES;
      const notice = document.getElementById('demoNotice');
      if (notice) notice.classList.remove('d-none');
    }

    // Normalize expected fields
    states = states.map(s => ({
      name: s.State_Name || s.name || s.StateName || s.stateName || s.id || s.State_ID,
      population: Number(s.Population || s.population || s.Population_Million ? (s.Population_Million * 1_000_000) : s.population) || 0,
      gdp: Number(s.GDP || s.GDP_Billion ? (s.GDP_Billion * 1_000_000_000) : s.gdp) || 0,
      area: Number(s.Area || s.area || s.Area_sqkm || s.Area_km2 || 0)
    }));

    // POPULATION (Top 6)
    const popTop = topBy(states, 'population', 6);
    const popCtx = document.getElementById('chartPopulation');
    if (popCtx) {
      new Chart(popCtx, {
        type: 'doughnut',
        data: {
          labels: popTop.map(s => s.name),
          datasets: [{ data: popTop.map(s => s.population) }]
        },
        options: {
          plugins: {
            legend: { position: 'bottom', labels: { color: '#e6edf3' } },
            tooltip: { callbacks: { label: c => `${c.label}: ${c.parsed.toLocaleString()}` } }
          }
        }
      });
    }

    // GDP (Top 8)
    const gdpTop = topBy(states, 'gdp', 8).reverse(); // small to large for horizontal bar
    const gdpCtx = document.getElementById('chartGDP');
    if (gdpCtx) {
      new Chart(gdpCtx, {
        type: 'bar',
        data: {
          labels: gdpTop.map(s => s.name),
          datasets: [{ data: gdpTop.map(s => s.gdp), borderWidth: 1 }]
        },
        options: {
          indexAxis: 'y',
          scales: {
            x: {
              ticks: {
                color: '#b9c3cc',
                callback: v => formatBillions(v)
              },
              grid: { color: 'rgba(255,255,255,0.08)' }
            },
            y: { ticks: { color: '#e6edf3' }, grid: { display: false } }
          },
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: c => formatBillions(c.parsed.x) } }
          }
        }
      });
    }

    // AREA (Top 10)
    const areaTop = topBy(states, 'area', 10);
    const areaCtx = document.getElementById('chartArea');
    if (areaCtx) {
      new Chart(areaCtx, {
        type: 'line',
        data: {
          labels: areaTop.map(s => s.name),
          datasets: [{
            data: areaTop.map(s => s.area),
            fill: false,
            tension: 0.3,
            pointRadius: 4
          }]
        },
        options: {
          scales: {
            y: { ticks: { color: '#b9c3cc', callback: v => v.toLocaleString() + ' km²' }, grid: { color: 'rgba(255,255,255,0.08)' } },
            x: { ticks: { color: '#e6edf3' }, grid: { display: false } }
          },
          plugins: { legend: { display: false } }
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', renderCharts);
})();
