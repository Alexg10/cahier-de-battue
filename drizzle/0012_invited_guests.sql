CREATE TYPE "public"."invite_parrain" AS ENUM('PARTICIPANT', 'PROPRIETAIRE');--> statement-breakpoint
CREATE TABLE "invite_participations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battue_id" uuid NOT NULL,
	"invite_id" uuid NOT NULL,
	"role" "poste_role" DEFAULT 'POSTE' NOT NULL,
	"signature" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "invite_participation_unique" UNIQUE("battue_id","invite_id")
);
--> statement-breakpoint
INSERT INTO "invite_participations" ("id","battue_id","invite_id","role","signature","created_at","updated_at","deleted_at")
SELECT gen_random_uuid(), "battue_id", "id", "role", "signature", "created_at", "updated_at", "deleted_at" FROM "invites";--> statement-breakpoint
ALTER TABLE "invites" ADD COLUMN "cahier_id" uuid;--> statement-breakpoint
ALTER TABLE "invites" ADD COLUMN "parrain_type" "public"."invite_parrain";--> statement-breakpoint
ALTER TABLE "invites" ADD COLUMN "parrain_id" uuid;--> statement-breakpoint
UPDATE "invites" SET "cahier_id" = b."cahier_id", "parrain_type" = 'PARTICIPANT', "parrain_id" = "invites"."participant_id" FROM "battues" b WHERE b."id" = "invites"."battue_id";--> statement-breakpoint
ALTER TABLE "invites" ALTER COLUMN "cahier_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invites" ALTER COLUMN "parrain_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invites" ALTER COLUMN "parrain_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invite_participations" ADD CONSTRAINT "invite_participations_battue_id_battues_id_fk" FOREIGN KEY ("battue_id") REFERENCES "public"."battues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_participations" ADD CONSTRAINT "invite_participations_invite_id_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_cahier_id_cahiers_id_fk" FOREIGN KEY ("cahier_id") REFERENCES "public"."cahiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" DROP CONSTRAINT IF EXISTS "invites_battue_id_battues_id_fk";--> statement-breakpoint
ALTER TABLE "invites" DROP CONSTRAINT IF EXISTS "invites_participant_id_participants_id_fk";--> statement-breakpoint
ALTER TABLE "invites" DROP COLUMN "battue_id";--> statement-breakpoint
ALTER TABLE "invites" DROP COLUMN "participant_id";--> statement-breakpoint
ALTER TABLE "invites" DROP COLUMN "role";--> statement-breakpoint
ALTER TABLE "invites" DROP COLUMN "signature";
