/**
 * Display a loading state inside the provided container.
 *
 * This clears previous content, removes any error styling, and sets
 * an accessible busy state while the app waits for the API response.
 *
 * @param {HTMLElement} container - The DOM element where the loading state is shown.
 * @returns {void}
 *
 * @example
 * showLoading(resultElement);
 */
export function showLoading(container) {
  container.textContent = 'Loading...';
  container.classList.remove('error', 'success');
  container.setAttribute('aria-busy', 'true');
}

/**
 * Display a feedback message in the provided container.
 *
 * The message is styled as an error or success and the busy state is removed.
 *
 * @param {HTMLElement} container - The DOM element where the message appears.
 * @param {string} message - The text to display.
 * @param {boolean} [isError=false] - Whether to style the message as an error.
 * @returns {void}
 *
 * @example
 * showMessage(resultElement, 'City not found', true);
 */
export function showMessage(container, message, isError = false) {
  container.textContent = message;
  container.classList.toggle('error', isError);
  container.classList.toggle('success', !isError);
  container.removeAttribute('aria-busy');
}

/**
 * Render weather data into the provided container.
 *
 * This clears any previous results and applies success styling.
 *
 * @param {HTMLElement} container - The element that will display the weather result.
 * @param {{city:string,temperature:number,description:string}} data - The weather data to render.
 * @returns {void}
 *
 * @example
 * renderWeather(resultElement, {
 *   city: 'Paris, France',
 *   temperature: 18,
 *   description: 'Clear sky'
 * });
 */
export function renderWeather(container, data) {
  container.innerHTML = '';
  container.classList.remove('error');
  container.classList.add('success');
  container.removeAttribute('aria-busy');

  const weatherTitle = document.createElement('strong');
  weatherTitle.className = 'weather-title';
  weatherTitle.textContent = data.city;

  const temperature = document.createElement('div');
  temperature.className = 'weather-temperature';
  temperature.textContent = `Temperature: ${data.temperature}°C`;

  const description = document.createElement('div');
  description.className = 'weather-description';
  description.textContent = `Conditions: ${data.description}`;

  container.append(weatherTitle, temperature, description);
}
