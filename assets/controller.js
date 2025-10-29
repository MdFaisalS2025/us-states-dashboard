// assets/controller.js
// CONTROLLER LAYER
// Handles events (form submits, button clicks) + triggers view refreshes.

function collectFormValues(prefix = "") {
  const getVal = (id) => document.getElementById(prefix + id).value.trim();

  return {
    id: getVal('id').toUpperCase(),
    name: getVal('name'),
    region: getVal('region'),
    capital: getVal('capital'),
    population: Number(getVal('population')),
    gdp: Number(getVal('gdp')),
    area: Number(getVal('area')),
    citiesCount: Number(getVal('citiesCount'))
  };
}

function fillFormFromState(state, prefix = "") {
  const setVal = (id, val) => {
    const el = document.getElementById(prefix + id);
    if (el) el.value = val ?? '';
  };
  setVal('id', state.id);
  setVal('name', state.name);
  setVal('region', state.region);
  setVal('capital', state.capital);
  setVal('population', state.population);
  setVal('gdp', state.gdp);
  setVal('area', state.area);
  setVal('citiesCount', state.citiesCount);
}

// CREATE PAGE
function initCreatePage() {
  const form = document.getElementById('createForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newState = collectFormValues("");
    try {
      StateDataService.create(newState);
      alert('State added!');
      form.reset();
      refreshReadTable();
      refreshCharts();
    } catch (err) {
      alert(err.message);
    }
  });
}

// READ PAGE
function refreshReadTable() {
  const tableBody = document.getElementById('statesTableBody');
  if (!tableBody) return;

  const data = StateDataService.getAll();
  tableBody.innerHTML = data.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.region}</td>
      <td>${s.capital}</td>
      <td>${s.population.toLocaleString()}</td>
      <td>$${s.gdp}B</td>
      <td>${s.area.toLocaleString()} sq mi</td>
      <td>${s.citiesCount}</td>
    </tr>
  `).join('');
}

// UPDATE PAGE
function initUpdatePage() {
  const loadBtn = document.getElementById('loadForEdit');
  const saveBtn = document.getElementById('saveEdit');
  if (!loadBtn || !saveBtn) return;

  loadBtn.addEventListener('click', () => {
    const id = document.getElementById('upd_id').value.trim().toUpperCase();
    const st = StateDataService.getById(id);
    if (!st) {
      alert('State not found');
      return;
    }
    fillFormFromState(st, 'upd_');
  });

  saveBtn.addEventListener('click', () => {
    const updatedState = collectFormValues('upd_');
    try {
      StateDataService.update(updatedState);
      alert('State updated!');
      refreshReadTable();
      refreshCharts();
    } catch (err) {
      alert(err.message);
    }
  });
}

// DELETE PAGE
function initDeletePage() {
  const delBtn = document.getElementById('deleteBtn');
  if (!delBtn) return;

  delBtn.addEventListener('click', () => {
    const id = document.getElementById('del_id').value.trim().toUpperCase();
    if (!id) {
      alert('Enter a state ID first.');
      return;
    }
    StateDataService.remove(id);
    alert('State deleted if it existed.');
    refreshReadTable();
    refreshCharts();
  });
}

// expose globals so pages can call them inline in <script>
window.initCreatePage = initCreatePage;
window.initUpdatePage = initUpdatePage;
window.initDeletePage = initDeletePage;
window.refreshReadTable = refreshReadTable;
