import { FileSpreadsheet, Printer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { listBattues } from "@/features/battues/queries";
import { requireCahier } from "@/features/cahiers/guard";
import { formatDateShort } from "@/lib/format";

export const metadata: Metadata = { title: "Exports" };

export default async function ExportPage({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}) {
  const { cahierId } = await params;
  const { cahier } = await requireCahier(cahierId);
  const battues = await listBattues(cahierId);

  return (
    <>
      <PageHeader title="Exports" backHref={`/cahiers/${cahierId}`} />
      <Container className="flex flex-col gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Toute la saison</CardTitle>
            <p className="text-sm text-muted-foreground">
              Participants, battues et tableau de chasse ({cahier.saison}).
            </p>
          </CardHeader>
          <CardContent>
            <Button
              render={<a href={`/api/cahiers/${cahierId}/export`} />}
              block
            >
              <FileSpreadsheet />
              Télécharger le classeur Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liste des participants</CardTitle>
            <p className="text-sm text-muted-foreground">
              Toutes les infos (téléphone, permis, validation, assurance).
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                render={
                  <Link href={`/cahiers/${cahierId}/participants/impression`} />
                }
              >
                <Printer />
                PDF
              </Button>
              <Button
                variant="secondary"
                render={
                  <a href={`/api/cahiers/${cahierId}/participants/export`} />
                }
              >
                <FileSpreadsheet />
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liste des propriétaires</CardTitle>
            <p className="text-sm text-muted-foreground">
              Nom, prénom et téléphone des propriétaires fonciers.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                render={
                  <Link href={`/cahiers/${cahierId}/proprietaires/impression`} />
                }
              >
                <Printer />
                PDF
              </Button>
              <Button
                variant="secondary"
                render={
                  <a href={`/api/cahiers/${cahierId}/proprietaires/export`} />
                }
              >
                <FileSpreadsheet />
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-2 text-base font-bold">Par journée</h2>
          {battues.length === 0 ? (
            <Card className="p-5 text-center text-sm text-muted-foreground">
              Aucune battue à exporter.
            </Card>
          ) : (
            <ul className="flex flex-col gap-2">
              {battues.map((b) => (
                <li
                  key={b.id}
                  className="rounded-[var(--radius)] border border-border bg-card p-3"
                >
                  <p className="mb-2 font-semibold capitalize">
                    {formatDateShort(b.date)}
                    {b.lieu ? (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        · {b.lieu}
                      </span>
                    ) : null}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      render={
                        <Link
                          href={`/cahiers/${cahierId}/battues/${b.id}/impression`}
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
                        <a
                          href={`/api/cahiers/${cahierId}/battues/${b.id}/export`}
                        />
                      }
                    >
                      <FileSpreadsheet />
                      Excel
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </>
  );
}
