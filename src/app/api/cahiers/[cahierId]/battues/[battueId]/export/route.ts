import { auth } from "@/auth";
import { getBattue } from "@/features/battues/queries";
import { getCahier } from "@/features/cahiers/queries";
import { splitPresents } from "@/features/export/battue-presents";
import { buildBattueWorkbook } from "@/features/export/xlsx";
import { listInvites } from "@/features/invites/queries";
import { listPointagesDetailed } from "@/features/pointages/queries";
import { listPrelevements } from "@/features/prelevements/queries";
import { refBattue } from "@/lib/format";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cahierId: string; battueId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Non autorisé", { status: 401 });
  }
  const { cahierId, battueId } = await params;
  const cahier = await getCahier(cahierId, session.user.id);
  if (!cahier) return new Response("Introuvable", { status: 404 });
  const detail = await getBattue(cahierId, battueId);
  if (!detail) return new Response("Introuvable", { status: 404 });

  const [pointages, invitesRows, prelevements] = await Promise.all([
    listPointagesDetailed(battueId),
    listInvites(battueId),
    listPrelevements(battueId),
  ]);

  const buffer = await buildBattueWorkbook(
    cahier,
    {
      numero: detail.battue.numero,
      date: detail.battue.date,
      lieu: detail.battue.lieu,
      heureDebut: detail.battue.heureDebut,
      heureFin: detail.battue.heureFin,
      especesJour: detail.battue.especesJour,
      responsable: detail.responsablePrenom
        ? `${detail.responsablePrenom} ${detail.responsableNom}`
        : null,
    },
    splitPresents(pointages, invitesRows),
    prelevements.map((p) => ({
      espece: p.espece,
      numBracelet: p.numBracelet,
      age: p.age,
      sexe: p.sexe,
      poids: p.poids,
      tireur: p.tireurNom ?? "",
    })),
    {
      chasse: Number(cahier.cotisationChasse),
      chiens: Number(cahier.cotisationChiens),
    },
  );

  const ref = refBattue(detail.battue.numero, cahier.saison);
  const filename = `battue-${ref}-${detail.battue.date}.xlsx`;
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
