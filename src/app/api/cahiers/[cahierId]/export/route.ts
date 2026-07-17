import { auth } from "@/auth";
import {
  saisonBattues,
  saisonPointageCotisations,
  saisonPrelevements,
} from "@/features/export/queries";
import { buildSaisonWorkbook } from "@/features/export/xlsx";
import { getCahier } from "@/features/cahiers/queries";
import { listParticipants } from "@/features/participants/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cahierId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Non autorisé", { status: 401 });
  }
  const { cahierId } = await params;
  const cahier = await getCahier(cahierId, session.user.id);
  if (!cahier) return new Response("Introuvable", { status: 404 });

  const [participants, battues, prelevements, cotisationRows] =
    await Promise.all([
      listParticipants(cahierId),
      saisonBattues(cahierId),
      saisonPrelevements(cahierId),
      saisonPointageCotisations(cahierId),
    ]);

  // Total récolté par battue = drapeaux cochés × montants du cahier.
  const cotChasse = Number(cahier.cotisationChasse);
  const cotChiens = Number(cahier.cotisationChiens);
  const totalParBattue = new Map<string, number>();
  for (const r of cotisationRows) {
    const montant =
      (r.cotisationChasse ? cotChasse : 0) +
      (r.cotisationChiens ? cotChiens : 0);
    totalParBattue.set(
      r.battueId,
      (totalParBattue.get(r.battueId) ?? 0) + montant,
    );
  }
  const battuesAvecCotis = battues.map((b) => ({
    ...b,
    cotisationTotal: totalParBattue.get(b.id) ?? 0,
  }));

  const buffer = await buildSaisonWorkbook(
    cahier,
    participants,
    battuesAvecCotis,
    prelevements,
  );

  const saison = cahier.saison.replace(/\//g, "-");
  const filename = `cahier-battue-${saison}.xlsx`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
