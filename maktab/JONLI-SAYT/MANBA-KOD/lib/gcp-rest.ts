import "server-only";

import crypto from "node:crypto";

/**
 * Pure-fetch Google Cloud clients (Firestore + Storage REST) authenticated
 * with a service-account JWT. No native modules (firebase-admin / sharp), so
 * these run reliably in the Vercel serverless runtime where those packages
 * fail to load. Credentials come from FIREBASE_SERVICE_ACCOUNT_B64.
 */

interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

const SCOPES =
  "https://www.googleapis.com/auth/datastore " +
  "https://www.googleapis.com/auth/devstorage.read_write";

function serviceAccount(): ServiceAccount {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64 ?? "";
  if (b64.length === 0) throw new Error("FIREBASE_SERVICE_ACCOUNT_B64 not set");
  return JSON.parse(Buffer.from(b64, "base64").toString("utf-8")) as ServiceAccount;
}

export function certBucket(): string {
  return process.env.FIREBASE_CERT_BUCKET ?? "ulugbek-perfect-edu-7b4fa-certs";
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

let cachedToken: { token: string; exp: number } | null = null;

async function accessToken(): Promise<string> {
  if (cachedToken !== null && cachedToken.exp > Date.now() + 60_000) {
    return cachedToken.token;
  }
  const sa = serviceAccount();
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPES,
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  );
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(`${header}.${claim}`)
    .sign(sa.private_key);
  const jwt = `${header}.${claim}.${b64url(signature)}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:
      "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=" + jwt,
  });
  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error("token exchange failed");
  cachedToken = {
    token: data.access_token,
    exp: Date.now() + ((data.expires_in ?? 3600) - 120) * 1000,
  };
  return cachedToken.token;
}

// ===== Firestore field (de)serialization =====

type FsValue = Record<string, unknown>;

export type FieldValue = string | number | boolean | null;

function toFsValue(v: FieldValue): FsValue {
  if (v === null) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (Number.isInteger(v)) return { integerValue: String(v) };
  return { doubleValue: v };
}

function fromFsValue(v: FsValue): FieldValue {
  if ("nullValue" in v) return null;
  if ("booleanValue" in v) return v.booleanValue as boolean;
  if ("stringValue" in v) return v.stringValue as string;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue as number;
  if ("timestampValue" in v) return v.timestampValue as string;
  return null;
}

function docBase(): string {
  return `https://firestore.googleapis.com/v1/projects/${serviceAccount().project_id}/databases/(default)/documents`;
}

export interface FsDoc {
  id: string;
  data: Record<string, FieldValue>;
}

function parseDoc(doc: { name: string; fields?: Record<string, FsValue> }): FsDoc {
  const id = doc.name.split("/").pop() ?? "";
  const data: Record<string, FieldValue> = {};
  for (const [k, v] of Object.entries(doc.fields ?? {})) data[k] = fromFsValue(v);
  return { id, data };
}

/** List every document in a collection (paginated). */
export async function fsList(collection: string): Promise<FsDoc[]> {
  const token = await accessToken();
  const out: FsDoc[] = [];
  let pageToken: string | undefined;
  do {
    const url =
      `${docBase()}/${collection}?pageSize=300` +
      (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "");
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`fsList ${res.status}`);
    const data = (await res.json()) as {
      documents?: Array<{ name: string; fields?: Record<string, FsValue> }>;
      nextPageToken?: string;
    };
    (data.documents ?? []).forEach((d) => out.push(parseDoc(d)));
    pageToken = data.nextPageToken;
  } while (pageToken !== undefined);
  return out;
}

/** Add a document with an auto id. Timestamp fields: pass ISO strings. */
export async function fsAdd(
  collection: string,
  fields: Record<string, FieldValue>,
  timestamps: string[] = []
): Promise<void> {
  const token = await accessToken();
  const fsFields: Record<string, FsValue> = {};
  for (const [k, v] of Object.entries(fields)) {
    fsFields[k] =
      timestamps.includes(k) && typeof v === "string"
        ? { timestampValue: v }
        : toFsValue(v);
  }
  const res = await fetch(`${docBase()}/${collection}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: fsFields }),
  });
  if (!res.ok) throw new Error(`fsAdd ${res.status}: ${await res.text()}`);
}

/** True if any doc in `collection` has field == integer value. */
export async function fsHasInt(
  collection: string,
  field: string,
  value: number
): Promise<boolean> {
  const token = await accessToken();
  const res = await fetch(`${docBase()}:runQuery`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: {
          fieldFilter: {
            field: { fieldPath: field },
            op: "EQUAL",
            value: { integerValue: String(value) },
          },
        },
        limit: 1,
      },
    }),
  });
  if (!res.ok) return false;
  const rows = (await res.json()) as Array<{ document?: unknown }>;
  return rows.some((r) => r.document !== undefined);
}

/** Find up to `limit` docs where `field` equals a string value (equality index). */
export async function fsQueryByString(
  collection: string,
  field: string,
  value: string,
  limit = 10
): Promise<FsDoc[]> {
  const token = await accessToken();
  const res = await fetch(`${docBase()}:runQuery`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: {
          fieldFilter: {
            field: { fieldPath: field },
            op: "EQUAL",
            value: { stringValue: value },
          },
        },
        limit,
      },
    }),
  });
  if (!res.ok) return [];
  const rows = (await res.json()) as Array<{
    document?: { name: string; fields?: Record<string, FsValue> };
  }>;
  const out: FsDoc[] = [];
  for (const r of rows) {
    if (r.document !== undefined) out.push(parseDoc(r.document));
  }
  return out;
}

/** Delete a document by id. */
export async function fsDelete(collection: string, id: string): Promise<void> {
  const token = await accessToken();
  await fetch(`${docBase()}/${collection}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => undefined);
}

