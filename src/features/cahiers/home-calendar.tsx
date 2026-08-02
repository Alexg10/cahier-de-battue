"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { GlobalBattue } from "./queries";

const STORAGE_KEY = "home-calendar-visible";

/** Palette de couleurs distinctes, une par cahier (cyclique). */
const PALETTE = [
  "#ef4444", // rouge
  "#3b82f6", // bleu
  "#10b981", // émeraude
  "#f59e0b", // ambre
  "#8b5cf6", // violet
  "#ec4899", // rose
  "#14b8a6", // sarcelle
  "#f97316", // orange
];

// Préférence d'affichage du calendrier, persistée en localStorage et partagée
// entre les composants via un petit store (visible par défaut).
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) !== "0";
}
function getServerSnapshot() {
  return true;
}
function toggleVisible() {
  localStorage.setItem(STORAGE_KEY, getSnapshot() ? "0" : "1");
  for (const l of listeners) l();
}
function useCalendarVisible() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Petit interrupteur on/off accessible (role="switch"). */
function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

/** Icône de réglages dans le header : ouvre un dialog de réglages d'affichage. */
export function HomeCalendarToggle() {
  const visible = useCalendarVisible();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Réglages d'affichage"
        aria-label="Réglages d'affichage"
        className="flex size-10 items-center justify-center rounded-full text-foreground hover:bg-muted"
      >
        <Settings className="size-5" />
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Affichage"
        description="Réglages de la page d'accueil."
      >
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">
            Afficher le calendrier des chasses
          </span>
          <Switch
            checked={visible}
            onChange={toggleVisible}
            label="Afficher le calendrier des chasses"
          />
        </label>
      </Dialog>
    </>
  );
}

/** Calendrier condensé de toutes les chasses, couleurs par cahier + légende. */
export function HomeCalendar({ battues }: { battues: GlobalBattue[] }) {
  const router = useRouter();
  const visible = useCalendarVisible();
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<string | null>(null);

  // Cahiers présents dans les battues, triés, avec une couleur stable chacun.
  const cahiers = useMemo(() => {
    const noms = new Map<string, string>();
    for (const b of battues) if (!noms.has(b.cahierId)) noms.set(b.cahierId, b.cahierNom);
    return [...noms.entries()]
      .sort((a, b) => a[1].localeCompare(b[1], "fr", { sensitivity: "base" }))
      .map(([id, nom], i) => ({ id, nom, color: PALETTE[i % PALETTE.length] }));
  }, [battues]);

  const colorById = useMemo(
    () => new Map(cahiers.map((c) => [c.id, c.color])),
    [cahiers],
  );

  // date "YYYY-MM-DD" -> battues ce jour.
  const byDate = useMemo(() => {
    const map = new Map<string, GlobalBattue[]>();
    for (const b of battues) {
      const arr = map.get(b.date) ?? [];
      arr.push(b);
      map.set(b.date, arr);
    }
    return map;
  }, [battues]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  if (!visible) return null;

  const weekdays = ["L", "M", "M", "J", "V", "S", "D"];
  const selectedBattues = selected ? (byDate.get(selected) ?? []) : [];

  return (
    <div className="rounded-[var(--radius)] border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Mois précédent"
          onClick={() => setCursor((c) => subMonths(c, 1))}
          className="flex size-8 items-center justify-center rounded-full hover:bg-muted"
        >
          <ChevronLeft className="size-5" />
        </button>
        <span className="text-sm font-bold capitalize">
          {format(cursor, "MMMM yyyy", { locale: fr })}
        </span>
        <button
          type="button"
          aria-label="Mois suivant"
          onClick={() => setCursor((c) => addMonths(c, 1))}
          className="flex size-8 items-center justify-center rounded-full hover:bg-muted"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {weekdays.map((w, i) => (
          <div
            key={i}
            className="pb-1 text-[10px] font-semibold text-muted-foreground"
          >
            {w}
          </div>
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayBattues = byDate.get(key) ?? [];
          const inMonth = isSameMonth(day, cursor);
          const isSel = selected === key;
          // Couleurs distinctes des cahiers concernés ce jour (max 3 pastilles).
          const couleurs = [
            ...new Set(dayBattues.map((b) => colorById.get(b.cahierId))),
          ].filter(Boolean) as string[];
          // Fond du jour : la couleur du cahier ; en bandes (dégradé) si
          // plusieurs cahiers ont une chasse le même jour.
          const background =
            couleurs.length === 1
              ? couleurs[0]
              : couleurs.length > 1
                ? `linear-gradient(90deg, ${couleurs
                    .map(
                      (c, i) =>
                        `${c} ${((i / couleurs.length) * 100).toFixed(1)}%, ${c} ${(((i + 1) / couleurs.length) * 100).toFixed(1)}%`,
                    )
                    .join(", ")})`
                : undefined;
          const hasBattue = dayBattues.length > 0;
          return (
            <button
              type="button"
              key={key}
              disabled={!hasBattue}
              onClick={() => {
                // Une seule chasse ce jour → lien direct ; sinon on déroule la
                // liste pour choisir le cahier.
                if (dayBattues.length === 1) {
                  router.push(
                    `/cahiers/${dayBattues[0].cahierId}/battues/${dayBattues[0].id}`,
                  );
                } else {
                  setSelected(key);
                }
              }}
              style={background ? { background } : undefined}
              className={cn(
                "flex h-9 items-center justify-center rounded-md text-xs transition-opacity",
                hasBattue
                  ? "cursor-pointer font-bold text-white hover:opacity-90"
                  : inMonth
                    ? "cursor-default text-foreground"
                    : "cursor-default text-muted-foreground/40",
                isSel ? "ring-2 ring-inset ring-primary" : "",
                isToday(day) && !isSel
                  ? "ring-1 ring-inset ring-foreground/30"
                  : "",
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {/* Détail du jour sélectionné */}
      {selected && selectedBattues.length > 0 ? (
        <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
          <p className="text-xs font-semibold text-muted-foreground capitalize">
            {format(new Date(selected), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
          {selectedBattues.map((b) => (
            <Link
              key={b.id}
              href={`/cahiers/${b.cahierId}/battues/${b.id}`}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: colorById.get(b.cahierId) }}
              />
              <span className="min-w-0 flex-1 truncate font-medium">
                {b.cahierNom}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                n° {b.numero}
              </span>
            </Link>
          ))}
        </div>
      ) : null}

      {/* Légende des cahiers */}
      {cahiers.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-3">
          {cahiers.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              <span className="max-w-[10rem] truncate">{c.nom}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 border-t border-border pt-3 text-center text-xs text-muted-foreground">
          Aucune battue programmée pour le moment.
        </p>
      )}
    </div>
  );
}
