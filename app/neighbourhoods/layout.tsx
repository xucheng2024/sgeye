import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Neighbourhoods",
  description:
    "Compare Singapore HDB neighbourhoods using data on prices, lease safety, MRT access, and living comfort.",
  alternates: {
    canonical: "/neighbourhoods/",
  },
  openGraph: {
    title: "Compare Neighbourhoods",
    description:
      "Compare Singapore HDB neighbourhoods using data on prices, lease safety, MRT access, and living comfort.",
    url: "/neighbourhoods/",
  },
};

export default function NeighbourhoodsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}

