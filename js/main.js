window.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('cityInput');
  const button = document.getElementById('searchBtn');
  const result = document.getElementById('result');

  if (!input || !button || !result) {
    return;
  }

  button.addEventListener('click', async () => {
    const city = input.value.trim();

    if (!window.appUtils.isNonEmptyString(city)) {
      window.ui.showMessage(result, 'Please enter a city name.', true);
      return;
    }

    window.ui.showLoading(result);

    const data = await window.weather.getWeatherByCity(city);

    if (data.error) {
      window.ui.showMessage(result, data.message, true);
      return;
    }

    window.ui.renderWeather(result, data);
  });
});
