import { FileSpreadsheet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireCahier } from "@/features/cahiers/guard";
import { listProprietaires } from "@/features/proprietaires/queries";
import { PrintButton } from "@/features/export/print-button";

export const metadata: Metadata = { title: "Propriétaires — impression" };

export default async function ProprietairesImpressionPage({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}) {
  const { cahierId } = await params;
  const { cahier } = await requireCahier(cahierId);
  const proprietaires = await listProprietaires(cahierId);

  return (
    <div className="mx-auto w-full max-w-3xl bg-white px-5 py-6 text-black print:max-w-none print:px-0">
      <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
        <Link
          href={`/cahiers/${cahierId}/proprietaires`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Retour
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            render={
              <a href={`/api/cahiers/${cahierId}/proprietaires/export`} />
            }
          >
            <FileSpreadsheet />
            Excel
          </Button>
          <PrintButton />
        </div>
      </div>

      <header className="mb-4 border-b-2 border-black pb-3">
        <h1 className="text-xl font-bold">Liste des propriétaires</h1>
        <p className="text-sm">
          {cahier.nom}
          {cahier.territoire ? ` — ${cahier.territoire}` : ""} · Saison{" "}
          {cahier.saison} · {proprietaires.length} propriétaire
          {proprietaires.length > 1 ? "s" : ""}
        </p>
      </header>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="py-1">Nom</th>
            <th className="py-1">Prénom</th>
            <th className="py-1">Téléphone</th>
          </tr>
        </thead>
        <tbody>
          {proprietaires.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-2 text-gray-500">
                Aucun propriétaire.
              </td>
            </tr>
          ) : (
            proprietaires.map((p) => (
              <tr key={p.id} className="border-b border-gray-300">
                <td className="py-1">{p.nom.toUpperCase()}</td>
                <td className="py-1">{p.prenom}</td>
                <td className="py-1">{p.telephone ?? "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
