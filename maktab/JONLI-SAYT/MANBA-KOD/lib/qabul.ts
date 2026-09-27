/**
 * Admission opening moment — shared between server components (static
 * "days left" chip) and the client countdown. Kept outside any
 * "use client" module so server imports get the real value, not a
 * client-reference proxy.
 */
export const COUNTDOWN_FROM = "2026-08-01T07:00:00+05:00";
