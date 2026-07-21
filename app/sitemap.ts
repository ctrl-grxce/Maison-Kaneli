import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/kandylove",
    "/naftali",
    "/formations",
    "/rendez-vous",
    "/a-propos",
  ];

  return routes.map((route) => ({
    url: `${SITE.url}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : route === "/rendez-vous" ? 0.9 : 0.7,
  }));
}
