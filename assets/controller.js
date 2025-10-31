import { $, $$, param } from './utils.js';
import { api } from './api.js';

/* ---------- Home ---------- */
export function bootHome(){
  api.init();
  const rows = api.list();
  const totalPop  = rows.reduce((a,s)=>a+(+s.population||0),0);
  const totalGDP  = rows.reduce((a,s)=>a+(+s.gdp||0),0);
  const totalArea = rows.reduce((a,s)=>a+(+s.area||0),0);

  $('#metric-pop').textContent    = api.fmtNumber(totalPop);
  $('#metric-gdp').textContent    = api.fmtMoney(totalGDP);
  $('#metric-area').textContent   = api.fmtNumber(totalArea);
  $('#metric-states').textContent = api.fmtNumber(rows.length);
}

/* ---------- Data Table (data.html / read.html) ---------- */
export function bootTable(){
  api.init();
  const tbody = $('#states-body');
  const q = $('#q'); const region = $('#filter-region');
  const all = api.list();

  function render(data){
    tbody.innerHTML = data.map(s=>`
      <tr>
        <td>${s.id}</td>
        <td>${s.name}</td>
        <td>${s.capital}</td>
        <td>${api.fmtNumber(s.population)}</td>
        <td>${api.fmtMoney(s.gdp)}</td>
        <td>${api.fmtNumber(s.area)}</td>
        <td>${api.fmtNumber(s.cities)}</td>
        <td class="actions">
          <a class="btn" href="update.html?id=${encodeURIComponent(s.id)}">Edit</a>
          <a class="btn" href="delete.html?id=${encodeURIComponent(s.id)}">Delete</a>
        </td>
      </tr>`).join('');
  }

  function apply(){
    const t = (q?.value||'').toLowerCase();
    const r = region?.value || '';
    const out = all.filter(s=>{
      const hit = !t || [s.id,s.name,s.capital].some(v=>String(v).toLowerCase().includes(t));
      const reg = !r || s.region===r;
      return hit && reg;
    }).sort((a,b)=>a.name.localeCompare(b.name));
    render(out);
  }

  // build regions
  if(region){
    [...new Set(all.map(s=>s.region))].sort().forEach(r=>{
      const o=document.createElement('option');o.value=r;o.textContent=r;region.appendChild(o);
    });
    region.addEventListener('change', apply);
  }
  q?.addEventListener('input', apply);
  apply();
}

/* Keep compatibility with your old import name */
export { bootTable as renderTable };

/* ---------- Create ---------- */
export function bootCreate(){
  api.init();
  $('#create-form').addEventListener('submit',(e)=>{
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const s = Object.fromEntries(fd.entries());
    const rec = {
      id:s.id.toUpperCase().trim(),
      name:s.name.trim(), region:s.region,
      capital:s.capital.trim(),
      population:+s.population||0, gdp:+s.gdp||0, area:+s.area||0, cities:+s.cities||0
    };
    if(!rec.id || rec.id.length!==2) return alert('ID must be a 2-letter USPS code (e.g., CA).');
    api.upsert(rec);
    e.currentTarget.reset();
    alert('State saved.');
  });
}

/* ---------- Update ---------- */
export function bootUpdate(){
  api.init();
  const data = api.list();
  const sel = $('#select-state'); const form = $('#update-form');

  data.sort((a,b)=>a.name.localeCompare(b.name)).forEach(s=>{
    const o=document.createElement('option');o.value=s.id;o.textContent=`${s.name} (${s.id})`;sel.appendChild(o);
  });

  const pre = param('id'); if(pre) sel.value = pre;

  function hydrate(){
    const s = api.get(sel.value); if(!s) return;
    form.id.value=s.id; form.name.value=s.name; form.region.value=s.region;
    form.capital.value=s.capital; form.population.value=s.population;
    form.gdp.value=s.gdp; form.area.value=s.area; form.cities.value=s.cities;
  }
  sel.addEventListener('change', hydrate); hydrate();

  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const fd=new FormData(form); const s=Object.fromEntries(fd.entries());
    api.upsert({ id:s.id.toUpperCase(), name:s.name, region:s.region, capital:s.capital,
      population:+s.population||0, gdp:+s.gdp||0, area:+s.area||0, cities:+s.cities||0 });
    alert('State updated.');
  });
}

/* ---------- Delete ---------- */
export function bootDelete(){
  api.init();
  const data = api.list(); const sel = $('#select-del');
  data.sort((a,b)=>a.name.localeCompare(b.name)).forEach(s=>{
    const o=document.createElement('option');o.value=s.id;o.textContent=`${s.name} (${s.id})`;sel.appendChild(o);
  });
  const pre = param('id'); if(pre) sel.value = pre;

  $('#btn-del').addEventListener('click',()=>{
    const id = sel.value; if(!id) return;
    if(confirm(`Delete ${id}? This cannot be undone.`)){
      api.remove(id); alert('Deleted.'); location.href='data.html';
    }
  });
}
