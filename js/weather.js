(function () {
  function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  async function fetchJson(url, errorMessage = 'Failed to fetch data') {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async function getWeatherByCity(city) {
    try {
      const isCityValid = window.appUtils?.isNonEmptyString
        ? window.appUtils.isNonEmptyString(city)
        : isNonEmptyString(city);

      if (!isCityValid) {
        throw new Error('City name is required');
      }

      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
      const fetchJsonFn = window.appApi?.fetchJson || fetchJson;
      const geoData = await fetchJsonFn(geoUrl, 'Failed to fetch location data');

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found');
      }

      const { latitude, longitude, name, country } = geoData.results[0];
      if (latitude == null || longitude == null) {
        throw new Error('Location coordinates not available');
      }

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
      const weatherData = await fetchJsonFn(weatherUrl, 'Failed to fetch weather data');

      if (!weatherData.current_weather) {
        throw new Error('Current weather data is not available');
      }

      const { temperature, weathercode } = weatherData.current_weather;
      if (typeof temperature !== 'number' || weathercode == null) {
        throw new Error('Current weather data is incomplete');
      }

      return {
        city: `${name}, ${country}`,
        temperature,
        description: getWeatherDescription(weathercode)
      };
    } catch (error) {
      return {
        error: true,
        message: error.message || 'Something went wrong'
      };
    }
  }

  function getWeatherDescription(code) {
    const weatherCodes = {
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

    return weatherCodes[code] || 'Unknown weather';
  }

  window.weather = {
    getWeatherByCity
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { getWeatherByCity };
  }
})();
