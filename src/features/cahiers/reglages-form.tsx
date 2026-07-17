"use client";

import { Plus, X } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateCahier, type FormState } from "./actions";
import type { Morceau } from "./constants";

type Cahier = {
  id: string;
  nom: string;
  territoire: string;
  saison: string;
  especes: string[];
  reglesSecurite: string;
  cotisationChasse: string;
  cotisationChiens: string;
  morceaux: Morceau[];
};

export function ReglagesForm({ cahier }: { cahier: Cahier }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateCahier,
    undefined,
  );
  const [especes, setEspeces] = useState<string[]>(cahier.especes);
  const [nouvelle, setNouvelle] = useState("");
  const [morceaux, setMorceaux] = useState<Morceau[]>(cahier.morceaux);
  const [mLabel, setMLabel] = useState("");
  const [mCode, setMCode] = useState("");

  function ajouterMorceau() {
    const label = mLabel.trim();
    const code = mCode.trim();
    if (label && code && !morceaux.some((m) => m.code === code)) {
      setMorceaux((prev) => [...prev, { label, code }]);
      setMLabel("");
      setMCode("");
    }
  }

  function ajouter() {
    const v = nouvelle.trim();
    if (v && !especes.some((e) => e.toLowerCase() === v.toLowerCase())) {
      setEspeces((prev) => [...prev, v]);
    }
    setNouvelle("");
  }

  function retirer(e: string) {
    setEspeces((prev) => prev.filter((x) => x !== e));
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={cahier.id} />
      {especes.map((e) => (
        <input key={e} type="hidden" name="especes" value={e} />
      ))}
      <input type="hidden" name="morceaux" value={JSON.stringify(morceaux)} />

      <Field label="Nom de la société de chasse" htmlFor="nom" required>
        <Input id="nom" name="nom" required defaultValue={cahier.nom} />
      </Field>
      <Field label="Territoire de chasse" htmlFor="territoire">
        <Input
          id="territoire"
          name="territoire"
          defaultValue={cahier.territoire}
        />
      </Field>
      <Field label="Saison" htmlFor="saison" required hint="Format 2025/2026.">
        <Input
          id="saison"
          name="saison"
          required
          inputMode="numeric"
          pattern="\d{4}/\d{4}"
          defaultValue={cahier.saison}
        />
      </Field>

      <Field
        label="Règles d'organisation et consignes de sécurité"
        htmlFor="reglesSecurite"
        hint="Affichées sur chaque battue, avant la signature du pointage."
      >
        <Textarea
          id="reglesSecurite"
          name="reglesSecurite"
          rows={6}
          defaultValue={cahier.reglesSecurite}
          placeholder="Ex. Port du gilet fluo obligatoire, angles de 30°, tir fichant, déchargement des armes aux déplacements…"
        />
      </Field>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Cotisations par battue</span>
        <p className="text-sm text-muted-foreground">
          Montant coché pour chaque signataire lors du pointage ; sert au total
          récolté par battue.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cotisation chasse (€)" htmlFor="cotisationChasse">
            <Input
              id="cotisationChasse"
              name="cotisationChasse"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              defaultValue={cahier.cotisationChasse}
            />
          </Field>
          <Field label="Cotisation chiens (€)" htmlFor="cotisationChiens">
            <Input
              id="cotisationChiens"
              name="cotisationChiens"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              defaultValue={cahier.cotisationChiens}
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Espèces chassables</span>
        <div className="flex flex-wrap gap-2">
          {especes.length === 0 ? (
            <span className="text-sm text-muted-foreground">
              Aucune espèce.
            </span>
          ) : (
            especes.map((e) => (
              <span
                key={e}
                className="inline-flex items-center gap-1 rounded-full bg-accent py-1 pl-3 pr-1 text-sm font-medium text-accent-foreground"
              >
                {e}
                <button
                  type="button"
                  aria-label={`Retirer ${e}`}
                  onClick={() => retirer(e)}
                  className="flex size-5 items-center justify-center rounded-full hover:bg-background/60"
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={nouvelle}
            onChange={(ev) => setNouvelle(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") {
                ev.preventDefault();
                ajouter();
              }
            }}
            placeholder="Ajouter une espèce"
          />
          <Button type="button" variant="secondary" size="icon" onClick={ajouter}>
            <Plus />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">
          Morceaux de la distribution
        </span>
        <p className="text-sm text-muted-foreground">
          Libellé + code court (utilisé dans le récap : g, e, gc…).
        </p>
        <div className="flex flex-wrap gap-2">
          {morceaux.length === 0 ? (
            <span className="text-sm text-muted-foreground">Aucun morceau.</span>
          ) : (
            morceaux.map((m) => (
              <span
                key={m.code}
                className="inline-flex items-center gap-1 rounded-full bg-accent py-1 pl-3 pr-1 text-sm font-medium text-accent-foreground"
              >
                {m.label}{" "}
                <span className="text-muted-foreground">({m.code})</span>
                <button
                  type="button"
                  aria-label={`Retirer ${m.label}`}
                  onClick={() =>
                    setMorceaux((prev) => prev.filter((x) => x.code !== m.code))
                  }
                  className="flex size-5 items-center justify-center rounded-full hover:bg-background/60"
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={mLabel}
            onChange={(ev) => setMLabel(ev.target.value)}
            placeholder="Morceau (ex. Gigot)"
            className="flex-1"
          />
          <Input
            value={mCode}
            onChange={(ev) => setMCode(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") {
                ev.preventDefault();
                ajouterMorceau();
              }
            }}
            placeholder="Code"
            className="w-24"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={ajouterMorceau}
          >
            <Plus />
          </Button>
        </div>
      </div>

      {state?.error ? (
        <p className="text-sm font-medium text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" size="lg" block disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer les réglages"}
      </Button>
    </form>
  );
}
