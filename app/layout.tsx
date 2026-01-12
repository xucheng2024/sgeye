import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalNav from "@/components/GlobalNav";
import Analytics from "@/components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://sgeye.vercel.app"),
  title: {
    default: "Singapore Data Eye",
    template: "%s | Singapore Data Eye",
  },
  description:
    "Data-driven insights into HDB prices, transport burden, school pressure, and real housing affordability in Singapore.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "Singapore Data Eye",
    description:
      "Data-driven insights into HDB prices, transport burden, school pressure, and real housing affordability in Singapore.",
    url: "/",
    siteName: "Singapore Data Eye",
    images: [{ url: "/opengraph-image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Singapore Data Eye",
    description:
      "Data-driven insights into HDB prices, transport burden, school pressure, and real housing affordability in Singapore.",
    images: ["/twitter-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://sgeye.vercel.app").replace(/\/+$/, "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Singapore Data Eye",
        url: siteUrl,
      },
      {
        "@type": "Organization",
        name: "Singapore Data Eye",
        url: siteUrl,
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Analytics />
        <GlobalNav />
        {children}
      </body>
    </html>
  );
}
