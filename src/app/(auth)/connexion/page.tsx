import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre cahier de battue.",
  alternates: { canonical: "/connexion" },
  // Page utilitaire : suivie (liens) mais pas proposée dans les résultats.
  robots: { index: false, follow: true },
};

export default async function ConnexionPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/");

  return (
    <Card>
      <CardContent className="pt-6">
        <LoginForm />
      </CardContent>
    </Card>
  );
}
