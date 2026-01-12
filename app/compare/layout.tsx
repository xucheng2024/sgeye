import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Neighbourhoods",
  description:
    "Compare 2–3 Singapore HDB neighbourhoods side-by-side across prices, lease safety, MRT access, and living comfort.",
  alternates: {
    canonical: "/compare/",
  },
  openGraph: {
    title: "Compare Neighbourhoods",
    description:
      "Compare 2–3 Singapore HDB neighbourhoods side-by-side across prices, lease safety, MRT access, and living comfort.",
    url: "/compare/",
  },
};

export default function CompareLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}

