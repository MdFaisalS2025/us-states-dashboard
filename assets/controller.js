import { DB } from "./model.js";
import { Bus, qs, fmtNumber } from "./utils.js";
import { renderAllCharts } from "./charts.js";

// Re-render listeners so views update when CRUD occurs
function emitRefresh(){ Bus.emit("refresh", {}); }

// ---------- READ (table) ----------
export function refreshReadTable(){
  const tbl = document.getElementById("statesTableBody");
  const search = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const regionFilter = document.getElementById("regionFilter")?.value || "ALL";

  let rows = DB.listStates();
  if (search){
    rows = rows.filter(r =>
      r.id.toLowerCase().includes(search) ||
      r.name.toLowerCase().includes(search) ||
      r.capital.toLowerCase().includes(search)
    );
  }
  if (regionFilter !== "ALL"){
    rows = rows.filter(r => r.region === regionFilter);
  }

  rows.sort((a,b)=>a.name.localeCompare(b.name));
  tbl.innerHTML = rows.map(s => `
    <tr>
      <td><span class="badge bg-secondary">${s.id}</span></td>
      <td>${s.name}</td>
      <td>${s.capital}</td>
      <td>${fmtNumber(s.population)}</td>
      <td>$${fmtNumber(s.gdp)}</td>
      <td>${fmtNumber(s.area)}</td>
      <td>${s.citiesCount}</td>
      <td class="text-end">
        <a class="btn btn-sm btn-outline-light" href="update.html?id=${encodeURIComponent(s.id)}">Edit</a>
        <a class="btn btn-sm btn-outline-light ms-2" href="delete.html?id=${encodeURIComponent(s.id)}">Delete</a>
      </td>
    </tr>
  `).join("");
  document.getElementById("rowCount").textContent = `${rows.length} record(s)`;
}

// ---------- CREATE ----------
export function initCreatePage(){
  const form = document.getElementById("createForm");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(form);
    try {
      DB.createState({
        id: formData.get("id"),
        name: formData.get("name"),
        region: formData.get("region"),
        capital: formData.get("capital"),
        population: formData.get("population"),
        gdp: formData.get("gdp"),
        area: formData.get("area"),
        citiesCount: formData.get("citiesCount")
      });
      emitRefresh();
      window.location.href = "read.html?created=1";
    } catch(err){
      alert(err.message);
    }
  });
}

// ---------- UPDATE ----------
export function initUpdatePage(){
  const idParam = qs("id");
  const form = document.getElementById("updateForm");
  const chooserWrap = document.getElementById("chooseContainer");

  function loadForm(id){
    const s = DB.getState(id);
    if (!s) { alert("State not found"); return; }
    ["id","name","region","capital","population","gdp","area","citiesCount"].forEach(k=>{
      const input = document.getElementById(k);
      if (input) {
        input.value = s[k];
        if (k==="id") input.readOnly = true;
      }
    });
    form.classList.remove("d-none");
    if (chooserWrap) chooserWrap.classList.add("d-none");
  }

  // If no id in URL, show a dropdown to choose first
  if (!idParam) {
    if (!chooserWrap) { alert("Missing state id"); window.location.href="read.html"; return; }
    const sel = document.getElementById("chooseId");
    sel.innerHTML = DB.listStates().sort((a,b)=>a.name.localeCompare(b.name))
      .map(s=>`<option value="${s.id}">${s.name} (${s.id})</option>`).join("");
    document.getElementById("chooseBtn").addEventListener("click", ()=>{
      const chosen = sel.value;
      if (chosen) loadForm(chosen);
    });
  } else {
    loadForm(idParam);
  }

  form.addEventListener("submit", e=>{
    e.preventDefault();
    const id = document.getElementById("id").value;
    const fd = new FormData(form);
    try {
      DB.updateState(id, {
        name: fd.get("name"),
        region: fd.get("region"),
        capital: fd.get("capital"),
        population: fd.get("population"),
        gdp: fd.get("gdp"),
        area: fd.get("area"),
        citiesCount: fd.get("citiesCount")
      });
      window.location.href = "read.html?updated=1";
    } catch(err){ alert(err.message); }
  });
}


// ---------- DELETE ----------
export function initDeletePage(){
  const id = qs("id");
  const s = id ? DB.getState(id) : null;
  if (s) {
    document.getElementById("deletePreview").textContent = `${s.id} — ${s.name}`;
  } else {
    document.getElementById("deletePreview").textContent = "Select a record below.";
  }

  document.getElementById("deleteForm")?.addEventListener("submit", e=>{
    e.preventDefault();
    const formData = new FormData(e.target);
    const deleteId = (formData.get("id") || id || "").toUpperCase().trim();
    if (!deleteId) { alert("Provide a State ID"); return; }
    try {
      DB.deleteState(deleteId);
      emitRefresh();
      window.location.href = "read.html?deleted=1";
    } catch(err){
      alert(err.message);
    }
  });

  // populate select
  const sel = document.getElementById("idSelect");
  if (sel) {
    sel.innerHTML = DB.listStates().map(s=>`<option value="${s.id}">${s.id} — ${s.name}</option>`).join("");
    if (id) sel.value = id;
  }
}

// ---------- INDEX / DATA ----------
export function initHomeKPIs(){
  // nothing special, charts.js will set KPI numbers too when rendering
}

// Listen to bus updates (so data page re-renders after CRUD)
Bus.on("refresh", ()=>{
  try { renderAllCharts(); } catch {}
});
