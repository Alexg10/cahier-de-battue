import { FileSpreadsheet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireCahier } from "@/features/cahiers/guard";
import { listParticipants } from "@/features/participants/queries";
import { PrintButton } from "@/features/export/print-button";
import type { Participant } from "@/features/participants/queries";

export const metadata: Metadata = { title: "Participants — impression" };

const VALIDATION_LABEL: Record<string, string> = {
  DEPARTEMENTALE: "Départementale",
  BI_DEPARTEMENTALE: "Bi-départementale",
  NATIONALE: "Nationale",
};

const TIMBRE_LABEL: Record<string, string> = {
  NATIONAL: "National",
  DEPARTEMENTAL: "Départemental",
};

/** "2025-11-15" -> "15/11/2025". */
const frDate = (s: string | null) => (s ? s.split("-").reverse().join("/") : "—");

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase text-gray-500">
        {label}
      </dt>
      <dd>{value || "—"}</dd>
    </div>
  );
}

function Fiche({ p }: { p: Participant }) {
  const assurance = [p.nomAssurance, p.numAssurance].filter(Boolean).join(" · ");
  return (
    <div className="mb-3 break-inside-avoid rounded border border-black p-3 text-xs">
      <p className="mb-2 border-b border-gray-300 pb-1 text-sm font-bold">
        {p.nom.toUpperCase()} {p.prenom}
        {p.type !== "CHASSEUR" ? (
          <span className="font-normal text-gray-500">
            {" "}
            — {p.type === "TRAQUEUR" ? "traqueur" : "accompagnant"}
          </span>
        ) : null}
      </p>
      <dl className="grid grid-cols-3 gap-x-4 gap-y-1.5">
        <Info label="Naissance" value={`${frDate(p.dateNaissance)}${p.lieuNaissance ? ` à ${p.lieuNaissance}` : ""}`} />
        <Info label="Téléphone" value={p.telephone} />
        <Info label="E-mail" value={p.email} />
        <div className="col-span-3">
          <Info label="Adresse" value={p.adresse} />
        </div>
        <Info label="N° permis" value={p.numPermis} />
        <Info label="Délivré le" value={frDate(p.permisDelivreLe)} />
        <Info label="Délivré à" value={p.permisDelivreA} />
        <Info label="N° validation" value={p.numValidation} />
        <Info
          label="Type validation"
          value={p.typeValidation ? VALIDATION_LABEL[p.typeValidation] : "—"}
        />
        <Info
          label="Timbre grand gibier"
          value={p.timbreGrandGibier ? TIMBRE_LABEL[p.timbreGrandGibier] : "—"}
        />
        <div className="col-span-3">
          <Info label="Assurance" value={assurance} />
        </div>
        <div className="col-span-3">
          <Info label="Adresse assurance" value={p.adresseAssurance} />
        </div>
      </dl>
    </div>
  );
}

export default async function ParticipantsImpressionPage({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}) {
  const { cahierId } = await params;
  const { cahier } = await requireCahier(cahierId);
  const participants = await listParticipants(cahierId);

  return (
    <div className="mx-auto w-full max-w-3xl bg-white px-5 py-6 text-black print:max-w-none print:px-0">
      <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
        <Link
          href={`/cahiers/${cahierId}/participants`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Retour
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            render={<a href={`/api/cahiers/${cahierId}/participants/export`} />}
          >
            <FileSpreadsheet />
            Excel
          </Button>
          <PrintButton />
        </div>
      </div>

      <header className="mb-4 border-b-2 border-black pb-3">
        <h1 className="text-xl font-bold">Liste des participants</h1>
        <p className="text-sm">
          {cahier.nom}
          {cahier.territoire ? ` — ${cahier.territoire}` : ""} · Saison{" "}
          {cahier.saison} · {participants.length} participant
          {participants.length > 1 ? "s" : ""}
        </p>
      </header>

      {participants.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun participant.</p>
      ) : (
        participants.map((p) => <Fiche key={p.id} p={p} />)
      )}
    </div>
  );
}
