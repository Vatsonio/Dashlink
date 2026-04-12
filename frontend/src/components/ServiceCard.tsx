"use client";

import {
  Globe, Server, Activity, Play, Database, Shield, Box, Home,
  Monitor, Wifi, HardDrive, Cloud, Lock, Mail, Music, Camera, Folder,
  type LucideIcon,
} from "lucide-react";
import type { Service } from "@/lib/api";

const iconMap: Record<string, LucideIcon> = {
  docker: Box, home: Home, server: Server, globe: Globe,
  activity: Activity, play: Play, database: Database, shield: Shield,
  monitor: Monitor, wifi: Wifi, "hard-drive": HardDrive, cloud: Cloud,
  lock: Lock, mail: Mail, music: Music, camera: Camera, folder: Folder,
};

// Background images for pinterest-style cards (SVG data URIs for zero external deps)
const serviceBgImages: Record<string, string> = {
  docker: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#0db7ed;stop-opacity:1"/><stop offset="100%" style="stop-color:#005f9e;stop-opacity:1"/></linearGradient></defs><rect fill="url(#g)" width="400" height="200"/><text x="200" y="110" text-anchor="middle" fill="rgba(255,255,255,0.15)" font-size="80" font-family="sans-serif" font-weight="bold">Docker</text></svg>')}`,
  activity: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f97316;stop-opacity:1"/><stop offset="100%" style="stop-color:#dc2626;stop-opacity:1"/></linearGradient></defs><rect fill="url(#g)" width="400" height="200"/><text x="200" y="110" text-anchor="middle" fill="rgba(255,255,255,0.15)" font-size="60" font-family="sans-serif" font-weight="bold">Monitor</text></svg>')}`,
  shield: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#059669;stop-opacity:1"/><stop offset="100%" style="stop-color:#065f46;stop-opacity:1"/></linearGradient></defs><rect fill="url(#g)" width="400" height="200"/><text x="200" y="110" text-anchor="middle" fill="rgba(255,255,255,0.15)" font-size="60" font-family="sans-serif" font-weight="bold">Security</text></svg>')}`,
  play: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1"/><stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1"/></linearGradient></defs><rect fill="url(#g)" width="400" height="200"/><text x="200" y="110" text-anchor="middle" fill="rgba(255,255,255,0.15)" font-size="60" font-family="sans-serif" font-weight="bold">Media</text></svg>')}`,
  home: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#2563eb;stop-opacity:1"/><stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1"/></linearGradient></defs><rect fill="url(#g)" width="400" height="200"/><text x="200" y="110" text-anchor="middle" fill="rgba(255,255,255,0.15)" font-size="60" font-family="sans-serif" font-weight="bold">Home</text></svg>')}`,
  server: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#6366f1;stop-opacity:1"/><stop offset="100%" style="stop-color:#4338ca;stop-opacity:1"/></linearGradient></defs><rect fill="url(#g)" width="400" height="200"/><text x="200" y="110" text-anchor="middle" fill="rgba(255,255,255,0.15)" font-size="60" font-family="sans-serif" font-weight="bold">Server</text></svg>')}`,
  database: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#0891b2;stop-opacity:1"/><stop offset="100%" style="stop-color:#155e75;stop-opacity:1"/></linearGradient></defs><rect fill="url(#g)" width="400" height="200"/><text x="200" y="110" text-anchor="middle" fill="rgba(255,255,255,0.15)" font-size="60" font-family="sans-serif" font-weight="bold">Data</text></svg>')}`,
  globe: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#64748b;stop-opacity:1"/><stop offset="100%" style="stop-color:#334155;stop-opacity:1"/></linearGradient></defs><rect fill="url(#g)" width="400" height="200"/><text x="200" y="110" text-anchor="middle" fill="rgba(255,255,255,0.15)" font-size="60" font-family="sans-serif" font-weight="bold">Web</text></svg>')}`,
  default: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#475569;stop-opacity:1"/><stop offset="100%" style="stop-color:#1e293b;stop-opacity:1"/></linearGradient></defs><rect fill="url(#g)" width="400" height="200"/></svg>')}`,
};

const statusColors: Record<string, string> = {
  online: "bg-green-500",
  offline: "bg-red-500",
  unknown: "bg-gray-400",
};

