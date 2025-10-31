// World Bank API (read-only): fetches US GDP and Population latest values
// Docs: https://datahelpdesk.worldbank.org/knowledgebase/topics/125589-developer-information
async function fetchWB(indicator){
  const url = `https://api.worldbank.org/v2/country/USA/indicator/${indicator}?format=json&per_page=2`;
  const r = await fetch(url, { cache: "no-store" });
  const j = await r.json();
  // j[1] is the data array; pick the first non-null value
  const row = (j?.[1]||[]).find(d=>d.value!=null);
  return { value: row?.value ?? null, date: row?.date ?? "—" };
}

export async function loadExternalInsights(){
  const [gdp, pop] = await Promise.all([
    fetchWB("NY.GDP.MKTP.CD"),  // GDP (current US$)
    fetchWB("SP.POP.TOTL")      // Population total
  ]);
  return { gdp, pop, source: "World Bank Open Data" };
}
