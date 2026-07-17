-- N° lisible de battue, figé, par cahier. Ajout en 3 temps pour rétro-remplir
-- les battues existantes (numérotées par date, puis date de création).
ALTER TABLE "battues" ADD COLUMN "numero" integer;--> statement-breakpoint
WITH ranked AS (
  SELECT
    "id",
    row_number() OVER (
      PARTITION BY "cahier_id"
      ORDER BY "date" ASC, "created_at" ASC, "id" ASC
    ) AS rn
  FROM "battues"
)
UPDATE "battues" AS b
SET "numero" = r.rn
FROM ranked AS r
WHERE b."id" = r."id";--> statement-breakpoint
ALTER TABLE "battues" ALTER COLUMN "numero" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "battues" ADD CONSTRAINT "battue_numero_unique" UNIQUE("cahier_id","numero");
