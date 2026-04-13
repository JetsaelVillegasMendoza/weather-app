(function () {
  function showLoading(container) {
    container.textContent = 'Loading...';
    container.classList.remove('error');
  }

  function showMessage(container, message, isError = false) {
    container.textContent = message;
    container.classList.toggle('error', isError);
  }

  function renderWeather(container, data) {
    container.textContent = `Temperature in ${data.city}: ${data.temperature}°C - ${data.description}`;
    container.classList.remove('error');
  }

  window.ui = {
    renderWeather,
    showLoading,
    showMessage
  };
})();
