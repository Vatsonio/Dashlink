"use client";

import { Settings, X, RefreshCw, Code, Sliders, Cloud, Search as SearchIcon, Plus, Trash2, ChevronUp, ChevronDown, Radar, ShieldCheck, Undo2, Eye, Pencil, AlertTriangle } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import { api, type AppConfig } from "@/lib/api";

type Tab = "general" | "appearance" | "weather" | "discovery" | "yaml";

interface Props {
  open: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (config: AppConfig) => void;
  onDiscoverDocker: () => void;
  onDiscoverNetwork: () => void;
}

export function ConfigPanel({ open, onClose, config, onSave, onDiscoverDocker, onDiscoverNetwork }: Props) {
  const [tab, setTab] = useState<Tab>("general");
  const [draft, setDraft] = useState<AppConfig>(config);

  useEffect(() => { setDraft(config); }, [config]);

  const update = useCallback(<K extends keyof AppConfig>(key: K, value: AppConfig[K]) =>
    setDraft((d) => ({ ...d, [key]: value })), []);

  const moveCat = useCallback((i: number, dir: -1 | 1) => {
    setDraft((d) => {
      const cats = [...d.categories];
      const j = i + dir;
      if (j < 0 || j >= cats.length) return d;
      [cats[i], cats[j]] = [cats[j], cats[i]];
      cats.forEach((c, idx) => c.sort_order = idx);
      return { ...d, categories: cats };
    });
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ animation: "cpFadeIn 200ms ease-out" }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-t-2xl sm:rounded-2xl bg-surface shadow-2xl flex flex-col"
        style={{ animation: "cpSlideUp 300ms cubic-bezier(0.16,1,0.3,1)" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-muted/10">
          <h2 className="font-heading text-lg font-semibold">Settings</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-primary/10 cursor-pointer" aria-label="Close">
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        {/* Tabs */}
        <TabBar tab={tab} setTab={setTab} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" key={tab}
          style={{ animation: "cpTabSwitch 200ms ease-out" }}>
          {tab === "general" && <GeneralTab draft={draft} update={update} moveCat={moveCat} />}
          {tab === "appearance" && <AppearanceTab draft={draft} update={update} />}
          {tab === "weather" && <WeatherTab draft={draft} update={update} />}
          {tab === "discovery" && <DiscoveryTab onDiscoverDocker={onDiscoverDocker} onDiscoverNetwork={onDiscoverNetwork} />}
          {tab === "yaml" && <YamlTab />}
        </div>

        {/* Footer */}
        {tab !== "yaml" && tab !== "discovery" && (
          <div className="p-4 border-t border-muted/10">
            <button onClick={() => onSave(draft)}
              className="w-full rounded-xl bg-cta py-2.5 text-sm font-semibold text-white hover:opacity-90 cursor-pointer">
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Tab Bar ── */
const TAB_DEF: { id: Tab; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: "general", label: "General", Icon: Sliders },
  { id: "appearance", label: "Look", Icon: Settings },
  { id: "weather", label: "Weather", Icon: Cloud },
  { id: "discovery", label: "Discovery", Icon: Radar },
  { id: "yaml", label: "Config", Icon: Code },
];

const TabBar = memo(function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="flex border-b border-muted/10 px-2 sm:px-4 gap-0.5 flex-wrap">
      {TAB_DEF.map((t) => (
        <button key={t.id} onClick={() => setTab(t.id)}
          className={`flex items-center gap-1 px-2 sm:px-3 py-2.5 text-[11px] sm:text-xs font-medium cursor-pointer border-b-2 -mb-px whitespace-nowrap
            ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted hover:text-primary/70"}`}>
          <t.Icon className="h-4 w-4" /><span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  );
});

/* ── Shared ── */
const inputCls = "w-full rounded-lg border border-muted/20 bg-base px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

const Field = memo(function Field({ label, value, onChange, type = "text", placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
    </div>
  );
});

const Toggle = memo(function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded accent-primary" />
      <span className="text-sm">{label}</span>
    </label>
  );
});

/* ── General Tab ── */
function GeneralTab({ draft, update, moveCat }: {
  draft: AppConfig;
  update: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => void;
  moveCat: (i: number, dir: -1 | 1) => void;
}) {
  return (
    <>
      <Field label="Title" value={draft.title} onChange={(v) => update("title", v)} />
      <Field label="Subtitle" value={draft.subtitle} onChange={(v) => update("subtitle", v)} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Columns</label>
          <select value={draft.columns} onChange={(e) => update("columns", Number(e.target.value))} className={inputCls + " cursor-pointer"}>
            {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Layout</label>
          <select value={draft.layout_mode} onChange={(e) => update("layout_mode", e.target.value)} className={inputCls + " cursor-pointer"}>
            <option value="grid">Grid</option>
            <option value="list">Columns (vertical)</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Health check (s)</label>
          <input type="number" min={10} value={draft.scan_interval} onChange={(e) => update("scan_interval", Number(e.target.value))} className={inputCls} />
        </div>
      </div>
      <Toggle label="Search bar" checked={draft.search_enabled} onChange={(v) => update("search_enabled", v)} />
      <Toggle label="PIN protection" checked={draft.pin_enabled} onChange={(v) => update("pin_enabled", v)} />
      {draft.pin_enabled && <Field label="PIN code" value={draft.pin_code} onChange={(v) => update("pin_code", v)} type="password" />}

      <div className="pt-2 border-t border-muted/10">
        <label className="block text-xs font-medium text-muted mb-2">Categories</label>
        <div className="space-y-1">
          {draft.categories.map((cat, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="flex flex-col">
                <button onClick={() => moveCat(i, -1)} disabled={i === 0}
                  className="p-0.5 text-muted hover:text-primary disabled:opacity-20 cursor-pointer">
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button onClick={() => moveCat(i, 1)} disabled={i === draft.categories.length - 1}
                  className="p-0.5 text-muted hover:text-primary disabled:opacity-20 cursor-pointer">
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
              <input value={cat.name}
                onChange={(e) => {
                  const cats = [...draft.categories];
                  cats[i] = { ...cats[i], name: e.target.value };
                  update("categories", cats);
                }}
                placeholder="Category name"
                className="flex-1 rounded-md border border-muted/10 bg-base px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40" />
              <input value={cat.icon}
                onChange={(e) => {
                  const cats = [...draft.categories];
                  cats[i] = { ...cats[i], icon: e.target.value };
                  update("categories", cats);
                }}
                placeholder="icon"
                className="w-14 rounded-md border border-muted/10 bg-base px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40" />
              <button onClick={() => update("categories", draft.categories.filter((_, j) => j !== i))}
                className="p-1 rounded text-red-400 hover:bg-red-500/10 cursor-pointer">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button onClick={() => update("categories", [...draft.categories, { name: "New Category", icon: "globe", sort_order: draft.categories.length }])}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 cursor-pointer mt-1">
            <Plus className="h-3 w-3" /> Add category
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Appearance Tab ── */
function AppearanceTab({ draft, update }: {
  draft: AppConfig;
  update: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => void;
}) {
  return (
    <>
      <Field label="Background image URL" value={draft.background_url} onChange={(v) => update("background_url", v)} placeholder="https://images.unsplash.com/..." />
      {draft.background_url && (
        <>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">
              Overlay darkness: {Math.round(draft.background_opacity * 100)}%
            </label>
            <input type="range" min={0} max={1} step={0.05} value={draft.background_opacity}
              onChange={(e) => update("background_opacity", Number(e.target.value))}
              className="w-full accent-primary cursor-pointer" />
          </div>
          <div className="relative h-24 rounded-lg overflow-hidden">
            <img src={draft.background_url} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${draft.background_opacity})` }} />
            <span className="absolute bottom-2 left-2 text-white text-xs font-medium drop-shadow">Preview</span>
          </div>
        </>
      )}
    </>
  );
}

/* ── Weather Tab ── */
function WeatherTab({ draft, update }: {
  draft: AppConfig;
  update: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => void;
}) {
  return (
    <>
      <p className="text-xs text-muted">Add an OpenWeatherMap API key to show weather in the navbar.</p>
      <Field label="API Key" value={draft.weather_api_key} onChange={(v) => update("weather_api_key", v)} placeholder="your-api-key" type="password" />
      <Field label="City" value={draft.weather_city} onChange={(v) => update("weather_city", v)} placeholder="Kyiv" />
      <div>
        <label className="block text-xs font-medium text-muted mb-1">Units</label>
        <select value={draft.weather_units} onChange={(e) => update("weather_units", e.target.value)} className={inputCls + " cursor-pointer"}>
          <option value="metric">Celsius</option>
          <option value="imperial">Fahrenheit</option>
        </select>
      </div>
      <Toggle label="Show city name in widget" checked={draft.weather_show_city ?? true} onChange={(v) => update("weather_show_city", v)} />
    </>
  );
}

/* ── Discovery Tab ── */
function DiscoveryTab({ onDiscoverDocker, onDiscoverNetwork }: {
  onDiscoverDocker: () => void;
  onDiscoverNetwork: () => void;
}) {
  const [discovering, setDiscovering] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const run = async (type: "docker" | "network") => {
    setDiscovering(type);
    setLog((l) => [...l, `[${new Date().toLocaleTimeString()}] Scanning ${type}...`]);
    try {
      if (type === "docker") {
        const found = await api.discoverDocker();
        setLog((l) => [...l, `[${new Date().toLocaleTimeString()}] Docker: ${found.length} new service(s) added`]);
      } else {
        const found = await api.discoverNetwork();
        setLog((l) => [...l, `[${new Date().toLocaleTimeString()}] Network: ${found.length} new service(s) added`]);
      }
    } catch (e) {
      setLog((l) => [...l, `[${new Date().toLocaleTimeString()}] Error: ${e}`]);
    } finally {
      setDiscovering(null);
    }
  };

  return (
    <>
      <p className="text-xs text-muted">Scan your local network or Docker to find services automatically.</p>
      <div className="space-y-3">
        <div className="rounded-lg border border-muted/10 p-3 space-y-2">
          <h3 className="text-xs font-semibold">Docker Discovery</h3>
          <p className="text-[11px] text-muted">Finds running containers with exposed ports.</p>
          <button onClick={() => run("docker")} disabled={discovering !== null}
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20 cursor-pointer disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${discovering === "docker" ? "animate-spin" : ""}`} />
            {discovering === "docker" ? "Scanning..." : "Scan Docker"}
          </button>
        </div>
        <div className="rounded-lg border border-muted/10 p-3 space-y-2">
          <h3 className="text-xs font-semibold">Network Discovery</h3>
          <p className="text-[11px] text-muted">Scans common ports on local subnets. May take 30-60s.</p>
          <button onClick={() => run("network")} disabled={discovering !== null}
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20 cursor-pointer disabled:opacity-50">
            <SearchIcon className={`h-3.5 w-3.5 ${discovering === "network" ? "animate-spin" : ""}`} />
            {discovering === "network" ? "Scanning..." : "Scan Network"}
          </button>
        </div>
      </div>
      {log.length > 0 && (
        <div className="rounded-lg bg-base border border-muted/10 p-3">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-muted">Log</label>
            <button onClick={() => setLog([])} className="text-[10px] text-muted hover:text-primary cursor-pointer">Clear</button>
          </div>
          <div className="space-y-0.5 max-h-32 overflow-y-auto">
            {log.map((line, i) => (
              <p key={i} className="text-[11px] font-mono text-muted">{line}</p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* ── YAML Tab (with validation, diff, backup, read-only) ── */
function YamlTab() {
  const [yaml, setYaml] = useState("");
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"ok" | "error" | "warn">("ok");
  const [diff, setDiff] = useState<Record<string, unknown> | null>(null);
  const [hasBackup, setHasBackup] = useState(false);
  const [validating, setValidating] = useState(false);

  const loadYaml = useCallback(async () => {
    try {
      const [res, backup] = await Promise.all([api.getRawConfig(), api.hasBackup()]);
      setYaml(res.yaml);
      setHasBackup(backup.exists);
      setStatus("");
      setDiff(null);
    } catch { setStatus("Failed to load"); setStatusType("error"); }
  }, []);

  useEffect(() => { loadYaml(); }, [loadYaml]);

  const validate = async () => {
    setValidating(true);
    try {
      const res = await api.validateRawConfig(yaml);
      if (res.valid) {
        setDiff(res.diff);
        setStatus(Object.keys(res.diff || {}).length === 0 ? "No changes detected" : "Valid - review changes below");
        setStatusType("ok");
      } else {
        setStatus(res.error);
        setStatusType("error");
        setDiff(null);
      }
    } catch (e) {
      setStatus(`${e}`);
      setStatusType("error");
    } finally {
      setValidating(false);
    }
  };

  const save = async () => {
    try {
      await api.updateRawConfig(yaml);
      setStatus("Saved successfully!");
      setStatusType("ok");
      setDiff(null);
      setEditing(false);
      setHasBackup(true);
      setTimeout(() => setStatus(""), 2000);
    } catch (e) {
      setStatus(`Error: ${e}`);
      setStatusType("error");
    }
  };

  const restore = async () => {
    try {
      await api.restoreBackup();
      await loadYaml();
      setStatus("Backup restored!");
      setStatusType("ok");
      setTimeout(() => setStatus(""), 2000);
    } catch (e) {
      setStatus(`${e}`);
      setStatusType("error");
    }
  };

  const showExample = () => {
    const example = `title: Dashlink
subtitle: Your home dashboard
theme: violet-marketplace
layout_mode: grid
columns: 4
pin_enabled: false
pin_code: ""
search_enabled: true
scan_interval: 30
background_url: ""
background_opacity: 0.3
weather_api_key: ""
weather_city: ""
weather_units: metric
weather_show_city: true
categories:
  - name: Default
    icon: home
    sort_order: 0
services: []
`;
    setYaml(example);
    setEditing(true);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {!editing ? (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 cursor-pointer">
            <Pencil className="h-3 w-3" /> Edit
          </button>
        ) : (
          <button onClick={() => { setEditing(false); loadYaml(); }}
            className="flex items-center gap-1 rounded-lg border border-muted/20 px-3 py-1.5 text-xs font-medium text-muted hover:bg-primary/10 cursor-pointer">
            <Eye className="h-3 w-3" /> Read-only
          </button>
        )}
        <button onClick={validate} disabled={validating}
          className="flex items-center gap-1 rounded-lg border border-muted/20 px-3 py-1.5 text-xs font-medium text-muted hover:bg-primary/10 cursor-pointer disabled:opacity-50">
          <ShieldCheck className="h-3 w-3" /> {validating ? "Checking..." : "Validate"}
        </button>
        <button onClick={() => { navigator.clipboard.writeText(yaml); setStatus("Copied!"); setStatusType("ok"); setTimeout(() => setStatus(""), 1500); }}
          className="rounded-lg border border-muted/20 px-3 py-1.5 text-xs font-medium text-muted hover:bg-primary/10 cursor-pointer">
          Copy
        </button>
        <button onClick={showExample}
          className="rounded-lg border border-muted/20 px-3 py-1.5 text-xs font-medium text-muted hover:bg-primary/10 cursor-pointer">
          Example
        </button>
        {hasBackup && (
          <button onClick={restore}
            className="flex items-center gap-1 rounded-lg border border-amber-400/40 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 cursor-pointer">
            <Undo2 className="h-3 w-3" /> Restore backup
          </button>
        )}
      </div>

      {/* Status */}
      {status && (
        <div className={`flex items-start gap-2 rounded-lg p-2.5 text-xs ${
          statusType === "error" ? "bg-red-50 text-red-600 border border-red-200" :
          statusType === "warn" ? "bg-amber-50 text-amber-700 border border-amber-200" :
          "bg-green-50 text-green-600 border border-green-200"
        }`}>
          {statusType === "error" && <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
          {statusType === "ok" && <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
          <span className="break-all">{status}</span>
        </div>
      )}

      {/* Diff preview */}
      {diff && Object.keys(diff).length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-1">
          <p className="text-[11px] font-semibold text-blue-700">Changes to apply:</p>
          {Object.entries(diff).map(([key, val]) => (
            <p key={key} className="text-[11px] font-mono text-blue-600">
              <span className="font-semibold">{key}:</span>{" "}
              {typeof val === "string" ? val : JSON.stringify(val)}
            </p>
          ))}
        </div>
      )}

      {/* Editor */}
      <textarea
        value={yaml}
        onChange={(e) => setYaml(e.target.value)}
        readOnly={!editing}
        rows={16}
        spellCheck={false}
        className={`w-full rounded-lg border border-muted/20 bg-base px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none ${
          !editing ? "opacity-70 cursor-default" : ""
        }`}
      />

      {/* Save */}
      {editing && (
        <div className="flex gap-2">
          <button onClick={async () => { await validate(); }}
            className="flex-1 rounded-lg border border-primary/30 py-2 text-xs font-medium text-primary hover:bg-primary/10 cursor-pointer">
            Validate first
          </button>
          <button onClick={save}
            className="flex-1 rounded-lg bg-cta py-2 text-xs font-semibold text-white hover:opacity-90 cursor-pointer">
            Apply YAML
          </button>
        </div>
      )}
    </>
  );
}
