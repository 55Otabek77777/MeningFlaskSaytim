import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import AOSInit from "@/components/AOSInit";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LazyAiChat from "@/components/LazyAiChat";
import MobileStickyBar from "@/components/MobileStickyBar";
import ScrollProgress from "@/components/ScrollProgress";
import ThemeProvider from "@/components/ThemeProvider";
import { experienceYears, FOUNDED_YEAR, SITE_NAME, SITE_URL } from "@/lib/site";
import { YONALISHLAR } from "@/lib/yonalishlar";

// Inter fully covers Uzbek Latin (incl. the U+2019 apostrophe used site-wide).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

// Computed at build/module load so the year never goes stale in metadata.
const YEARS = experienceYears();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Mirzo Ulug’bek xususiy maktabi — Uchko’prik, Farg’ona | ${YEARS} yillik tajriba`,
    template: `%s — ${SITE_NAME}`,
  },
  description: `«Mirzo Ulug’bek» xususiy maktabi — Uchko’prik tumani, Farg’ona viloyatidagi ${YEARS} yillik xususiy ta’lim maskani. 45+ o’qituvchi, 1560+ sertifikat, IELTS 8.0. Qabul 1-avgustdan.`,
  // Google Search Console / Yandex Webmaster tasdiqlash public/ dagi HTML
  // fayllar orqali bajarilgan (google…html, yandex_…html).
  alternates: {
    canonical: "./",
    languages: {
      uz: "./",
    },
  },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    siteName: SITE_NAME,
    url: SITE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

const GOOGLE_MAPS_CID = "https://maps.google.com/?cid=18054142510786065278";
const GOOGLE_MAPS_SHORT = "https://maps.app.goo.gl/n7HcCtnK3KU1ZUWh9";
const WIKIDATA_URL = "https://www.wikidata.org/wiki/Q140421588";
const MIRZO_LINK_URL = "https://mirzolink.com";

const ORG_ID = `${SITE_URL}/#organization`;

const schoolJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "@id": ORG_ID,
  name: SITE_NAME,
  alternateName: "«ULUGBEK PERFECT EDU» Nodavlat ta’lim muassasasi",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/og-image.png`,
  description: `${YEARS}+ yillik tajribaga ega xususiy maktab: 45+ o’qituvchi, 1560+ sertifikat, IELTS 8.0. Kimyo-biologiya (tibbiyot), ingliz tili va aniq fanlar yo’nalishlari.`,
  foundingDate: String(FOUNDED_YEAR),
  founder: {
    "@type": "Person",
    name: "Jabborov A’zamjon Mashrabovich",
  },
  telephone: ["+998974173777", "+998945953777"],
  email: "mirzoulugbekxususiymaktabi@gmail.com",
  areaServed: ["Uchko’prik tumani", "Farg’ona viloyati"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Nihol MFY, Qayrog’och qishlog’i, 45-uy",
    addressLocality: "Uchko’prik tumani",
    addressRegion: "Farg’ona viloyati",
    addressCountry: "UZ",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 40.6182794,
    longitude: 70.9805234,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "07:00",
    closes: "21:30",
  },
  // Google Business rating shown on-page (Testimonials "4.9 ★ (41+ sharh)").
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "41",
    bestRating: "5",
  },
  makesOffer: {
    "@type": "Offer",
    name: "2026–2027 o’quv yiliga qabul",
    availability: "https://schema.org/InStock",
    validFrom: "2026-08-01",
    url: `${SITE_URL}/qabul`,
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Yo’nalishlar",
    itemListElement: YONALISHLAR.map((y) => ({
      "@type": "Course",
      name: y.title,
      description: y.short,
      url: `${SITE_URL}/yonalishlar/${y.slug}`,
      provider: { "@id": ORG_ID },
    })),
  },
  hasMap: GOOGLE_MAPS_CID,
  sameAs: [
    "https://t.me/ulugbek_rm",
    "https://www.instagram.com/mirzoulugbekmaktabi",
    "https://www.youtube.com/@ulugbek_xm",
    GOOGLE_MAPS_SHORT,
    GOOGLE_MAPS_CID,
    WIKIDATA_URL,
    MIRZO_LINK_URL,
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "uz",
  publisher: { "@id": ORG_ID },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={`${inter.variable} pb-14 antialiased md:pb-0`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schoolJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ThemeProvider>
          <ScrollProgress />
          <AOSInit />
          <Header />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
          <MobileStickyBar />
          <LazyAiChat />
        </ThemeProvider>
      </body>
    </html>
  );
}
