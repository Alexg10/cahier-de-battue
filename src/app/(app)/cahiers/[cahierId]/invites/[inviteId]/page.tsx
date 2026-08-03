import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { requireCahier } from "@/features/cahiers/guard";
import { deleteInvite } from "@/features/invites/actions";
import { InviteForm } from "@/features/invites/invite-form";
import { getCahierInvite, listParrainOptions } from "@/features/invites/queries";

export const metadata: Metadata = { title: "Modifier un invité" };

export default async function EditInvitePage({
  params,
}: {
  params: Promise<{ cahierId: string; inviteId: string }>;
}) {
  const { cahierId, inviteId } = await params;
  await requireCahier(cahierId);
  const invite = await getCahierInvite(cahierId, inviteId);
  if (!invite) notFound();
  const parrains = await listParrainOptions(cahierId);

  return (
    <>
      <PageHeader
        title={`${invite.nom.toUpperCase()} ${invite.prenom}`}
        backHref={`/cahiers/${cahierId}/invites`}
      />
      <Container className="flex flex-col gap-4">
        <Card>
          <CardContent className="pt-6">
            <InviteForm
              cahierId={cahierId}
              parrains={parrains}
              invite={{ ...invite, parrainNom: null, parrainPrenom: null }}
            />
          </CardContent>
        </Card>

        <ConfirmDelete action={deleteInvite} block label="Supprimer cet invité">
          <input type="hidden" name="cahierId" value={cahierId} />
          <input type="hidden" name="id" value={invite.id} />
        </ConfirmDelete>
      </Container>
    </>
  );
}
