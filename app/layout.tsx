import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Stoppa marknadshyror | Hyresgästföreningen",
    template: "%s | Stoppa marknadshyror",
  },
  description: "Säg nej till marknadshyror. Skriv under uppropet och engagera dig i kampen för rimliga hyror inför valet 2026.",
  keywords: [
    "stoppa marknadshyror",
    "marknadshyror",
    "Hyresgästföreningen",
    "HGF",
    "valkampanj",
    "val 2026",
    "bostadspolitik",
    "hyresrätt",
    "rimliga hyror",
    "hyresgäst",
    "bostadsfrågor"
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
    siteName: "Stoppa marknadshyror",
    title: "Stoppa marknadshyror | Hyresgästföreningen",
    description: "Säg nej till marknadshyror. Skriv under uppropet och engagera dig i kampen för rimliga hyror inför valet 2026.",
    images: [
      {
        url: "/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Stoppa marknadshyror - Hyresgästföreningen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stoppa marknadshyror | Hyresgästföreningen",
    description: "Säg nej till marknadshyror. Skriv under uppropet och engagera dig i kampen för rimliga hyror inför valet 2026.",
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
      <body className="antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
