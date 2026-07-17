ALTER TABLE "cahiers" ADD COLUMN "cotisation_chasse" numeric(8, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "cahiers" ADD COLUMN "cotisation_chiens" numeric(8, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "pointages" ADD COLUMN "cotisation_chasse" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "pointages" ADD COLUMN "cotisation_chiens" boolean DEFAULT false NOT NULL;