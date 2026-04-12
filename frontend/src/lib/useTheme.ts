"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_THEME, themes, type Theme } from "@/themes";

export function useTheme() {
  const [themeId, setThemeId] = useState(DEFAULT_THEME);
  const [isDark, setIsDark] = useState(false);

  const theme: Theme = themes[themeId] ?? themes[DEFAULT_THEME];

  const applyTheme = useCallback((t: Theme, dark: boolean) => {
    const root = document.documentElement;
    const colors = dark ? t.dark : t.light;

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    root.style.setProperty("--font-heading", t.fonts.heading);
    root.style.setProperty("--font-body", t.fonts.body);

    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Update Google Fonts link
    let link = document.getElementById("theme-fonts") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = "theme-fonts";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = t.fonts.import;
  }, []);

  useEffect(() => {
    applyTheme(theme, isDark);
  }, [theme, isDark, applyTheme]);

  const switchTheme = useCallback((id: string) => {
    if (themes[id]) {
      setThemeId(id);
      localStorage.setItem("dashlink-theme", id);
    }
  }, []);

  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("dashlink-dark", String(next));
      return next;
    });
  }, []);

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem("dashlink-theme");
    if (savedTheme && themes[savedTheme]) setThemeId(savedTheme);

    const savedDark = localStorage.getItem("dashlink-dark");
    if (savedDark === "true") {
      setIsDark(true);
    } else if (!savedDark && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDark(true);
    }
  }, []);

  return { theme, themeId, switchTheme, isDark, toggleDark, allThemes: themes };
}
