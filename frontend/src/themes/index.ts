export interface ThemeColors {
  "--color-primary": string;
  "--color-secondary": string;
  "--color-cta": string;
  "--color-background": string;
  "--color-surface": string;
  "--color-text": string;
  "--color-muted": string;
  [key: string]: string;
}

export interface Theme {
  id: string;
  name: string;
  fonts: { heading: string; body: string; import: string };
  light: ThemeColors;
  dark: ThemeColors;
  effects: string;
}

export const themes: Record<string, Theme> = {
  "modern-classic": {
    id: "modern-classic",
    name: "Modern Classic",
    fonts: {
      heading: "Inter",
      body: "Inter",
      import:
        "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
    },
    light: {
      "--color-primary": "#18181B",
      "--color-secondary": "#3F3F46",
      "--color-cta": "#2563EB",
      "--color-background": "#FFFFFF",
      "--color-surface": "#F4F4F5",
      "--color-text": "#09090B",
      "--color-muted": "#71717A",
    },
    dark: {
      "--color-primary": "#FAFAFA",
      "--color-secondary": "#A1A1AA",
      "--color-cta": "#3B82F6",
      "--color-background": "#09090B",
      "--color-surface": "#18181B",
      "--color-text": "#FAFAFA",
      "--color-muted": "#A1A1AA",
    },
    effects: "clean modern, background images, pinterest aesthetic",
  },
  "clean-flat": {
    id: "clean-flat",
    name: "Clean Flat",
    fonts: {
      heading: "Poppins",
      body: "Open Sans",
      import:
        "https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap",
    },
    light: {
      "--color-primary": "#1E40AF",
      "--color-secondary": "#3B82F6",
      "--color-cta": "#F97316",
      "--color-background": "#FFFFFF",
      "--color-surface": "#F8FAFC",
      "--color-text": "#0F172A",
      "--color-muted": "#64748B",
    },
    dark: {
      "--color-primary": "#60A5FA",
      "--color-secondary": "#3B82F6",
      "--color-cta": "#FB923C",
      "--color-background": "#0F172A",
      "--color-surface": "#1E293B",
      "--color-text": "#F1F5F9",
      "--color-muted": "#94A3B8",
    },
    effects: "flat, no shadows, border-2",
  },
  "geometric-modern": {
    id: "geometric-modern",
    name: "Geometric Modern",
    fonts: {
      heading: "Outfit",
      body: "Work Sans",
      import:
        "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Work+Sans:wght@300;400;500;600;700&display=swap",
    },
    light: {
      "--color-primary": "#000000",
      "--color-secondary": "#525252",
      "--color-cta": "#2563EB",
      "--color-background": "#FFFFFF",
      "--color-surface": "#F5F5F5",
      "--color-text": "#171717",
      "--color-muted": "#525252",
    },
    dark: {
      "--color-primary": "#FFFFFF",
      "--color-secondary": "#A3A3A3",
      "--color-cta": "#3B82F6",
      "--color-background": "#0A0A0A",
      "--color-surface": "#171717",
      "--color-text": "#FAFAFA",
      "--color-muted": "#A3A3A3",
    },
    effects: "swiss grid, high contrast",
  },
  "soft-warm": {
    id: "soft-warm",
    name: "Soft & Warm",
    fonts: {
      heading: "Plus Jakarta Sans",
      body: "Plus Jakarta Sans",
      import:
        "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap",
    },
    light: {
      "--color-primary": "#D97706",
      "--color-secondary": "#FBBF24",
      "--color-cta": "#059669",
      "--color-background": "#FFFBEB",
      "--color-surface": "#FFFFFF",
      "--color-text": "#1C1917",
      "--color-muted": "#57534E",
    },
    dark: {
      "--color-primary": "#FBBF24",
      "--color-secondary": "#F59E0B",
      "--color-cta": "#34D399",
      "--color-background": "#1C1917",
      "--color-surface": "#292524",
      "--color-text": "#FAFAF9",
      "--color-muted": "#A8A29E",
    },
    effects: "soft shadows, rounded-xl",
  },
  "violet-marketplace": {
    id: "violet-marketplace",
    name: "Violet Marketplace",
    fonts: {
      heading: "Outfit",
      body: "Work Sans",
      import:
        "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Work+Sans:wght@300;400;500;600;700&display=swap",
    },
    light: {
      "--color-primary": "#7C3AED",
      "--color-secondary": "#A78BFA",
      "--color-cta": "#22C55E",
      "--color-background": "#FAF5FF",
      "--color-surface": "#FFFFFF",
      "--color-text": "#4C1D95",
      "--color-muted": "#6B7280",
    },
    dark: {
      "--color-primary": "#A78BFA",
      "--color-secondary": "#7C3AED",
      "--color-cta": "#4ADE80",
      "--color-background": "#0C0A1D",
      "--color-surface": "#1A1533",
      "--color-text": "#EDE9FE",
      "--color-muted": "#9CA3AF",
    },
    effects: "rounded-2xl, gradient hero",
  },
};

export const DEFAULT_THEME = "violet-marketplace";
