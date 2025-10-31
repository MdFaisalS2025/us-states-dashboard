/* assets/model.js
   Simple singleton “Model” with localStorage persistence + initial seed.
*/
const STORAGE_KEY = "us_states_v4"; // bump when schema changes

const SeedStates = [
  // ID, Name, Capital, Region, Population (people), GDP (USD), Area (km2), Cities
  ["CA","California","Sacramento","West",39500000,3100000000000,423967,482],
  ["TX","Texas","Austin","South",30000000,2800000000000,268596,1218],
  ["FL","Florida","Tallahassee","South",21900000,1200000000000,170312,411],
  ["NY","New York","Albany","Northeast",19700000,2100000000000,54555,62],
  ["IL","Illinois","Springfield","Midwest",12500000,1050000000000,57914,1297],
  ["PA","Pennsylvania","Harrisburg","Northeast",12900000,950000000000,46054,2567],
  ["OH","Ohio","Columbus","Midwest",11800000,820000000000,44825,938],
  ["GA","Georgia","Atlanta","South",10900000,680000000000,153910,597],
  ["NC","North Carolina","Raleigh","South",10800000,750000000000,53819,552],
  ["MI","Michigan","Lansing","Midwest",10000000,680000000000,96714,276],
  ["WA","Washington","Olympia","West",7900000,820000000000,71298,281],
  ["AZ","Arizona","Phoenix","West",7500000,600000000000,295234,91],
];

const Model = (() => {
  let _state = { states: [] };

  function _load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // first run → seed
      _state.states = SeedStates.map(r => ({
        id: r[0], name: r[1], capital: r[2], region: r[3],
        population: r[4], gdp: r[5], area: r[6], cities: r[7]
      }));
      _save();
      return;
    }
    try { _state = JSON.parse(raw) || { states: [] }; }
    catch { _state = { states: [] }; }
  }
  function _save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(_state)); }

  // CRUD
  function list()       { return [..._state.states]; }
  function get(id)      { return _state.states.find(s => s.id === id) || null; }
  function upsert(obj)  {
    const i = _state.states.findIndex(s => s.id === obj.id);
    if (i >= 0) _state.states[i] = obj; else _state.states.push(obj);
    _save(); return obj;
  }
  function remove(id)   {
    const before = _state.states.length;
    _state.states = _state.states.filter(s => s.id !== id);
    _save(); return _state.states.length < before;
  }

  // Aggregates
  function totals() {
    const states = _state.states;
    const population = states.reduce((a,s)=>a+(+s.population||0),0);
    const gdp        = states.reduce((a,s)=>a+(+s.gdp||0),0);
    const area       = states.reduce((a,s)=>a+(+s.area||0),0);
    return { population, gdp, area };
  }

  // Charts helpers
  function topBy(field, n) {
    return [..._state.states]
      .sort((a,b)=>(b[field]||0)-(a[field]||0))
      .slice(0,n);
  }

  _load();
  return { list, get, upsert, remove, totals, topBy };
})();

export default Model;
