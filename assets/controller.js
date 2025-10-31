import { Model } from './model.js';
import { fmtInt, fmtUSD, el, els } from './utils.js';
import { fetchWorldBank } from './api.js';

/* ---------- Shared Navbar & Footer injection ---------- */
export function mountChrome(active){
  const nav = `
  <div class="navbar">
    <div class="nav-inner">
      <a class="brand" href="index.html">US States Dashboard</a>
      <div class="nav-links">
        <a href="read.html"   class="${active==='read'   ? 'active':''}">Data Table</a>
        <a href="create.html" class="${active==='create' ? 'active':''}">Create</a>
        <a href="update.html" class="${active==='update' ? 'active':''}">Update</a>
        <a href="delete.html" class="${active==='delete' ? 'active':''}">Delete</a>
        <a href="data.html"   class="${active==='charts' ? 'active':''}">Charts</a>
        <a href="about.html"  class="${active==='about'  ? 'active':''}">About</a>
      </div>
      <div class="nav-cta"><a class="btn secondary" href="https://github.com/mdfaisals2025/us-states-dashboard" target="_blank" rel="noopener">GitHub</a></div>
    </div>
  </div>`;
  const footer = `
  <div class="footer">
    <div class="inner">
      <span>© 2025 US States Dashboard</span>
      <span class="credit">Built with ❤️ by Faisal, Hongxu & Jonathan</span>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('afterbegin', nav);
  document.body.insertAdjacentHTML('beforeend', footer);
}

/* ---------- Home (index) ---------- */
export function initHome(){
  const t = Model.totals();
  el('#kpi-pop').textContent = fmtInt(t.population);
  el('#kpi-gdp').textContent = fmtUSD(t.gdp);
  el('#kpi-area').textContent = fmtInt(t.area);

  loadInsights();
  el('#btn-refresh')?.addEventListener('click', loadInsights);

  async function loadInsights(){
    const boxG = el('#wb-gdp'); const metaG = el('#wb-gdp-meta');
    const boxP = el('#wb-pop'); const metaP = el('#wb-pop-meta');
    boxG.textContent = '—'; boxP.textContent = '—';
    const res = await fetchWorldBank();
    boxG.textContent = res.gdp.value ? fmtUSD(res.gdp.value) : '—';
    metaG.textContent = res.gdp.value ? `(Year: ${res.gdp.year}) • Source: World Bank Open Data` : 'Unavailable';
    boxP.textContent = res.pop.value ? fmtInt(res.pop.value) : '—';
    metaP.textContent = res.pop.value ? `(Year: ${res.pop.year}) • Source: World Bank Open Data` : 'Unavailable';
  }
}

/* ---------- Read table ---------- */
export function initRead(){
  const tbody = el('tbody');
  const rows = Model.getAll();
  tbody.innerHTML = rows.map(r=>`
    <tr>
      <td><span class="badge">${r.id}</span></td>
      <td>${r.name}</td>
      <td>${r.capital}</td>
      <td>${fmtInt(r.population)}</td>
      <td>${fmtUSD(r.gdp)}</td>
      <td>${fmtInt(r.area)}</td>
      <td>${fmtInt(r.cities)}</td>
      <td class="actions">
        <a class="btn ghost" href="update.html?id=${r.id}">Edit</a>
        <a class="btn danger" href="delete.html?id=${r.id}">Delete</a>
      </td>
    </tr>
  `).join('');
}

/* ---------- Create ---------- */
export function initCreate(){
  const f = el('form');
  f.addEventListener('submit', e=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(f));
    try{
      Model.create({
        id:data.id.trim().toUpperCase(),
        name:data.name.trim(),
        region:data.region,
        capital:data.capital.trim(),
        population:+data.population||0,
        gdp:+data.gdp||0,
        area:+data.area||0,
        cities:+data.cities||0
      });
      location.href='read.html';
    }catch(err){ alert(err.message) }
  });
}

/* ---------- Update ---------- */
export function initUpdate(){
  const sel = el('#sel'); const loadBtn = el('#load');
  const rows = Model.getAll();
  sel.innerHTML = rows.map(r=>`<option value="${r.id}">${r.name} (${r.id})</option>`).join('');

  const params = new URLSearchParams(location.search);
  if(params.get('id')) sel.value = params.get('id');

  loadBtn.addEventListener('click', ()=>load(sel.value));
  function load(id){
    const r = Model.get(id); if(!r) return;
    el('#f-id').value=r.id; el('#f-name').value=r.name; el('#f-region').value=r.region;
    el('#f-capital').value=r.capital; el('#f-cities').value=r.cities;
    el('#f-pop').value=r.population; el('#f-gdp').value=r.gdp; el('#f-area').value=r.area;
  }

  el('form').addEventListener('submit', e=>{
    e.preventDefault();
    const id = el('#f-id').value.trim().toUpperCase();
    Model.update(id,{
      name:el('#f-name').value.trim(),
      region:el('#f-region').value,
      capital:el('#f-capital').value.trim(),
      cities:+el('#f-cities').value||0,
      population:+el('#f-pop').value||0,
      gdp:+el('#f-gdp').value||0,
      area:+el('#f-area').value||0
    });
    location.href='read.html';
  });

  // auto-load first
  if(sel.value) load(sel.value);
}

/* ---------- Delete ---------- */
export function initDelete(){
  const sel = el('#sel'); const rows = Model.getAll();
  sel.innerHTML = `<option value="">— Select —</option>` + rows.map(r=>`<option value="${r.id}">${r.name} (${r.id})</option>`).join('');
  const params = new URLSearchParams(location.search);
  if(params.get('id')) sel.value=params.get('id');

  el('form').addEventListener('submit', e=>{
    e.preventDefault();
    const id = sel.value || el('#manual').value.trim().toUpperCase();
    if(!id) return alert('Choose an ID');
    if(confirm(`Delete ${id}? This cannot be undone.`)){
      Model.remove(id); location.href='read.html';
    }
  });
}

/* ---------- Charts page bootstrap ---------- */
export function currentData(){ return Model.getAll() }
