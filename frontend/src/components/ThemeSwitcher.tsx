"use client";

import { Palette } from "lucide-react";
import { useState } from "react";
import { themes, type Theme } from "@/themes";

interface Props {
  currentId: string;
  onSwitch: (id: string) => void;
}

export function ThemeSwitcher({ currentId, onSwitch }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-body
                   text-base hover:bg-primary/10 transition-colors cursor-pointer
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Switch theme"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">Theme</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-muted/20 bg-surface p-2 shadow-xl">
            {Object.values(themes).map((t: Theme) => (
              <button
                key={t.id}
                onClick={() => {
                  onSwitch(t.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer
                  ${t.id === currentId ? "bg-primary/10 font-semibold" : "hover:bg-primary/5"}`}
              >
                <span
                  className="h-4 w-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: t.light["--color-primary"] }}
                />
                <span className="text-base">{t.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
