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

// ==================== COUNTRIES LOGIC ====================

let allCountries = []; // Store full list for filtering

const grid = document.getElementById('countries-grid'); // Cache it once

async function fetchCountries() {
  grid.innerHTML = '<p class="text-center text-lg col-span-full">Loading countries...</p>';

  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,population,region,flags,borders');
    if (!response.ok) throw new Error('API error');

    const countries = await response.json();

    // Sort alphabetically
    countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

    // SAVE the full list and render
    allCountries = countries;
    renderCountries(allCountries);

  } catch (error) {
    console.error('Fetch error:', error);
    grid.innerHTML = `
      <p class="text-center text-lg text-red-500 col-span-full">
        Error loading countries: ${error.message}
      </p>
    `;
  }
}

function renderCountries(countriesToShow) {
  if (countriesToShow.length === 0) {
    grid.innerHTML = '<p class="text-center text-lg col-span-full text-gray-600 dark:text-gray-400">No countries found</p>';
    return;
  }

  grid.innerHTML = ''; // Clear grid

  countriesToShow.forEach(country => {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-lg shadow-gray-300 dark:shadow-gray-900/50 overflow-hidden hover:shadow-xl hover:shadow-gray-400 dark:hover:shadow-black/60 transition-shadow duration-300 cursor-pointer';

    card.innerHTML = `
      <img src="${country.flags.svg}" alt="${country.name.common} flag" class="w-full h-48 object-cover">
      <div class="p-6">
        <h2 class="text-xl font-bold mb-4 text-black dark:text-white">${country.name.common}</h2>
        <p class="text-sm text-gray-700 dark:text-gray-300"><span class="font-semibold">Population:</span> ${country.population.toLocaleString()}</p>
        <p class="text-sm text-gray-700 dark:text-gray-300"><span class="font-semibold">Region:</span> ${country.region}</p>
        <p class="text-sm text-gray-700 dark:text-gray-300"><span class="font-semibold">Capital:</span> ${country.capital?.[0] || 'N/A'}</p>
      </div>
    `;

    grid.appendChild(card);
  });
}

// Search functionality
const searchInput = document.getElementById('search-input');

if (searchInput) {  // Safety check in case element not found
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    const filtered = allCountries.filter(country =>
      country.name.common.toLowerCase().includes(query)
    );

    renderCountries(filtered);
  });
}

// Load countries when page is ready
document.addEventListener('DOMContentLoaded', fetchCountries);