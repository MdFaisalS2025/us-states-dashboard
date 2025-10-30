// assets/model.js
// v3 — localStorage-backed singleton with seed + totals helpers

const STORAGE_KEY = "usStatesDB_v3";
const META_KEY = "usStatesDB_meta";
const SCHEMA_VERSION = 3;

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const seedStates = [
  // Keep any existing data you already had — we only seed if empty.
  { id:"CA", name:"California", region:"W", capital:"Sacramento", population:39200000, gdp:3200000000000, area:423967, citiesCount:482 },
  { id:"TX", name:"Texas",      region:"S", capital:"Austin",     population:30000000, gdp:2100000000000, area:695662, citiesCount:1218 },
  { id:"FL", name:"Florida",    region:"S", capital:"Tallahassee",population:22100000, gdp:1200000000000, area:170312, citiesCount:412 },
  { id:"NY", name:"New York",   region:"NE",capital:"Albany",     population:19500000, gdp:2200000000000, area:141297, citiesCount:62  },
  { id:"PA", name:"Pennsylvania",region:"NE",capital:"Harrisburg",population:13000000, gdp:900000000000,  area:119280, citiesCount:2567},
  { id:"IL", name:"Illinois",   region:"MW",capital:"Springfield",population:12500000, gdp:900000000000,  area:149995, citiesCount:1299},
  { id:"OH", name:"Ohio",       region:"MW",capital:"Columbus",   population:11800000, gdp:750000000000,  area:116098, citiesCount:938 },
  { id:"GA", name:"Georgia",    region:"S", capital:"Atlanta",    population:10900000, gdp:700000000000,  area:153910, citiesCount:681 },
  { id:"NC", name:"North Carolina",region:"S",capital:"Raleigh",  population:10800000, gdp:700000000000,  area:139391, citiesCount:552 },
  { id:"WA", name:"Washington", region:"W", capital:"Olympia",    population:7800000,  gdp:700000000000,  area:184661, citiesCount:281 },
  { id:"LA", name:"Louisiana",  region:"S", capital:"Baton Rouge",population:4600000,  gdp:260000000000,  area:135659, citiesCount:305 }
];

function init() {
  const meta = load(META_KEY, { version: 0 });
  if (meta.version !== SCHEMA_VERSION) {
    // migration or first run
    const existing = load(STORAGE_KEY, null);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      save(STORAGE_KEY, seedStates);
    } else {
      // keep user data
      save(STORAGE_KEY, existing);
    }
    save(META_KEY, { version: SCHEMA_VERSION, migratedAt: new Date().toISOString() });
  }
}
init();

const store = {
  list()  { return load(STORAGE_KEY, []); },
  write(arr) { save(STORAGE_KEY, arr); }
};

export const DB = {
  listStates() { return store.list(); },
  getState(id) { return store.list().find(s => String(s.id).toUpperCase() === String(id).toUpperCase()); },
  createState(s) {
    const arr = store.list();
    const id = String(s.id || "").toUpperCase();
    if (!id) throw new Error("ID required");
    if (arr.some(x => String(x.id).toUpperCase() === id)) throw new Error("State already exists");
    const rec = {
      id,
      name: s.name?.trim() || id,
      region: s.region || "",
      capital: s.capital || "",
      population: Number(s.population || 0),
      gdp: Number(s.gdp || 0),
      area: Number(s.area || 0),
      citiesCount: Number(s.citiesCount || 0)
    };
    arr.push(rec); store.write(arr); return rec;
  },
  updateState(id, patch) {
    const arr = store.list();
    const idx = arr.findIndex(s => String(s.id).toUpperCase() === String(id).toUpperCase());
    if (idx === -1) throw new Error("State not found");
    const cur = arr[idx];
    arr[idx] = {
      ...cur,
      ...patch,
      id: cur.id, // immutable
      population: Number(patch.population ?? cur.population ?? 0),
      gdp: Number(patch.gdp ?? cur.gdp ?? 0),
      area: Number(patch.area ?? cur.area ?? 0),
      citiesCount: Number(patch.citiesCount ?? cur.citiesCount ?? 0)
    };
    store.write(arr); return arr[idx];
  },
  deleteState(id) {
    const arr = store.list().filter(s => String(s.id).toUpperCase() !== String(id).toUpperCase());
    store.write(arr);
  },
  totalPopulation() { return store.list().reduce((t,s)=>t + (Number(s.population)||0), 0); },
  totalGDP()        { return store.list().reduce((t,s)=>t + (Number(s.gdp)||0), 0); },
  totalArea()       { return store.list().reduce((t,s)=>t + (Number(s.area)||0), 0); }
};

// small utils used elsewhere
export function fmtNumber(n){ return Number(n||0).toLocaleString(); }
export function fmtCurrency(n){ return "$" + Number(n||0).toLocaleString(); }
