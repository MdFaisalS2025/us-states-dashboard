import {load, save} from './utils.js';

const KEY = 'us_states';

const SEED = [
  {id:'CA', name:'California', region:'West', capital:'Sacramento', cities:482, population:39500000, gdp:3100000000000, area:423967},
  {id:'TX', name:'Texas',      region:'South',capital:'Austin',      cities:1214,population:30000000, gdp:2800000000000, area:268596},
  {id:'FL', name:'Florida',    region:'South',capital:'Tallahassee', cities:411, population:21900000, gdp:1200000000000, area:170312},
  {id:'NY', name:'New York',   region:'Northeast',capital:'Albany',  cities:62,  population:19400000, gdp:2500000000000, area:141297},
  {id:'IL', name:'Illinois',   region:'Midwest', capital:'Springfield',cities:1297,population:12500000,gdp:870000000000, area:149995},
  {id:'PA', name:'Pennsylvania',region:'Northeast',capital:'Harrisburg',cities:256,population:12900000,gdp:950000000000, area:119280}
];

function ensure(){
  const cur = load(KEY, null);
  if(!cur || !Array.isArray(cur) || cur.length===0){ save(KEY, SEED); }
}

export const Model = {
  init(){ ensure(); },
  all(){ return load(KEY, []); },
  get(id){ return this.all().find(s=>s.id===id) || null; },
  add(rec){
    const list = this.all();
    if(list.some(x=>x.id===rec.id)) throw new Error('Duplicate ID');
    list.push(rec); save(KEY,list); return rec;
  },
  update(id, patch){
    const list = this.all();
    const i = list.findIndex(x=>x.id===id);
    if(i<0) throw new Error('Not found');
    list[i] = {...list[i], ...patch};
    // normalize id change
    if(patch.id){ list[i].id = patch.id.toUpperCase(); }
    save(KEY,list); return list[i];
  },
  remove(id){
    const list = this.all().filter(x=>x.id!==id);
    save(KEY,list);
  },
  totals(){
    const d = this.all();
    return {
      population: d.reduce((a,b)=>a+(+b.population||0),0),
      gdp:        d.reduce((a,b)=>a+(+b.gdp||0),0),
      area:       d.reduce((a,b)=>a+(+b.area||0),0)
    };
  }
};
