import type { Yonalish } from "@/lib/yonalishlar";

const PATHS: Record<Yonalish["icon"], React.ReactNode> = {
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
    </>
  ),
  sigma: <path d="M17 5H7l6 7-6 7h10M17 5v2M17 17v2" />,
  book: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z" />
      <path d="M4 19a2 2 0 0 1 2-2h13" />
    </>
  ),
  seedling: (
    <>
      <path d="M12 21v-8" />
      <path d="M12 13c0-4-3-7-8-7 0 4 3 7 8 7zM12 11c0-3.5 2.5-6 7-6 0 3.5-2.5 6-7 6z" />
    </>
  ),
  // Heartbeat inside a flask silhouette — medicine track (kimyo-biologiya).
  pulse: (
    <>
      <path d="M10 3v5L4.9 17a2 2 0 0 0 1.8 3h10.6a2 2 0 0 0 1.8-3L14 8V3" />
      <path d="M8.5 3h7M6.5 14h2l1.5-2.5 2 4 1.5-2.5h4" />
    </>
  ),
  // Calculator + orbit — matematika-ingliz pairing.
  calcglobe: (
    <>
      <rect x="3" y="3" width="11" height="18" rx="2" />
      <path d="M6 7h5M6.5 11h.01M9 11h.01M11.5 11h.01M6.5 14.5h.01M9 14.5h.01M11.5 14.5h.01M6.5 18h5" />
      <circle cx="18.5" cy="8" r="3.5" />
      <path d="M15 8h7M18.5 4.5c1.2 2.3 1.2 4.7 0 7" />
    </>
  ),
};

export default function YonalishIcon({
  icon,
  className,
}: {
  icon: Yonalish["icon"];
  className?: string;
}) {
  return (
    <svg
      className={className}
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[icon]}
    </svg>
  );
}
