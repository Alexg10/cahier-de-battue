import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { requireCahier } from "@/features/cahiers/guard";
import { listParticipants } from "@/features/participants/queries";
import { ProprietaireForm } from "@/features/proprietaires/proprietaire-form";

export const metadata: Metadata = { title: "Nouveau propriétaire" };

export default async function NouveauProprietairePage({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}) {
  const { cahierId } = await params;
  await requireCahier(cahierId);

  const tous = await listParticipants(cahierId);
  // Chasseurs proposés pour pré-remplir (un chasseur peut être propriétaire).
  const chasseurs = tous
    .filter((p) => p.estChasseur)
    .map((p) => ({
      id: p.id,
      nom: p.nom,
      prenom: p.prenom,
      telephone: p.telephone,
    }));
  // Référents possibles : tous les participants.
  const referents = tous.map((p) => ({
    id: p.id,
    nom: p.nom,
    prenom: p.prenom,
  }));

  return (
    <>
      <PageHeader
        title="Nouveau propriétaire"
        backHref={`/cahiers/${cahierId}/proprietaires`}
      />
      <Container>
        <Card>
          <CardContent className="pt-6">
            <ProprietaireForm
              cahierId={cahierId}
              chasseurs={chasseurs}
              referents={referents}
            />
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
