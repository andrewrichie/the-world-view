import './style.css';

// Theme toggle (only on homepage)
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
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  } else {
    setTheme('light');
  }
}

// Only add listener if button exists
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = html.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
  });
}

// ==================== COUNTRIES LOGIC ====================

let allCountries = [];
const grid = document.getElementById('countries-grid');

const searchInput = document.getElementById('search-input');
const regionFilter = document.getElementById('region-filter');

async function fetchCountries() {
  if (!grid) return; // Safety: only run on homepage

  grid.innerHTML = '<p class="text-center text-lg col-span-full">Loading countries...</p>';

  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,population,region,flags,borders');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const countries = await response.json();

    countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

    allCountries = countries;
    renderCountries(allCountries);

  } catch (error) {
    console.error('Fetch error:', error);
    if (grid) {
      grid.innerHTML = `
        <p class="text-center text-lg text-red-500 col-span-full">
          Error loading countries: ${error.message}
        </p>
      `;
    }
  }
}

function renderCountries(countriesToShow) {
  if (!grid || countriesToShow.length === 0) {
    if (grid) {
      grid.innerHTML = '<p class="text-center text-lg col-span-full text-gray-600 dark:text-gray-400">No countries found</p>';
    }
    return;
  }

  grid.innerHTML = '';

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

    card.addEventListener('click', () => {
      const encodedName = encodeURIComponent(country.name.common);
      window.location.href = `country-detail.html?name=${encodedName}`;
    });

    grid.appendChild(card);
  });
}

// Search & Region filters
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    let filtered = allCountries;

    const selectedRegion = regionFilter?.value || '';
    if (selectedRegion) filtered = filtered.filter(c => c.region === selectedRegion);
    if (query) filtered = filtered.filter(c => c.name.common.toLowerCase().includes(query));

    renderCountries(filtered);
  });
}

if (regionFilter) {
  regionFilter.addEventListener('change', (e) => {
    const selectedRegion = e.target.value;
    let filtered = allCountries;

    if (selectedRegion) filtered = filtered.filter(c => c.region === selectedRegion);

    const currentQuery = searchInput?.value.toLowerCase().trim() || '';
    if (currentQuery) filtered = filtered.filter(c => c.name.common.toLowerCase().includes(currentQuery));

    renderCountries(filtered);
  });
}

// ===== DETAIL PAGE ======

const backButton = document.getElementById('back-button');
if (backButton) {
  backButton.addEventListener('click', () => {
    window.history.back();
  });
}

async function renderCountryDetail() {
  const detailContainer = document.getElementById('detail-container');
  if (!detailContainer) return;

  const params = new URLSearchParams(window.location.search);
  const encodedName = params.get('name');
  if (!encodedName) {
    detailContainer.innerHTML = '<p class="text-center text-red-500">No country specified</p>';
    return;
  }

  const countryName = decodeURIComponent(encodedName);

  detailContainer.innerHTML = '<p class="text-center text-lg">Loading details...</p>';

    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${encodedName}?fullText=true`);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const country = data[0];

    // Border countries
    let borderCountries = [];
    if (country.borders?.length > 0) {
      try {
        const borderResp = await fetch(`https://restcountries.com/v3.1/alpha?codes=${country.borders.join(',')}&fields=name`);
        if (borderResp.ok) {
          const borderData = await borderResp.json();
          borderCountries = borderData.map(c => c.name.common);
        }
      } catch (e) {
        console.warn('Borders failed:', e);
      }
    }

    
    detailContainer.innerHTML = `
      <div class="lg:col-span-1">
        <img src="${country.flags.svg}" alt="${countryName} flag" class="w-full rounded-lg shadow-lg">
      </div>
      <div class="lg:col-span-1 flex flex-col justify-center">
        <h1 class="text-3xl font-bold mb-8 text-black dark:text-white">${countryName}</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-gray-700 dark:text-gray-300">
          <div>
            <p class="text-sm"><span class="font-semibold">Native Name:</span> ${Object.values(country.name.nativeName || {})[0]?.common || 'N/A'}</p>
            <p class="text-sm"><span class="font-semibold">Population:</span> ${country.population.toLocaleString()}</p>
            <p class="text-sm"><span class="font-semibold">Region:</span> ${country.region}</p>
            <p class="text-sm"><span class="font-semibold">Sub Region:</span> ${country.subregion || 'N/A'}</p>
            <p class="text-sm"><span class="font-semibold">Capital:</span> ${country.capital?.[0] || 'N/A'}</p>
          </div>
          <div>
            <p class="text-sm"><span class="font-semibold">Top Level Domain:</span> ${country.tld?.[0] || 'N/A'}</p>
            <p class="text-sm"><span class="font-semibold">Currencies:</span> ${Object.values(country.currencies || {}).map(c => c.name).join(', ') || 'N/A'}</p>
            <p class="text-sm"><span class="font-semibold">Languages:</span> ${Object.values(country.languages || {}).join(', ') || 'N/A'}</p>
          </div>
        </div>

        ${borderCountries.length > 0 ? `
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-semibold text-black dark:text-white">Border Countries:</span>
            ${borderCountries.map(border => `
              <button class="px-4 py-2 rounded shadow-md bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow text-black dark:text-white"
                      onclick="window.location.href='country-detail.html?name=${encodeURIComponent(border)}'">
                ${border}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

  } catch (error) {
    console.error('Detail error:', error);
    detailContainer.innerHTML = `<p class="text-center text-red-500">Error: ${error.message}</p>`;
  }
}

// Run correct function based on page
if (document.getElementById('countries-grid')) {
  document.addEventListener('DOMContentLoaded', fetchCountries);
} else if (document.getElementById('detail-container')) {
  document.addEventListener('DOMContentLoaded', renderCountryDetail);
}