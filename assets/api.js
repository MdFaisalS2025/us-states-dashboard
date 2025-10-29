async function loadExternalInsight() {
  const box = document.getElementById('apiInsightBox');
  if (!box) return;
  box.innerHTML = `<div class="text-secondary small">Loading live data...</div>`;

  try {
    const res = await fetch('https://datausa.io/api/data?drilldowns=State&measures=Population&year=2023');
    const data = await res.json();

    const top5 = data.data.slice(0, 5);
    const list = top5.map(s => `<li>${s.State}: ${s.Population.toLocaleString()}</li>`).join('');

    box.innerHTML = `
      <div class="card rounded-4 shadow-sm">
        <div class="card-body">
          <h5 class="card-title">📡 Live API Data (DataUSA)</h5>
          <p class="small text-body-secondary">Top 5 States by Population (2023)</p>
          <ul class="small mb-0">${list}</ul>
          <div class="small text-muted mt-2">Source: <a href="https://datausa.io/" target="_blank">DataUSA API</a></div>
        </div>
      </div>
    `;
  } catch (err) {
    box.innerHTML = `<p class="text-danger small">Could not load API data.</p>`;
  }
}
loadExternalInsight();
