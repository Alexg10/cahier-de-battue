CREATE TABLE "proprietaires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cahier_id" uuid NOT NULL,
	"nom" text NOT NULL,
	"prenom" text NOT NULL,
	"telephone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "proprietaires" ADD CONSTRAINT "proprietaires_cahier_id_cahiers_id_fk" FOREIGN KEY ("cahier_id") REFERENCES "public"."cahiers"("id") ON DELETE cascade ON UPDATE no action;