/**
 * Weather API using Open-Meteo (https://open-meteo.com)
 * ✅ 100% FREE — No API key, No signup, No billing, No limits for non-commercial use.
 * Perfect for POC / demo purposes.
 */

/**
 * Get user's current position using the browser Geolocation API (free).
 */
function getUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000 }
    );
  });
}

/**
 * Reverse geocode coordinates to get city name using OpenStreetMap Nominatim (free, no key).
 */
async function getCityName(lat, lon) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000); // Fast 2s timeout
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`;
    const res = await fetch(url, {
      headers: { "User-Agent": "BataCopilot-POC/1.0" },
      signal: controller.signal
    });
    clearTimeout(id);
    if (!res.ok) return "your area";
    const data = await res.json();
    return data.address?.city || data.address?.town || data.address?.state_district || data.address?.state || "your area";
  } catch {
    return "your area";
  }
}

/**
 * Fetch current weather from Open-Meteo — completely free, no API key needed.
 */
async function fetchWeather(lat, lon) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000); // Fast 2s timeout
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&timezone=auto`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Map WMO weather codes to human-readable descriptions and main category.
 * Reference: https://open-meteo.com/en/docs
 */
function decodeWeatherCode(code) {
  const map = {
    0: { main: "Clear", description: "clear sky" },
    1: { main: "Clear", description: "mainly clear" },
    2: { main: "Clouds", description: "partly cloudy" },
    3: { main: "Clouds", description: "overcast" },
    45: { main: "Fog", description: "foggy" },
    48: { main: "Fog", description: "depositing rime fog" },
    51: { main: "Drizzle", description: "light drizzle" },
    53: { main: "Drizzle", description: "moderate drizzle" },
    55: { main: "Drizzle", description: "dense drizzle" },
    61: { main: "Rain", description: "slight rain" },
    63: { main: "Rain", description: "moderate rain" },
    65: { main: "Rain", description: "heavy rain" },
    66: { main: "Rain", description: "freezing rain" },
    67: { main: "Rain", description: "heavy freezing rain" },
    71: { main: "Snow", description: "slight snowfall" },
    73: { main: "Snow", description: "moderate snowfall" },
    75: { main: "Snow", description: "heavy snowfall" },
    80: { main: "Rain", description: "rain showers" },
    81: { main: "Rain", description: "moderate rain showers" },
    82: { main: "Rain", description: "violent rain showers" },
    85: { main: "Snow", description: "snow showers" },
    95: { main: "Thunderstorm", description: "thunderstorm" },
    96: { main: "Thunderstorm", description: "thunderstorm with hail" },
    99: { main: "Thunderstorm", description: "thunderstorm with heavy hail" },
  };
  return map[code] || { main: "Clear", description: "clear" };
}

/**
 * Returns a weather context object with city, temp, description, and a prompt-ready string.
 * Returns null if weather data cannot be fetched.
 */
export async function getWeatherContext() {
  const location = await getUserLocation();
  if (!location) return null;

  const [weather, city] = await Promise.all([
    fetchWeather(location.latitude, location.longitude),
    getCityName(location.latitude, location.longitude),
  ]);

  if (!weather?.current) return null;

  const temp = Math.round(weather.current.temperature_2m || 0);
  const weatherCode = weather.current.weather_code || 0;
  const { main, description } = decodeWeatherCode(weatherCode);

  // Map weather to footwear advice
  let advice = "";
  if (["Rain", "Drizzle", "Thunderstorm"].includes(main)) {
    advice = "It's rainy — recommend waterproof closed shoes, avoid open sandals and canvas shoes.";
  } else if (temp >= 35) {
    advice = "It's very hot — recommend breathable mesh shoes, sandals, floatz, and light footwear.";
  } else if (temp >= 28) {
    advice = "It's warm — recommend comfortable sneakers, sandals, or breathable casual shoes.";
  } else if (temp <= 15) {
    advice = "It's cold — recommend leather boots, closed formal shoes, or warm indoor slippers.";
  } else {
    advice = "Weather is pleasant — any footwear category works well.";
  }

  return {
    city,
    temp,
    description,
    main,
    promptText: `The customer is in ${city}. Current weather: ${temp}°C, ${description}. ${advice}`,
    displayText: `${city} • ${temp}°C`,
  };
}

/**
 * Get a weather emoji based on weather condition
 */
export function getWeatherEmoji(main) {
  const map = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "❄️",
    Fog: "🌫️",
  };
  return map[main] || "🌤️";
}
