import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { PAGES } from "@/lib/seo";

/* Les pages publiques de lib/seo.ts, et elles seules. */
export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(PAGES).map(({ path }) => ({
    url: `${SITE.url}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : path === "/rendez-vous" ? 0.9 : 0.7,
  }));
}
