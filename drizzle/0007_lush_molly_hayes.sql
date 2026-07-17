CREATE TYPE "public"."timbre_gg_type" AS ENUM('NATIONAL', 'DEPARTEMENTAL');--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "timbre_gg" "timbre_gg_type";--> statement-breakpoint
UPDATE "participants" SET "timbre_gg" = CASE
  WHEN "timbre_ggn" THEN 'NATIONAL'::"timbre_gg_type"
  WHEN "timbre_ggd" THEN 'DEPARTEMENTAL'::"timbre_gg_type"
  ELSE NULL
END;
