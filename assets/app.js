// assets/app.js
// Theme toggle + utility bootstrapping

(function(){
  const key = 'theme:dark';
  const btns = () => document.querySelectorAll('#toggleTheme');

  const apply = (on) => {
    document.documentElement.classList.toggle('dark', on);
    btns().forEach(b => b.textContent = on ? '☀️ Light' : '🌙 Dark');
    localStorage.setItem(key, on ? '1' : '0');
  };

  const saved = localStorage.getItem(key) === '1';
  apply(saved);

  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'toggleTheme') {
      apply(!document.documentElement.classList.contains('dark'));
    }
  });
})();
