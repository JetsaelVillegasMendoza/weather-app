const input = typeof document !== 'undefined' ? document.getElementById('cityInput') : null;
const button = typeof document !== 'undefined' ? document.getElementById('searchBtn') : null;
const result = typeof document !== 'undefined' ? document.getElementById('result') : null;

if (button && result && typeof window !== 'undefined' && typeof window.getWeatherByCity === 'function') {
  button.addEventListener('click', async () => {
    const city = input.value.trim();

    if (!city) {
      result.textContent = 'Please enter a city name.';
      return;
    }

    result.textContent = 'Loading...';

    const data = await window.getWeatherByCity(city);

    if (data.error) {
      result.textContent = data.message;
    } else {
      result.textContent = `Temperature in ${data.city}: ${data.temperature}°C - ${data.description}`;
    }
  });
}
