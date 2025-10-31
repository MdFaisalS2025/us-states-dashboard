import { $, $$, on, fmtInt, fmtUsd } from './utils.js';
import { Model } from './model.js';
import { hydrateInsights } from './api.js';

/* ---------- NAV (active link) ---------- */
(function setActive(){
  const path = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-center a').forEach(a=>{
    const href = a.getAttribute('href')||'';
    if(href.endsWith(path)) a.classList.add('active');
  });
})();

/* ---------- BOOT ---------- */
Model.init();

/* ---------- HOME ---------- */
(function home(){
  if(!$('#total-pop')) return;
  const t = Model.totals();
  $('#total-pop').textContent = fmtInt(t.population);
  $('#total-gdp').textContent = fmtUsd(t.gdp);
  $('#total-area').textContent = fmtInt(t.area);
  on($('#refresh-insights'),'click', hydrateInsights);
  hydrateInsights();
})();

/* ---------- READ (table) ---------- */
(function read(){
  const tbody = $('#states-body');
  if(!tbody) return;

  const draw = ()=>{
    const list = Model.all();
    tbody.innerHTML = list.map(s=>`
      <tr>
        <td><a href="update.html?id=${s.id}">${s.id}</a></td>
        <td>${s.name}</td>
        <td>${s.capital}</td>
        <td>${fmtInt(s.population)}</td>
        <td>${fmtUsd(s.gdp)}</td>
        <td>${fmtInt(s.area)}</td>
        <td>${fmtInt(s.cities)}</td>
        <td>
          <a class="btn small ghost" href="update.html?id=${s.id}">Edit</a>
          <button class="btn small danger" data-del="${s.id}">Delete</button>
        </td>
      </tr>
    `).join('') || `<tr><td colspan="8" class="muted">No records yet. Use Create.</td></tr>`;
    // wire delete
    $$('button[data-del]').forEach(b=>{
      on(b,'click', ()=>{
        if(confirm('Delete this state?')){ Model.remove(b.dataset.del); draw(); }
      });
    });
  };
  draw();
})();

/* ---------- CREATE ---------- */
(function create(){
  const form = $('#create-form');
  if(!form) return;

  on(form,'submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const rec = {
      id: (fd.get('id')||'').toUpperCase().trim(),
      name: fd.get('name').trim(),
      region: fd.get('region'),
      capital: fd.get('capital').trim(),
      population: +fd.get('population')||0,
      gdp: +fd.get('gdp')||0,
      area: +fd.get('area')||0,
      cities: +fd.get('cities')||0
    };
    try{
      Model.add(rec);
      location.href = 'read.html';
    }catch(err){
      alert(err.message);
    }
  });
})();

/* ---------- UPDATE ---------- */
(function update(){
  const form = $('#update-form');
  if(!form) return;

  const select = $('#select-state');
  const idFromQuery = new URLSearchParams(location.search).get('id') || '';

  // options
  const list = Model.all();
  select.innerHTML = list.map(s=>`<option value="${s.id}">${s.name} (${s.id})</option>`).join('');

  const loadRecord = (id)=>{
    const s = Model.get(id);
    if(!s) return;
    form.id.value = s.id;
    form.name.value = s.name;
    form.region.value = s.region;
    form.capital.value = s.capital;
    form.cities.value = s.cities;
    form.population.value = s.population;
    form.gdp.value = s.gdp;
    form.area.value = s.area;
  };

  loadRecord(idFromQuery || select.value);
  on($('#btn-load'),'click', ()=> loadRecord(select.value));

  on(form,'submit',(e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    try{
      Model.update(form.id.value.toUpperCase(), {
        id: (fd.get('id')||'').toUpperCase(),
        name: fd.get('name'),
        region: fd.get('region'),
        capital: fd.get('capital'),
        cities: +fd.get('cities')||0,
        population: +fd.get('population')||0,
        gdp: +fd.get('gdp')||0,
        area: +fd.get('area')||0
      });
      location.href = 'read.html';
    }catch(err){ alert(err.message); }
  });
})();

/* ---------- DELETE ---------- */
(function remove(){
  const sel = $('#delete-select');
  if(!sel) return;
  const list = Model.all();
  sel.innerHTML = `<option value="">— Select —</option>` + list.map(s=>`<option value="${s.id}">${s.name} (${s.id})</option>`).join('');
  on($('#delete-form'),'submit', (e)=>{
    e.preventDefault();
    const id = sel.value || $('#delete-id').value.toUpperCase().trim();
    if(!id) return;
    if(confirm('Delete this state?')){ Model.remove(id); location.href='read.html'; }
  });
})();
