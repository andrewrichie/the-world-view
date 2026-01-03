import './style.css';

const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

function setTheme(theme) {
  if (theme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  setTheme(savedTheme);
} else {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  } else {
    setTheme('light');
  }
}

themeToggle.addEventListener('click', () => {
  const isDark = html.classList.contains('dark');
  setTheme(isDark ? 'light' : 'dark');
});





