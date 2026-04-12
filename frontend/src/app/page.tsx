"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Settings, RefreshCw, Pencil, Sun, Moon, Cloud, Lock } from "lucide-react";
import { api, type AppConfig, type Service } from "@/lib/api";
import { useTheme } from "@/lib/useTheme";
import { ServiceCard } from "@/components/ServiceCard";
import { SearchBar } from "@/components/SearchBar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { AddServiceModal } from "@/components/AddServiceModal";
import { ConfigPanel } from "@/components/ConfigPanel";
import { EditMode } from "@/components/EditMode";
import { WeatherWidget } from "@/components/WeatherWidget";

// Theme-specific page layouts (no grid-cols - handled via inline style)
const pageStyles: Record<string, {
  wrapper: string;
  header: string;
  title: string;
  subtitle: string;
  navBtn: string;
  gridGap: string;
  sectionTitle: string;
  emptyIcon: string;
}> = {
  "modern-classic": {
    wrapper: "mx-auto min-h-screen max-w-6xl px-3 sm:px-6 py-4 sm:py-8",
    header: "relative z-20 mb-8 flex items-center justify-between",
    title: "font-heading text-3xl font-extrabold tracking-tight",
    subtitle: "mt-1 font-body text-sm text-muted font-light",
    navBtn: "rounded-full p-2.5 text-muted hover:bg-primary/10 hover:text-primary transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    gridGap: "gap-4",
    sectionTitle: "mb-4 font-heading text-xs font-semibold uppercase tracking-widest text-muted",
    emptyIcon: "rounded-2xl bg-primary/5 p-8",
  },
  "clean-flat": {
    wrapper: "mx-auto min-h-screen max-w-5xl px-3 sm:px-4 py-3 sm:py-4",
    header: "relative z-20 mb-6 flex items-center justify-between border-b-2 border-primary pb-4",
    title: "font-heading text-2xl font-bold uppercase tracking-wide",
    subtitle: "mt-0.5 font-body text-xs text-muted uppercase tracking-widest",
    navBtn: "rounded-none p-2 text-muted hover:bg-primary hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    gridGap: "gap-3",
    sectionTitle: "mb-2 font-heading text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 px-3 py-2",
    emptyIcon: "rounded-none bg-primary/10 p-6",
  },
  "geometric-modern": {
    wrapper: "mx-auto min-h-screen max-w-7xl px-3 sm:px-8 py-4 sm:py-10",
    header: "relative z-20 mb-12 flex items-center justify-between",
    title: "font-heading text-4xl font-black tracking-tighter",
    subtitle: "mt-1 font-body text-sm text-muted font-light",
    navBtn: "rounded-none border border-transparent p-2 text-muted hover:border-black hover:text-black transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black",
    gridGap: "gap-4",
    sectionTitle: "mb-6 font-heading text-lg font-black uppercase tracking-tight border-l-4 border-black pl-3",
    emptyIcon: "bg-black text-white p-6",
  },
  "soft-warm": {
    wrapper: "mx-auto min-h-screen max-w-6xl px-3 sm:px-6 py-4 sm:py-8",
    header: "relative z-20 mb-10 flex items-center justify-between bg-surface rounded-3xl p-6 shadow-[0_2px_20px_-5px_rgba(217,119,6,0.1)]",
    title: "font-heading text-2xl font-bold",
    subtitle: "mt-1 font-body text-sm text-muted",
    navBtn: "rounded-full p-2.5 text-muted hover:bg-amber-100 hover:text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    gridGap: "gap-5",
    sectionTitle: "mb-4 font-heading text-sm font-semibold text-primary flex items-center gap-2 before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-primary",
    emptyIcon: "rounded-full bg-amber-100 p-8",
  },
  "violet-marketplace": {
    wrapper: "mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8",
    header: "relative z-20 mb-8 flex items-center justify-between",
    title: "font-heading text-2xl font-bold sm:text-3xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent",
    subtitle: "mt-1 font-body text-sm text-muted",
    navBtn: "rounded-lg p-2 text-muted hover:bg-violet-100 hover:text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    gridGap: "gap-4",
    sectionTitle: "mb-3 font-heading text-sm font-semibold uppercase tracking-wider text-muted",
    emptyIcon: "rounded-full bg-gradient-to-br from-violet-100 to-purple-100 p-6",
  },
};

const defaultPageStyle = pageStyles["violet-marketplace"];

