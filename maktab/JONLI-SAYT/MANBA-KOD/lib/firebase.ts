/**
 * Firebase client initialization (Firestore Lite, REST-based).
 * Used both in Server Components (news fetching) and the API route
 * (admission writes). Only `public_*` collections are ever touched —
 * see ALLOWED_COLLECTIONS guard below.
 */
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

/** The only collections this codebase is allowed to access. */
export const ALLOWED_COLLECTIONS = [
  "public_news",
  "public_admissions",
  "public_certificates",
  "public_settings",
  "public_ai_usage",
  "public_news_rewritten",
  "public_unanswered_questions",
] as const;

export type AllowedCollection = (typeof ALLOWED_COLLECTIONS)[number];

/** Runtime guard: every collection reference must go through this. */
export function assertPublicCollection(name: string): AllowedCollection {
  if (!(ALLOWED_COLLECTIONS as readonly string[]).includes(name)) {
    throw new Error(
      `Collection "${name}" is not allowed. Only public_* collections may be used.`
    );
  }
  return name as AllowedCollection;
}

function getFirebaseApp(): FirebaseApp {
  const existing = getApps();
  if (existing.length > 0) {
    return existing[0];
  }
  return initializeApp(firebaseConfig);
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}
