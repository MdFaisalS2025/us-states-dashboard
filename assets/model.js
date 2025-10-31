// Simple localStorage-backed model with seed data
import { fmtNumber, fmtMoney } from './utils.js';

const STORAGE_KEY = 'us_states_v1';

const SEED = [
  { id:'CA', name:'California', region:'West',      capital:'Sacramento', population:38970000, gdp:3600000000000, area:423967, cities:482 },
  { id:'TX', name:'Texas',      region:'South',     capital:'Austin',     population:30400000, gdp:2300000000000, area:695662, cities:1214 },
  { id:'FL', name:'Florida',    region:'South',     capital:'Tallahassee',population:22380000, gdp:1200000000000, area:170312, cities:411 },
  { id:'NY', name:'New York',   region:'Northeast', capital:'Albany',     population:19600000, gdp:2200000000000, area:141297, cities:62 },
  { id:'PA', name:'Pennsylvania',region:'Northeast',capital:'Harrisburg', population:12960000, gdp: 950000000000, area:119280, cities:57 },
  { id:'IL', name:'Illinois',   region:'Midwest',   capital:'Springfield',population:12500000, gdp:1000000000000, area:149995, cities:1299 },
  { id:'OH', name:'Ohio',       region:'Midwest',   capital:'Columbus',   population:11800000, gdp: 780000000000, area:116098, cities:931 },
  { id:'GA', name:'Georgia',    region:'South',     capital:'Atlanta',    population:11100000, gdp: 800000000000, area:153910, cities:535 },
  { id:'NC', name:'North Carolina', region:'South', capital:'Raleigh',    population:10800000, gdp: 730000000000, area:139391, cities:552 },
  { id:'MI', name:'Michigan',   region:'Midwest',   capital:'Lansing',    population:10000000, gdp: 600000000000, area:250487, cities:533 }
];

function ensureSeed() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
  }
}
function getAll() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveAll(arr) { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

function upsert(state) {
  const data = getAll();
  const i = data.findIndex(s => s.id.toUpperCase() === state.id.toUpperCase());
  if (i >= 0) data[i] = state; else data.push(state);
  saveAll(data);
}
function removeById(id) {
  saveAll(getAll().filter(s => s.id.toUpperCase() !== id.toUpperCase()));
}
function findById(id) {
  return getAll().find(s => s.id.toUpperCase() === id.toUpperCase());
}

export const StateDB = { ensureSeed, getAll, upsert, removeById, findById, fmtNumber, fmtMoney };
