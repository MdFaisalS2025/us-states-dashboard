/** World Bank External Insights with graceful fallback */
export async function fetchWorldBank() {
  const endpoints = {
    gdp: 'https://api.worldbank.org/v2/country/USA/indicator/NY.GDP.MKTP.CD?format=json',
    pop: 'https://api.worldbank.org/v2/country/USA/indicator/SP.POP.TOTL?format=json'
  };
  try{
    const [g,p] = await Promise.all([
      fetch(endpoints.gdp).then(r=>r.json()),
      fetch(endpoints.pop).then(r=>r.json())
    ]);
    const gdpRow = g?.[1]?.find(r=>r.value!=null);
    const popRow = p?.[1]?.find(r=>r.value!=null);
    return {
      ok:true,
      gdp: { value:gdpRow?.value ?? null, year:gdpRow?.date ?? '—' },
      pop: { value:popRow?.value ?? null, year:popRow?.date ?? '—' }
    };
  }catch(e){
    console.warn('World Bank fetch failed, using fallback', e);
    // Fallback (static)
    return {
      ok:false,
      gdp:{ value:29184890000000, year:'2024' },
      pop:{ value:340110988, year:'2024' }
    };
  }
}
