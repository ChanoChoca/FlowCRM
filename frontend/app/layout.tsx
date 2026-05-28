import { ToastProvider } from "@/layout/ToastProvider";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL = "https://example.com";
const SITE_NAME = "FlowCRM";
const SITE_TAGLINE = "Agencia de marketing y conectividad en Argentina";
const SITE_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;
const SITE_DESCRIPTION =
  "Diseñamos campañas que se escuchan y conectamos hogares y empresas con planes de internet de fibra, televisión y telefonía móvil. Asesoramiento personalizado, instalación rápida y promociones exclusivas en toda Argentina.";
const OG_IMAGE = "/images/logo/logo.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Next.js",
  category: "Marketing y Telecomunicaciones",
  classification: "Agencia de marketing, conectividad y telecomunicaciones",
  keywords: [
    "FlowCRM",
    "agencia de marketing Argentina",
    "marketing digital",
    "estrategia de marca",
    "campañas publicitarias",
    "performance marketing",
    "branding",
    "diseño web",
    "asesoramiento comercial",
    "internet hogar",
    "fibra óptica",
    "planes de internet",
    "televisión por cable",
    "telefonía móvil",
    "planes combinados",
    "portabilidad de línea",
    "promociones telecomunicaciones",
    "conectividad para empresas",
    "instalación rápida",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/images/logo/logo.ico", sizes: "any" },
      { url: "/images/logo/logo.png", type: "image/png" },
    ],
    apple: [{ url: "/images/logo/logo.png", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
    creator: "@flowcrm",
    site: "@flowcrm",
  },
  alternates: {
    canonical: "/",
    languages: {
      "es-AR": "/",
      "x-default": "/",
    },
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  other: {
    "geo.region": "AR",
    "geo.placename": "Argentina",
    "geo.country": "Argentina",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/images/logo/logo.png`,
        },
        description: SITE_DESCRIPTION,
        areaServed: { "@type": "Country", name: "Argentina" },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "es-AR",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#service`,
        name: `${SITE_NAME} — ${SITE_TAGLINE}`,
        url: SITE_URL,
        image: `${SITE_URL}/images/logo/logo.png`,
        priceRange: "$$",
        areaServed: { "@type": "Country", name: "Argentina" },
        provider: { "@id": `${SITE_URL}/#organization` },
        serviceType: [
          "Marketing digital y estrategia de marca",
          "Planes de internet de fibra óptica",
          "Televisión y planes combinados",
          "Telefonía móvil y portabilidad",
          "Conectividad para empresas",
        ],
      },
    ],
  };

  return (
    <html
      lang="es-AR"
      suppressHydrationWarning
      className={`${bricolage.variable} ${geist.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-neutral-50 dark:bg-neutral-950">
        <ToastProvider>{children}</ToastProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var stored = localStorage.getItem('theme');
                if (stored === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-XXXXXXXXXX');`}
        </Script>
      </body>
    </html>
  );
}
