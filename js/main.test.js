/** @jest-environment jsdom */

import { jest } from '@jest/globals';
import { getWeatherByCity } from './weather.js';

global.fetch = jest.fn();

document.body.innerHTML = `
  <input id="cityInput" />
  <button id="searchBtn"></button>
  <p id="result"></p>
`;

beforeEach(() => {
  fetch.mockClear();
});

test('returns weather data for a valid city', async () => {
  fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { latitude: 48.8566, longitude: 2.3522, name: 'Paris', country: 'France' }
        ]
      })
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        current_weather: { temperature: 18, weathercode: 0 }
      })
    });

  const data = await getWeatherByCity('Paris');

  expect(data).toEqual({
    city: 'Paris, France',
    temperature: 18,
    description: 'Clear sky'
  });

  expect(fetch).toHaveBeenNthCalledWith(
    1,
    'https://geocoding-api.open-meteo.com/v1/search?name=Paris&count=1'
  );
  expect(fetch).toHaveBeenNthCalledWith(
    2,
    'https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current_weather=true'
  );
});

test('handles city names with accents and spaces', async () => {
  fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { latitude: -23.5505, longitude: -46.6333, name: 'São Paulo', country: 'Brazil' }
        ]
      })
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        current_weather: { temperature: 25, weathercode: 1 }
      })
    });

  const data = await getWeatherByCity('São Paulo');

  expect(data).toEqual({
    city: 'São Paulo, Brazil',
    temperature: 25,
    description: 'Mainly clear'
  });

  expect(fetch).toHaveBeenNthCalledWith(
    1,
    'https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o%20Paulo&count=1'
  );
  expect(fetch).toHaveBeenNthCalledWith(
    2,
    'https://api.open-meteo.com/v1/forecast?latitude=-23.5505&longitude=-46.6333&current_weather=true'
  );
});

test('returns an error when city name is empty', async () => {
  const data = await getWeatherByCity('   ');
  expect(data).toEqual({
    error: true,
    message: 'City name is required'
  });
});

test('returns an error when city is not found', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ results: [] })
  });

  const data = await getWeatherByCity('UnknownCity');
  expect(data).toEqual({
    error: true,
    message: 'City not found'
  });
});

test('returns an error when geocoding API fails', async () => {
  fetch.mockResolvedValueOnce({ ok: false });

  const data = await getWeatherByCity('Paris');
  expect(data).toEqual({
    error: true,
    message: 'Failed to fetch location data'
  });
});

test('returns an error when the input type is not a string', async () => {
  const data = await getWeatherByCity(1234);
  expect(data).toEqual({
    error: true,
    message: 'City name is required'
  });
});

test('returns an error when geocoding result lacks coordinates', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      results: [
        { name: 'Paris', country: 'France' }
      ]
    })
  });

  const data = await getWeatherByCity('Paris');
  expect(data).toEqual({
    error: true,
    message: 'Location coordinates not available'
  });
});

test('returns an error when weather data is incomplete', async () => {
  fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { latitude: 48.8566, longitude: 2.3522, name: 'Paris', country: 'France' }
        ]
      })
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        current_weather: { temperature: 20 }
      })
    });

  const data = await getWeatherByCity('Paris');
  expect(data).toEqual({
    error: true,
    message: 'Current weather data is incomplete'
  });
});

test('returns an error when weather API fails', async () => {
  fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { latitude: 48.8566, longitude: 2.3522, name: 'Paris', country: 'France' }
        ]
      })
    })
    .mockResolvedValueOnce({ ok: false });

  const data = await getWeatherByCity('Paris');
  expect(data).toEqual({
    error: true,
    message: 'Failed to fetch weather data'
  });
});

test('handles unknown weather code with default description', async () => {
  fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { latitude: 48.8566, longitude: 2.3522, name: 'Paris', country: 'France' }
        ]
      })
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        current_weather: { temperature: 10, weathercode: 999 }
      })
    });

  const data = await getWeatherByCity('Paris');
  expect(data.description).toBe('Unknown weather');
});
