/**
 * Get a simple icon that matches the weather description.
 *
 * @param {string} description
 * @returns {string}
 */
function getWeatherIcon(description) {
  const text = description.toLowerCase();

  if (text.includes('thunderstorm')) return '⛈️';
  if (text.includes('snow')) return '❄️';
  if (text.includes('rain') || text.includes('drizzle') || text.includes('showers')) return '🌧️';
  if (text.includes('fog')) return '🌫️';
  if (text.includes('cloud') || text.includes('overcast')) return '☁️';
  if (text.includes('clear')) return '☀️';

  return '🌤️';
}

/**
 * Display a loading state inside the provided container.
 *
 * @param {HTMLElement} container
 * @returns {void}
 */
export function showLoading(container) {
  container.innerHTML = `
    <div class="loading-state">
      <span class="spinner" aria-hidden="true"></span>
      <span>Loading weather data...</span>
    </div>
  `;

  container.classList.remove('error', 'success');
  container.setAttribute('aria-busy', 'true');
}

/**
 * Display a feedback message in the provided container.
 *
 * @param {HTMLElement} container
 * @param {string} message
 * @param {boolean} [isError=false]
 * @returns {void}
 */
export function showMessage(container, message, isError = false) {
  const icon = isError ? '⚠️' : 'ℹ️';

  container.innerHTML = `
    <div class="message-state">
      <span class="result-inline-icon" aria-hidden="true">${icon}</span>
      <span>${message}</span>
    </div>
  `;

  container.classList.toggle('error', isError);
  container.classList.toggle('success', !isError);
  container.removeAttribute('aria-busy');
}

/**
 * Render weather data into the provided container.
 *
 * @param {HTMLElement} container
 * @param {{city:string, temperature:number, description:string}} data
 * @returns {void}
 */
export function renderWeather(container, data) {
  const weatherIcon = getWeatherIcon(data.description);

  container.innerHTML = `
    <article class="result-card">
      <div class="result-top">
        <div class="weather-icon" aria-hidden="true">${weatherIcon}</div>

        <div>
          <h2 class="weather-title">${data.city}</h2>
          <p class="weather-meta">Current weather</p>
        </div>
      </div>

      <div class="weather-temperature">${data.temperature}°C</div>
      <div class="weather-description">Conditions: ${data.description}</div>
    </article>
  `;

  container.classList.remove('error');
  container.classList.add('success');
  container.removeAttribute('aria-busy');
}