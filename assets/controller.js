// assets/controller.js
import { getAllStates, getStateById, totals, createState, updateState, deleteState } from './model.js';
import { fmt, bindNavActive } from './utils.js';
import { getUsaGdpAndPop } from './api.js';
import { renderAllCharts } from './charts.js';

// run on every page
document.addEventListener('DOMContentLoaded', () => {
  bindNavActive();
  mountBot(); // <- floating bot everywhere

  const page = document.body.dataset.page;

  if (page === 'home') initHome();
  if (page === 'read') initRead();
  if (page === 'create') initCreate();
  if (page === 'update') initUpdate();
  if (page === 'delete') initDelete();
  if (page === 'charts') initCharts(); // data.html
  if (page === 'about') initAbout();
});

// -------- Bot widget (every page) ----------
function mountBot(){
  // If already mounted (navigations in SPA-like flows), skip
  if (document.getElementById('bot-fab')) return;

  const fab = document.createElement('div');
  fab.id = 'bot-fab';
  fab.className = 'bot-fab';
  fab.title = 'Open Bot';
  fab.textContent = '💬';

  const panel = document.createElement('div');
  panel.id = 'bot-panel';
  panel.className = 'bot-panel';
  panel.innerHTML = `
    <div class="head">
      <div class="ttl">Travel Assistant Bot</div>
      <button id="bot-close" class="xbtn">Close</button>
    </div>
    <iframe id="bot-iframe" class="bot-iframe" src="mybot.html" title="Bot"></iframe>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  const toggle = () => panel.classList.toggle('open');
  fab.addEventListener('click', toggle);
  panel.querySelector('#bot-close').addEventListener('click', toggle);
}

// -------- HOME ----------
async function initHome() {
  // KPIs from local storage
  const t = totals();
  document.getElementById('kpiPopulation').textContent = fmt.int(t.population);
  document.getElementById('kpiGdp').textContent        = fmt.money(t.gdp);
  document.getElementById('kpiArea').textContent       = fmt.int(t.area);

  // External insights
  fillInsights();
  document.getElementById('btnInsightsRefresh').addEventListener('click', fillInsights);
}

async function fillInsights() {
  const gdpEl = document.getElementById('insGdp');
  const popEl = document.getElementById('insPop');
  if (!gdpEl || !popEl) return;
  gdpEl.textContent = 'Loading...';
  popEl.textContent = 'Loading...';
  const data = await getUsaGdpAndPop();
  gdpEl.innerHTML = `<strong>${fmt.money(data.gdp.value)}</strong> <span class="muted">(Year: ${data.gdp.year})</span><div class="src">Source: ${data.source}</div>`;
  popEl.innerHTML = `<strong>${fmt.int(data.pop.value)}</strong> <span class="muted">(Year: ${data.pop.year})</span><div class="src">Source: ${data.source}</div>`;
}

// -------- READ ----------
function initRead() {
  const tbody = document.querySelector('#statesBody');
  renderTable();

  function renderTable() {
    const rows = getAllStates().map(s => `
      <tr>
        <td><span class="badge">${s.id}</span></td>
        <td>${s.name}</td>
        <td>${s.capital}</td>
        <td class="num">${fmt.int(s.population)}</td>
        <td class="num">${fmt.money(s.gdp)}</td>
        <td class="num">${fmt.int(s.area)}</td>
        <td class="num">${fmt.int(s.cities)}</td>
        <td class="actions">
          <a class="btn btn-xs" href="update.html?id=${s.id}">Edit</a>
          <a class="btn btn-xs danger" href="delete.html?id=${s.id}">Delete</a>
        </td>
      </tr>
    `).join('');
    tbody.innerHTML = rows || `<tr><td colspan="8" class="empty-row">0 record(s)</td></tr>`;
  }
}

// -------- CREATE ----------
function initCreate() {
  const form = document.getElementById('createForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    try {
      createState({
        id: fd.get('id').toUpperCase().trim(),
        name: fd.get('name').trim(),
        region: fd.get('region'),
        capital: fd.get('capital').trim(),
        population: fd.get('population'),
        gdp: fd.get('gdp'),
        area: fd.get('area'),
        cities: fd.get('cities'),
      });
      location.href = 'read.html';
    } catch (err) {
      alert(err.message);
    }
  });
}

// -------- UPDATE ----------
function initUpdate() {
  const select = document.getElementById('stateChooser');
  const states = getAllStates();
  select.innerHTML = states.map(s => `<option value="${s.id}">${s.name} (${s.id})</option>`).join('');
  const params = new URLSearchParams(location.search);
  const initial = params.get('id');
  if (initial && states.some(s => s.id === initial)) select.value = initial;
  document.getElementById('btnLoad').addEventListener('click', loadSelected);
  loadSelected();

  function loadSelected() {
    const s = getStateById(select.value);
    if (!s) return;
    document.getElementById('u_id').value = s.id;
    document.getElementById('u_name').value = s.name;
    document.getElementById('u_region').value = s.region;
    document.getElementById('u_capital').value = s.capital;
    document.getElementById('u_cities').value = s.cities;
    document.getElementById('u_population').value = s.population;
    document.getElementById('u_gdp').value = s.gdp;
    document.getElementById('u_area').value = s.area;
  }

  document.getElementById('updateForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('u_id').value;
    updateState(id, {
      name: document.getElementById('u_name').value,
      region: document.getElementById('u_region').value,
      capital: document.getElementById('u_capital').value,
      cities: document.getElementById('u_cities').value,
      population: document.getElementById('u_population').value,
      gdp: document.getElementById('u_gdp').value,
      area: document.getElementById('u_area').value
    });
    alert('Saved.');
  });
}

// -------- DELETE ----------
function initDelete() {
  const select = document.getElementById('delChooser');
  const states = getAllStates();
  select.innerHTML = `<option value="">— Select —</option>` +
    states.map(s => `<option value="${s.id}">${s.name} (${s.id})</option>`).join('');
  const params = new URLSearchParams(location.search);
  const initial = params.get('id');
  if (initial && states.some(s => s.id === initial)) select.value = initial;

  document.getElementById('deleteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const chosen = document.getElementById('delChooser').value || document.getElementById('delManual').value;
    if (!chosen) return alert('Pick an ID.');
    if (!getStateById(chosen)) return alert('ID not found.');
    if (confirm(`Delete state ${chosen}? This cannot be undone.`)) {
      deleteState(chosen);
      location.href = 'read.html';
    }
  });
}

// -------- CHARTS ----------
function initCharts() {
  renderAllCharts();
  // also mirror insights block (if present)
  fillInsights();
}

// -------- ABOUT ----------
function initAbout() {
  // placeholder
}
