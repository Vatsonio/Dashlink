"use client";

import { Cloud, Droplets, Wind } from "lucide-react";
import { useEffect, useState } from "react";

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  city: string;
}

interface Props {
  apiKey: string;
  city: string;
  units: string;
  showCity?: boolean;
}

export function WeatherWidget({ apiKey, city, units, showCity = true }: Props) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (!apiKey || !city) return;
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${units}&appid=${apiKey}`
        );
        if (!res.ok) return;
        const data = await res.json();
        setWeather({
          temp: Math.round(data.main.temp),
          description: data.weather[0]?.description ?? "",
          icon: data.weather[0]?.icon ?? "01d",
          city: data.name,
        });
      } catch { /* */ }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000); // 10 min
    return () => clearInterval(interval);
  }, [apiKey, city, units]);

  if (!weather) return null;

  const unitSymbol = units === "imperial" ? "°F" : "°C";

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-muted">
      <img
        src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
        alt={weather.description}
        className="h-6 w-6"
      />
      <span className="font-medium text-sm">
        {weather.temp}{unitSymbol}
      </span>
      {showCity && (
        <span className="hidden sm:inline text-muted capitalize">
          {weather.city}
        </span>
      )}
    </div>
  );
}
