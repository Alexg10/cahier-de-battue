import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { saisonCourante } from "@/features/cahiers/constants";
import { NewCahierForm } from "@/features/cahiers/new-cahier-form";

export const metadata: Metadata = { title: "Nouveau cahier" };

export default function NouveauCahierPage() {
  return (
    <>
      <PageHeader title="Nouveau cahier" backHref="/" />
      <Container>
        <Card>
          <CardContent className="pt-6">
            <NewCahierForm saisonDefaut={saisonCourante()} />
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
