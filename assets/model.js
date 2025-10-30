// StateDataService (Singleton) — localStorage persistence with schema version
const STORAGE_KEY = "us_states_dashboard_v3";
const SCHEMA_VERSION = 3;

class StateDataService {
  constructor() {
    if (StateDataService._instance) return StateDataService._instance;
    StateDataService._instance = this;

    this.state = {
      version: SCHEMA_VERSION,
      regions: [
        { id: "NE", name: "Northeast" },
        { id: "MW", name: "Midwest" },
        { id: "S",  name: "South" },
        { id: "W",  name: "West" }
      ],
      states: []
    };

    this.#load();
    if (this.state.states.length === 0) this.#seed();
  }

  #load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      // v1 -> v2 migration (ensure citiesCount)
      if ((parsed.version ?? 1) < 2) {
        parsed.states.forEach(s => {
          if (typeof s.citiesCount !== "number") s.citiesCount = Math.floor(5 + Math.random()*95);
        });
        parsed.version = 2;
      }
      // v2 -> v3 migration (enrich with full 50-state catalog)
      if (parsed.version < 3) {
        parsed.states = this.#enrichWithDefaults(parsed.states);
        parsed.version = 3;
      }

      this.state = parsed;
    } catch {
      // ignore corrupt storage
    }
  }

  #save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  #seed() {
    this.state.states = this.#defaultStates();
    this.#save();
  }

  // Merge any missing states from the default catalog (non-destructive).
  #enrichWithDefaults(existing) {
    const byId = new Map(existing.map(s => [s.id, s]));
    for (const def of this.#defaultStates()) {
      if (!byId.has(def.id)) byId.set(def.id, def);
    }
    return Array.from(byId.values());
  }

  // ---- Regions ----
  getRegions() { return [...this.state.regions]; }
  getRegionName(id){ return this.state.regions.find(r=>r.id===id)?.name ?? ""; }

  // ---- States ----
  listStates() { return [...this.state.states]; }
  getState(id) { return this.state.states.find(s => s.id === id) || null; }

  createState(payload) {
    if (!payload.id || this.getState(payload.id)) {
      throw new Error("ID is required and must be unique (e.g., use USPS code).");
    }
    this.state.states.push({
      id: payload.id.trim().toUpperCase(),
      name: payload.name.trim(),
      region: payload.region,
      capital: payload.capital.trim(),
      population: Number(payload.population) || 0,
      gdp: Number(payload.gdp) || 0,
      area: Number(payload.area) || 0,
      citiesCount: Number(payload.citiesCount) || 0
    });
    this.#save();
  }

  updateState(id, changes) {
    const s = this.getState(id);
    if (!s) throw new Error("State not found.");
    Object.assign(s, {
      name: (changes.name ?? s.name).trim(),
      region: (changes.region ?? s.region),
      capital: (changes.capital ?? s.capital).trim(),
      population: Number(changes.population ?? s.population),
      gdp: Number(changes.gdp ?? s.gdp),
      area: Number(changes.area ?? s.area),
      citiesCount: Number(changes.citiesCount ?? s.citiesCount)
    });
    this.#save();
  }

  deleteState(id) {
    const before = this.state.states.length;
    this.state.states = this.state.states.filter(s => s.id !== id);
    if (this.state.states.length === before) throw new Error("State not found.");
    this.#save();
  }

  clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    // reinitialize and seed
    this.state = { version: SCHEMA_VERSION, regions: this.state.regions, states: [] };
    this.#seed();
  }

  // ---- Derived KPIs ----
  totalPopulation() { return this.state.states.reduce((a,b)=>a + (Number(b.population)||0),0); }
  totalGDP()        { return this.state.states.reduce((a,b)=>a + (Number(b.gdp)||0),0); }
  totalArea()       { return this.state.states.reduce((a,b)=>a + (Number(b.area)||0),0); }

  // ---- Default catalog: all 50 states (approx starter metrics) ----
  #defaultStates(){
    // NOTE: Values are reasonable placeholders for a class project (not official statistics).
    // Regions: NE=Northeast, MW=Midwest, S=South, W=West
    return [
      // West
      { id:"AK", name:"Alaska",      region:"W",  capital:"Juneau",       population: 740000,   gdp: 64000000000,  area: 1717854, citiesCount: 146 },
      { id:"AZ", name:"Arizona",     region:"W",  capital:"Phoenix",      population: 7400000,  gdp: 440000000000, area: 295234,  citiesCount: 91  },
      { id:"CA", name:"California",  region:"W",  capital:"Sacramento",   population: 39000000, gdp: 3200000000000,area: 423967,  citiesCount: 482 },
      { id:"CO", name:"Colorado",    region:"W",  capital:"Denver",       population: 5900000,  gdp: 460000000000, area: 269601,  citiesCount: 271 },
      { id:"HI", name:"Hawaii",      region:"W",  capital:"Honolulu",     population: 1450000,  gdp: 100000000000, area: 28313,   citiesCount: 75  },
      { id:"ID", name:"Idaho",       region:"W",  capital:"Boise",        population: 2000000,  gdp: 110000000000, area: 216443,  citiesCount: 201 },
      { id:"MT", name:"Montana",     region:"W",  capital:"Helena",       population: 1100000,  gdp: 60000000000,  area: 380831,  citiesCount: 129 },
      { id:"NV", name:"Nevada",      region:"W",  capital:"Carson City",  population: 3200000,  gdp: 220000000000, area: 286380,  citiesCount: 99  },
      { id:"NM", name:"New Mexico",  region:"W",  capital:"Santa Fe",     population: 2100000,  gdp: 125000000000, area: 314917,  citiesCount: 106 },
      { id:"OR", name:"Oregon",      region:"W",  capital:"Salem",        population: 4300000,  gdp: 300000000000, area: 254799,  citiesCount: 241 },
      { id:"UT", name:"Utah",        region:"W",  capital:"Salt Lake City",population: 3400000, gdp: 250000000000, area: 219887,  citiesCount: 253 },
      { id:"WA", name:"Washington",  region:"W",  capital:"Olympia",      population: 7800000,  gdp: 700000000000, area: 184661,  citiesCount: 281 },
      { id:"WY", name:"Wyoming",     region:"W",  capital:"Cheyenne",     population: 585000,   gdp: 45000000000,  area: 253335,  citiesCount: 99  },

      // South
      { id:"AL", name:"Alabama",     region:"S",  capital:"Montgomery",   population: 5100000,  gdp: 260000000000, area: 135767,  citiesCount: 461 },
      { id:"AR", name:"Arkansas",    region:"S",  capital:"Little Rock",  population: 3100000,  gdp: 140000000000, area: 137732,  citiesCount: 502 },
      { id:"DE", name:"Delaware",    region:"S",  capital:"Dover",        population: 1030000,  gdp: 90000000000,  area: 6446,    citiesCount: 57  },
      { id:"FL", name:"Florida",     region:"S",  capital:"Tallahassee",  population: 22000000, gdp: 1200000000000,area: 170312,  citiesCount: 411 },
      { id:"GA", name:"Georgia",     region:"S",  capital:"Atlanta",      population: 11000000, gdp: 750000000000, area: 153910,  citiesCount: 537 },
      { id:"KY", name:"Kentucky",    region:"S",  capital:"Frankfort",    population: 4500000,  gdp: 250000000000, area: 104656,  citiesCount: 420 },
      { id:"LA", name:"Louisiana",   region:"S",  capital:"Baton Rouge",  population: 4600000,  gdp: 260000000000, area: 135659,  citiesCount: 305 },
      { id:"MD", name:"Maryland",    region:"S",  capital:"Annapolis",    population: 6200000,  gdp: 470000000000, area: 32131,   citiesCount: 157 },
      { id:"MS", name:"Mississippi", region:"S",  capital:"Jackson",      population: 3000000,  gdp: 120000000000, area: 125438,  citiesCount: 298 },
      { id:"NC", name:"North Carolina",region:"S",capital:"Raleigh",      population: 10800000, gdp: 700000000000, area: 139391,  citiesCount: 552 },
      { id:"OK", name:"Oklahoma",    region:"S",  capital:"Oklahoma City",population: 4000000,  gdp: 210000000000, area: 181037,  citiesCount: 597 },
      { id:"SC", name:"South Carolina",region:"S",capital:"Columbia",     population: 5300000,  gdp: 300000000000, area: 82933,   citiesCount: 271 },
      { id:"TN", name:"Tennessee",   region:"S",  capital:"Nashville",    population: 7100000,  gdp: 460000000000, area: 109153,  citiesCount: 346 },
      { id:"TX", name:"Texas",       region:"S",  capital:"Austin",       population: 30000000, gdp: 2000000000000,area: 695662,  citiesCount: 1218 },
      { id:"VA", name:"Virginia",    region:"S",  capital:"Richmond",     population: 8800000,  gdp: 650000000000, area: 110787,  citiesCount: 230 },
      { id:"WV", name:"West Virginia",region:"S", capital:"Charleston",   population: 1780000,  gdp: 90000000000,  area: 62756,   citiesCount: 232 },

      // Midwest
      { id:"IL", name:"Illinois",    region:"MW", capital:"Springfield",  population: 12500000, gdp: 1000000000000,area: 149995,  citiesCount: 1297 },
      { id:"IN", name:"Indiana",     region:"MW", capital:"Indianapolis", population: 6900000,  gdp: 430000000000, area: 94326,   citiesCount: 567 },
      { id:"IA", name:"Iowa",        region:"MW", capital:"Des Moines",   population: 3200000,  gdp: 210000000000, area: 145746,  citiesCount: 947 },
      { id:"KS", name:"Kansas",      region:"MW", capital:"Topeka",       population: 2950000,  gdp: 180000000000, area: 213100,  citiesCount: 627 },
      { id:"MI", name:"Michigan",    region:"MW", capital:"Lansing",      population: 10000000, gdp: 600000000000, area: 250487,  citiesCount: 533 },
      { id:"MN", name:"Minnesota",   region:"MW", capital:"Saint Paul",   population: 5700000,  gdp: 420000000000, area: 225163,  citiesCount: 853 },
      { id:"MO", name:"Missouri",    region:"MW", capital:"Jefferson City",population: 6200000, gdp: 360000000000, area: 180540,  citiesCount: 944 },
      { id:"NE", name:"Nebraska",    region:"MW", capital:"Lincoln",      population: 2000000,  gdp: 140000000000, area: 200330,  citiesCount: 531 },
      { id:"ND", name:"North Dakota",region:"MW", capital:"Bismarck",     population: 800000,   gdp: 70000000000,  area: 183108,  citiesCount: 356 },
      { id:"OH", name:"Ohio",        region:"MW", capital:"Columbus",     population: 11800000, gdp: 750000000000, area: 116098,  citiesCount: 938 },
      { id:"SD", name:"South Dakota",region:"MW", capital:"Pierre",       population: 920000,   gdp: 65000000000,  area: 199729,  citiesCount: 311 },
      { id:"WI", name:"Wisconsin",   region:"MW", capital:"Madison",      population: 5900000,  gdp: 380000000000, area: 169635,  citiesCount: 601 },

      // Northeast
      { id:"CT", name:"Connecticut", region:"NE", capital:"Hartford",     population: 3600000,  gdp: 330000000000, area: 14357,   citiesCount: 169 },
      { id:"ME", name:"Maine",       region:"NE", capital:"Augusta",      population: 1400000,  gdp: 80000000000,  area: 91633,   citiesCount: 488 },
      { id:"MA", name:"Massachusetts",region:"NE",capital:"Boston",       population: 7100000,  gdp: 690000000000, area: 27336,   citiesCount: 351 },
      { id:"NH", name:"New Hampshire",region:"NE",capital:"Concord",      population: 1400000,  gdp: 95000000000,  area: 24214,   citiesCount: 234 },
      { id:"NJ", name:"New Jersey",  region:"NE", capital:"Trenton",      population: 9300000,  gdp: 700000000000, area: 22591,   citiesCount: 565 },
      { id:"NY", name:"New York",    region:"NE", capital:"Albany",       population: 19500000, gdp: 2200000000000,area: 141297,  citiesCount: 62  },
      { id:"PA", name:"Pennsylvania",region:"NE", capital:"Harrisburg",   population: 13000000, gdp: 900000000000, area: 119280,  citiesCount: 2567 },
      { id:"RI", name:"Rhode Island",region:"NE", capital:"Providence",   population: 1100000,  gdp: 70000000000,  area: 4001,    citiesCount: 39  },
      { id:"VT", name:"Vermont",     region:"NE", capital:"Montpelier",   population: 650000,   gdp: 40000000000,  area: 24906,   citiesCount: 255 }
    ];
  }
}

export const DB = new StateDataService();
