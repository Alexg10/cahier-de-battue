import { ChevronRight, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { requireCahier } from "@/features/cahiers/guard";
import { listCahierInvites } from "@/features/invites/queries";

export const metadata: Metadata = { title: "Invités" };

export default async function InvitesPage({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}) {
  const { cahierId } = await params;
  await requireCahier(cahierId);
  const invites = await listCahierInvites(cahierId);

  return (
    <>
      <PageHeader title="Invités" backHref={`/cahiers/${cahierId}`} />
      <Container className="flex flex-col gap-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h2 className="text-base font-bold">Invités ({invites.length})</h2>
        </div>

        <Button
          render={<Link href={`/cahiers/${cahierId}/invites/nouveau`} />}
          block
        >
          <UserPlus />
          Ajouter un invité
        </Button>

        {invites.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            Aucun invité pour l&apos;instant. Les invités sont réutilisables sur
            toutes les battues.
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {invites.map((i) => (
              <li key={i.id}>
                <Link
                  href={`/cahiers/${cahierId}/invites/${i.id}`}
                  className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-3 transition-colors hover:bg-accent"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {i.nom.toUpperCase()} {i.prenom}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {i.parrainPrenom ? (
                        <Badge variant="muted">
                          Invité par {i.parrainNom?.toUpperCase()}{" "}
                          {i.parrainPrenom}
                        </Badge>
                      ) : (
                        <Badge variant="muted">Parrain supprimé</Badge>
                      )}
                      {i.numPermis ? <span>Permis {i.numPermis}</span> : null}
                    </div>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
