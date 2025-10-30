// assets/model.js
// v3 with migration: imports older keys if present so charts/updates work.

const STORAGE_KEY = "usStatesDB_v3";
const META_KEY = "usStatesDB_meta";
const SCHEMA_VERSION = 3;

function jget(k, fb){ try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } }
function jset(k, v){ localStorage.setItem(k, JSON.stringify(v)); }

// Try to migrate from previous keys used in your repo/branches
function tryMigrateFromOld() {
  const oldKeys = ["usStatesDB_v2","usStatesDB","statesDB","US_STATES_DB"];
  for (const k of oldKeys){
    const arr = jget(k, null);
    if (Array.isArray(arr) && arr.length) return arr;
  }
  return null;
}

// Minimal seed only if absolutely nothing exists
const minimalSeed = [
  { id:"CA", name:"California", region:"W",  capital:"Sacramento", population:39200000, gdp:3200000000000, area:423967, citiesCount:482 },
  { id:"TX", name:"Texas",      region:"S",  capital:"Austin",     population:30000000, gdp:2100000000000, area:695662, citiesCount:1218 },
  { id:"FL", name:"Florida",    region:"S",  capital:"Tallahassee",population:22100000, gdp:1200000000000, area:170312, citiesCount:412 },
  { id:"NY", name:"New York",   region:"NE", capital:"Albany",     population:19500000, gdp:2200000000000, area:141297, citiesCount:62 },
  { id:"PA", name:"Pennsylvania",region:"NE",capital:"Harrisburg", population:13000000, gdp:900000000000,  area:119280, citiesCount:2567 },
  { id:"OH", name:"Ohio",       region:"MW", capital:"Columbus",   population:11800000, gdp:750000000000,  area:116098, citiesCount:938 }
];

(function init(){
  const meta = jget(META_KEY, { version:0 });
  if (meta.version !== SCHEMA_VERSION){
    let current = jget(STORAGE_KEY, null);
    if (!current || !Array.isArray(current) || current.length === 0){
      const imported = tryMigrateFromOld();
      jset(STORAGE_KEY, imported && imported.length ? imported : minimalSeed);
    }
    jset(META_KEY, { version:SCHEMA_VERSION, migratedAt:new Date().toISOString() });
  }
})();

const store = {
  list(){ return jget(STORAGE_KEY, []); },
  write(a){ jset(STORAGE_KEY, a); }
};

export const DB = {
  listStates(){ return store.list(); },
  getState(id){ return store.list().find(s => String(s.id).toUpperCase() === String(id).toUpperCase()); },
  createState(s){
    const arr = store.list();
    const id = String(s.id||"").toUpperCase();
    if (!id) throw new Error("ID required");
    if (arr.some(x=>String(x.id).toUpperCase()===id)) throw new Error("State already exists");
    const rec = {
      id,
      name: s.name?.trim() || id,
      region: s.region || "",
      capital: s.capital || "",
      population: Number(s.population||0),
      gdp: Number(s.gdp||0),
      area: Number(s.area||0),
      citiesCount: Number(s.citiesCount||0),
    };
    arr.push(rec); store.write(arr); return rec;
  },
  updateState(id, patch){
    const arr = store.list();
    const idx = arr.findIndex(s => String(s.id).toUpperCase() === String(id).toUpperCase());
    if (idx === -1) throw new Error("State not found");
    const cur = arr[idx];
    arr[idx] = {
      ...cur, ...patch,
      id: cur.id,
      population: Number(patch.population ?? cur.population ?? 0),
      gdp: Number(patch.gdp ?? cur.gdp ?? 0),
      area: Number(patch.area ?? cur.area ?? 0),
      citiesCount: Number(patch.citiesCount ?? cur.citiesCount ?? 0),
    };
    store.write(arr); return arr[idx];
  },
  deleteState(id){
    store.write(store.list().filter(s => String(s.id).toUpperCase() !== String(id).toUpperCase()));
  },
  totalPopulation(){ return store.list().reduce((t,s)=>t + (Number(s.population)||0), 0); },
  totalGDP(){ return store.list().reduce((t,s)=>t + (Number(s.gdp)||0), 0); },
  totalArea(){ return store.list().reduce((t,s)=>t + (Number(s.area)||0), 0); },
};

export const fmtNumber = n => Number(n||0).toLocaleString();
export const fmtCurrency = n => "$" + Number(n||0).toLocaleString();
