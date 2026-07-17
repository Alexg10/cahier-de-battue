"use client";

import { Check, CloudOff, RefreshCw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useDirtyCount, useOnline } from "./hooks";
import { sync } from "./sync";

/** Bandeau d'état de synchronisation d'une journée. */
export function SyncBadge({ battueId }: { battueId: string }) {
  const online = useOnline();
  const dirty = useDirtyCount(battueId) ?? 0;
  const [busy, setBusy] = useState(false);

  async function manualSync() {
    setBusy(true);
    await sync(battueId);
    setBusy(false);
  }

  const label = !online
    ? dirty > 0
      ? `Hors ligne · ${dirty} à synchroniser`
      : "Hors ligne"
    : dirty > 0
      ? `${dirty} modification${dirty > 1 ? "s" : ""} à envoyer`
      : "À jour";

  const tone = !online
    ? "bg-amber-100 text-warning"
    : dirty > 0
      ? "bg-accent text-accent-foreground"
      : "bg-green-100 text-success";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
        tone,
      )}
    >
      {!online ? (
        <CloudOff className="size-4" />
      ) : dirty > 0 ? (
        <RefreshCw className={cn("size-4", busy && "animate-spin")} />
      ) : (
        <Check className="size-4" />
      )}
      <span className="flex-1">{label}</span>
      {online && dirty > 0 ? (
        <button
          type="button"
          onClick={manualSync}
          disabled={busy}
          className="underline underline-offset-2"
        >
          Synchroniser
        </button>
      ) : null}
    </div>
  );
}
