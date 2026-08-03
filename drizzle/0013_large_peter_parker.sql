CREATE TYPE "public"."participant_type" AS ENUM('CHASSEUR', 'TRAQUEUR', 'ACCOMPAGNANT');--> statement-breakpoint
ALTER TYPE "public"."poste_role" ADD VALUE 'ACCOMPAGNANT';--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "type" "participant_type" DEFAULT 'CHASSEUR' NOT NULL;--> statement-breakpoint
UPDATE "participants" SET "type" = 'ACCOMPAGNANT' WHERE "est_chasseur" = false;