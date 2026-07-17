CREATE TYPE "public"."validation_type" AS ENUM('DEPARTEMENTALE', 'BI_DEPARTEMENTALE', 'NATIONALE');--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "adresse" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "date_naissance" date;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "lieu_naissance" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "permis_delivre_le" date;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "permis_delivre_a" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "type_validation" "validation_type";--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "timbre_ggn" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "timbre_ggd" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "adresse_assurance" text;