// assets/model.js
// MODEL LAYER (Data / Persistence)

const StateDataService = (function () {
  const STORE_KEY = 'states:data:v3';

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

  function load() {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      localStorage.setItem(STORE_KEY, JSON.stringify(SEED));
      return SEED.slice();
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED.slice();
    }
  }

  function save(list) {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  }

  return {
    getAll() {
      return load();
    },

    getById(id) {
      return load().find(s => s.id === id.toUpperCase());
    },

    create(stateObj) {
      const list = load();
      if (list.some(x => x.id === stateObj.id)) {
        throw new Error('State ID already exists');
      }
      list.push(stateObj);
      save(list);
    },

    update(stateObj) {
      const list = load();
      const i = list.findIndex(x => x.id === stateObj.id);
      if (i === -1) throw new Error('State not found');
      list[i] = stateObj;
      save(list);
    },

    remove(id) {
      const list = load();
      const idx = list.findIndex(x => x.id === id.toUpperCase());
      if (idx !== -1) {
        list.splice(idx, 1);
        save(list);
      }
    }
  };
})();
