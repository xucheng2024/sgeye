import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lease Depreciation Analysis",
  description:
    "Island-wide analysis of how remaining lease affects HDB resale prices and price-per-sqm, based on recent transactions.",
  alternates: {
    canonical: "/hdb/lease-price/",
  },
  openGraph: {
    title: "Lease Depreciation Analysis",
    description:
      "Island-wide analysis of how remaining lease affects HDB resale prices and price-per-sqm, based on recent transactions.",
    url: "/hdb/lease-price/",
  },
};

export default function LeasePriceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}

