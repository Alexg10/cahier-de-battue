import type { Metadata } from "next";
import { auth } from "@/auth";
import { AccueilPage } from "@/features/cahiers/accueil-page";
import { LandingPage } from "@/features/vitrine/landing-page";
import { SITE_DESCRIPTION } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth();
  if (session?.user?.id) return { robots: { index: false, follow: false } };
  const title = "Cahier de battue numérique gratuit | Carnet de chasse en ligne";
  const description = SITE_DESCRIPTION;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    openGraph: { title, description, url: "/" },
    twitter: { card: "summary_large_image", title, description },
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
