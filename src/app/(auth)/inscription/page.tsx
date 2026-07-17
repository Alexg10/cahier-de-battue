import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import { SignUpForm } from "@/features/auth/sign-up-form";

export const metadata: Metadata = { title: "Créer un compte" };

export default async function InscriptionPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/");

  return (
    <Card>
      <CardContent className="pt-6">
        <SignUpForm />
      </CardContent>
    </Card>
  );
}
