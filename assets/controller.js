// assets/controller.js
import { DB } from "./model.js";
import { renderAllCharts } from "./charts.js";
import { renderApiInsight } from "./api.js";

const $ = (sel, root=document)=>root.querySelector(sel);
export function qs(key){
  const params = new URLSearchParams(location.search);
  return params.get(key);
}

// ---------- HOME ----------
export function initHome(){
  renderAllCharts(); // sets KPIs safely even if no charts
}

// ---------- READ (table) ----------
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
        <a href="update.html?id=${encodeURIComponent(s.id)}" class="link">Edit</a>
        <a href="delete.html?id=${encodeURIComponent(s.id)}" class="link text-danger ms-2">Delete</a>
      </td>
    </tr>
  `;
}
export function initRead(){
  const tbody = $("#dataBody");
  if (!tbody) return;
  const rows = DB.listStates().sort((a,b)=>a.name.localeCompare(b.name)).map(rowHTML).join("");
  tbody.innerHTML = rows || `<tr><td colspan="8" class="text-center text-muted">No data</td></tr>`;
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
  const form = $("#updateForm");
  const pickerWrap = $("#chooseContainer");
  const chooseSel = $("#chooseId");
  const chooseBtn = $("#chooseBtn");

  function loadIntoForm(id){
    const s = DB.getState(id);
    if(!s){ alert("State not found"); return; }
    form.classList.remove("d-none");
    pickerWrap?.classList.add("d-none");
    for (const k of ["id","name","region","capital","population","gdp","area","citiesCount"]) {
      const el = $("#"+k);
      if (el) {
        el.value = s[k] ?? "";
        if (k==="id") el.readOnly = true;
      }
    }
  }

  // No id? show chooser
  const idParam = qs("id");
  if (!idParam) {
    if (!pickerWrap) { alert("Missing state id"); return; }
    const options = DB.listStates().sort((a,b)=>a.name.localeCompare(b.name))
      .map(s=>`<option value="${s.id}">${s.name} (${s.id})</option>`).join("");
    chooseSel.innerHTML = options;
    chooseBtn.addEventListener("click", ()=> loadIntoForm(chooseSel.value));
  } else {
    loadIntoForm(idParam);
  }

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
        citiesCount: fd.get("citiesCount")
      });
      location.href = "read.html?updated=1";
    }catch(err){ alert(err.message); }
  });
}

// ---------- DELETE ----------
export function initDelete(){
  const id = qs("id");
  const el = $("#deleteTarget");
  if (el) el.textContent = id ?? "(none)";
  $("#btnDelete")?.addEventListener("click", ()=>{
    try{ DB.deleteState(id); location.href = "read.html?deleted=1"; }
    catch(e){ alert(e.message); }
  });
  $("#btnCancel")?.addEventListener("click", ()=> history.back());
}

// ---------- CHARTS PAGE ----------
export function initCharts(){
  renderAllCharts();
  // External insights (World Bank)
  renderApiInsight("externalInsights");
}

// ---------- BOOT by body[data-page] ----------
document.addEventListener("DOMContentLoaded", ()=>{
  const page = document.body?.dataset?.page;
  try{
    if (page === "home")    initHome();
    if (page === "read")    initRead();
    if (page === "create")  initCreate();
    if (page === "update")  initUpdatePage();
    if (page === "delete")  initDelete();
    if (page === "charts")  initCharts();
  }catch(e){ console.error(e); }
});
