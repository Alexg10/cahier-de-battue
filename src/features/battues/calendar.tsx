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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type BattueLite = { id: string; date: string };

export function Calendar({
  cahierId,
  battues,
}: {
  cahierId: string;
  battues: BattueLite[];
}) {
  const router = useRouter();
  const [cursor, setCursor] = useState(() => new Date());

  // date "YYYY-MM-DD" -> liste d'ids de battues ce jour.
  const byDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const b of battues) {
      const arr = map.get(b.date) ?? [];
      arr.push(b.id);
      map.set(b.date, arr);
    }
    return map;
  }, [battues]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const weekdays = ["L", "M", "M", "J", "V", "S", "D"];

  function onDayClick(day: Date) {
    const key = format(day, "yyyy-MM-dd");
    const ids = byDate.get(key);
    if (ids && ids.length > 0) {
      router.push(`/cahiers/${cahierId}/battues/${ids[0]}`);
    } else {
      router.push(`/cahiers/${cahierId}/battues/nouvelle?date=${key}`);
    }
  }

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
          const hasBattue = byDate.has(key);
          const inMonth = isSameMonth(day, cursor);
          return (
            <button
              type="button"
              key={key}
              onClick={() => onDayClick(day)}
              className={cn(
                "relative flex h-9 items-center justify-center rounded-md text-xs transition-colors",
                inMonth ? "text-foreground" : "text-muted-foreground/50",
                hasBattue
                  ? "bg-primary font-bold text-primary-foreground hover:bg-primary-hover"
                  : "hover:bg-muted",
                isToday(day) && !hasBattue
                  ? "ring-1 ring-inset ring-primary"
                  : "",
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Touchez un jour vide pour créer une battue à cette date.
      </p>
    </div>
  );
}
