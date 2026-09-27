"use client";

import dynamic from "next/dynamic";

// The chat widget is not needed for first paint — load it lazily so it
// never weighs on the initial bundle / LCP.
const AiChat = dynamic(() => import("@/components/AiChat"), { ssr: false });

export default function LazyAiChat() {
  return <AiChat />;
}
