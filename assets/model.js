/* assets/model.js
 * Singleton data layer with schema versioning + localStorage persistence.
 * Exposes CRUD + aggregates used by KPIs/charts.
 */
const Model = (() => {
  const STORAGE_KEY = "us_states_dashboard.v3";
  const SCHEMA_VERSION = 3;

  // Regions for select controls
  const REGIONS = ["Northeast", "South", "Midwest", "West", "Other"];

  // Minimal clean seed (edit/extend freely). You can paste your 50-state set here.
  const DEMO_SEED = [
    { id:"CA", name:"California", region:"West",  capital:"Sacramento", cities:482, population:39500000, gdp:3100000000000, area:423967 },
    { id:"TX", name:"Texas",      region:"South", capital:"Austin",     cities:1216,population:29500000, gdp:1870000000000, area:695662 },
    { id:"FL", name:"Florida",    region:"South", capital:"Tallahassee",cities:411, population:21900000, gdp:1200000000000, area:170312 },
    { id:"NY", name:"New York",   region:"Northeast", capital:"Albany", cities:62,  population:19400000, gdp:2100000000000, area:141297 },
    { id:"IL", name:"Illinois",   region:"Midwest", capital:"Springfield", cities:1297, population:12500000, gdp:870000000000, area:149995 },
    { id:"PA", name:"Pennsylvania", region:"Northeast", capital:"Harrisburg", cities:2567, population:13000000, gdp:900000000000, area:119280 },
    { id:"OH", name:"Ohio",       region:"Midwest", capital:"Columbus", cities:938, population:11800000, gdp:780000000000, area:116098 },
    { id:"GA", name:"Georgia",    region:"South", capital:"Atlanta", cities:535, population:10800000, gdp:680000000000, area:153910 },
    { id:"NC", name:"North Carolina", region:"South", capital:"Raleigh", cities:552, population:10800000, gdp:700000000000, area:139391 },
    { id:"AZ", name:"Arizona",    region:"West", capital:"Phoenix", cities:91, population:7600000, gdp:420000000000, area:295234 }
  ];

  function loadRaw() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; }
    catch { return null; }
  }
  function saveRaw(payload) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function migrateIfNeeded(raw) {
    if (!raw || raw.version !== SCHEMA_VERSION) {
      // Fresh payload from seed
      const payload = { version: SCHEMA_VERSION, states: DEMO_SEED };
      saveRaw(payload);
      return payload;
    }
    return raw;
  }

  // Public API
  let state = migrateIfNeeded(loadRaw());

  function list() {
    return [...state.states].sort((a,b)=>a.name.localeCompare(b.name));
  }
  function get(id) {
    return state.states.find(s => s.id === id) || null;
  }
  function upsert(item) {
    const i = state.states.findIndex(s => s.id === item.id);
    if (i >= 0) state.states[i] = {...item};
    else state.states.push({...item});
    saveRaw(state);
    return get(item.id);
  }
  function remove(id) {
    state.states = state.states.filter(s => s.id !== id);
    saveRaw(state);
  }
  function aggregates() {
    const all = state.states;
    const totalPopulation = all.reduce((t,s)=>t + (Number(s.population)||0),0);
    const totalGDP = all.reduce((t,s)=>t + (Number(s.gdp)||0),0);
    const totalArea = all.reduce((t,s)=>t + (Number(s.area)||0),0);
    return { totalPopulation, totalGDP, totalArea };
  }
  function regions() { return REGIONS; }

  return { list, get, upsert, remove, aggregates, regions };
})();
window.Model = Model;
