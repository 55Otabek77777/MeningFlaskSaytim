import "server-only";

import { cache } from "react";

import type { Certificate } from "@/lib/certificates";
import { fsList, hasCredentials } from "@/lib/gcp-rest";

/**
 * Server-side certificate fetch via the Firestore REST API (JWT auth — works
 * reliably in the serverless runtime). Cached per request; pages set
 * `revalidate` so Firestore is hit at most once per ISR window. Never throws.
 */
export const getCertificates = cache(async (): Promise<Certificate[]> => {
  if (!hasCredentials()) {
    return [];
  }
  try {
    const docs = await fsList("public_certificates");
    const list: Certificate[] = docs.map(({ id, data }) => ({
      id,
      name: typeof data.name === "string" ? data.name : "",
      subject: typeof data.subject === "string" ? data.subject : "",
      grade: typeof data.grade === "string" ? data.grade : "",
      year: typeof data.year === "string" ? data.year : "",
      imageUrl: typeof data.image_url === "string" ? data.image_url : "",
      date: typeof data.date === "string" ? data.date : null,
      sort: typeof data.sort === "number" ? data.sort : 0,
      width: typeof data.width === "number" && data.width > 0 ? data.width : 1000,
      height:
        typeof data.height === "number" && data.height > 0 ? data.height : 1400,
    }));
    list.sort((a, b) =>
      a.year !== b.year ? (a.year < b.year ? 1 : -1) : a.sort - b.sort
    );
    return list.filter((c) => c.imageUrl.length > 0);
  } catch (error) {
    console.error("[certificates-data] fetch failed:", error);
    return [];
  }
});
