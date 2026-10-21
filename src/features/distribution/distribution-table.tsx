import { refBattue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { type EspeceLegende, regrouperParts } from "./especes";
import type { DistributionMatrix, Part } from "./queries";

const TYPE_SHORT: Record<string, string> = {
  PARTICIPANT: "",
  PROPRIETAIRE: " (prop.)",
  INVITE: " (inv.)",
};

/** Pastille d'espèce : abréviation sur la couleur de l'espèce. */
export function PastilleEspece({ espece }: { espece: EspeceLegende }) {
  return (
    <span
      title={espece.nom}
      style={{ backgroundColor: espece.couleur }}
      className="inline-flex h-4 min-w-6 items-center justify-center rounded px-1 text-[10px] leading-none font-bold text-white [print-color-adjust:exact]"
    >
      {espece.abrev}
    </span>
  );
}

/** Parts d'une case : code du morceau + pastille d'espèce, regroupées (×n). */
function CelluleParts({
  parts,
  especes,
}: {
  parts: Part[] | undefined;
  especes: Map<string, EspeceLegende>;
}) {
  const groupes = regrouperParts(parts);
  if (groupes.length === 0) return <>—</>;
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
      {groupes.map(({ part, n }) => {
        const espece = part.espece ? especes.get(part.espece) : undefined;
        return (
          <span
            key={`${part.morceau ?? ""}|${part.espece ?? ""}`}
            className="inline-flex items-center gap-0.5"
          >
            {part.morceau}
            {espece ? (
              <PastilleEspece espece={espece} />
            ) : part.espece ? (
              part.espece
            ) : null}
            {n > 1 ? <span className="text-gray-500">×{n}</span> : null}
          </span>
        );
      })}
    </span>
  );
}

export function DistributionTable({
  data,
  print = false,
}: {
  data: DistributionMatrix;
  print?: boolean;
}) {
  const border = print ? "border-gray-300" : "border-border";
  const especes = new Map(data.especes.map((e) => [e.nom, e]));
  return (
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr
          className={cn("border-b text-left", print ? "border-black" : border)}
        >
          <th className="sticky left-0 bg-inherit py-1 pr-2">Bénéficiaire</th>
          {data.battues.map((b) => (
            <th key={b.id} className="px-2 py-1 text-center whitespace-nowrap">
              n° {refBattue(b.numero, data.saison)}
            </th>
          ))}
          <th className="px-2 py-1 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {data.lignes.length === 0 ? (
          <tr>
            <td
              colSpan={data.battues.length + 2}
              className="py-2 text-gray-500"
            >
              Aucune distribution.
            </td>
          </tr>
        ) : (
          data.lignes.map((l) => (
            <tr key={l.key} className={cn("border-b", border)}>
              <td className="sticky left-0 bg-inherit py-1 pr-2 font-semibold whitespace-nowrap">
                {l.nom.toUpperCase()} {l.prenom}
                <span className="font-normal text-gray-500">
                  {TYPE_SHORT[l.type]}
                </span>
              </td>
              {data.battues.map((b) => (
                <td
                  key={b.id}
                  className="px-2 py-1 text-center whitespace-nowrap"
                >
                  <CelluleParts parts={l.cells[b.id]} especes={especes} />
                </td>
              ))}
              <td className="px-2 py-1 text-right font-semibold">{l.total}</td>
            </tr>
          ))
        )}
      </tbody>
      <tfoot>
        <tr
          className={cn(
            "border-t-2 font-bold",
            print ? "border-black" : border,
          )}
        >
          <td className="sticky left-0 bg-inherit py-1 pr-2">Total morceaux</td>
          {data.battues.map((b) => (
            <td key={b.id} className="px-2 py-1 text-center">
              {data.totalParBattue[b.id] ?? 0}
            </td>
          ))}
          <td className="px-2 py-1 text-right">{data.totalGeneral}</td>
        </tr>
      </tfoot>
    </table>
  );
}
