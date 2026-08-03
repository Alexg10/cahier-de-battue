import { FileSpreadsheet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getBattue } from "@/features/battues/queries";
import { requireCahier } from "@/features/cahiers/guard";
import { getBureau } from "@/features/participants/queries";
import { listInvites } from "@/features/invites/queries";
import { listPointagesDetailed } from "@/features/pointages/queries";
import { listPrelevements } from "@/features/prelevements/queries";
import { PrintButton } from "@/features/export/print-button";
import {
  formatDateLong,
  formatEuro,
  formatPlage,
  refBattue,
} from "@/lib/format";

export const metadata: Metadata = { title: "Impression" };

const SEXE_LABEL: Record<string, string> = {
  MALE: "Mâle",
  FEMELLE: "Femelle",
  INDETERMINE: "Indéterminé",
};
const ROLE_LABEL: Record<string, string> = {
  POSTE: "Posté",
  TRAQUEUR: "Traqueur",
  ACCOMPAGNANT: "Accompagnant",
};

/** Ordre d'affichage : postés, puis traqueurs, puis accompagnants. */
const ROLE_ORDER: Record<string, number> = {
  POSTE: 0,
  TRAQUEUR: 1,
  ACCOMPAGNANT: 2,
};

function SignatureImg({ src }: { src: string | null }) {
  if (!src) return <span className="text-gray-400">—</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="signature" className="h-10 object-contain" />;
}

