import "server-only";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getCahier } from "./queries";

/**
 * Vérifie que l'utilisateur est connecté et propriétaire du cahier.
 * Renvoie l'utilisateur et le cahier, ou déclenche 404.
 */
export async function requireCahier(cahierId: string) {
  const user = await requireUser();
  const cahier = await getCahier(cahierId, user.id);
  if (!cahier) notFound();
  return { user, cahier };
}
