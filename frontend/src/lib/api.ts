const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export interface Service {
  id: string;
  name: string;
  url: string;
  icon: string;
  description: string;
  category: string;
  status: "online" | "offline" | "unknown";
  source: string;
  container_id: string | null;
  port: number | null;
  sort_order: number;
}

export interface AppConfig {
  title: string;
  subtitle: string;
  theme: string;
  layout_mode: string;
  pin_enabled: boolean;
  pin_code: string;
  columns: number;
  search_enabled: boolean;
  scan_interval: number;
  background_url: string;
  background_opacity: number;
  weather_api_key: string;
  weather_city: string;
  weather_units: string;
  weather_show_city: boolean;
  categories: { name: string; icon: string; sort_order: number }[];
  services: Service[];
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

export const api = {
  getServices: () => apiFetch<Service[]>("/api/services"),

  getConfig: () => apiFetch<AppConfig>("/api/config"),

  updateConfig: (config: AppConfig) =>
    apiFetch<AppConfig>("/api/config", { method: "PUT", body: JSON.stringify(config) }),

  getRawConfig: () => apiFetch<{ yaml: string }>("/api/config/raw"),

  updateRawConfig: (yaml: string) =>
    apiFetch<{ status: string }>("/api/config/raw", { method: "PUT", body: JSON.stringify({ yaml }) }),

  validateRawConfig: (yaml: string) =>
    apiFetch<{ valid: boolean; error: string; diff: Record<string, unknown> | null }>("/api/config/raw/validate", { method: "POST", body: JSON.stringify({ yaml }) }),

  restoreBackup: () =>
    apiFetch<AppConfig>("/api/config/backup/restore", { method: "POST" }),

  hasBackup: () =>
    apiFetch<{ exists: boolean }>("/api/config/backup/exists"),

  verifyPin: (pin: string) =>
    apiFetch<{ valid: boolean }>(`/api/config/verify-pin?pin=${pin}`, { method: "POST" }),

  addService: (service: Partial<Service>) =>
    apiFetch<Service>("/api/config/services", { method: "POST", body: JSON.stringify(service) }),

  updateService: (id: string, service: Partial<Service>) =>
    apiFetch<Service>(`/api/config/services/${id}`, { method: "PUT", body: JSON.stringify(service) }),

  deleteService: (id: string) =>
    apiFetch<{ deleted: string }>(`/api/config/services/${id}`, { method: "DELETE" }),

  discoverDocker: () => apiFetch<Service[]>("/api/discover/docker"),
  discoverNetwork: (targets?: string, ports?: string) => {
    const params = new URLSearchParams();
    if (targets) params.set("targets", targets);
    if (ports) params.set("ports", ports);
    return apiFetch<Service[]>(`/api/discover/network?${params}`);
  },
  discoverAll: () => apiFetch<Service[]>("/api/discover/all"),
};
