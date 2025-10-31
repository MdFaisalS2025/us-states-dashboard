import { LS_KEY } from './utils.js';

/** Seed dataset so the app is never empty.  Persist in localStorage. */
const seed = [
  { id:'CA', name:'California',  region:'West',      capital:'Sacramento', population:39500000, gdp:3100000000000, area:423967, cities:482 },
  { id:'TX', name:'Texas',       region:'South',     capital:'Austin',     population:30000000, gdp:2800000000000, area:268596, cities:1214 },
  { id:'FL', name:'Florida',     region:'South',     capital:'Tallahassee',population:21900000, gdp:1200000000000, area:170312, cities:411 },
  { id:'NY', name:'New York',    region:'Northeast', capital:'Albany',     population:19400000, gdp:2500000000000, area:141297, cities:62 },
  { id:'IL', name:'Illinois',    region:'Midwest',   capital:'Springfield',population:12500000, gdp: 870000000000, area:149995, cities:1297 },
  { id:'PA', name:'Pennsylvania',region:'Northeast', capital:'Harrisburg', population:12900000, gdp: 950000000000, area:119280, cities:256 }
];

function load(){
  const raw = localStorage.getItem(LS_KEY);
  if(!raw){ localStorage.setItem(LS_KEY, JSON.stringify(seed)); return [...seed] }
  try{ return JSON.parse(raw) }catch{ localStorage.setItem(LS_KEY, JSON.stringify(seed)); return [...seed] }
}
function save(rows){ localStorage.setItem(LS_KEY, JSON.stringify(rows)) }

export const Model = {
  getAll(){ return load() },
  get(id){ return load().find(x=>x.id===id) },
  create(row){
    const rows = load();
    if(rows.some(r=>r.id===row.id)) throw new Error('ID already exists.');
    rows.push(row); save(rows); return row;
  },
  update(id, patch){
    const rows = load(); const i = rows.findIndex(r=>r.id===id);
    if(i<0) throw new Error('Not found');
    rows[i] = {...rows[i], ...patch}; save(rows); return rows[i];
  },
  remove(id){
    const rows = load().filter(r=>r.id!==id); save(rows);
  },
  totals(){
    const rows = load();
    return {
      population: rows.reduce((a,b)=>a+(+b.population||0),0),
      gdp: rows.reduce((a,b)=>a+(+b.gdp||0),0),
      area: rows.reduce((a,b)=>a+(+b.area||0),0)
    }
  }
};
