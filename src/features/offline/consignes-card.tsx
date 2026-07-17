"use client";

import { ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Carte des consignes de sécurité : aperçu limité + lecture complète en dialog. */
export function ConsignesCard({ texte }: { texte: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="border-warning/40 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <ShieldAlert className="size-5" />
            Règles & consignes de sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-2">
          <p className="line-clamp-3 whitespace-pre-line text-sm leading-relaxed">
            {texte}
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-sm font-bold text-warning underline underline-offset-2"
          >
            Lire les consignes
          </button>
        </CardContent>
      </Card>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Règles et consignes de sécurité"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-[var(--radius)] bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border p-4">
              <ShieldAlert className="size-5 text-warning" />
              <h2 className="flex-1 text-base font-bold">
                Règles & consignes de sécurité
              </h2>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setOpen(false)}
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {texte}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
