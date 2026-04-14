import { getWeatherByCity } from './weather.js';
import { isNonEmptyString } from './utils.js';
import { renderWeather, showLoading, showMessage } from './ui.js';

/**
 * @typedef {import('./weather.js').WeatherResult} WeatherResult
 * @typedef {import('./weather.js').WeatherError} WeatherError
 * @typedef {{input: HTMLInputElement, button: HTMLButtonElement}} SearchControls
 */

/**
 * Enable or disable the main search controls while an API request is in progress.
 *
 * @param {boolean} enabled - Whether the controls should be enabled.
 * @param {SearchControls} controls - The input and button controls.
 * @returns {void}
 *
 * @example
 * setControlsEnabled(false, { input: cityInput, button: searchBtn });
 */
function setControlsEnabled(enabled, controls) {
  controls.input.disabled = !enabled;
  controls.button.disabled = !enabled;
}

/**
 * Attach DOM event listeners once the page has loaded.
 *
 * Binds the search button and Enter key to the weather lookup flow,
 * and logs an error if the required DOM elements are not available.
 *
 * @returns {void}
 *
 * @example
 * document.addEventListener('DOMContentLoaded', bindEvents);
 */
function bindEvents() {
  const input = document.getElementById('cityInput');
  const button = document.getElementById('searchBtn');
  const result = document.getElementById('result');

  if (!input || !button || !result) {
    console.error('Missing required DOM elements for weather app.');
    return;
  }

  const controls = { input, button };

  /**
   * Handle search requests from the user and update the UI with weather results.
   *
   * Validates the input city name, shows a loading state, and renders either
   * weather information or an error message.
   *
   * @returns {Promise<void>} Resolves after rendering weather or showing an error.
   *
   * @example
   * await handleSearch();
   */
  const handleSearch = async () => {
    const city = input.value.trim();

    if (!isNonEmptyString(city)) {
      showMessage(result, 'Please enter a city name.', true);
      return;
    }

    showLoading(result);
    setControlsEnabled(false, controls);

    try {
      const data = await getWeatherByCity(city);

      if (data.error) {
        showMessage(result, data.message, true);
        return;
      }

      renderWeather(result, data);
    } catch (error) {
      showMessage(result, 'An unexpected error occurred.', true);
      console.error(error);
    } finally {
      setControlsEnabled(true, controls);
    }
  };

  button.addEventListener('click', handleSearch);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  });
}

document.addEventListener('DOMContentLoaded', bindEvents);
