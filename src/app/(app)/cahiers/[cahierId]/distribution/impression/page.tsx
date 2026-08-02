import { FileSpreadsheet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireCahier } from "@/features/cahiers/guard";
import { DistributionTable } from "@/features/distribution/distribution-table";
import { saisonDistributionMatrix } from "@/features/distribution/queries";
import { PrintButton } from "@/features/export/print-button";

export const metadata: Metadata = { title: "Distribution — impression" };

export default async function DistributionImpressionPage({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}) {
  const { cahierId } = await params;
  const { cahier } = await requireCahier(cahierId);
  const data = await saisonDistributionMatrix(cahierId);

  return (
    <div className="mx-auto w-full max-w-5xl bg-white px-5 py-6 text-black print:max-w-none print:px-0">
      <style>{"@media print { @page { size: landscape; } }"}</style>

      <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
        <Link
          href={`/cahiers/${cahierId}/distribution`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Retour
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            render={<a href={`/api/cahiers/${cahierId}/distribution/export`} />}
          >
            <FileSpreadsheet />
            Excel
          </Button>
          <PrintButton />
        </div>
      </div>

      <header className="mb-4 border-b-2 border-black pb-3">
        <h1 className="text-xl font-bold">Distribution du gibier</h1>
        <p className="text-sm">
          {cahier.nom}
          {cahier.territoire ? ` — ${cahier.territoire}` : ""} · Saison{" "}
          {cahier.saison}
        </p>
        {data.morceaux.length > 0 ? (
          <p className="text-xs text-gray-600">
            Légende :{" "}
            {data.morceaux.map((m, i) => (
              <span key={m.code}>
                {i > 0 ? " · " : ""}
                {m.code} = {m.label}
              </span>
            ))}
            {" · "}gigot tireur (gT) attribué d&apos;office au tireur de chaque
            animal.
          </p>
        ) : null}
      </header>

      <div className="overflow-x-auto">
        <DistributionTable data={data} print />
      </div>
    </div>
  );
}
