import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cahier de battue",
    short_name: "Battue",
    description:
      "Le cahier de battue numérique : participants, pointage, prélèvements.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f6f3",
    theme_color: "#2f6b3a",
    lang: "fr",
    orientation: "portrait",
    icons: [
      {
        src: "/api/icon?size=192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/api/icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/api/icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
