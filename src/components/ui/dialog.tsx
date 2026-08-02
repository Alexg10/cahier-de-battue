"use client";

import { X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Modale simple et autonome (sans dépendance externe), adaptée au mobile
 * et au fonctionnement hors-ligne. Se ferme via Échap, le bouton ou le fond.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Empêche le défilement de l'arrière-plan.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // Rendu via portal sur <body> : indispensable pour que le `position: fixed`
  // couvre tout l'écran même si un ancêtre a un `transform`/`backdrop-filter`
  // (ex. le header collant), qui sinon deviendrait le bloc conteneur.
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[var(--radius)] border border-border bg-card shadow-lg sm:rounded-[var(--radius)]",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-4">
          <div className="min-w-0">
            {title ? (
              <h2 className="truncate text-base font-bold">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
