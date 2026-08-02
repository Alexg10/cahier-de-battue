import {
  CalendarDays,
  ChevronRight,
  Coins,
  Download,
  Drumstick,
  Home,
  Map,
  Settings,
  Target,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Calendar } from "@/features/battues/calendar";
import { listBattues } from "@/features/battues/queries";
import { saisonSuivante } from "@/features/cahiers/constants";
import { NouvelleSaisonButton } from "@/features/cahiers/nouvelle-saison-button";
import { getCahier, saisonRecap } from "@/features/cahiers/queries";
import { formatEuro } from "@/lib/format";
import { requireUser } from "@/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}): Promise<Metadata> {
  const user = await requireUser();
  const { cahierId } = await params;
  const cahier = await getCahier(cahierId, user.id);
  return { title: cahier?.nom ?? "Cahier" };
}

const tuiles = [
  {
    href: "battues",
    icon: CalendarDays,
    titre: "Battues",
    desc: "Journées de chasse et pointage",
  },
  {
    href: "participants",
    icon: Users,
    titre: "Participants & bureau",
    desc: "Participants et rôles du bureau",
  },
  {
    href: "proprietaires",
    icon: Home,
    titre: "Propriétaires",
    desc: "Propriétaires fonciers",
  },
  {
    href: "plan",
    icon: Map,
    titre: "Plan du territoire",
    desc: "Cartes et plans (JPG, PDF)",
  },
  {
    href: "export",
    icon: Download,
    titre: "Exports",
    desc: "PDF et Excel de la saison",
  },
  {
    href: "reglages",
    icon: Settings,
    titre: "Réglages",
    desc: "Nom, territoire, espèces",
  },
];

export default async function CahierHubPage({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}) {
  const user = await requireUser();
  const { cahierId } = await params;
  const cahier = await getCahier(cahierId, user.id);
  if (!cahier) notFound();

  const [battues, recap] = await Promise.all([
    listBattues(cahierId),
    saisonRecap(cahierId),
  ]);
  const saisonCible = saisonSuivante(cahier.saison);

  return (
    <>
      <PageHeader
        title={cahier.nom}
        subtitle={[cahier.territoire, `Saison ${cahier.saison}`]
          .filter(Boolean)
          .join(" · ")}
        backHref="/"
      />
      <Container className="flex flex-col gap-5">
        {/* Calendrier en tête */}
        <Calendar cahierId={cahierId} battues={battues} />

        {/* Récap de la saison */}
        <Card>
          <CardHeader>
            <CardTitle>Récap de la saison {cahier.saison}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat
                icon={<CalendarDays className="size-5" />}
                value={recap.battuesCount}
                label={recap.battuesCount > 1 ? "battues" : "battue"}
              />
              <Stat
                icon={<Users className="size-5" />}
                value={recap.participantsCount}
                label="participants"
              />
              <Stat
                icon={<Target className="size-5" />}
                value={recap.prelevementsTotal}
                label={recap.prelevementsTotal > 1 ? "prélevés" : "prélevé"}
              />
            </div>

            {recap.cotisationTotal > 0 ? (
              <Link
                href={`/cahiers/${cahierId}/cotisations`}
                className="flex items-center justify-between gap-2 rounded-[var(--radius)] bg-accent px-4 py-3 text-accent-foreground transition-colors hover:bg-accent/80"
              >
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Coins className="size-5" />
                  Cotisations récoltées
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="text-lg font-extrabold">
                    {formatEuro(recap.cotisationTotal)}
                  </span>
                  <ChevronRight className="size-5" />
                </span>
              </Link>
            ) : null}

            <Link
              href={`/cahiers/${cahierId}/distribution`}
              className="flex items-center justify-between gap-2 rounded-[var(--radius)] border border-border px-4 py-3 transition-colors hover:bg-accent"
            >
              <span className="inline-flex items-center gap-2 font-semibold">
                <Drumstick className="size-5" />
                Distribution du gibier
              </span>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>

            {recap.parEspece.length > 0 ? (
              <div>
                <p className="mb-2 text-sm font-semibold">
                  Tableau de chasse
                </p>
                <ul className="flex flex-col gap-1.5">
                  {recap.parEspece.map((e) => (
                    <li
                      key={e.espece}
                      className="flex items-center justify-between border-b border-border pb-1.5 text-sm last:border-0"
                    >
                      <span>{e.espece}</span>
                      <Badge variant="default">{e.n}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun prélèvement enregistré cette saison.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Liens */}
        {tuiles.map((t) => (
          <Link key={t.href} href={`/cahiers/${cahierId}/${t.href}`}>
            <Card className="flex items-center gap-4 p-4 transition-colors hover:bg-accent">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <t.icon className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold">{t.titre}</p>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
            </Card>
          </Link>
        ))}

        {/* Reconduction du cahier sur la saison suivante */}
        {saisonCible ? (
          <NouvelleSaisonButton
            cahierId={cahierId}
            saisonCible={saisonCible}
            block
          />
        ) : null}
      </Container>
    </>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-[var(--radius)] bg-muted p-3">
      <span className="text-accent-foreground">{icon}</span>
      <span className="text-2xl font-extrabold leading-none">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
