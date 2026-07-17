import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Renvoie l'utilisateur connecté ou redirige vers la page de connexion. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion");
  }
  return session.user;
}
