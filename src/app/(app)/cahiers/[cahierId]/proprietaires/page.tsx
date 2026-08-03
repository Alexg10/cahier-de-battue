import {
  ChevronRight,
  FileSpreadsheet,
  Printer,
  UserPlus,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { requireCahier } from "@/features/cahiers/guard";
import { listFilleulsByProprietaire } from "@/features/invites/queries";
import { listProprietaires } from "@/features/proprietaires/queries";

export const metadata: Metadata = { title: "Propriétaires" };

export default async function ProprietairesPage({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}) {
  const { cahierId } = await params;
  await requireCahier(cahierId);
  const [proprietaires, filleulsByProp] = await Promise.all([
    listProprietaires(cahierId),
    listFilleulsByProprietaire(cahierId),
  ]);

  return (
    <>
      <PageHeader title="Propriétaires" backHref={`/cahiers/${cahierId}`} />
      <Container className="flex flex-col gap-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold">
              Propriétaires ({proprietaires.length})
            </h2>
            {proprietaires.length > 0 ? (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  render={
                    <Link
                      href={`/cahiers/${cahierId}/proprietaires/impression`}
                    />
                  }
                >
                  <Printer />
                  PDF
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  render={
                    <a href={`/api/cahiers/${cahierId}/proprietaires/export`} />
                  }
                >
                  <FileSpreadsheet />
                  Excel
                </Button>
              </div>
            ) : null}
          </div>

          <Button
            render={
              <Link href={`/cahiers/${cahierId}/proprietaires/nouveau`} />
            }
            block
            className="mb-3"
          >
            <UserPlus />
            Ajouter un propriétaire
          </Button>

          {proprietaires.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              Aucun propriétaire pour l&apos;instant.
            </Card>
          ) : (
            <ul className="flex flex-col gap-2">
              {proprietaires.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/cahiers/${cahierId}/proprietaires/${p.id}`}
                    className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-3 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {p.nom.toUpperCase()} {p.prenom}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {p.participantId ? (
                          <Badge variant="muted">Chasseur</Badge>
                        ) : null}
                        {p.telephone ? (
                          <span className="text-sm text-muted-foreground">
                            {p.telephone}
                          </span>
                        ) : null}
                      </div>
                      {p.referentNom ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Référent :
                          </span>{" "}
                          {p.referentNom.toUpperCase()} {p.referentPrenom}
                        </p>
                      ) : null}
                      {(filleulsByProp[p.id]?.invites ?? []).length > 0 ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Invités :
                          </span>{" "}
                          {(filleulsByProp[p.id]?.invites ?? [])
                            .map((i) => `${i.nom.toUpperCase()} ${i.prenom}`)
                            .join(" · ")}
                        </p>
                      ) : null}
                      {(filleulsByProp[p.id]?.participants ?? []).length > 0 ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Personnes invitées :
                          </span>{" "}
                          {(filleulsByProp[p.id]?.participants ?? [])
                            .map((i) => `${i.nom.toUpperCase()} ${i.prenom}`)
                            .join(" · ")}
                        </p>
                      ) : null}
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </>
  );
}
