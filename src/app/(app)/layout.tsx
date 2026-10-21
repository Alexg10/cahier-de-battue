import type { Metadata } from "next";
import { requireUser } from "@/lib/session";

// Espace privé (cahiers des sociétés) : jamais indexé.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return <div className="flex flex-1 flex-col">{children}</div>;
}
