/* assets/charts.js */
import Model from "./model.js";

const fmtShort = (n)=> new Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:1}).format(n||0);

export function renderCharts() {
  donutTopPopulation();
  barTopGDP();
  lineTopArea();
}

function donutTopPopulation(){
  const data = Model.topBy("population",6);
  new Chart(document.getElementById("popDonut"),{
    type:"doughnut",
    data:{
      labels:data.map(d=>d.name),
      datasets:[{ data:data.map(d=>d.population) }]
    },
    options:{ plugins:{legend:{position:"bottom"}}, cutout:"55%" }
  });
}

function barTopGDP(){
  const data = Model.topBy("gdp",8).reverse();
  new Chart(document.getElementById("gdpBar"),{
    type:"bar",
    data:{
      labels:data.map(d=>d.name),
      datasets:[{ label:"GDP", data:data.map(d=>d.gdp)}]
    },
    options:{
      indexAxis:"y",
      plugins:{legend:{display:false}, tooltip:{callbacks:{label:(ctx)=>"$"+fmtShort(ctx.raw)}}},
      scales:{ x:{ ticks:{ callback:(v)=>"$"+fmtShort(v) } } }
    }
  });
}

function lineTopArea(){
  const data = Model.topBy("area",10);
  new Chart(document.getElementById("areaLine"),{
    type:"line",
    data:{
      labels:data.map(d=>d.name),
      datasets:[{ label:"Land Area (km²)", data:data.map(d=>d.area), tension:.3 }]
    },
    options:{
      plugins:{legend:{position:"bottom"}},
      scales:{ y:{ ticks:{ callback:(v)=>fmtShort(v) } } }
    }
  });
}
