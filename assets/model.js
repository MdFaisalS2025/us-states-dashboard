// LocalStorage-backed data model with one-time seeding
const LS_KEY = 'us_states_v1';

const SEED = [
  { id:'CA', name:'California', region:'West',  capital:'Sacramento', cities:482, population:39500000, gdp:3100000000000, area:423967 },
  { id:'TX', name:'Texas',      region:'South', capital:'Austin',     cities:1214, population:30000000, gdp:2800000000000, area:268596 },
  { id:'FL', name:'Florida',    region:'South', capital:'Tallahassee',cities:411, population:21900000, gdp:1200000000000, area:170312 },
  { id:'NY', name:'New York',   region:'Northeast', capital:'Albany', cities:62,  population:19400000, gdp:2500000000000, area:141297 },
  { id:'IL', name:'Illinois',   region:'Midwest',   capital:'Springfield', cities:1297, population:12500000, gdp:870000000000, area:149995 },
  { id:'PA', name:'Pennsylvania',region:'Northeast',capital:'Harrisburg', cities:256, population:12900000, gdp:950000000000, area:119280 }
];

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}
function save(rows) { localStorage.setItem(LS_KEY, JSON.stringify(rows)); }

export function seedIfEmpty(){
  const rows = load();
  if (!rows || rows.length === 0) save(SEED);
}
export function list(){ return load(); }
export function get(id){ return load().find(r => r.id === id) || null; }

export function add(row){
  const rows = load();
  if (rows.some(r => r.id === row.id)) throw new Error('ID already exists');
  rows.push(row); save(rows);
}
export function update(id, next){
  const rows = load();
  const i = rows.findIndex(r => r.id === id);
  if (i === -1) throw new Error('Record not found');
  rows[i] = { ...rows[i], ...next, id: next.id || id };
  save(rows);
}
export function remove(id){
  const rows = load().filter(r => r.id !== id);
  save(rows);
}

/* helpers used by totals/charts */
export function totals(){
  const rows = load();
  const sumPop = rows.reduce((a,b)=>a + (+b.population||0), 0);
  const sumGDP = rows.reduce((a,b)=>a + (+b.gdp||0), 0);
  const sumArea= rows.reduce((a,b)=>a + (+b.area||0), 0);
  return { population:sumPop, gdp:sumGDP, area:sumArea };
}
