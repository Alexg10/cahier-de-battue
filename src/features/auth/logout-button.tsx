"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "./logout";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        aria-label="Se déconnecter"
        className="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-muted-foreground hover:bg-muted"
      >
        <LogOut className="size-5" />
        <span className="hidden sm:inline">Déconnexion</span>
      </button>
    </form>
  );
}
