/**
 * Fetch JSON data from the provided URL and return the parsed object.
 *
 * @param {string} url - The endpoint to fetch.
 * @param {string} [errorMessage='Failed to fetch data'] - Custom error message used when the request fails.
 * @returns {Promise<any>} The parsed JSON response from the endpoint.
 * @throws {Error} When the network request fails, the response is not OK, or the response body cannot be parsed as JSON.
 *
 * @example
 * const data = await fetchJson('https://api.example.com/data');
 */
export async function fetchJson(url, errorMessage = 'Failed to fetch data') {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`${errorMessage} (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(errorMessage);
  }
}
