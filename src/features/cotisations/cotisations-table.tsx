import { Crosshair, Dog } from "lucide-react";
import { formatEuro, refBattue } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CotisationsMatrix } from "./queries";

/** Sous-colonnes d'une battue : cotisation chasse puis chiens. */
const SOUS_COLONNES = [
  { key: "chasse", label: "Chasse", Icon: Crosshair },
  { key: "chiens", label: "Chiens", Icon: Dog },
] as const;

/** Contenu d'une sous-case : montant si versé, ✓ si versé sans montant, X sinon. */
function cellLabel(verse: boolean, montant: number) {
  if (!verse) return "X";
  return montant > 0 ? `${montant.toLocaleString("fr-FR")} €` : "✓";
}

/**
 * Tableau récapitulatif des cotisations : participants (lignes) × battues
 * (colonnes, chacune découpée en chasse / chiens). Partagé entre la vue écran
 * et la version imprimable.
 */
export function CotisationsTable({
  data,
  print = false,
}: {
  data: CotisationsMatrix;
  print?: boolean;
}) {
  const border = print ? "border-gray-300" : "border-border";
  // Colonne des noms figée au scroll horizontal : fond opaque pour masquer
  // les cases qui défilent dessous.
  const sticky = cn(
    "sticky left-0 z-10 border-r pr-3 pl-3",
    print ? "bg-white" : "bg-card",
    border,
  );
  const montants = { chasse: data.montantChasse, chiens: data.montantChiens };

  // Totaux par battue et par type de cotisation (ligne de pied).
  const totaux: Record<string, { chasse: number; chiens: number }> = {};
  for (const b of data.battues) {
    totaux[b.id] = { chasse: 0, chiens: 0 };
    for (const l of data.lignes) {
      const cell = l.cells[b.id];
      if (cell.chasse) totaux[b.id].chasse += data.montantChasse;
      if (cell.chiens) totaux[b.id].chiens += data.montantChiens;
    }
  }

  return (
    <table
      className={cn(
        "w-full border-collapse",
        print ? "text-xs" : "text-sm",
      )}
    >
      <thead>
        <tr className="text-left">
          <th rowSpan={2} className={cn(sticky, "py-1 align-bottom")}>
            Participant
          </th>
          {data.battues.map((b) => (
            <th
              key={b.id}
              colSpan={2}
              className={cn("border-l px-2 py-1 text-center whitespace-nowrap", border)}
            >
              n° {refBattue(b.numero, data.saison)}
            </th>
          ))}
          <th rowSpan={2} className="px-3 py-1.5 text-right whitespace-nowrap align-bottom">
            Total
          </th>
        </tr>
        <tr className={cn("border-b", print ? "border-black" : border)}>
          {data.battues.map((b) =>
            SOUS_COLONNES.map(({ key, label, Icon }, i) => (
              <th
                key={`${b.id}-${key}`}
                className={cn("px-2 pb-1", i === 0 && cn("border-l", border))}
              >
                <Icon className="mx-auto size-3.5" aria-label={label} />
              </th>
            )),
          )}
        </tr>
      </thead>
      <tbody>
        {data.lignes.length === 0 ? (
          <tr>
            <td colSpan={data.battues.length * 2 + 2} className="py-2 text-gray-500">
              Aucun participant.
            </td>
          </tr>
        ) : (
          data.lignes.map((l) => (
            <tr key={l.id} className={cn("border-b", border)}>
              <td className={cn(sticky, "py-1.5 font-semibold whitespace-nowrap")}>
                {l.nom.toUpperCase()} {l.prenom}
              </td>
              {data.battues.map((b) => {
                const cell = l.cells[b.id];
                return SOUS_COLONNES.map(({ key }, i) => (
                  <td
                    key={`${b.id}-${key}`}
                    className={cn(
                      "px-3 py-1.5 text-center whitespace-nowrap",
                      i === 0 && cn("border-l", border),
                      !cell[key] && "text-destructive print:text-inherit",
                    )}
                  >
                    {cellLabel(cell[key], montants[key])}
                  </td>
                ));
              })}
              <td className="px-3 py-1.5 text-right font-semibold whitespace-nowrap">
                {formatEuro(l.total)}
              </td>
            </tr>
          ))
        )}
      </tbody>
      <tfoot>
        <tr className={cn("border-t-2 font-bold", print ? "border-black" : border)}>
          <td className={cn(sticky, "py-1.5")}>Total récolté</td>
          {data.battues.map((b) =>
            SOUS_COLONNES.map(({ key }, i) => (
              <td
                key={`${b.id}-${key}`}
                className={cn(
                  "px-3 py-1.5 text-center whitespace-nowrap",
                  i === 0 && cn("border-l", border),
                )}
              >
                {formatEuro(totaux[b.id][key])}
              </td>
            )),
          )}
          <td className="px-3 py-1.5 text-right whitespace-nowrap">
            {formatEuro(data.totalGeneral)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
