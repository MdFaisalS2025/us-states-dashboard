/* High-contrast defaults for Chart.js on dark theme */
if (window.Chart) {
  Chart.defaults.color = "#ECF2F8";                 // all text in charts
  Chart.defaults.font.family = 'Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial';
  Chart.defaults.plugins.legend.labels.color = "#ECF2F8";
  Chart.defaults.plugins.tooltip.titleColor = "#ECF2F8";
  Chart.defaults.plugins.tooltip.bodyColor = "#D7E2EB";
  Chart.defaults.plugins.tooltip.backgroundColor = "rgba(18,35,48,0.95)";
  Chart.defaults.scales.category.ticks.color = "#D7E2EB";
  Chart.defaults.scales.linear.ticks.color = "#D7E2EB";
  Chart.defaults.scales.category.grid.color = "rgba(159,179,200,.25)";
  Chart.defaults.scales.linear.grid.color   = "rgba(159,179,200,.25)";
}