export default async function ImpressionPage({
  params,
}: {
  params: Promise<{ cahierId: string; battueId: string }>;
}) {
  const { cahierId, battueId } = await params;
  const { cahier } = await requireCahier(cahierId);
  const detail = await getBattue(cahierId, battueId);
  if (!detail) notFound();
  const { battue } = detail;

  const [pointages, invitesRows, prelevements, bureau] = await Promise.all([
    listPointagesDetailed(battueId),
    listInvites(battueId),
    listPrelevements(battueId),
    getBureau(cahierId),
  ]);

  const cotChasse = Number(cahier.cotisationChasse);
  const cotChiens = Number(cahier.cotisationChiens);
  // Afficher la colonne dès qu'un montant est réglé OU qu'un participant a
  // coché la cotisation (pour toujours savoir qui a participé).
  const showChasse =
    cotChasse > 0 || pointages.some((p) => p.cotisationChasse);
  const showChiens =
    cotChiens > 0 || pointages.some((p) => p.cotisationChiens);
  const hasCotisations = showChasse || showChiens;
  const totalRecolte = pointages.reduce(
    (sum, p) =>
      sum +
      (p.cotisationChasse ? cotChasse : 0) +
      (p.cotisationChiens ? cotChiens : 0),
    0,
  );

  const president = bureau.find((b) => b.role === "PRESIDENT");
  const responsableNom = detail.responsablePrenom
    ? `${detail.responsablePrenom} ${detail.responsableNom}`
    : null;
  const estDelegation =
    Boolean(battue.responsableId) &&
    Boolean(president) &&
    battue.responsableId !== president?.participantId;

  return (
    <div className="mx-auto w-full max-w-3xl bg-white px-5 py-6 text-black print:max-w-none print:px-0">
      <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
        <Link
          href={`/cahiers/${cahierId}/battues/${battueId}`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Retour
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            render={
              <a href={`/api/cahiers/${cahierId}/battues/${battueId}/export`} />
            }
          >
            <FileSpreadsheet />
            Excel
          </Button>
          <PrintButton />
        </div>
      </div>

      <header className="mb-4 border-b-2 border-black pb-3">
        <h1 className="text-xl font-bold">Cahier de battue</h1>
        <p className="text-sm">
          {cahier.nom}
          {cahier.territoire ? ` — ${cahier.territoire}` : ""} · Saison{" "}
          {cahier.saison}
        </p>
      </header>

      <section className="mb-5">
        <h2 className="mb-1 text-base font-bold capitalize">
          Battue n° {refBattue(battue.numero, cahier.saison)} — du{" "}
          {formatDateLong(battue.date)}
        </h2>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="w-40 py-0.5 font-semibold">Lieu</td>
              <td>{battue.lieu ?? "—"}</td>
            </tr>
            <tr>
              <td className="py-0.5 font-semibold">Horaires</td>
              <td>{formatPlage(battue.heureDebut, battue.heureFin) ?? "—"}</td>
            </tr>
            <tr>
              <td className="py-0.5 font-semibold">Responsable</td>
              <td>{responsableNom ?? "à désigner"}</td>
            </tr>
            <tr>
              <td className="py-0.5 font-semibold">Espèces chassées</td>
              <td>{battue.especesJour.join(", ") || "—"}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {cahier.reglesSecurite.trim() ? (
        <section className="mb-5 break-inside-avoid rounded border border-black p-3 text-sm">
          <h3 className="mb-1 font-bold">Règles & consignes de sécurité</h3>
          <p className="whitespace-pre-line leading-relaxed">
            {cahier.reglesSecurite}
          </p>
        </section>
      ) : null}

      {estDelegation && president && responsableNom ? (
        <section className="mb-5 break-inside-avoid rounded border border-black p-3 text-sm">
          <h3 className="mb-1 font-bold">Délégation de pouvoir</h3>
          <p className="leading-relaxed">
            Je soussigné {president.prenom} {president.nom}, responsable du
            territoire de chasse de {cahier.territoire || "…"}, donne délégation
            pour l&apos;organisation de la battue à {responsableNom} pour la
            saison de chasse {cahier.saison} pour la journée du{" "}
            {formatDateLong(battue.date)}. Les responsabilités inhérentes à
            l&apos;organisation de la battue
            incombent au délégué. Fait à {battue.lieu || "…"}.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold">
                Le président ({president.prenom} {president.nom})
              </p>
              <SignatureImg src={battue.signatureDelegant} />
            </div>
            <div>
              <p className="text-xs font-semibold">
                Le délégué ({responsableNom})
              </p>
              <SignatureImg src={battue.signatureDelegue} />
            </div>
          </div>
        </section>
      ) : null}

      <section className="mb-5 break-inside-avoid">
        <h3 className="mb-1 font-bold">
          Pointage des participants ({pointages.length})
        </h3>
        <p className="mb-1 text-xs italic">
          En signant, tous les signataires reconnaissent avoir pris connaissance
          des consignes de sécurité.
        </p>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-black text-left">
              <th className="py-1">Nom</th>
              <th className="py-1">Téléphone</th>
              <th className="py-1">Permis</th>
              <th className="py-1">Validation</th>
              <th className="py-1">Assurance</th>
              <th className="py-1">Rôle</th>
              {showChasse ? <th className="py-1">Chasse</th> : null}
              {showChiens ? <th className="py-1">Chiens</th> : null}
              <th className="py-1">Signature</th>
            </tr>
          </thead>
          <tbody>
            {pointages.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-2 text-gray-500">
                  Aucun pointage.
                </td>
              </tr>
            ) : (
              // Postés, puis traqueurs, puis accompagnants (tri stable).
              [...pointages]
                .sort(
                  (a, b) =>
                    (ROLE_ORDER[a.role] ?? 0) - (ROLE_ORDER[b.role] ?? 0),
                )
                .map((p) => (
                <tr key={p.participantId} className="border-b border-gray-300">
                  <td className="py-1">
                    {p.nom.toUpperCase()} {p.prenom}
                  </td>
                  <td className="py-1">{p.telephone ?? "—"}</td>
                  <td className="py-1">{p.numPermis ?? "—"}</td>
                  <td className="py-1">{p.numValidation ?? "—"}</td>
                  <td className="py-1">
                    {p.nomAssurance || p.numAssurance
                      ? [p.nomAssurance, p.numAssurance]
                          .filter(Boolean)
                          .join(" · ")
                      : "—"}
                  </td>
                  <td className="py-1">{ROLE_LABEL[p.role]}</td>
                  {showChasse ? (
                    <td className="py-1">{p.cotisationChasse ? "✓" : "X"}</td>
                  ) : null}
                  {showChiens ? (
                    <td className="py-1">{p.cotisationChiens ? "✓" : "X"}</td>
                  ) : null}
                  <td className="py-1">
                    <SignatureImg src={p.signature} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {hasCotisations ? (
          <p className="mt-2 text-sm font-bold">
            Total cotisations récoltées : {formatEuro(totalRecolte)}
            <span className="ml-2 font-normal text-gray-600">
              (chasse {formatEuro(cotChasse)} · chiens {formatEuro(cotChiens)})
            </span>
          </p>
        ) : null}
      </section>

      {invitesRows.length > 0 ? (
        <section className="mb-5 break-inside-avoid">
          <h3 className="mb-1 font-bold">Invités ({invitesRows.length})</h3>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-black text-left">
                <th className="py-1">Nom</th>
                <th className="py-1">Permis</th>
                <th className="py-1">Validation</th>
                <th className="py-1">Assurance</th>
                <th className="py-1">Poste</th>
                <th className="py-1">Invité par</th>
                <th className="py-1">Signature</th>
              </tr>
            </thead>
            <tbody>
              {invitesRows.map(({ invite, parrainPrenom, parrainNom }) => (
                <tr key={invite.id} className="border-b border-gray-300">
                  <td className="py-1">
                    {invite.nom.toUpperCase()} {invite.prenom}
                  </td>
                  <td className="py-1">{invite.numPermis ?? "—"}</td>
                  <td className="py-1">{invite.numValidation ?? "—"}</td>
                  <td className="py-1">{invite.numAssurance ?? "—"}</td>
                  <td className="py-1">{ROLE_LABEL[invite.role]}</td>
                  <td className="py-1">
                    {parrainPrenom ? `${parrainPrenom} ${parrainNom}` : "—"}
                  </td>
                  <td className="py-1">
                    <SignatureImg src={invite.signature} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <section className="break-inside-avoid">
        <h3 className="mb-1 font-bold">
          Tableau de chasse ({prelevements.length})
        </h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-black text-left">
              <th className="py-1">Espèce</th>
              <th className="py-1">Bracelet</th>
              <th className="py-1">Âge</th>
              <th className="py-1">Sexe</th>
              <th className="py-1">Poids</th>
              <th className="py-1">Tireur</th>
            </tr>
          </thead>
          <tbody>
            {prelevements.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-2 text-gray-500">
                  Aucun prélèvement.
                </td>
              </tr>
            ) : (
              prelevements.map((p) => (
                <tr key={p.id} className="border-b border-gray-300">
                  <td className="py-1">{p.espece}</td>
                  <td className="py-1">{p.numBracelet ?? "—"}</td>
                  <td className="py-1">{p.age ?? "—"}</td>
                  <td className="py-1">{p.sexe ? SEXE_LABEL[p.sexe] : "—"}</td>
                  <td className="py-1">{p.poids ? `${p.poids} kg` : "—"}</td>
                  <td className="py-1">{p.tireurNom ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
