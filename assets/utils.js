export function getStates(){
  const raw = localStorage.getItem('states');
  try{
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  }catch{
    return [];
  }
}

export function setStates(arr){
  localStorage.setItem('states', JSON.stringify(arr||[]));
  window.dispatchEvent(new CustomEvent('states:updated'));
}

export function formatNumber(n){
  if(n==null || isNaN(n)) return '0';
  return Number(n).toLocaleString('en-US');
}

export function formatMoney(n){
  const v = Number(n||0);
  if(v>=1_000_000_000_000) return (v/1_000_000_000_000).toFixed(1)+'T';
  if(v>=1_000_000_000)     return (v/1_000_000_000).toFixed(1)+'B';
  if(v>=1_000_000)         return (v/1_000_000).toFixed(1)+'M';
  return v.toLocaleString('en-US');
}
