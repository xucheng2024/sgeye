import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Data-driven guides to help you choose the right Singapore HDB neighbourhood and understand trade-offs like transport burden, school pressure, and lease risk.",
  alternates: {
    canonical: "/guides/",
  },
  openGraph: {
    title: "Guides",
    description:
      "Data-driven guides to help you choose the right Singapore HDB neighbourhood and understand trade-offs like transport burden, school pressure, and lease risk.",
    url: "/guides/",
  },
};

export default function GuidesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}

