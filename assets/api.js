/* assets/api.js
   World Bank (USA) fetch with graceful fallback.
   GDP indicator: NY.GDP.MKTP.CD, POP: SP.POP.TOTL
*/
const WB = {
  gdp: "https://api.worldbank.org/v2/country/USA/indicator/NY.GDP.MKTP.CD?format=json&per_page=2",
  pop: "https://api.worldbank.org/v2/country/USA/indicator/SP.POP.TOTL?format=json&per_page=2",
};

const Fallback = {
  year: 2024,
  gdp: 29184890000000,      // World Bank “current US$” approx.
  population: 340110988
};

export async function fetchWorldBank() {
  try {
    const [gdpRes, popRes] = await Promise.all([
      fetch(WB.gdp), fetch(WB.pop)
    ]);
    const [gdpJson, popJson] = await Promise.all([gdpRes.json(), popRes.json()]);
    const gdpRow = Array.isArray(gdpJson?.[1]) ? gdpJson[1].find(r=>r.value!==null) : null;
    const popRow = Array.isArray(popJson?.[1]) ? popJson[1].find(r=>r.value!==null) : null;
    return {
      year: (gdpRow?.date && +gdpRow.date) || (popRow?.date && +popRow.date) || Fallback.year,
      gdp:  gdpRow?.value ?? Fallback.gdp,
      population: popRow?.value ?? Fallback.population,
      source: "World Bank Open Data"
    };
  } catch {
    return { ...Fallback, source: "Fallback (cached)" };
  }
}
