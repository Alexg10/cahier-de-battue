import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegister } from "@/components/sw-register";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Cahier de battue",
    template: "%s · Cahier de battue",
  },
  description:
    "Le cahier de battue numérique : participants, pointage, prélèvements. Utilisable hors réseau.",
  applicationName: "Cahier de battue",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cahier de battue",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2f6b3a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