// Each theme has a completely different card style
const themeStyles: Record<string, {
  card: string;
  iconWrap: string;
  iconSize: string;
  statusPos: string;
  layout: "horizontal" | "vertical" | "pinterest";
}> = {
  "modern-classic": {
    card: `relative flex items-center gap-3 p-3 rounded-xl cursor-pointer
           bg-surface border border-transparent shadow-sm
           transition-all duration-300
           hover:shadow-lg hover:-translate-y-0.5
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`,
    iconWrap: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
    iconSize: "h-4 w-4",
    statusPos: "absolute top-3 right-3",
    layout: "horizontal",
  },
  "clean-flat": {
    card: `relative flex items-center gap-3 p-4 rounded-none cursor-pointer
           bg-surface border-l-4 border-l-primary border-y border-r border-gray-200
           transition-colors duration-150
           hover:bg-primary/5
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`,
    iconWrap: "flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-primary text-white",
    iconSize: "h-5 w-5",
    statusPos: "absolute top-1/2 right-4 -translate-y-1/2",
    layout: "horizontal",
  },
  "geometric-modern": {
    card: `relative flex flex-col items-center text-center gap-3 p-6 cursor-pointer
           bg-surface border-2 border-black/10
           transition-all duration-200
           hover:border-black hover:bg-black hover:text-white [&:hover_.icon-wrap]:bg-white [&:hover_.icon-wrap]:text-black [&:hover_.svc-meta]:text-gray-300
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black`,
    iconWrap: "icon-wrap flex h-12 w-12 items-center justify-center bg-black text-white transition-colors duration-200",
    iconSize: "h-6 w-6",
    statusPos: "absolute top-3 right-3",
    layout: "vertical",
  },
  "soft-warm": {
    card: `relative flex items-start gap-4 p-5 rounded-3xl cursor-pointer
           bg-surface shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]
           border border-orange-100
           transition-all duration-300
           hover:shadow-[0_4px_25px_-5px_rgba(217,119,6,0.15)] hover:-translate-y-1
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`,
    iconWrap: "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 text-primary",
    iconSize: "h-6 w-6",
    statusPos: "absolute top-4 right-4",
    layout: "horizontal",
  },
  "violet-marketplace": {
    card: `relative flex items-start gap-4 p-5 rounded-2xl cursor-pointer
           bg-surface border border-violet-200/60 shadow-sm
           transition-all duration-200
           hover:shadow-xl hover:shadow-violet-500/10 hover:scale-[1.03] hover:border-violet-400/40
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`,
    iconWrap: "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/25",
    iconSize: "h-6 w-6",
    statusPos: "absolute top-3 right-3",
    layout: "horizontal",
  },
};

const defaultStyle = themeStyles["violet-marketplace"];

export function ServiceCard({
  service,
  themeId,
}: {
  service: Service;
  themeId: string;
}) {
  const Icon = iconMap[service.icon] ?? Globe;
  const style = themeStyles[themeId] ?? defaultStyle;

  // Pinterest-style card with background image
  if (style.layout === "pinterest") {
    const bgImage = serviceBgImages[service.icon] ?? serviceBgImages["default"];
    return (
      <a
        href={service.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group ${style.card}`}
      >
        <span
          className={`${style.statusPos} h-2 w-2 rounded-full ring-2 ring-white ${statusColors[service.status]}`}
          title={service.status}
        />
        {/* Background image */}
        <div
          className="h-20 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="h-full w-full bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        {/* Content */}
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className={style.iconWrap}>
              <Icon className={style.iconSize} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-heading text-xs font-semibold truncate">
                {service.name}
              </h3>
              {service.description && (
                <p className="text-[11px] text-muted truncate">
                  {service.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </a>
    );
  }

  if (style.layout === "vertical") {
    return (
      <a
        href={service.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group ${style.card}`}
      >
        <span
          className={`${style.statusPos} h-2.5 w-2.5 rounded-full ${statusColors[service.status]}`}
          title={service.status}
        />
        <div className={style.iconWrap}>
          <Icon className={style.iconSize} />
        </div>
        <div className="min-w-0 w-full">
          <h3 className="font-heading text-sm font-bold truncate">
            {service.name}
          </h3>
          {service.description && (
            <p className="svc-meta mt-1 text-xs text-muted truncate transition-colors duration-200">
              {service.description}
            </p>
          )}
          <span className="svc-meta mt-1 inline-block text-[11px] text-muted/70 font-mono uppercase tracking-widest transition-colors duration-200">
            {service.category}
          </span>
        </div>
      </a>
    );
  }

  return (
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group ${style.card}`}
    >
      <span
        className={`${style.statusPos} h-2.5 w-2.5 rounded-full ${statusColors[service.status]}`}
        title={service.status}
      />
      <div className={style.iconWrap}>
        <Icon className={style.iconSize} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-sm font-semibold truncate">
          {service.name}
        </h3>
        {service.description && (
          <p className="mt-0.5 text-xs text-muted truncate">
            {service.description}
          </p>
        )}
        <span className="mt-1 inline-block text-[11px] text-muted/70 font-body">
          {service.category}
          {service.source === "docker" && " · Docker"}
        </span>
      </div>
    </a>
  );
}
