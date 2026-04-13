import { fetchJson } from './api.js';
import { isNonEmptyString } from './utils.js';

const WEATHER_CODES = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Light rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  95: 'Thunderstorm'
};

/**
 * Format a city label by combining name and country if available.
 *
 * @param {string} name - The city name returned by the geocoding API.
 * @param {string} [country] - The country code or name.
 * @returns {string} A formatted city label for display.
 *
 * @example
 * formatCityName('Berlin', 'Germany'); // 'Berlin, Germany'
 */
function formatCityName(name, country) {
  return country ? `${name}, ${country}` : name;
}

/**
 * Retrieve geographic coordinates for a city name using the geocoding API.
 *
 * @param {string} city - The city name to search for.
 * @returns {Promise<{latitude:number,longitude:number,name:string,country?:string}>} The location data.
 * @throws {Error} When the city cannot be found or coordinates are unavailable.
 *
 * @example
 * const location = await fetchLocation('Madrid');
 */
async function fetchLocation(city) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const geoData = await fetchJson(geoUrl, 'Failed to fetch location data');

  if (!geoData?.results?.length) {
    throw new Error('City not found');
  }

  const { latitude, longitude, name, country } = geoData.results[0];

  if (latitude == null || longitude == null) {
    throw new Error('Location coordinates not available');
  }

  return { latitude, longitude, name, country };
}

/**
 * Fetch current weather data for a geographic location.
 *
 * @param {number} latitude - The latitude coordinate.
 * @param {number} longitude - The longitude coordinate.
 * @returns {Promise<{temperature:number,weathercode:number}>} The current weather values.
 * @throws {Error} When weather data is missing or incomplete.
 *
 * @example
 * const weather = await fetchCurrentWeather(52.52, 13.41);
 */
async function fetchCurrentWeather(latitude, longitude) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
  const weatherData = await fetchJson(weatherUrl, 'Failed to fetch weather data');

  if (!weatherData?.current_weather) {
    throw new Error('Current weather data is not available');
  }

  const { temperature, weathercode } = weatherData.current_weather;

  if (typeof temperature !== 'number' || weathercode == null) {
    throw new Error('Current weather data is incomplete');
  }

  return { temperature, weathercode };
}

/**
 * Get weather details from an entered city name.
 *
 * @param {string} city - The name of the city to query.
 * @returns {Promise<{city:string,temperature:number,description:string}|{error:boolean,message:string}>} The weather result object or an error object.
 *
 * @example
 * const result = await getWeatherByCity('Tokyo');
 * if (!result.error) {
 *   console.log(result.city, result.temperature, result.description);
 * }
 */
export async function getWeatherByCity(city) {
  try {
    if (!isNonEmptyString(city)) {
      throw new Error('City name is required');
    }

    const location = await fetchLocation(city);
    const weather = await fetchCurrentWeather(location.latitude, location.longitude);

    return {
      city: formatCityName(location.name, location.country),
      temperature: weather.temperature,
      description: getWeatherDescription(weather.weathercode)
    };
  } catch (error) {
    return {
      error: true,
      message: error?.message || 'Something went wrong'
    };
  }
}

/**
 * Convert a numeric weather code into a human-readable description.
 *
 * @param {number} code - The weather condition code.
 * @returns {string} A friendly weather description.
 *
 * @example
 * getWeatherDescription(0); // 'Clear sky'
 */
export function getWeatherDescription(code) {
  return WEATHER_CODES[code] || 'Unknown weather';
}
