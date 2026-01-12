import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neighbourhood Profile",
  description:
    "Neighbourhood-level profile for Singapore HDB: prices, lease safety, transport access, and living notes.",
};

export default function NeighbourhoodLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}

