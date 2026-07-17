import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { deleteCahier } from "@/features/cahiers/actions";
import { requireCahier } from "@/features/cahiers/guard";
import { ReglagesForm } from "@/features/cahiers/reglages-form";

export const metadata: Metadata = { title: "Réglages" };

export default async function ReglagesPage({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}) {
  const { cahierId } = await params;
  const { cahier } = await requireCahier(cahierId);

  return (
    <>
      <PageHeader title="Réglages" backHref={`/cahiers/${cahierId}`} />
      <Container className="flex flex-col gap-4">
        <Card>
          <CardContent className="pt-6">
            <ReglagesForm
              cahier={{
                id: cahier.id,
                nom: cahier.nom,
                territoire: cahier.territoire,
                saison: cahier.saison,
                especes: cahier.especes,
                reglesSecurite: cahier.reglesSecurite,
                cotisationChasse: cahier.cotisationChasse,
                cotisationChiens: cahier.cotisationChiens,
                morceaux: cahier.morceaux,
              }}
            />
          </CardContent>
        </Card>

        <ConfirmDelete
          action={deleteCahier}
          block
          label="Supprimer ce cahier de battue"
          confirmLabel="Supprimer définitivement"
        >
          <input type="hidden" name="id" value={cahier.id} />
        </ConfirmDelete>
      </Container>
    </>
  );
}
