import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HGF Valkampanj | Hyresgästföreningen",
    template: "%s | HGF Valkampanj",
  },
  description: "Hyresgästföreningens valkampanjsida. Engagera dig i bostadspolitiken och gör din röst hörd.",
  keywords: [
    "Hyresgästföreningen",
    "HGF",
    "valkampanj",
    "val 2026",
    "bostadspolitik",
    "hyresrätt",
    "bostad",
    "hyresgäst",
    "bostadsfrågor",
    "politisk påverkan"
  ],
  authors: [{ name: "Hyresgästföreningen" }],
  creator: "Hyresgästföreningen",
  publisher: "Hyresgästföreningen",
  metadataBase: new URL("https://hgf-valkampanj.se"),
  alternates: {
    canonical: "https://hgf-valkampanj.se",
  },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: "https://hgf-valkampanj.se",
    siteName: "HGF Valkampanj",
    title: "HGF Valkampanj | Hyresgästföreningen",
    description: "Hyresgästföreningens valkampanjsida. Engagera dig i bostadspolitiken och gör din röst hörd.",
    images: [
      {
        url: "/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HGF Valkampanj - Hyresgästföreningen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HGF Valkampanj | Hyresgästföreningen",
    description: "Hyresgästföreningens valkampanjsida. Engagera dig i bostadspolitiken och gör din röst hörd.",
    images: ["/assets/og-image.jpg"],
    creator: "@hyaboratt",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "politics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
