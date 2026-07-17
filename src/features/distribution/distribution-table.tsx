import { refBattue } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DistributionMatrix } from "./queries";

const TYPE_SHORT: Record<string, string> = {
  PARTICIPANT: "",
  PROPRIETAIRE: " (prop.)",
  INVITE: " (inv.)",
};

/** Codes d'une case, compactés : ["g","g","e"] -> "g×2 e". */
export function formatCodes(codes: string[] | undefined) {
  if (!codes || codes.length === 0) return "—";
  const counts = new Map<string, number>();
  for (const c of codes) counts.set(c, (counts.get(c) ?? 0) + 1);
  return [...counts.entries()]
    .map(([c, n]) => (n > 1 ? `${c}×${n}` : c))
    .join(" ");
}

export function DistributionTable({
  data,
  print = false,
}: {
  data: DistributionMatrix;
  print?: boolean;
}) {
  const border = print ? "border-gray-300" : "border-border";
  return (
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr className={cn("border-b text-left", print ? "border-black" : border)}>
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
            <td colSpan={data.battues.length + 2} className="py-2 text-gray-500">
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
                <td key={b.id} className="px-2 py-1 text-center whitespace-nowrap">
                  {formatCodes(l.cells[b.id])}
                </td>
              ))}
              <td className="px-2 py-1 text-right font-semibold">{l.total}</td>
            </tr>
          ))
        )}
      </tbody>
      <tfoot>
        <tr className={cn("border-t-2 font-bold", print ? "border-black" : border)}>
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
