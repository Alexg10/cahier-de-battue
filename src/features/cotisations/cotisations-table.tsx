import { formatEuro, refBattue } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CotisationsMatrix } from "./queries";

/** Contenu d'une case : montant si versé, ✓ si versé sans montant, X sinon. */
function cellLabel(cell: { participe: boolean; montant: number }) {
  if (!cell.participe) return "X";
  return cell.montant > 0 ? `${cell.montant.toLocaleString("fr-FR")} €` : "✓";
}

/**
 * Tableau récapitulatif des cotisations : participants (lignes) × battues
 * (colonnes). Partagé entre la vue écran et la version imprimable.
 */
export function CotisationsTable({
  data,
  print = false,
}: {
  data: CotisationsMatrix;
  print?: boolean;
}) {
  const border = print ? "border-gray-300" : "border-border";
  return (
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr className={cn("border-b text-left", print ? "border-black" : border)}>
          <th className="sticky left-0 bg-inherit py-1 pr-2">Participant</th>
          {data.battues.map((b) => (
            <th key={b.id} className="px-2 py-1 text-center whitespace-nowrap">
              n° {refBattue(b.numero, data.saison)}
            </th>
          ))}
          <th className="px-2 py-1 text-right whitespace-nowrap">Total</th>
        </tr>
      </thead>
      <tbody>
        {data.lignes.length === 0 ? (
          <tr>
            <td colSpan={data.battues.length + 2} className="py-2 text-gray-500">
              Aucun participant.
            </td>
          </tr>
        ) : (
          data.lignes.map((l) => (
            <tr key={l.id} className={cn("border-b", border)}>
              <td className="sticky left-0 bg-inherit py-1 pr-2 font-semibold whitespace-nowrap">
                {l.nom.toUpperCase()} {l.prenom}
              </td>
              {data.battues.map((b) => {
                const cell = l.cells[b.id];
                return (
                  <td
                    key={b.id}
                    className={cn(
                      "px-2 py-1 text-center",
                      !cell.participe && "text-destructive print:text-inherit",
                    )}
                  >
                    {cellLabel(cell)}
                  </td>
                );
              })}
              <td className="px-2 py-1 text-right font-semibold whitespace-nowrap">
                {formatEuro(l.total)}
              </td>
            </tr>
          ))
        )}
      </tbody>
      <tfoot>
        <tr className={cn("border-t-2 font-bold", print ? "border-black" : border)}>
          <td className="sticky left-0 bg-inherit py-1 pr-2">Total récolté</td>
          {data.battues.map((b) => (
            <td key={b.id} className="px-2 py-1 text-center whitespace-nowrap">
              {formatEuro(data.totalParBattue[b.id] ?? 0)}
            </td>
          ))}
          <td className="px-2 py-1 text-right whitespace-nowrap">
            {formatEuro(data.totalGeneral)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
