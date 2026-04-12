"use client";

import { X, Search, Globe, Server, Activity, Play, Database, Shield, Box, Home, Monitor, Wifi, HardDrive, Cloud, Lock, Mail, Music, Camera, Folder, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ICONS: { name: string; icon: LucideIcon }[] = [
  { name: "globe", icon: Globe },
  { name: "server", icon: Server },
  { name: "activity", icon: Activity },
  { name: "play", icon: Play },
  { name: "database", icon: Database },
  { name: "shield", icon: Shield },
  { name: "docker", icon: Box },
  { name: "home", icon: Home },
  { name: "monitor", icon: Monitor },
  { name: "wifi", icon: Wifi },
  { name: "hard-drive", icon: HardDrive },
  { name: "cloud", icon: Cloud },
  { name: "lock", icon: Lock },
  { name: "mail", icon: Mail },
  { name: "music", icon: Music },
  { name: "camera", icon: Camera },
  { name: "folder", icon: Folder },
];

const FALLBACK_CATEGORIES = ["Default", "Media", "Monitoring", "Infrastructure", "Development", "Security", "Network", "Storage"];

interface Props {
  open: boolean;
  onClose: () => void;
  categories?: string[];
  onAdd: (service: {
    id: string;
    name: string;
    url: string;
    icon: string;
    description: string;
    category: string;
  }) => void;
}

export function AddServiceModal({ open, onClose, onAdd, categories: propCategories }: Props) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("globe");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Default");
  const [iconSearch, setIconSearch] = useState("");
  const [iconOpen, setIconOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const iconRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (iconRef.current && !iconRef.current.contains(e.target as Node)) setIconOpen(false);
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!open) return null;

  const filteredIcons = ICONS.filter((i) => i.name.includes(iconSearch.toLowerCase()));
  const allCats = propCategories && propCategories.length > 0 ? propCategories : FALLBACK_CATEGORIES;
  const filteredCats = allCats.filter((c) => c.toLowerCase().includes(catSearch.toLowerCase()));
  const SelectedIcon = ICONS.find((i) => i.name === icon)?.icon ?? Globe;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;
    onAdd({ id: `manual-${Date.now()}`, name, url, icon, description, category });
    setName(""); setUrl(""); setIcon("globe"); setDescription(""); setCategory("Default");
    onClose();
  };

  const inputCls = "w-full rounded-lg border border-muted/20 bg-base px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl border border-muted/20">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-semibold">Add Service</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-primary/10 transition-colors cursor-pointer" aria-label="Close">
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Name *</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">URL *</label>
            <input type="url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="http://192.168.1.100:8080" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Icon picker */}
            <div ref={iconRef} className="relative">
              <label className="block text-xs font-medium text-muted mb-1">Icon</label>
              <button type="button" onClick={() => { setIconOpen(!iconOpen); setCatOpen(false); }}
                className="w-full flex items-center gap-2 rounded-lg border border-muted/20 bg-base px-3 py-2 text-sm cursor-pointer hover:border-primary/40 transition-colors">
                <SelectedIcon className="h-4 w-4 text-primary" />
                <span className="truncate">{icon}</span>
              </button>
              {iconOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-muted/20 bg-surface shadow-xl max-h-56 overflow-hidden flex flex-col">
                  <div className="p-2 border-b border-muted/10">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                      <input type="text" value={iconSearch} onChange={(e) => setIconSearch(e.target.value)}
                        placeholder="Search icons..." autoFocus
                        className="w-full rounded-md border border-muted/20 bg-base pl-7 pr-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40" />
                    </div>
                  </div>
                  <div className="overflow-y-auto p-1.5 grid grid-cols-4 gap-1">
                    {filteredIcons.map((i) => (
                      <button key={i.name} type="button"
                        onClick={() => { setIcon(i.name); setIconOpen(false); setIconSearch(""); }}
                        className={`flex flex-col items-center gap-0.5 rounded-md p-2 text-xs cursor-pointer transition-colors
                          ${icon === i.name ? "bg-primary/15 text-primary" : "hover:bg-primary/5 text-muted"}`}>
                        <i.icon className="h-4 w-4" />
                        <span className="text-[10px] truncate w-full text-center">{i.name}</span>
                      </button>
                    ))}
                    {filteredIcons.length === 0 && <p className="col-span-4 text-center text-xs text-muted py-3">No icons found</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Category picker */}
            <div ref={catRef} className="relative">
              <label className="block text-xs font-medium text-muted mb-1">Category</label>
              <button type="button" onClick={() => { setCatOpen(!catOpen); setIconOpen(false); }}
                className="w-full flex items-center gap-2 rounded-lg border border-muted/20 bg-base px-3 py-2 text-sm cursor-pointer hover:border-primary/40 transition-colors text-left">
                <span className="truncate">{category}</span>
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-muted/20 bg-surface shadow-xl max-h-56 overflow-hidden flex flex-col">
                  <div className="p-2 border-b border-muted/10">
                    <input type="text" value={catSearch} onChange={(e) => setCatSearch(e.target.value)}
                      placeholder="Search or type new..." autoFocus
                      className="w-full rounded-md border border-muted/20 bg-base px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40" />
                  </div>
                  <div className="overflow-y-auto p-1">
                    {filteredCats.map((c) => (
                      <button key={c} type="button"
                        onClick={() => { setCategory(c); setCatOpen(false); setCatSearch(""); }}
                        className={`w-full text-left rounded-md px-3 py-1.5 text-xs cursor-pointer transition-colors
                          ${category === c ? "bg-primary/15 text-primary font-medium" : "hover:bg-primary/5 text-muted"}`}>
                        {c}
                      </button>
                    ))}
                    {catSearch && !filteredCats.includes(catSearch) && (
                      <button type="button"
                        onClick={() => { setCategory(catSearch); setCatOpen(false); setCatSearch(""); }}
                        className="w-full text-left rounded-md px-3 py-1.5 text-xs cursor-pointer hover:bg-primary/5 text-primary font-medium">
                        + Create &ldquo;{catSearch}&rdquo;
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
          </div>

          <button type="submit"
            className="w-full rounded-xl bg-cta py-2.5 text-sm font-semibold text-white hover:opacity-90 cursor-pointer transition-colors">
            Add Service
          </button>
        </form>
      </div>
    </div>
  );
}
