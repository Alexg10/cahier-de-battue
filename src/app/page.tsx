import type { Metadata } from "next";
import { auth } from "@/auth";
import { AccueilPage } from "@/features/cahiers/accueil-page";
import { LandingPage } from "@/features/vitrine/landing-page";

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth();
  if (session?.user?.id) return {};
  return {
    title: { absolute: "Cahier de battue — le carnet de battue numérique et gratuit" },
    description:
      "Participants, pointage signé, tableau de chasse, partage du gibier et cotisations : le cahier de battue de votre société sur téléphone, même sans réseau. Gratuit.",
  };
}

/**
 * « / » : site vitrine pour les visiteurs, liste des cahiers une fois connecté.
 * (L'accueil connecté vivait dans `(app)/page.tsx`, dont le layout redirige
 * vers /connexion : il est rendu ici pour libérer « / » aux visiteurs.)
 */
export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) return <LandingPage />;
  return (
    <div className="flex flex-1 flex-col">
      <AccueilPage />
    </div>
  );
}
