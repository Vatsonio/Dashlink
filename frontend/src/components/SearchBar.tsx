"use client";

import { Search } from "lucide-react";
import { useEffect, useRef } from "react";

const themeInputStyles: Record<string, string> = {
  "modern-classic":
    "w-full rounded-xl bg-surface border border-primary/10 py-3 pl-12 pr-4 font-body text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20 transition-all duration-200",
  "clean-flat":
    "w-full rounded-none bg-surface border-2 border-primary/20 py-3 pl-12 pr-4 font-body text-sm placeholder:text-muted focus:outline-none focus:border-primary transition-colors duration-150",
  "geometric-modern":
    "w-full rounded-none bg-transparent border-b-2 border-black/20 py-3 pl-12 pr-4 font-body text-sm placeholder:text-muted focus:outline-none focus:border-black transition-colors duration-200",
  "soft-warm":
    "w-full rounded-2xl bg-surface border border-amber-200/60 py-3.5 pl-12 pr-4 font-body text-sm shadow-[0_2px_10px_-3px_rgba(217,119,6,0.08)] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-amber-300/40 transition-all duration-300",
  "violet-marketplace":
    "w-full rounded-xl bg-surface border border-violet-200/60 py-3 pl-12 pr-4 font-body text-sm shadow-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-300 transition-all duration-200",
};

const defaultInputStyle = themeInputStyles["violet-marketplace"];

interface Props {
  value: string;
  onChange: (v: string) => void;
  themeId?: string;
}

export function SearchBar({ value, onChange, themeId = "violet-marketplace" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        onChange("");
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onChange]);

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search services... (Ctrl+K)"
        className={themeInputStyles[themeId] ?? defaultInputStyle}
      />
    </div>
  );
}
