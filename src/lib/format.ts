import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const euroFmt = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

/** 15 -> "15,00 €". */
export function formatEuro(montant: number) {
  return euroFmt.format(montant);
}

/** "2025/2026" -> "2526" (2 chiffres par année). */
export function saisonCourte(saison: string) {
  const m = saison.match(/(\d{4})\D+(\d{4})/);
  if (!m) return saison.replace(/\D/g, "");
  return `${m[1].slice(2)}${m[2].slice(2)}`;
}

/** Référence lisible d'une battue, ex. 6 + "2025/2026" -> "6-2526". */
export function refBattue(numero: number, saison: string) {
  return `${numero}-${saisonCourte(saison)}`;
}

/** "2025-11-15" -> "samedi 15 novembre 2025". */
export function formatDateLong(dateStr: string) {
  return format(parseISO(dateStr), "EEEE d MMMM yyyy", { locale: fr });
}

/** "2025-11-15" -> "sam. 15 nov.". */
export function formatDateShort(dateStr: string) {
  return format(parseISO(dateStr), "EEE d MMM", { locale: fr });
}

/** "08:00:00" ou "08:00" -> "08h00". */
export function formatHeure(time: string | null | undefined) {
  if (!time) return null;
  return time.slice(0, 5).replace(":", "h");
}

/** Plage horaire "08h00 – 12h30" ou null. */
export function formatPlage(
  debut: string | null | undefined,
  fin: string | null | undefined,
) {
  const d = formatHeure(debut);
  const f = formatHeure(fin);
  if (d && f) return `${d} – ${f}`;
  return d ?? f ?? null;
}
