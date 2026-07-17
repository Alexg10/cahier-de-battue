import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { requireCahier } from "@/features/cahiers/guard";
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

  return (
    <>
      <PageHeader
        title={`${proprietaire.prenom} ${proprietaire.nom}`}
        backHref={`/cahiers/${cahierId}/proprietaires`}
      />
      <Container className="flex flex-col gap-4">
        <Card>
          <CardContent className="pt-6">
            <ProprietaireForm
              cahierId={cahierId}
              proprietaire={proprietaire}
            />
          </CardContent>
        </Card>

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
