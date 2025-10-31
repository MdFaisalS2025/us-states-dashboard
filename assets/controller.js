/* assets/controller.js */
import Model from "./model.js";
import { fetchWorldBank } from "./api.js";

// ---------- formatting ----------
const fmt = {
  num: (n) => new Intl.NumberFormat("en-US").format(+n || 0),
  usd: (n) => "$" + new Intl.NumberFormat("en-US").format(+n || 0),
};

// ---------- homepage KPIs ----------
export function renderKPIs() {
  const t = Model.totals();
  document.querySelector("#kpi-pop").textContent = fmt.num(t.population);
  document.querySelector("#kpi-gdp").textContent = fmt.usd(t.gdp);
  document.querySelector("#kpi-area").textContent = fmt.num(t.area);
}

// ---------- external insights ----------
export async function renderExternal() {
  const boxGDP = document.querySelector("#ext-gdp");
  const boxPOP = document.querySelector("#ext-pop");
  boxGDP.textContent = "Loading…";
  boxPOP.textContent = "Loading…";
  const info = await fetchWorldBank();
  boxGDP.innerHTML = `${fmt.usd(info.gdp)} <span class="text-muted-2">(Year: ${info.year})</span>`;
  boxPOP.innerHTML = `${fmt.num(info.population)} <span class="text-muted-2">(Year: ${info.year})</span>`;
  document.querySelectorAll(".ext-source").forEach(e => e.textContent = info.source);
}

// ---------- table (read.html) ----------
export function renderTable() {
  const tbody = document.querySelector("#states-body");
  tbody.innerHTML = "";
  Model.list().forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="badge bg-slate">${s.id}</span></td>
      <td>${s.name}</td>
      <td>${s.capital}</td>
      <td class="text-end">${fmt.num(s.population)}</td>
      <td class="text-end">${fmt.usd(s.gdp)}</td>
      <td class="text-end">${fmt.num(s.area)}</td>
      <td class="text-end">${fmt.num(s.cities)}</td>
      <td class="text-end">
        <a class="btn btn-sm btn-outline-info" href="update.html?id=${encodeURIComponent(s.id)}">Edit</a>
        <a class="btn btn-sm btn-outline-danger ms-1" href="delete.html?id=${encodeURIComponent(s.id)}">Delete</a>
      </td>`;
    tbody.appendChild(tr);
  });
}

// ---------- create ----------
export function bindCreate() {
  const form = document.querySelector("#create-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = formToState(new FormData(form));
    if (!data.id) return alert("ID is required (2-letter code).");
    if (Model.get(data.id)) return alert("ID already exists.");
    Model.upsert(data);
    location.href = "read.html";
  });
}

// ---------- update ----------
export function initUpdate() {
  const select = document.querySelector("#state-select");
  const form = document.querySelector("#update-form");
  // populate dropdown
  select.innerHTML = Model.list().map(s=>`<option value="${s.id}">${s.name} (${s.id})</option>`).join("");
  // if ?id=XX preselect
  const urlId = new URLSearchParams(location.search).get("id");
  if (urlId) select.value = urlId;

  document.querySelector("#btn-load").addEventListener("click", () => {
    const s = Model.get(select.value);
    if (!s) return;
    fillForm(form, s);
  });
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const data = formToState(new FormData(form));
    if (!data.id) return alert("ID is required.");
    Model.upsert(data);
    alert("Saved.");
    location.href = "read.html";
  });
}

// ---------- delete ----------
export function initDelete() {
  const select = document.querySelector("#delete-select");
  const manual = document.querySelector("#delete-id");
  const confirmBox = document.querySelector("#delete-confirm");
  select.innerHTML = `<option value="">— Select —</option>` +
    Model.list().map(s=>`<option value="${s.id}">${s.name} (${s.id})</option>`).join("");
  const choose = () => {
    const id = manual.value.trim().toUpperCase() || select.value;
    const s = id ? Model.get(id) : null;
    confirmBox.textContent = s ? `${s.name} (${s.id})` : "Select a record below.";
    return id;
  };
  select.addEventListener("change", choose);
  manual.addEventListener("input", choose);

  document.querySelector("#btn-delete").addEventListener("click", ()=>{
    const id = choose();
    if (!id) return;
    if (confirm(`Delete ${id}? This action cannot be undone.`)) {
      Model.remove(id);
      location.href = "read.html";
    }
  });
}

// ---------- helpers ----------
function formToState(fd) {
  return {
    id: (fd.get("id")||"").toUpperCase(),
    name: fd.get("name")||"",
    region: fd.get("region")||"",
    capital: fd.get("capital")||"",
    population: +(fd.get("population")||0),
    gdp: +(fd.get("gdp")||0),
    area: +(fd.get("area")||0),
    cities: +(fd.get("cities")||0),
  };
}
function fillForm(form, s) {
  form.id.value = s.id;
  form.name.value = s.name;
  form.region.value = s.region;
  form.capital.value = s.capital;
  form.population.value = s.population;
  form.gdp.value = s.gdp;
  form.area.value = s.area;
  form.cities.value = s.cities;
}
