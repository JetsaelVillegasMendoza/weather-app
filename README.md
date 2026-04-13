# Weather App

## Project Summary

Weather App is a lightweight client-side web application that displays current weather data for a city entered by the user. It uses Open-Meteo's geocoding and forecast APIs to resolve city coordinates and fetch current weather conditions without requiring an API key.

## Installation Instructions

1. Clone or download the repository.
2. Open a terminal in the project folder.
3. Install dependencies for tests:

   ```bash
   npm install
   ```

4. Open `index.html` in your browser, or serve the folder with a local static server if preferred.

> Note: The app uses ES modules (`type: module` in `package.json`), so the browser must support module scripts when opening `index.html`.

## User Guide

1. Open `index.html` in a browser.
2. Enter a city name in the input field.
3. Click the **Get Weather** button or press **Enter**.
4. The weather result appears below the input.

> Example: enter `Paris`, then click **Get Weather**.

## Sample Results

Successful result example:

```text
Paris, France
Temperature: 18°C
Conditions: Clear sky
```

Error examples:

```text
Please enter a city name.
```

```text
City not found
```

## Features

- Search weather by city name
- Supports Enter key submission and button click
- Uses Open-Meteo geocoding API to resolve city coordinates
- Uses Open-Meteo forecast API to get current weather
- Displays city label, temperature, and weather conditions
- Shows a loading state while fetching data
- Applies success and error styling for feedback
- Uses ES module imports across JavaScript files
- Includes Jest unit tests for weather fetching and error handling

## Error Handling

The application handles errors at several stages:

- Empty or invalid city input is rejected with a message.
- If the geocoding API does not find the city, the user sees `City not found`.
- If the API request fails or returns invalid data, the app shows an appropriate error.
- If location coordinates or current weather are missing, the app reports the issue.
- Unknown weather codes are shown as `Unknown weather`.

## API Information

The app uses the following Open-Meteo APIs:

- Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1`
- Forecast: `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true`

No API key is required for these endpoints.

## Running Tests

Run the unit tests with:

```bash
npm test
```

The suite uses Jest and runs with node experimental VM modules to support ES module imports.

## Future Improvements

- Add hourly and daily forecast display
- Improve UI design with weather icons and responsive layout
- Add search suggestions/autocomplete for city names
- Support browser geolocation and saved favorites
- Add better loading animations and retry support
- Expand test coverage with integration or end-to-end tests
