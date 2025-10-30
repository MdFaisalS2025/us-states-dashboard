// assets/controller.js
import { DB } from "./model.js";
import { renderAllCharts } from "./charts.js";
import { mountInsights } from "./api.js";

const $ = (sel, root=document)=>root.querySelector(sel);
export const qs = key => new URLSearchParams(location.search).get(key);

// ---------- HOME ----------
export function initHome(){
  renderAllCharts();          // always fills KPIs
  mountInsights("insights");  // shows WB or local fallback
}

// ---------- READ ----------
function rowHTML(s){
  return `
    <tr>
      <td><span class="badge">${s.id}</span></td>
      <td>${s.name}</td>
      <td>${s.capital||""}</td>
      <td>${Number(s.population||0).toLocaleString()}</td>
      <td>$${Number(s.gdp||0).toLocaleString()}</td>
      <td>${Number(s.area||0).toLocaleString()}</td>
      <td>${Number(s.citiesCount||0).toLocaleString()}</td>
      <td class="text-end">
        <a class="link" href="update.html?id=${encodeURIComponent(s.id)}">Edit</a>
        <a class="link" style="color:#ffb4b4" href="delete.html?id=${encodeURIComponent(s.id)}">Delete</a>
      </td>
    </tr>
  `;
}
export function initRead(){
  const tbody = $("#dataBody"); if (!tbody) return;
  const rows = DB.listStates().sort((a,b)=>a.name.localeCompare(b.name)).map(rowHTML).join("");
  tbody.innerHTML = rows || `<tr><td colspan="8" class="text-center text-muted-2">No data</td></tr>`;
}

// ---------- CREATE ----------
export function initCreate(){
  const form = $("#createForm"); if(!form) return;
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    try{
      DB.createState({
        id: fd.get("id"),
        name: fd.get("name"),
        region: fd.get("region"),
        capital: fd.get("capital"),
        population: fd.get("population"),
        gdp: fd.get("gdp"),
        area: fd.get("area"),
        citiesCount: fd.get("citiesCount")
      });
      location.href = "read.html?created=1";
    }catch(err){ alert(err.message); }
  });
}

// ---------- UPDATE ----------
export function initUpdatePage(){
  const form = $("#updateForm"); if(!form) return;
  const chooser = $("#chooseContainer"), sel = $("#chooseId"), loadBtn = $("#chooseBtn");

  function fill(id){
    const s = DB.getState(id);
    if (!s){ alert("State not found in data set"); return; }
    form.classList.remove("d-none");
    chooser.classList.add("d-none");
    const map = { id:"id", name:"name", region:"region", capital:"capital", citiesCount:"citiesCount", population:"population", gdp:"gdp", area:"area" };
    Object.entries(map).forEach(([k,i])=>{ const el = $("#"+i); if (!el) return; el.value = s[k] ?? ""; });
    $("#id").readOnly = true;
  }

  // populate chooser from whatever data exists (after migration this has content)
  const opts = DB.listStates().sort((a,b)=>a.name.localeCompare(b.name)).map(s=>`<option value="${s.id}">${s.name} (${s.id})</option>`).join("");
  sel.innerHTML = opts;
  loadBtn.addEventListener("click", ()=> fill(sel.value));

  const q = qs("id");
  if (q) fill(q); // direct deep link still works

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    try{
      DB.updateState(fd.get("id"), {
        name: fd.get("name"),
        region: fd.get("region"),
        capital: fd.get("capital"),
        population: fd.get("population"),
        gdp: fd.get("gdp"),
        area: fd.get("area"),
        citiesCount: fd.get("citiesCount"),
      });
      location.href = "read.html?updated=1";
    }catch(err){ alert(err.message); }
  });
}

// ---------- DELETE ----------
export function initDelete(){
  const id = qs("id");
  $("#deleteTarget")?.append(document.createTextNode(id ?? "(none)"));
  $("#btnDelete")?.addEventListener("click", ()=>{ try{ DB.deleteState(id); location.href="read.html?deleted=1"; }catch(e){ alert(e.message);} });
  $("#btnCancel")?.addEventListener("click", ()=> history.back());
}

// ---------- CHARTS ----------
export function initCharts(){ renderAllCharts(); mountInsights("externalInsights"); }

// ---------- boot ----------
document.addEventListener("DOMContentLoaded", ()=>{
  const page = document.body?.dataset?.page;
  try{
    if (page==="home")   initHome();
    if (page==="read")   initRead();
    if (page==="create") initCreate();
    if (page==="update") initUpdatePage();
    if (page==="delete") initDelete();
    if (page==="charts") initCharts();
  }catch(e){ console.error(e); }
});
