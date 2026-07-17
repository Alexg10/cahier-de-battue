CREATE TYPE "public"."bureau_role" AS ENUM('PRESIDENT', 'TRESORIER', 'SECRETAIRE');--> statement-breakpoint
CREATE TYPE "public"."poste_role" AS ENUM('POSTE', 'TRAQUEUR');--> statement-breakpoint
CREATE TYPE "public"."sexe" AS ENUM('MALE', 'FEMELLE', 'INDETERMINE');--> statement-breakpoint
CREATE TABLE "battues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cahier_id" uuid NOT NULL,
	"date" date NOT NULL,
	"lieu" text,
	"heure_debut" time,
	"heure_fin" time,
	"responsable_id" uuid,
	"especes_jour" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"signature_delegant" text,
	"signature_delegue" text,
	"cloturee" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "bureau_membres" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cahier_id" uuid NOT NULL,
	"role" "bureau_role" NOT NULL,
	"participant_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "bureau_role_unique" UNIQUE("cahier_id","role")
);
--> statement-breakpoint
CREATE TABLE "cahiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"nom" text NOT NULL,
	"territoire" text DEFAULT '' NOT NULL,
	"saison" text NOT NULL,
	"especes" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battue_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"nom" text NOT NULL,
	"prenom" text NOT NULL,
	"num_permis" text,
	"num_validation" text,
	"num_assurance" text,
	"role" "poste_role" DEFAULT 'POSTE' NOT NULL,
	"signature" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cahier_id" uuid NOT NULL,
	"nom" text NOT NULL,
	"prenom" text NOT NULL,
	"telephone" text,
	"num_assurance" text,
	"num_validation" text,
	"est_chasseur" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pointages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battue_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"role" "poste_role" DEFAULT 'POSTE' NOT NULL,
	"signature" text,
	"signed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "pointage_unique" UNIQUE("battue_id","participant_id")
);
--> statement-breakpoint
CREATE TABLE "prelevements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battue_id" uuid NOT NULL,
	"espece" text NOT NULL,
	"num_bracelet" text,
	"age" text,
	"sexe" "sexe",
	"poids" numeric(6, 2),
	"tireur_participant_id" uuid,
	"tireur_invite_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "battues" ADD CONSTRAINT "battues_cahier_id_cahiers_id_fk" FOREIGN KEY ("cahier_id") REFERENCES "public"."cahiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battues" ADD CONSTRAINT "battues_responsable_id_participants_id_fk" FOREIGN KEY ("responsable_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bureau_membres" ADD CONSTRAINT "bureau_membres_cahier_id_cahiers_id_fk" FOREIGN KEY ("cahier_id") REFERENCES "public"."cahiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bureau_membres" ADD CONSTRAINT "bureau_membres_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cahiers" ADD CONSTRAINT "cahiers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_battue_id_battues_id_fk" FOREIGN KEY ("battue_id") REFERENCES "public"."battues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_cahier_id_cahiers_id_fk" FOREIGN KEY ("cahier_id") REFERENCES "public"."cahiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pointages" ADD CONSTRAINT "pointages_battue_id_battues_id_fk" FOREIGN KEY ("battue_id") REFERENCES "public"."battues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pointages" ADD CONSTRAINT "pointages_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prelevements" ADD CONSTRAINT "prelevements_battue_id_battues_id_fk" FOREIGN KEY ("battue_id") REFERENCES "public"."battues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prelevements" ADD CONSTRAINT "prelevements_tireur_participant_id_participants_id_fk" FOREIGN KEY ("tireur_participant_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prelevements" ADD CONSTRAINT "prelevements_tireur_invite_id_invites_id_fk" FOREIGN KEY ("tireur_invite_id") REFERENCES "public"."invites"("id") ON DELETE set null ON UPDATE no action;