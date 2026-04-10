// Get elements from HTML
const input = document.getElementById('cityInput');
const button = document.getElementById('searchBtn');
const result = document.getElementById('result');

// Main function: get weather by city
async function getWeatherByCity(city) {
  try {
    // Validate input
    if (!city || city.trim() === "") {
      throw new Error("City name is required");
    }

    // 1. Get coordinates
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

    // 2. Get weather
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const weatherData = await weatherResponse.json();

    const { temperature, weathercode } = weatherData.current_weather;

    // 3. Weather code → description
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

    // 4. Return JSON
    return {
      city: `${name}, ${country}`,
      temperature: temperature,
      description: getWeatherDescription(weathercode)
    };

  } catch (error) {
    return {
      error: true,
      message: error.message || "Something went wrong"
    };
  }
}

// Handle button click
button.addEventListener('click', async () => {
  const city = input.value.trim();

  if (!city) {
    result.textContent = 'Please enter a city name.';
    return;
  }

  result.textContent = 'Loading...';

  const data = await getWeatherByCity(city);

  if (data.error) {
    result.textContent = data.message;
  } else {
    result.textContent = `Temperature in ${data.city}: ${data.temperature}°C - ${data.description}`;
  }
});