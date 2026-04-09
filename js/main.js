const input = document.getElementById('cityInput');
const button = document.getElementById('searchBtn');
const result = document.getElementById('result');

// Step 1: Get coordinates from city name
async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error('City not found');
  }

  const { latitude, longitude, name, country } = data.results[0];
  return { latitude, longitude, name, country };
}

// Step 2: Get weather data
async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

  const response = await fetch(url);
  const data = await response.json();

  return data.current_weather.temperature;
}

// Step 3: Handle user action
button.addEventListener('click', async () => {
  const city = input.value.trim();

  if (!city) {
    result.textContent = 'Please enter a city name.';
    return;
  }

  result.textContent = 'Loading...';

  try {
    const { latitude, longitude, name, country } = await getCoordinates(city);
    const temperature = await getWeather(latitude, longitude);

    result.textContent = `Temperature in ${name}, ${country}: ${temperature}°C`;
  } catch (error) {
    result.textContent = error.message;
  }
});