// assets/charts.js
import { getAllStates } from './model.js';
import { fmt } from './utils.js';

let charts = [];

function destroyAll() {
  charts.forEach(c => c.destroy());
  charts = [];
}

function noDataCard(el, msg = 'No data to display.') {
  el.innerHTML = `<div class="empty-card">${msg}</div>`;
}

function buildDonut(el) {
  const data = getAllStates().slice().sort((a,b)=>b.population-a.population).slice(0,6);
  if (!data.length) return noDataCard(el);
  const ctx = el.getContext('2d');
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        data: data.map(d => d.population),
        hoverOffset: 6
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 14 } },
        tooltip: { callbacks: { label: (c)=> `${c.label}: ${fmt.int(c.parsed)}` } }
      },
      cutout: '60%'
    }
  });
  charts.push(chart);
}

function buildBar(el) {
  const data = getAllStates().slice().sort((a,b)=>b.gdp-a.gdp).slice(0,8);
  if (!data.length) return noDataCard(el);
  const ctx = el.getContext('2d');
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        label: 'GDP',
        data: data.map(d => d.gdp)
      }]
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        y: { ticks: { callback: (v)=>'$'+fmt.bigAbbrev(v) }, grid: { color: 'rgba(255,255,255,.06)' } },
        x: { grid: { display:false } }
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c)=> `GDP: ${fmt.money(c.parsed.y)}` } }
      }
    }
  });
  charts.push(chart);
}

function buildLine(el) {
  const data = getAllStates().slice().sort((a,b)=>b.area-a.area).slice(0,10);
  if (!data.length) return noDataCard(el);
  const ctx = el.getContext('2d');
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        label: 'Land Area (km²)',
        data: data.map(d => d.area),
        tension: 0.35,
        pointRadius: 3
      }]
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        y: { ticks: { callback: (v)=>fmt.bigAbbrev(v) }, grid: { color: 'rgba(255,255,255,.06)' } },
        x: { grid: { display:false } }
      },
      plugins: { legend: { position: 'bottom' } }
    }
  });
  charts.push(chart);
}

export function renderAllCharts() {
  destroyAll();
  buildDonut(document.getElementById('popChart'));
  buildBar(document.getElementById('gdpChart'));
  buildLine(document.getElementById('areaChart'));
}
