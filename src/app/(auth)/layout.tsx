import { TreePine } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <TreePine className="size-8" />
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Cahier de battue
          </h1>
          <p className="text-sm text-muted-foreground">
            Le carnet de chasse numérique
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
