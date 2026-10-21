import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Seul le site vitrine est indexable ; l'espace connecté et l'API ne le sont pas. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cahiers/", "/api/", "/hors-ligne"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
