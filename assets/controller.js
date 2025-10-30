/* assets/controller.js
 * Page controllers wired by <body data-page="...">.
 * Requires model.js and Chart.js on pages that render charts.
 */
(function () {
  const $$ = sel => document.querySelector(sel);
  const $$$ = sel => [...document.querySelectorAll(sel)];
  const fmtInt = n => (isFinite(n) ? n.toLocaleString() : "—");
  const fmtUSD = n => (isFinite(n) ? `$${n.toLocaleString()}` : "—");

  // ----- HOME (index.html) -----
  function initHome() {
    const { totalPopulation, totalGDP, totalArea } = Model.aggregates();
    $$("#kpi-pop").textContent = fmtInt(totalPopulation);
    $$("#kpi-gdp").textContent = fmtUSD(totalGDP);
    $$("#kpi-area").textContent = fmtInt(totalArea);

    // External insights: World Bank API (latest real value) with graceful fallback
    setupInsightsCard({
      gdpEl: "#insight-gdp",
      popEl: "#insight-pop",
      refreshBtn: "#insight-refresh",
      loader: "#insight-loader",
      error: "#insight-error"
    });
  }

  // ----- READ (read.html) -----
  function initRead() {
    const tbody = $$("#table-body");
    const empty = $$("#empty-note");
    const rows = Model.list();
    tbody.innerHTML = "";
    if (!rows.length) {
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";
    for (const s of rows) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><span class="badge">${s.id}</span></td>
        <td>${s.name}</td>
        <td>${s.capital}</td>
        <td class="num">${fmtInt(s.population)}</td>
        <td class="num">${fmtUSD(s.gdp)}</td>
        <td class="num">${fmtInt(s.area)}</td>
        <td class="num">${fmtInt(s.cities)}</td>
        <td class="actions">
          <a class="btn btn-xs" href="update.html?id=${encodeURIComponent(s.id)}">Edit</a>
          <a class="btn btn-xs btn-danger" href="delete.html?id=${encodeURIComponent(s.id)}">Delete</a>
        </td>`;
      tbody.appendChild(tr);
    }
  }

  // ----- CREATE (create.html) -----
  function initCreate() {
    const form = $$("#state-form");
    fillRegionSelect("#region");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const item = readForm();
      if (!/^[A-Z]{2}$/.test(item.id)) return alert("State ID must be two uppercase letters (e.g., CA).");
      if (!item.name.trim()) return alert("Name is required.");
      Model.upsert(item);
      location.href = "read.html";
    });
    $$("#cancel").addEventListener("click", (e)=>{ e.preventDefault(); history.back(); });

    function readForm() {
      return {
        id: $$("#id").value.trim().toUpperCase(),
        name: $$("#name").value.trim(),
        region: $$("#region").value,
        capital: $$("#capital").value.trim(),
        population: Number($$("#population").value||0),
        gdp: Number($$("#gdp").value||0),
        area: Number($$("#area").value||0),
        cities: Number($$("#cities").value||0)
      };
    }
  }

  // ----- UPDATE (update.html) -----
  function initUpdate() {
    fillRegionSelect("#region");
    const select = $$("#state-picker");
    const loadBtn = $$("#load-state");
    const form = $$("#state-form");
    const idInput = $$("#id");

    // Populate chooser
    for (const s of Model.list()) {
      const opt = document.createElement("option");
      opt.value = s.id; opt.textContent = `${s.name} (${s.id})`;
      select.appendChild(opt);
    }

    // Autofill from query ?id=
    const url = new URL(location.href);
    const qid = url.searchParams.get("id");
    if (qid && Model.get(qid)) {
      select.value = qid;
      loadSelected();
    }

    loadBtn.addEventListener("click", loadSelected);

    function loadSelected() {
      const id = select.value;
      const s = Model.get(id);
      if (!s) return alert("Select a state first.");
      idInput.value = s.id;
      $$("#name").value = s.name;
      $$("#region").value = s.region;
      $$("#capital").value = s.capital;
      $$("#population").value = s.population;
      $$("#gdp").value = s.gdp;
      $$("#area").value = s.area;
      $$("#cities").value = s.cities;
    }

    form.addEventListener("submit",(e)=>{
      e.preventDefault();
      const item = {
        id: idInput.value.trim().toUpperCase(),
        name: $$("#name").value.trim(),
        region: $$("#region").value,
        capital: $$("#capital").value.trim(),
        population: Number($$("#population").value||0),
        gdp: Number($$("#gdp").value||0),
        area: Number($$("#area").value||0),
        cities: Number($$("#cities").value||0)
      };
      Model.upsert(item);
      location.href = "read.html";
    });
    $$("#cancel").addEventListener("click",(e)=>{ e.preventDefault(); history.back(); });
  }

  // ----- CHARTS (data.html) -----
  function initCharts() {
    const topPop = Model.list().slice().sort((a,b)=>b.population-a.population).slice(0,6);
    const topGDP = Model.list().slice().sort((a,b)=>b.gdp-a.gdp).slice(0,8);
    const topArea = Model.list().slice().sort((a,b)=>b.area-a.area).slice(0,10);

    const baseGrid = { color: "rgba(255,255,255,0.08)" };
    const font = { family: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" };

    // Donut: Population
    new Chart($$("#popChart"), {
      type: "doughnut",
      data: {
        labels: topPop.map(s=>s.name),
        datasets: [{ data: topPop.map(s=>s.population) }]
      },
      options: {
        plugins: {
          legend: { position: "bottom", labels:{ color:"#dfe7ee", font } },
          title: { display:true, text:"Population Share (Top 6)", color:"#dfe7ee", font:{weight:"600", size:16} }
        },
        cutout: "55%"
      }
    });

    // Bar: GDP
    new Chart($$("#gdpChart"), {
      type: "bar",
      data: {
        labels: topGDP.map(s=>s.name),
        datasets: [{ label: "GDP", data: topGDP.map(s=>s.gdp) }]
      },
      options: {
        plugins: {
          legend: { labels:{ color:"#dfe7ee", font } },
          title: { display:true, text:"GDP by State (Top 8)", color:"#dfe7ee", font:{weight:"600", size:16} },
          tooltip: { callbacks: { label: c => ` ${c.dataset.label}: $${Number(c.parsed.y).toLocaleString()}` } }
        },
        scales: {
          x: { ticks: { color:"#b7c1c9", font }, grid: baseGrid },
          y: { ticks: { color:"#b7c1c9", font, callback:v=>"$"+Number(v).toLocaleString() }, grid: baseGrid }
        }
      }
    });

    // Line: Area
    new Chart($$("#areaChart"), {
      type: "line",
      data: {
        labels: topArea.map(s=>s.name),
        datasets: [{ label: "Land Area (km²)", data: topArea.map(s=>s.area), tension:0.25, fill:false }]
      },
      options: {
        plugins: {
          legend: { labels:{ color:"#dfe7ee", font } },
          title: { display:true, text:"Land Area (Top 10)", color:"#dfe7ee", font:{weight:"600", size:16} }
        },
        scales: {
          x: { ticks: { color:"#b7c1c9", font }, grid: baseGrid },
          y: { ticks: { color:"#b7c1c9", font, callback:v=>Number(v).toLocaleString() }, grid: baseGrid }
        }
      }
    });

    // Insights block (same as Home)
    setupInsightsCard({
      gdpEl: "#insight-gdp",
      popEl: "#insight-pop",
      refreshBtn: "#insight-refresh",
      loader: "#insight-loader",
      error: "#insight-error"
    });
  }

  // ----- helpers -----
  function fillRegionSelect(sel) {
    const el = $$(sel);
    el.innerHTML = `<option value="">Select Region</option>` + Model.regions().map(r=>`<option>${r}</option>`).join("");
  }

  function setupInsightsCard({ gdpEl, popEl, refreshBtn, loader, error }) {
    const refresh = $$(refreshBtn);
    async function load() {
      $$(loader).style.display = "block";
      $$(error).style.display = "none";
      try {
        const [gdp, gdpYear] = await latestWorldBank("NY.GDP.MKTP.CD");
        const [pop, popYear] = await latestWorldBank("SP.POP.TOTL");
        $$(gdpEl).textContent = `${fmtUSD(gdp)} (Year: ${gdpYear})`;
        $$(popEl).textContent = `${fmtInt(pop)} (Year: ${popYear})`;
      } catch (e) {
        $$(error).style.display = "block";
      } finally {
        $$(loader).style.display = "none";
      }
    }
    refresh.addEventListener("click", load);
    load();
  }

  // World Bank helper: returns [value, year] for latest non-null USA value
  async function latestWorldBank(indicator) {
    const url = `https://api.worldbank.org/v2/country/USA/indicator/${indicator}?format=json`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("wb http");
    const data = await res.json();
    const series = (data && data[1]) || [];
    const row = series.find(r => r.value !== null);
    if (!row) throw new Error("wb empty");
    return [Number(row.value), row.date];
  }

  // Router
  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    if (page === "home")   return initHome();
    if (page === "read")   return initRead();
    if (page === "create") return initCreate();
    if (page === "update") return initUpdate();
    if (page === "charts") return initCharts();
  });
})();
