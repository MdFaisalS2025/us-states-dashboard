import * as model from './model.js';

/* boot */
document.addEventListener('DOMContentLoaded', () => {
  model.seedIfEmpty();             // ensure table isn’t empty on first load
  route();
});

/* very small “router” by page */
function route(){
  const here = location.pathname.split('/').pop();
  if (here === 'read.html') mountTable();
  if (here === 'create.html') mountCreate();
  if (here === 'update.html') mountUpdate();
  if (here === 'delete.html') mountDelete();
  if (here === 'index.html')  mountHome();
}

/* ------- HOME (index.html) ------- */
function mountHome(){
  // Totals
  const t = model.totals();
  setText('#totalPopulation', num(t.population));
  setText('#totalGDP', money(t.gdp));
  setText('#totalArea', num(t.area));

  // External insights copy is just styling; values come from api.js already
}

/* ------- TABLE (read.html) ------- */
function mountTable(){
  const body = document.querySelector('#rows');
  if (!body) return;
  body.innerHTML = '';

  for (const r of model.list()){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><a href="update.html?id=${encodeURIComponent(r.id)}">${escape(r.id)}</a></td>
      <td>${escape(r.name)}</td>
      <td>${escape(r.capital)}</td>
      <td>${num(r.population)}</td>
      <td>${money(r.gdp)}</td>
      <td>${num(r.area)} km²</td>
      <td>${num(r.cities)}</td>
      <td>
        <a class="btn ghost" href="update.html?id=${encodeURIComponent(r.id)}">Edit</a>
        <button class="btn" style="background:var(--danger);border-color:#b51d1d"
          data-act="del" data-id="${escape(r.id)}">Delete</button>
      </td>`;
    body.appendChild(tr);
  }

  body.addEventListener('click', e=>{
    const btn = e.target.closest('[data-act="del"]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (confirm(`Delete state ${id}?`)){
      model.remove(id);
      mountTable();
    }
  });
}

/* ------- CREATE (create.html) ------- */
function mountCreate(){
  const form = document.querySelector('form');
  if (!form) return;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const v = readForm(form);
    model.add({
      id: v.id.trim().toUpperCase(),
      name: v.name.trim(),
      region: v.region,
      capital: v.capital.trim(),
      cities: +v.cities||0,
      population: +v.population||0,
      gdp: +v.gdp||0,
      area: +v.area||0
    });
    location.href = 'read.html';
  });
}

/* ------- UPDATE (update.html) ------- */
function mountUpdate(){
  const sel = document.querySelector('#selectId');
  const form = document.querySelector('form');
  const urlId = new URLSearchParams(location.search).get('id');

  // populate dropdown
  for (const r of model.list()){
    const opt = document.createElement('option');
    opt.value = r.id; opt.textContent = `${r.name} (${r.id})`;
    if (urlId && urlId === r.id) opt.selected = true;
    sel.appendChild(opt);
  }

  function load(id){
    const r = model.get(id);
    if (!r) return;
    form.id.value = r.id;
    form.name.value = r.name;
    form.region.value = r.region;
    form.capital.value = r.capital;
    form.cities.value = r.cities;
    form.population.value = r.population;
    form.gdp.value = r.gdp;
    form.area.value = r.area;
  }
  sel.addEventListener('change',()=>load(sel.value));
  document.querySelector('#btnLoad')?.addEventListener('click',()=>load(sel.value));
  if (urlId) load(urlId);

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const v = readForm(form);
    model.update(v.id, {
      name:v.name, region:v.region, capital:v.capital,
      cities:+v.cities||0, population:+v.population||0,
      gdp:+v.gdp||0, area:+v.area||0
    });
    location.href = 'read.html';
  });
}

/* ------- DELETE (delete.html) ------- */
function mountDelete(){
  const sel = document.querySelector('#deleteId');
  if (!sel) return;
  for (const r of model.list()){
    const opt = document.createElement('option');
    opt.value = r.id; opt.textContent = `${r.name} (${r.id})`;
    sel.appendChild(opt);
  }
}

/* ------- helpers ------- */
function setText(selector, text){
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}
function readForm(form){
  const fd = new FormData(form); const v = {};
  for (const [k,val] of fd.entries()) v[k]=String(val);
  return v;
}
function num(n){ return (+n||0).toLocaleString('en-US'); }
function money(n){ return `${(+n||0).toLocaleString('en-US',{maximumFractionDigits:0})} USD`; }
function escape(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
