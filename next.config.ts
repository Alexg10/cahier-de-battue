import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Marge au-dessus de la taille max d'un plan (10 Mo) pour couvrir
    // l'overhead multipart lors de l'upload via la route handler.
    proxyClientMaxBodySize: "12mb",
  },
};

export default nextConfig;
