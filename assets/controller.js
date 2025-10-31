import { getStates, upsertState, deleteState, findState } from './model.js';

/* Pretty number formatting */
export function fmt(n, unit=''){
  if(n===undefined || n===null || n==='') return '—';
  const val = Number(n);
  return isNaN(val) ? String(n) : val.toLocaleString('en-US') + (unit?` ${unit}`:'');
}

/* ---------- READ (table) ---------- */
export function renderTable(){
  const tbody = document.querySelector('#states-tbody');
  if(!tbody) return;
  const data = getStates();
  tbody.innerHTML = data.map(s => `
    <tr>
      <td><span class="badge">${s.id}</span></td>
      <td>${s.name}</td>
      <td>${s.capital}</td>
      <td>${fmt(s.population)}</td>
      <td>${fmt(s.gdp,'USD')}</td>
      <td>${fmt(s.area,'km²')}</td>
      <td>${fmt(s.cities)}</td>
      <td>
        <a class="btn secondary" href="update.html?id=${encodeURIComponent(s.id)}">Edit</a>
        <a class="btn warning" style="margin-left:8px" href="delete.html?id=${encodeURIComponent(s.id)}">Delete</a>
      </td>
    </tr>
  `).join('');
}

/* ---------- CREATE ---------- */
export function bindCreate(){
  const form = document.querySelector('#create-form');
  if(!form) return;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const fd = new FormData(form);
    const state = {
      id: (fd.get('id')||'').trim().toUpperCase(),
      name: (fd.get('name')||'').trim(),
      region: fd.get('region'),
      capital: (fd.get('capital')||'').trim(),
      population: Number(fd.get('population')||0),
      gdp: Number(fd.get('gdp')||0),
      area: Number(fd.get('area')||0),
      cities: Number(fd.get('cities')||0),
    };
    if(!state.id || !state.name){ alert('ID and Name are required.'); return; }
    upsertState(state);
    window.location.href = 'read.html';
  });
}

/* ---------- UPDATE ---------- */
export function bindUpdate(){
  const form = document.querySelector('#update-form');
  if(!form) return;

  const url = new URL(window.location.href);
  const idParam = url.searchParams.get('id');

  // Dropdown
  const picker = document.querySelector('#pick-state');
  const states = getStates();
  picker.innerHTML = `<option value="">Select…</option>` +
    states.map(s=>`<option value="${s.id}">${s.name} (${s.id})</option>`).join('');
  if(idParam) picker.value = idParam;

  function loadToForm(id){
    const s = findState(id);
    if(!s) return;
    form.id.value = s.id;
    form.name.value = s.name;
    form.region.value = s.region;
    form.capital.value = s.capital;
    form.population.value = s.population;
    form.gdp.value = s.gdp;
    form.area.value = s.area;
    form.cities.value = s.cities;
  }

  picker.addEventListener('change', ()=> loadToForm(picker.value));
  document.querySelector('#load-btn').addEventListener('click', ()=> loadToForm(picker.value));

  if(idParam) loadToForm(idParam);

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const fd = new FormData(form);
    const s = {
      id: (fd.get('id')||'').trim().toUpperCase(),
      name: (fd.get('name')||'').trim(),
      region: fd.get('region'),
      capital: (fd.get('capital')||'').trim(),
      population: Number(fd.get('population')||0),
      gdp: Number(fd.get('gdp')||0),
      area: Number(fd.get('area')||0),
      cities: Number(fd.get('cities')||0),
    };
    upsertState(s);
    window.location.href = 'read.html';
  });
}

/* ---------- DELETE ---------- */
export function bindDelete(){
  const form = document.querySelector('#delete-form');
  if(!form) return;

  const picker = document.querySelector('#delete-pick');
  const idInput = document.querySelector('#delete-id');
  const states = getStates();
  picker.innerHTML = `<option value="">— Select —</option>` +
    states.map(s=>`<option value="${s.id}">${s.name} (${s.id})</option>`).join('');

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const id = (idInput.value || picker.value || '').toUpperCase().trim();
    if(!id){ alert('Pick or enter an ID to delete.'); return; }
    if(!confirm(`Delete ${id}? This cannot be undone.`)) return;
    deleteState(id);
    window.location.href = 'read.html';
  });
}
