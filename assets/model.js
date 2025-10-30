// assets/model.js
// Persistent LocalStorage model with safe seeding + helpers

const LS_KEY = 'us-states-v3';

// ------- seed if empty (first load) -------
const SEED = [
  { id: 'AZ', name: 'Arizona',  region: 'West',     capital: 'Phoenix',     population: 7600000,  gdp: 420000000000, area: 295234, cities: 91 },
  { id: 'CA', name: 'California',region: 'West',     capital: 'Sacramento',  population: 39500000, gdp: 3100000000000, area: 423967, cities: 482 },
  { id: 'FL', name: 'Florida',   region: 'South',    capital: 'Tallahassee', population: 21900000, gdp: 1200000000000, area: 170312, cities: 411 },
  { id: 'GA', name: 'Georgia',   region: 'South',    capital: 'Atlanta',     population: 10800000, gdp: 680000000000,  area: 153910, cities: 535 },
  { id: 'IL', name: 'Illinois',  region: 'Midwest',  capital: 'Springfield', population: 12500000, gdp: 870000000000,  area: 149995, cities: 1297 },
  { id: 'NY', name: 'New York',  region: 'Northeast',capital: 'Albany',      population: 19400000, gdp: 2100000000000, area: 141297, cities: 62 },
];

function _load() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    localStorage.setItem(LS_KEY, JSON.stringify(SEED));
    return [...SEED];
  }
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
  } catch {}
  localStorage.setItem(LS_KEY, JSON.stringify(SEED));
  return [...SEED];
}

function _save(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}

export function getAllStates() {
  return _load().sort((a,b) => a.name.localeCompare(b.name));
}

export function getStateById(id) {
  return _load().find(s => s.id.toUpperCase() === id.toUpperCase()) || null;
}

export function createState(state) {
  const data = _load();
  if (data.some(s => s.id.toUpperCase() === state.id.toUpperCase())) {
    throw new Error('A state with this ID already exists.');
  }
  data.push({
    id: state.id.toUpperCase(),
    name: state.name.trim(),
    region: state.region,
    capital: state.capital.trim(),
    population: Number(state.population) || 0,
    gdp: Number(state.gdp) || 0,
    area: Number(state.area) || 0,
    cities: Number(state.cities) || 0
  });
  _save(data);
}

export function updateState(id, patch) {
  const data = _load();
  const idx = data.findIndex(s => s.id.toUpperCase() === id.toUpperCase());
  if (idx === -1) throw new Error('State not found.');
  data[idx] = {
    ...data[idx],
    ...patch,
    id: data[idx].id.toUpperCase(),
    name: (patch.name ?? data[idx].name).trim(),
    capital: (patch.capital ?? data[idx].capital).trim(),
    population: Number(patch.population ?? data[idx].population),
    gdp: Number(patch.gdp ?? data[idx].gdp),
    area: Number(patch.area ?? data[idx].area),
    cities: Number(patch.cities ?? data[idx].cities)
  };
  _save(data);
}

export function deleteState(id) {
  const data = _load();
  const next = data.filter(s => s.id.toUpperCase() !== id.toUpperCase());
  _save(next);
}

export function totals() {
  const data = _load();
  return data.reduce((acc, s) => {
    acc.population += s.population || 0;
    acc.gdp        += s.gdp || 0;
    acc.area       += s.area || 0;
    return acc;
  }, { population:0, gdp:0, area:0 });
}
