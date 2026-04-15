import { fetchJson } from './api.js';
import { isNonEmptyString } from './utils.js';

/**
 * @typedef {{temperature:number,weathercode:number}} WeatherData
 * @typedef {{city:string,temperature:number,description:string}} WeatherResult
 * @typedef {{error:boolean,message:string}} WeatherError
 * @typedef {{latitude:number,longitude:number,name:string,country?:string}} Location
 * @typedef {{getItem:(key:string)=>string|null,setItem:(key:string,value:string)=>void,removeItem:(key:string)=>void}} CacheStorage
 * @typedef {{timestamp:number,data:WeatherData}} CacheEntry
 */

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
 * @example
 * formatCityName('Tokyo'); // 'Tokyo'
 */
function formatCityName(name, country) {
  return country ? `${name}, ${country}` : name;
}

/**
 * Retrieve geographic coordinates for a city name using the geocoding API.
 *
 * @param {string} city - The city name to search for.
 * @returns {Promise<Location>} The location data.
 * @throws {Error} When the city cannot be found, coordinates are unavailable, or the request fails.
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
 * Cache duration in milliseconds for weather responses.
 * Cached data older than this value is discarded.
 * @type {number}
 */
const CACHE_DURATION_MS = 60 * 60 * 1000;
const inMemoryCache = {};

/**
 * Create a storage adapter for weather cache.
 *
 * Uses browser localStorage when available and writable to cache recent
 * weather responses on the client side. Cached entries are keyed by the
 * searched city's coordinates and expire after one hour.
 *
 * If persistent storage is unavailable, the app falls back to an in-memory
 * cache for the current session only.
 *
 * @returns {CacheStorage} A storage adapter for caching weather JSON.
 */
function getCacheStorage() {
  if (typeof window !== 'undefined' && window?.localStorage) {
    try {
      const testKey = '__weather_cache_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch (error) {
      // Fall back to memory cache when localStorage is unavailable.
    }
  }

  return {
    getItem(key) {
      return inMemoryCache[key] ?? null;
    },
    setItem(key, value) {
      inMemoryCache[key] = value;
    },
    removeItem(key) {
      delete inMemoryCache[key];
    }
  };
}

const cacheStorage = getCacheStorage();

/**
 * Build a stable cache key for a geographic coordinate pair.
 *
 * @param {number} latitude - The latitude coordinate.
 * @param {number} longitude - The longitude coordinate.
 * @returns {string} A cache key for the coordinate pair.
 */
function getWeatherCacheKey(latitude, longitude) {
  return `weather-cache:${latitude.toFixed(4)}:${longitude.toFixed(4)}`;
}

/**
 * Read cached weather data from storage if it is still valid.
 *
 * @param {string} key - The cache key.
 * @returns {WeatherData|null} The cached weather data or null.
 */
function readCachedWeather(key) {
  try {
    const cachedValue = cacheStorage.getItem(key);
    if (!cachedValue) {
      return null;
    }

    const cacheEntry = JSON.parse(cachedValue);
    if (
      !cacheEntry ||
      typeof cacheEntry.timestamp !== 'number' ||
      cacheEntry.data == null
    ) {
      cacheStorage.removeItem(key);
      return null;
    }

    if (Date.now() - cacheEntry.timestamp > CACHE_DURATION_MS) {
      cacheStorage.removeItem(key);
      return null;
    }

    return cacheEntry.data;
  } catch (error) {
    return null;
  }
}

/**
 * Persist weather data in cache storage with a timestamp.
 *
 * Data is stored only in the user's browser and is used to reduce repeated
 * API requests for the same searched location during the cache window.
 *
 * @param {string} key - The cache key.
 * @param {WeatherData} data - The weather data to cache.
 * @returns {void}
 */
function writeCachedWeather(key, data) {
  try {
    const cacheEntry = JSON.stringify({
      timestamp: Date.now(),
      data
    });
    cacheStorage.setItem(key, cacheEntry);
  } catch (error) {
    // Ignore cache write errors to keep app flow resilient.
  }
}

/**
 * Fetch current weather data for a geographic location.
 *
 * @param {number} latitude - The latitude coordinate.
 * @param {number} longitude - The longitude coordinate.
 * @returns {Promise<WeatherData>} The current weather values.
 * @throws {Error} When weather data is missing, incomplete, or the request fails.
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
 * Fetch current weather data from cache when valid, otherwise request it from the API.
 *
 * @param {number} latitude - The latitude coordinate.
 * @param {number} longitude - The longitude coordinate.
 * @returns {Promise<WeatherData>} The current weather values.
 */
async function fetchCurrentWeatherWithCache(latitude, longitude) {
  const cacheKey = getWeatherCacheKey(latitude, longitude);
  const cachedWeather = readCachedWeather(cacheKey);

  if (cachedWeather) {
    return cachedWeather;
  }

  const weather = await fetchCurrentWeather(latitude, longitude);
  writeCachedWeather(cacheKey, weather);

  return weather;
}

/**
 * Get weather details from an entered city name.
 *
 * Validates the city input, performs location lookup, fetches current weather,
 * uses cached weather data when valid, and returns either a success result or an error object.
 *
 * @param {string} city - The name of the city to query.
 * @returns {Promise<WeatherResult|WeatherError>} The weather result object or an error object.
 *
 * @example
 * const result = await getWeatherByCity('Tokyo');
 * if (!result.error) {
 *   console.log(result.city, result.temperature, result.description);
 * } else {
 *   console.error(result.message);
 * }
 *
 * @example
 * const invalid = await getWeatherByCity('   ');
 * console.log(invalid.error, invalid.message); // true, 'City name is required'
 */
export async function getWeatherByCity(city) {
  try {
    if (!isNonEmptyString(city)) {
      throw new Error('City name is required');
    }

    const location = await fetchLocation(city);
    const weather = await fetchCurrentWeatherWithCache(location.latitude, location.longitude);

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
 * @example
 * getWeatherDescription(999); // 'Unknown weather'
 */
export function getWeatherDescription(code) {
  return WEATHER_CODES[code] || 'Unknown weather';
}
