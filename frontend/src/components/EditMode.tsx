"use client";

import { Trash2, ArrowRight, GripVertical, Pencil, Check, X } from "lucide-react";
import { useState, useCallback } from "react";
import type { Service } from "@/lib/api";

interface Props {
  services: Service[];
  category: string;
  allCategories: string[];
  themeId: string;
  gridStyle: React.CSSProperties;
  gridClassName: string;
  onMove: (serviceId: string, newCategory: string) => void;
  onDelete: (serviceId: string) => void;
  onReorder?: (serviceId: string, newSortOrder: number) => void;
  onEdit?: (serviceId: string, updates: Partial<Service>) => void;
  compact?: boolean;
}

export function EditMode({
  services,
  category,
  allCategories,
  gridStyle,
  gridClassName,
  onMove,
  onDelete,
  onReorder,
  onEdit,
  compact,
}: Props) {
  const [moveTarget, setMoveTarget] = useState<string | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ name: string; url: string; description: string }>({ name: "", url: "", description: "" });
  const otherCategories = allCategories.filter((c) => c !== category);

  const onDragStart = useCallback((e: React.DragEvent, idx: number) => {
    setDraggingIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", services[idx].id);
    // Use a timeout so the browser captures the element before we style it
    requestAnimationFrame(() => {
      (e.target as HTMLElement).style.opacity = "0.4";
    });
  }, []);

  const onDragEnd = useCallback((e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = "1";
    setDraggingIdx(null);
    setDragOverIdx(null);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(idx);
  }, []);

  const onDrop = useCallback((e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    e.stopPropagation(); // prevent category-level drop
    const srcIdx = draggingIdx;
    setDragOverIdx(null);
    setDraggingIdx(null);
    if (srcIdx === null || srcIdx === targetIdx || !onReorder) return;
    onReorder(services[srcIdx].id, targetIdx);
  }, [draggingIdx, onReorder, services]);

  return (
    <div className={gridClassName} style={gridStyle}>
      {services.map((s, idx) => (
        <div
          key={s.id}
          draggable
          onDragStart={(e) => onDragStart(e, idx)}
          onDragEnd={onDragEnd}
          onDragOver={(e) => onDragOver(e, idx)}
          onDragLeave={() => setDragOverIdx(null)}
          onDrop={(e) => onDrop(e, idx)}
          className={`rounded-lg transition-all duration-150
            ${dragOverIdx === idx ? "ring-2 ring-primary ring-offset-1 ring-offset-surface" : ""}
            ${draggingIdx === idx ? "opacity-40" : ""}`}
        >
          {editing === s.id ? (
            /* Inline edit form */
            <div className={`rounded-lg bg-surface border border-primary/30 ${compact ? "p-2" : "p-3"} space-y-2`}
              onClick={(e) => e.stopPropagation()}>
              <input value={editDraft.name} onChange={(e) => setEditDraft(d => ({ ...d, name: e.target.value }))}
                placeholder="Name" autoFocus
                className="w-full rounded-md border border-muted/20 bg-base px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40" />
              <input value={editDraft.url} onChange={(e) => setEditDraft(d => ({ ...d, url: e.target.value }))}
                placeholder="URL"
                className="w-full rounded-md border border-muted/20 bg-base px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40" />
              <input value={editDraft.description} onChange={(e) => setEditDraft(d => ({ ...d, description: e.target.value }))}
                placeholder="Description"
                className="w-full rounded-md border border-muted/20 bg-base px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40" />
              <div className="flex gap-1 justify-end">
                <button onClick={() => setEditing(null)}
                  className="rounded-md p-1.5 text-muted hover:bg-muted/10 cursor-pointer" draggable={false}>
                  <X className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => { onEdit?.(s.id, editDraft); setEditing(null); }}
                  className="rounded-md p-1.5 text-cta hover:bg-cta/10 cursor-pointer" draggable={false}>
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Normal drag card */
            <div className={`rounded-lg bg-surface border border-muted/10 ${compact ? "p-2" : "p-3"} flex items-center gap-2 cursor-grab active:cursor-grabbing`}>
              <GripVertical className={`${compact ? "h-3 w-3" : "h-4 w-4"} text-muted shrink-0`} />
              <div className="min-w-0 flex-1">
                <p className={`${compact ? "text-xs" : "text-sm"} font-medium truncate`}>{s.name}</p>
                {!compact && <p className="text-xs text-muted truncate">{s.description || s.url}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditing(s.id); setEditDraft({ name: s.name, url: s.url, description: s.description }); }}
                  className={`rounded-md bg-primary/10 ${compact ? "p-1" : "p-1.5"} text-primary hover:bg-primary/20 cursor-pointer transition-colors`}
                  title="Edit"
                  draggable={false}
                >
                  <Pencil className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
                </button>
                {otherCategories.length > 0 && (
                  <div className="relative">
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMoveTarget(moveTarget === s.id ? null : s.id); }}
                      className={`rounded-md bg-primary/10 ${compact ? "p-1" : "p-1.5"} text-primary hover:bg-primary/20 cursor-pointer transition-colors`}
                      title="Move to category"
                      draggable={false}
                    >
                      <ArrowRight className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
                    </button>
                    {moveTarget === s.id && (
                      <div className="absolute top-full right-0 z-50 mt-1 w-36 rounded-lg bg-surface shadow-xl border border-muted/10 py-1">
                        {otherCategories.map((cat) => (
                          <button key={cat}
                            onClick={(e) => { e.stopPropagation(); onMove(s.id, cat); setMoveTarget(null); }}
                            className="w-full px-3 py-1.5 text-left text-xs hover:bg-primary/10 cursor-pointer transition-colors"
                            draggable={false}>
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(s.id); }}
                  className={`rounded-md bg-red-500/10 ${compact ? "p-1" : "p-1.5"} text-red-500 hover:bg-red-500/20 cursor-pointer transition-colors`}
                  title="Delete"
                  draggable={false}
                >
                  <Trash2 className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
