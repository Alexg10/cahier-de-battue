"use client";

import { useRef } from "react";
import { Select } from "@/components/ui/select";
import { setBureauRole } from "./actions";
import type { Participant } from "./queries";

const ROLES = [
  { value: "PRESIDENT", label: "Président" },
  { value: "TRESORIER", label: "Trésorier" },
  { value: "SECRETAIRE", label: "Secrétaire" },
] as const;

export function BureauEditor({
  cahierId,
  participants,
  current,
}: {
  cahierId: string;
  participants: Participant[];
  /** role → participantId */
  current: Record<string, string | undefined>;
}) {
  return (
    <div className="flex flex-col gap-3">
      {ROLES.map((role) => (
        <RoleRow
          key={role.value}
          cahierId={cahierId}
          role={role.value}
          label={role.label}
          participants={participants}
          value={current[role.value] ?? ""}
        />
      ))}
    </div>
  );
}

function RoleRow({
  cahierId,
  role,
  label,
  participants,
  value,
}: {
  cahierId: string;
  role: string;
  label: string;
  participants: Participant[];
  value: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={setBureauRole} className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" htmlFor={`bureau-${role}`}>
        {label}
      </label>
      <input type="hidden" name="cahierId" value={cahierId} />
      <input type="hidden" name="role" value={role} />
      <Select
        id={`bureau-${role}`}
        name="participantId"
        defaultValue={value}
        onChange={() => formRef.current?.requestSubmit()}
      >
        <option value="">— Non attribué —</option>
        {participants.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nom.toUpperCase()} {p.prenom}
          </option>
        ))}
      </Select>
    </form>
  );
}
