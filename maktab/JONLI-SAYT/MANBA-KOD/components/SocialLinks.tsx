/**
 * "Biz bilan bog’laning" — official channel cards (mirzo-link ecosystem).
 * Brand-colored inline SVG icons, hover lift + glow, micro-animations.
 */

interface SocialCard {
  name: string;
  href: string;
  color: string;
  icon: React.ReactNode;
  external: boolean;
}

const ICON_PROPS = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true as const,
};

const CARDS: SocialCard[] = [
  {
    name: "Rasmiy bot (AI yordamchi)",
    href: "https://t.me/mirzorasmiybot?start=web",
    color: "#3b5bdb",
    external: true,
    icon: (
      <svg {...ICON_PROPS} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="7" width="16" height="12" rx="3" />
        <path d="M12 3v4M8.5 12h.01M15.5 12h.01M9 16h6" />
      </svg>
    ),
  },
  {
    name: "Telegram kanal",
    href: "https://t.me/ulugbek_rm",
    color: "#229ED9",
    external: true,
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M21.9 4.4L2.9 11.7c-1 .4-1 1.8.1 2.1l4.6 1.4 1.8 5.6c.3 1 1.6 1.2 2.2.4l2.6-3.1 4.8 3.5c.8.6 2 .2 2.2-.8l3-14.6c.2-1.1-.8-2-1.9-1.6z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/mirzoulugbekmaktabi",
    color: "#E1306C",
    external: true,
    icon: (
      <svg {...ICON_PROPS} fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@ulugbek_xm",
    color: "#FF0000",
    external: true,
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M23 7.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.3-1C16.6 3.6 12 3.6 12 3.6s-4.6 0-7.8.3c-.4.1-1.4.1-2.3 1-.7.7-.9 2.3-.9 2.3S.8 9.1.8 11v1.8c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.6.3 7.6.3s4.6 0 7.8-.3c.4-.1 1.4-.1 2.3-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8V11c0-1.9-.2-3.8-.2-3.8zM9.9 15.1V8.4l6.2 3.4-6.2 3.3z" />
      </svg>
    ),
  },
  {
    name: "Manzil (Google Maps)",
    href: "https://maps.app.goo.gl/n7HcCtnK3KU1ZUWh9",
    color: "#34A853",
    external: true,
    icon: (
      <svg {...ICON_PROPS} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    name: "Telefon",
    href: "tel:+998974173777",
    color: "#1E3A8A",
    external: false,
    icon: (
      <svg {...ICON_PROPS} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c1 .3 2 .5 3 .6a2 2 0 0 1 1.6 2z" />
      </svg>
    ),
  },
  {
    name: "Admin",
    href: "https://t.me/MirzoUlugbekMaktabi_Admin",
    color: "#229ED9",
    external: true,
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M21.9 4.4L2.9 11.7c-1 .4-1 1.8.1 2.1l4.6 1.4 1.8 5.6c.3 1 1.6 1.2 2.2.4l2.6-3.1 4.8 3.5c.8.6 2 .2 2.2-.8l3-14.6c.2-1.1-.8-2-1.9-1.6z" />
      </svg>
    ),
  },
  {
    name: "Menejer",
    href: "https://t.me/Otabek_Mashrabov",
    color: "#229ED9",
    external: true,
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M21.9 4.4L2.9 11.7c-1 .4-1 1.8.1 2.1l4.6 1.4 1.8 5.6c.3 1 1.6 1.2 2.2.4l2.6-3.1 4.8 3.5c.8.6 2 .2 2.2-.8l3-14.6c.2-1.1-.8-2-1.9-1.6z" />
      </svg>
    ),
  },
];

export default function SocialLinks() {
  return (
    <section className="bg-mist">
      <div className="mx-auto max-w-6xl px-4 py-16" data-aos="fade-up">
        <h2 className="text-center text-2xl font-bold text-ink sm:text-3xl">
          Biz bilan bog’laning
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted">
          Barcha rasmiy sahifalarimiz va aloqa kanallarimiz
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CARDS.map((card, index) => (
            <a
              key={card.name}
              href={card.href}
              target={card.external ? "_blank" : undefined}
              rel={card.external ? "noopener noreferrer" : undefined}
              data-aos="fade-up"
              data-aos-delay={(index % 4) * 100}
              className="social-card shadow-card group flex flex-col items-center gap-3 rounded-2xl border border-mist bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <span
                className="social-icon flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  color: card.color,
                  backgroundColor: `color-mix(in oklab, ${card.color} 12%, transparent)`,
                }}
              >
                {card.icon}
              </span>
              <span className="text-sm font-bold text-ink group-hover:text-brand">
                {card.name}
              </span>
            </a>
          ))}
          {/* mirzo-link — QR ekotizimi bilan bog'lovchi karta */}
          <a
            href="https://mirzolink.com"
            target="_blank"
            rel="noopener noreferrer"
            data-aos="fade-up"
            data-aos-delay="300"
            className="social-card group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-brand/40 bg-brand-soft p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-brand hover:shadow-xl"
          >
            <span className="social-icon flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
                <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
              </svg>
            </span>
            <span className="text-sm font-bold text-brand">
              Barcha havolalar bir sahifada →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
