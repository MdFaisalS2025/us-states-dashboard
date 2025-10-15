// ===== Theme Toggle =====
(function(){
  const key = 'theme:dark';
  const btns = () => document.querySelectorAll('#toggleTheme');
  const apply = (on) => {
    document.documentElement.classList.toggle('dark', on);
    btns().forEach(b => b.textContent = on ? '☀️ Light' : '🌙 Dark');
    localStorage.setItem(key, on ? '1' : '0');
  };
  const saved = localStorage.getItem(key) === '1';
  apply(saved);
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'toggleTheme') apply(!document.documentElement.classList.contains('dark'));
  });
})();

// ===== Data Store (localStorage) =====
const STORE_KEY = 'states:data:v1';

const SEED = [
  { id:'CA', name:'California', region:'West', capital:'Sacramento', population:39237836, gdp:3500, area:163695, citiesCount:482 },
  { id:'TX', name:'Texas', region:'South', capital:'Austin', population:30029572, gdp:2200, area:268596, citiesCount:1214 },
  { id:'FL', name:'Florida', region:'South', capital:'Tallahassee', population:21992985, gdp:1200, area:65758, citiesCount:411 },
  { id:'NY', name:'New York', region:'Northeast', capital:'Albany', population:19835913, gdp:2000, area:54555, citiesCount:62 },
  { id:'PA', name:'Pennsylvania', region:'Northeast', capital:'Harrisburg', population:13062732, gdp:930, area:46054, citiesCount:57 },
  { id:'IL', name:'Illinois', region:'Midwest', capital:'Springfield', population:12587530, gdp:944, area:57914, citiesCount:1299 },
  { id:'OH', name:'Ohio', region:'Midwest', capital:'Columbus', population:11780017, gdp:780, area:44826, citiesCount:251 },
  { id:'GA', name:'Georgia', region:'South', capital:'Atlanta', population:10912876, gdp:640, area:59425, citiesCount:537 },
  { id:'NC', name:'North Carolina', region:'South', capital:'Raleigh', population:10698973, gdp:680, area:53819, citiesCount:552 },
  { id:'MI', name:'Michigan', region:'Midwest', capital:'Lansing', population:10050811, gdp:590, area:96714, citiesCount:533 }
];

function load(){
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw){ localStorage.setItem(STORE_KEY, JSON.stringify(SEED)); return SEED.slice(); }
  try { return JSON.parse(raw); } catch { return SEED.slice(); }
}

function save(list){ localStorage.setItem(STORE_KEY, JSON.stringify(list)); }

function getStates(){ return load(); }
function getState(id){ return load().find(s => s.id === id.toUpperCase()); }

function addState(s){
  const list = load();
  if (list.some(x => x.id === s.id)) throw new Error('State ID already exists');
  list.push(s); save(list);
}

function updateState(s){
  const list = load();
  const i = list.findIndex(x => x.id === s.id);
  if (i === -1) throw new Error('State not found');
  list[i] = s; save(list);
}

function deleteState(id){
  const list = load();
  const i = list.findIndex(x => x.id === id.toUpperCase());
  if (i >= 0){ list.splice(i,1); save(list); }
}

// ===== Form helpers (shared on Create/Update pages) =====
function collectFormValues(){
  const s = (id) => document.getElementById(id).value.trim();
  return {
    id: s('id').toUpperCase(),
    name: s('name'),
    region: s('region'),
    capital: s('capital'),
    population: Number(s('population')),
    gdp: Number(s('gdp')),
    area: Number(s('area')),
    citiesCount: Number(s('citiesCount'))
  };
}

function setFormValues(state){
  const set = (id, val) => document.getElementById(id).value = val;
  set('id', state.id);
  set('name', state.name);
  set('region', state.region);
  set('capital', state.capital);
  set('population', state.population);
  set('gdp', state.gdp);
  set('area', state.area);
  set('citiesCount', state.citiesCount);
}

// Expose globally for inline scripts
window.getStates = getStates;
window.getState = getState;
window.addState = addState;
window.updateState = updateState;
window.deleteState = deleteState;
window.collectFormValues = collectFormValues;
window.setFormValues = setFormValues;
