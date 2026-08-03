import { auth } from "@/auth";
import { assertBattueOwned } from "@/features/battues/owner";
import { applyPush } from "@/features/offline/apply";
import { battueSnapshot } from "@/features/offline/snapshot";
import type { SyncPushBody } from "@/features/offline/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ battueId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Non autorisé", { status: 401 });
  const { battueId } = await params;
  const cahierId = await assertBattueOwned(battueId, session.user.id);
  if (!cahierId) return new Response("Introuvable", { status: 404 });

  const snapshot = await battueSnapshot(cahierId, battueId);
  if (!snapshot) return new Response("Introuvable", { status: 404 });
  return Response.json(snapshot);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ battueId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Non autorisé", { status: 401 });
  const { battueId } = await params;
  const cahierId = await assertBattueOwned(battueId, session.user.id);
  if (!cahierId) return new Response("Introuvable", { status: 404 });

  let body: SyncPushBody;
  try {
    body = (await req.json()) as SyncPushBody;
  } catch {
    return new Response("Corps invalide", { status: 400 });
  }
  body.pointages ??= [];
  body.inviteParticipations ??= [];
  body.prelevements ??= [];
  body.participants ??= [];
  body.distributions ??= [];

  await applyPush(battueId, cahierId, body);

  const snapshot = await battueSnapshot(cahierId, battueId);
  if (!snapshot) return new Response("Introuvable", { status: 404 });
  return Response.json(snapshot);
}