/**
 * Upload bytes to the certificate bucket and return the public URL.
 * predefinedAcl=publicRead makes the single object world-readable.
 */
export async function storageUpload(
  objectPath: string,
  bytes: Buffer,
  contentType: string
): Promise<string> {
  const token = await accessToken();
  const bucket = certBucket();
  const url =
    `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o` +
    `?uploadType=media&name=${encodeURIComponent(objectPath)}&predefinedAcl=publicRead`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": contentType },
    body: new Uint8Array(bytes),
  });
  if (!res.ok) throw new Error(`storageUpload ${res.status}: ${await res.text()}`);
  return `https://storage.googleapis.com/${bucket}/${objectPath}`;
}

/** Read a whole document's fields (null if missing). */
export async function fsGetDoc(
  docPath: string
): Promise<Record<string, FieldValue> | null> {
  const token = await accessToken();
  const res = await fetch(`${docBase()}/${docPath}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { fields?: Record<string, FsValue> };
  if (data.fields === undefined) return null;
  const out: Record<string, FieldValue> = {};
  for (const [k, v] of Object.entries(data.fields)) out[k] = fromFsValue(v);
  return out;
}

/**
 * Merge-write specific fields on a fixed-path document (created if missing;
 * other fields untouched, via updateMask). Pass field names in `timestamps`
 * to store ISO strings as Firestore timestamps.
 */
export async function fsSet(
  docPath: string,
  fields: Record<string, FieldValue>,
  timestamps: string[] = []
): Promise<void> {
  const token = await accessToken();
  const fsFields: Record<string, FsValue> = {};
  for (const [k, v] of Object.entries(fields)) {
    fsFields[k] =
      timestamps.includes(k) && typeof v === "string"
        ? { timestampValue: v }
        : toFsValue(v);
  }
  const mask = Object.keys(fields)
    .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join("&");
  const res = await fetch(`${docBase()}/${docPath}?${mask}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: fsFields }),
  });
  if (!res.ok) throw new Error(`fsSet ${res.status}: ${await res.text()}`);
}

/** Read a single integer field from a fixed-path document (0 if missing). */
export async function fsReadInt(docPath: string, field: string): Promise<number> {
  const token = await accessToken();
  const res = await fetch(`${docBase()}/${docPath}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return 0;
  const data = (await res.json()) as { fields?: Record<string, FsValue> };
  const v = data.fields?.[field];
  return v !== undefined ? Number(fromFsValue(v)) : 0;
}

/**
 * Atomically increment an integer field on a fixed-path document (created if
 * missing) and return the NEW value. Uses the Firestore commit transform so
 * concurrent visits never lose a count.
 */
export async function fsIncrement(
  docPath: string,
  field: string,
  by = 1
): Promise<number> {
  const token = await accessToken();
  const name = `projects/${serviceAccount().project_id}/databases/(default)/documents/${docPath}`;
  const res = await fetch(`${docBase()}:commit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      writes: [
        {
          transform: {
            document: name,
            fieldTransforms: [
              { fieldPath: field, increment: { integerValue: String(by) } },
            ],
          },
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`fsIncrement ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as {
    writeResults?: Array<{ transformResults?: FsValue[] }>;
  };
  const tr = data.writeResults?.[0]?.transformResults?.[0];
  return tr !== undefined ? Number(fromFsValue(tr)) : 0;
}

/** Delete an object from the certificate bucket (authenticated). */
export async function storageDelete(objectPath: string): Promise<void> {
  const token = await accessToken();
  const bucket = certBucket();
  await fetch(
    `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(objectPath)}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
  ).catch(() => undefined);
}

export function hasCredentials(): boolean {
  return (process.env.FIREBASE_SERVICE_ACCOUNT_B64 ?? "").length > 0;
}
