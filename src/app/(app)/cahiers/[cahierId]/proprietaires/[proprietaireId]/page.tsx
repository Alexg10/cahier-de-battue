import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { requireCahier } from "@/features/cahiers/guard";
import { listFilleulsByProprietaire } from "@/features/invites/queries";
import { listParticipants } from "@/features/participants/queries";
import { deleteProprietaire } from "@/features/proprietaires/actions";
import { ProprietaireForm } from "@/features/proprietaires/proprietaire-form";
import { getProprietaire } from "@/features/proprietaires/queries";

export const metadata: Metadata = { title: "Modifier un propriétaire" };

export default async function EditProprietairePage({
  params,
}: {
  params: Promise<{ cahierId: string; proprietaireId: string }>;
}) {
  const { cahierId, proprietaireId } = await params;
  await requireCahier(cahierId);
  const proprietaire = await getProprietaire(cahierId, proprietaireId);
  if (!proprietaire) notFound();

  const tous = await listParticipants(cahierId);
  const chasseurs = tous
    .filter((p) => p.estChasseur)
    .map((p) => ({
      id: p.id,
      nom: p.nom,
      prenom: p.prenom,
      telephone: p.telephone,
    }));
  const referents = tous.map((p) => ({
    id: p.id,
    nom: p.nom,
    prenom: p.prenom,
  }));

  const filleuls = (await listFilleulsByProprietaire(cahierId))[proprietaireId];
  const invites = filleuls?.invites ?? [];
  const personnesInvitees = filleuls?.participants ?? [];

  return (
    <>
      <PageHeader
        title={`${proprietaire.nom.toUpperCase()} ${proprietaire.prenom}`}
        backHref={`/cahiers/${cahierId}/proprietaires`}
      />
      <Container className="flex flex-col gap-4">
        <Card>
          <CardContent className="pt-6">
            <ProprietaireForm
              cahierId={cahierId}
              proprietaire={proprietaire}
              chasseurs={chasseurs}
              referents={referents}
            />
          </CardContent>
        </Card>

        {invites.length > 0 || personnesInvitees.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Personnes invitées</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {invites.length > 0 ? (
                <div>
                  <p className="mb-1 text-sm font-semibold">
                    Invités ({invites.length})
                  </p>
                  <ul className="flex flex-col gap-1 text-sm">
                    {invites.map((i) => (
                      <li key={i.id}>
                        {i.nom.toUpperCase()} {i.prenom}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {personnesInvitees.length > 0 ? (
                <div>
                  <p className="mb-1 text-sm font-semibold">
                    Participants ({personnesInvitees.length})
                  </p>
                  <ul className="flex flex-col gap-1 text-sm">
                    {personnesInvitees.map((i) => (
                      <li key={i.id}>
                        {i.nom.toUpperCase()} {i.prenom}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <ConfirmDelete
          action={deleteProprietaire}
          block
          label="Supprimer ce propriétaire"
        >
          <input type="hidden" name="cahierId" value={cahierId} />
          <input type="hidden" name="id" value={proprietaire.id} />
        </ConfirmDelete>
      </Container>
    </>
  );
}
