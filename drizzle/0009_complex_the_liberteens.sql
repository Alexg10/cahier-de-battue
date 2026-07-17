CREATE TYPE "public"."distribution_recipient" AS ENUM('PARTICIPANT', 'PROPRIETAIRE', 'INVITE');--> statement-breakpoint
CREATE TABLE "distributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battue_id" uuid NOT NULL,
	"recipient_type" "distribution_recipient" NOT NULL,
	"recipient_id" uuid NOT NULL,
	"morceau" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "cahiers" ADD COLUMN "morceaux" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
-- Amorce les cahiers existants avec la liste de morceaux par défaut.
UPDATE "cahiers" SET "morceaux" = '[{"label":"Gigot","code":"g"},{"label":"Épaule","code":"e"},{"label":"Gigot+côte","code":"gc"},{"label":"Filet","code":"f"},{"label":"Côtes","code":"C"},{"label":"Rognons","code":"r"}]'::jsonb WHERE "morceaux" = '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_battue_id_battues_id_fk" FOREIGN KEY ("battue_id") REFERENCES "public"."battues"("id") ON DELETE cascade ON UPDATE no action;