export default function Dashboard() {
  const { themeId, switchTheme, isDark, toggleDark } = useTheme();
  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [pinLocked, setPinLocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const ps = pageStyles[themeId] ?? defaultPageStyle;
  const cols = config?.columns ?? 4;
  const layoutMode = config?.layout_mode ?? "grid";

  // Responsive grid via inline style
  const gridStyle = useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: layoutMode === "list" ? "1fr" : `repeat(${cols}, minmax(0, 1fr))`,
    }),
    [cols, layoutMode]
  );

  // For mobile: 1 col, sm: 2 cols (grid mode) or always 1 (list mode), lg: user choice
  const gridClassName = layoutMode === "list"
    ? `${ps.gridGap}`
    : `${ps.gridGap} [grid-template-columns:1fr] sm:[grid-template-columns:repeat(2,minmax(0,1fr))]`;

  const fetchData = useCallback(async () => {
    try {
      const [svcData, cfgData] = await Promise.all([
        api.getServices(),
        api.getConfig(),
      ]);
      setServices(svcData);
      setConfig(cfgData);
    } catch {
      // API not available
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // PIN lock on first load only
  const [pinChecked, setPinChecked] = useState(false);
  useEffect(() => {
    if (!pinChecked && config) {
      setPinChecked(true);
      if (config.pin_enabled && config.pin_code) {
        setPinLocked(true);
      }
    }
  }, [config, pinChecked]);

  useEffect(() => {
    const interval = setInterval(fetchData, (config?.scan_interval ?? 30) * 1000);
    return () => clearInterval(interval);
  }, [config?.scan_interval, fetchData]);

  const filtered = services.filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Service[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  const handleAddService = async (svc: {
    id: string; name: string; url: string; icon: string; description: string; category: string;
  }) => {
    try {
      // Auto-add category to config if it doesn't exist
      if (config && !config.categories.some(c => c.name === svc.category)) {
        const updatedConfig = {
          ...config,
          categories: [...config.categories, { name: svc.category, icon: "globe", sort_order: config.categories.length }],
        };
        await api.updateConfig(updatedConfig);
      }
      await api.addService({ ...svc, status: "unknown", source: "manual", container_id: null, port: null, sort_order: 0 });
      fetchData();
    } catch { /* */ }
  };

  const handleSaveConfig = async (cfg: AppConfig) => {
    try {
      await api.updateConfig(cfg);
      setConfig(cfg);
      setConfigOpen(false);
    } catch { /* */ }
  };

  const handleDiscoverDocker = async () => {
    try {
      const found = await api.discoverDocker();
      await fetchData();
      return found;
    } catch { /* */ }
  };

  const handleDiscoverNetwork = async () => {
    try {
      const found = await api.discoverNetwork();
      await fetchData();
      return found;
    } catch { /* */ }
  };

  const handlePinSubmit = async () => {
    try {
      const res = await api.verifyPin(pinInput);
      if (res.valid) {
        setPinLocked(false);
        setPinError(false);
      } else {
        setPinError(true);
      }
    } catch {
      setPinError(true);
    }
  };

  const handleMoveService = async (serviceId: string, newCategory: string) => {
    const svc = services.find((s) => s.id === serviceId);
    if (!svc) return;
    try {
      await api.updateService(svc.id, { ...svc, category: newCategory });
      fetchData();
    } catch { /* */ }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await api.deleteService(serviceId);
      fetchData();
    } catch { /* */ }
  };

  const handleEditService = async (serviceId: string, updates: Partial<Service>) => {
    const svc = services.find((s) => s.id === serviceId);
    if (!svc) return;
    try {
      await api.updateService(svc.id, { ...svc, ...updates });
      fetchData();
    } catch { /* */ }
  };

  const handleReorderService = async (serviceId: string, newIndex: number) => {
    const svc = services.find((s) => s.id === serviceId);
    if (!svc) return;
    try {
      await api.updateService(svc.id, { ...svc, sort_order: newIndex });
      fetchData();
    } catch { /* */ }
  };

  // Loading screen (shown before data arrives)
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0a1a]">
        <div className="h-6 w-6 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
      </div>
    );
  }

  // PIN lock screen
  if (pinLocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-base">
        <div className="w-full max-w-xs text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-heading text-xl font-bold">Dashlink</h1>
          <p className="text-sm text-muted">Enter PIN to unlock</p>
          <input
            type="password"
            value={pinInput}
            onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
            placeholder="••••"
            className={`w-full rounded-xl border px-4 py-3 text-center text-2xl tracking-[0.5em] bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40 ${pinError ? "border-red-500 shake" : "border-muted/20"}`}
            autoFocus
          />
          {pinError && <p className="text-xs text-red-500">Incorrect PIN</p>}
          <button onClick={handlePinSubmit}
            className="w-full rounded-xl bg-cta py-3 text-sm font-semibold text-white hover:opacity-90 cursor-pointer transition-colors">
            Unlock
          </button>
        </div>
      </div>
    );
  }

  const bgUrl = config?.background_url;
  const bgOpacity = config?.background_opacity ?? 0.3;

  return (
    <div className={`relative min-h-screen ${bgUrl ? "has-custom-bg" : ""}`}>
      {/* Background image */}
      {bgUrl && (
        <div className="fixed inset-0 -z-10">
          <img src={bgUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${bgOpacity})` }} />
        </div>
      )}

      <div className={ps.wrapper}>
        {/* Navbar */}
        <header className={ps.header}>
          <div className="min-w-0">
            <h1 className={`${ps.title} truncate`}>{config?.title ?? "Dashlink"}</h1>
            <p className={`${ps.subtitle} hidden sm:block`}>{config?.subtitle ?? "Your home dashboard"}</p>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {config?.weather_api_key && (
              <WeatherWidget apiKey={config.weather_api_key} city={config.weather_city} units={config.weather_units} showCity={config.weather_show_city ?? true} />
            )}
            <button onClick={toggleDark} className={ps.navBtn} aria-label="Toggle dark mode">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={() => setEditMode(!editMode)} className={`${ps.navBtn} hidden sm:flex ${editMode ? "!bg-primary/20 !text-primary" : ""}`} aria-label="Edit mode">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => setConfigOpen(true)} className={ps.navBtn} aria-label="Settings">
              <Settings className="h-4 w-4" />
            </button>
            <ThemeSwitcher currentId={themeId} onSwitch={switchTheme} />
          </div>
        </header>

        {/* Search */}
        {(config?.search_enabled ?? true) && (
          <div className="mb-8">
            <SearchBar value={search} onChange={setSearch} themeId={themeId} />
          </div>
        )}

        {/* Services */}
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className={`mb-4 ${ps.emptyIcon}`}>
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-heading text-lg font-semibold">No services yet</h2>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Add services manually or trigger Docker discovery in settings.
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setAddOpen(true)} className="rounded-xl bg-cta px-4 py-2 text-sm font-semibold text-white hover:opacity-90 cursor-pointer transition-colors">
                Add Service
              </button>
              <button onClick={() => setConfigOpen(true)} className="rounded-xl border border-primary/30 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 cursor-pointer transition-colors">
                Open Settings
              </button>
            </div>
          </div>
        ) : layoutMode === "list" ? (
          /* List layout: categories as vertical columns side by side */
          <div className="columns-layout grid gap-3 sm:gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(Object.keys(grouped).length, cols)}, minmax(0, 1fr))` }}>
            {Object.entries(grouped).map(([category, svcs]) => (
              <CategoryDropZone key={category} category={category} editMode={editMode} onDrop={handleMoveService} className="rounded-xl bg-surface/50 backdrop-blur-sm border border-gray-500/15 p-3 sm:p-4">
                <h2 className={ps.sectionTitle}>{category}</h2>
                {editMode ? (
                  <EditMode
                    services={svcs}
                    category={category}
                    allCategories={Object.keys(grouped)}
                    themeId={themeId}
                    gridStyle={{ display: "flex", flexDirection: "column" as const }}
                    gridClassName="flex flex-col gap-2"
                    onMove={handleMoveService}
                    onDelete={handleDeleteService}
                    onReorder={handleReorderService}
                    onEdit={handleEditService}
                    compact
                  />
                ) : (
                  <div className="space-y-2">
                    {svcs.map((s) => (
                      <ServiceCard key={s.id} service={s} themeId={themeId} />
                    ))}
                  </div>
                )}
              </CategoryDropZone>
            ))}
          </div>
        ) : (
          /* Grid layout: categories stacked, services in grid */
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, svcs]) => (
              <CategoryDropZone key={category} category={category} editMode={editMode} onDrop={handleMoveService}>
                <h2 className={ps.sectionTitle}>{category}</h2>
                {editMode ? (
                  <EditMode
                    services={svcs}
                    category={category}
                    allCategories={Object.keys(grouped)}
                    themeId={themeId}
                    gridStyle={gridStyle}
                    gridClassName={`grid ${gridClassName}`}
                    onMove={handleMoveService}
                    onDelete={handleDeleteService}
                    onReorder={handleReorderService}
                    onEdit={handleEditService}
                  />
                ) : (
                  <div className={`grid ${gridClassName}`} style={gridStyle}>
                    {svcs.map((s) => (
                      <ServiceCard key={s.id} service={s} themeId={themeId} />
                    ))}
                  </div>
                )}
              </CategoryDropZone>
            ))}
          </div>
        )}

        {/* Spacer for FAB */}
        <div className="h-20" />

        {/* FAB for adding services */}
        {!editMode && (
          <button onClick={() => setAddOpen(true)}
            className="fixed bottom-6 right-6 z-40 rounded-full bg-cta p-3.5 sm:p-4 text-white shadow-lg hover:opacity-90 cursor-pointer transition-all hover:scale-105"
            aria-label="Add service">
            <Plus className="h-5 w-5" />
          </button>
        )}

        <AddServiceModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAddService} categories={config?.categories.map(c => c.name)} />
        {config && (
          <ConfigPanel
            open={configOpen}
            onClose={() => setConfigOpen(false)}
            config={config}
            onSave={handleSaveConfig}
            onDiscoverDocker={handleDiscoverDocker}
            onDiscoverNetwork={handleDiscoverNetwork}
          />
        )}
      </div>
    </div>
  );
}

function CategoryDropZone({ category, editMode, onDrop, className, children }: {
  category: string;
  editMode: boolean;
  onDrop: (serviceId: string, newCategory: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [isOver, setIsOver] = useState(false);

  if (!editMode) return <section className={className}>{children}</section>;

  return (
    <section
      className={`${className ?? ""} transition-all duration-200 ${isOver ? "ring-2 ring-primary/40 bg-primary/5" : ""}`}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        const serviceId = e.dataTransfer.getData("text/plain");
        if (serviceId) onDrop(serviceId, category);
      }}
    >
      {children}
    </section>
  );
}
