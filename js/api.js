(function () {
  async function fetchJson(url, errorMessage = 'Failed to fetch data') {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(errorMessage);
    }

    return response.json();
  }

  window.appApi = {
    fetchJson
  };
})();
