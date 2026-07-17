import { auth } from "@/auth";
import { getCahier } from "@/features/cahiers/queries";
import { buildProprietairesWorkbook } from "@/features/export/xlsx";
import { listProprietaires } from "@/features/proprietaires/queries";

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

  const proprietaires = await listProprietaires(cahierId);
  const buffer = await buildProprietairesWorkbook(cahier, proprietaires);

  const saison = cahier.saison.replace(/\//g, "-");
  const filename = `proprietaires-${saison}.xlsx`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
