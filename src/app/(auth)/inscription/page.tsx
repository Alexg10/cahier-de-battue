import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import { SignUpForm } from "@/features/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Créer un cahier de battue gratuit",
  description:
    "Créez gratuitement le cahier de battue de votre société de chasse : participants, pointage, tableau de chasse et partage du gibier sur téléphone.",
  alternates: { canonical: "/inscription" },
};

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  const session = await auth();
  if (session?.user?.id) redirect("/");
  // E-mail saisi sur la vitrine (formulaire GET vers /inscription).
  const { email } = await searchParams;
  const defaultEmail = typeof email === "string" ? email : undefined;

  return (
    <Card>
      <CardContent className="pt-6">
        <SignUpForm defaultEmail={defaultEmail} />
      </CardContent>
    </Card>
  );
}
