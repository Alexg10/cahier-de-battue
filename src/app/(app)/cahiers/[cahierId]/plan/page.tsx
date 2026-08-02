import type { Metadata } from "next";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { requireCahier } from "@/features/cahiers/guard";
import { PlansManager } from "@/features/plans/plans-manager";
import { listPlans } from "@/features/plans/queries";

export const metadata: Metadata = { title: "Plan du territoire" };

export default async function PlanPage({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}) {
  const { cahierId } = await params;
  await requireCahier(cahierId);
  const plans = await listPlans(cahierId);

  return (
    <>
      <PageHeader
        title="Plan du territoire"
        backHref={`/cahiers/${cahierId}`}
      />
      <Container>
        <PlansManager cahierId={cahierId} plans={plans} />
      </Container>
    </>
  );
}
