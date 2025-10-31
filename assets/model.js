/* Data model + persistence (localStorage)
   Key: "usStates"
   Structure: [{id,name,region,capital,population,gdp,area,cities}]
*/
const STORE_KEY = 'usStates';

export function getStates() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

export function setStates(arr) {
  localStorage.setItem(STORE_KEY, JSON.stringify(arr || []));
  // small “version bump” to let other pages react if open
  localStorage.setItem(STORE_KEY + '_v', String(Date.now()));
}

export function upsertState(state) {
  const data = getStates();
  const i = data.findIndex(s => s.id.toUpperCase() === state.id.toUpperCase());
  if (i >= 0) { data[i] = state; } else { data.push(state); }
  setStates(data);
}

export function deleteState(id) {
  const data = getStates().filter(s => s.id.toUpperCase() !== id.toUpperCase());
  setStates(data);
}

export function findState(id){
  return getStates().find(s => s.id.toUpperCase() === id.toUpperCase());
}

export function totals() {
  const states = getStates();
  const population = states.reduce((a,b)=>a+(Number(b.population)||0),0);
  const gdp        = states.reduce((a,b)=>a+(Number(b.gdp)||0),0);
  const area       = states.reduce((a,b)=>a+(Number(b.area)||0),0);
  return { population, gdp, area };
}

/* Utility for sorting and slicing */
export function topBy(field, n){
  const data = [...getStates()].sort((a,b)=>(Number(b[field])||0)-(Number(a[field])||0));
  return data.slice(0, n);
}
