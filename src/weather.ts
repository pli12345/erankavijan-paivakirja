export type Weather = {
  temperature: number;
  windSpeed: number;
  code: number;
};

const WMO: Record<number, string> = {
  0: 'Selkeää',
  1: 'Enimmäkseen selkeää',
  2: 'Puolipilvistä',
  3: 'Pilvistä',
  45: 'Sumua',
  48: 'Huurresumua',
  51: 'Tihkusadetta',
  53: 'Tihkusadetta',
  55: 'Voimakasta tihkua',
  61: 'Heikkoa vesisadetta',
  63: 'Vesisadetta',
  65: 'Voimakasta vesisadetta',
  71: 'Heikkoa lumisadetta',
  73: 'Lumisadetta',
  75: 'Voimakasta lumisadetta',
  77: 'Lumijyväsiä',
  80: 'Sadekuuroja',
  81: 'Sadekuuroja',
  82: 'Voimakkaita sadekuuroja',
  85: 'Lumikuuroja',
  86: 'Voimakkaita lumikuuroja',
  95: 'Ukkosta',
  96: 'Ukkosta ja rakeita',
  99: 'Voimakasta ukkosta',
};

export function weatherDescription(code: number | null): string {
  if (code === null) return 'Ei säätietoa';
  return WMO[code] ?? 'Tuntematon sää';
}

export function weatherIcon(code: number | null): string {
  if (code === null) return '❓';
  if (code === 0 || code === 1) return '☀️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 71 && code <= 77) return '🌨️';
  if (code === 85 || code === 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌧️';
}

export async function fetchWeather(lat: number, lon: number): Promise<Weather | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const c = json.current;
    if (!c) return null;
    return {
      temperature: c.temperature_2m,
      windSpeed: c.wind_speed_10m,
      code: c.weather_code,
    };
  } catch {
    return null;
  }
}
