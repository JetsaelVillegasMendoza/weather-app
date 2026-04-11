async function getWeatherByCity(city) {
  try {
    if (typeof city !== 'string' || city.trim() === "") {
      throw new Error("City name is required");
    }

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) {
      throw new Error("Failed to fetch location data");
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found");
    }

    const { latitude, longitude, name, country } = geoData.results[0];
    if (latitude == null || longitude == null) {
      throw new Error("Location coordinates not available");
    }

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const weatherData = await weatherResponse.json();

    if (!weatherData.current_weather) {
      throw new Error("Current weather data is not available");
    }

    const { temperature, weathercode } = weatherData.current_weather;
    if (typeof temperature !== 'number' || weathercode == null) {
      throw new Error("Current weather data is incomplete");
    }

    return {
      city: `${name}, ${country}`,
      temperature,
      description: getWeatherDescription(weathercode)
    };
  } catch (error) {
    return {
      error: true,
      message: error.message || "Something went wrong"
    };
  }
}

function getWeatherDescription(code) {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    95: "Thunderstorm"
  };

  return weatherCodes[code] || "Unknown weather";
}

if (typeof window !== 'undefined' && window) {
  window.getWeatherByCity = getWeatherByCity;
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = { getWeatherByCity };
}
