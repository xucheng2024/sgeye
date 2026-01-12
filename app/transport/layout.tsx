import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transport & Time Burden",
  description:
    "Explore transport access and time burden across Singapore HDB neighbourhoods using MRT distance, station coverage, and a Transport Burden Index.",
  alternates: {
    canonical: "/transport/",
  },
  openGraph: {
    title: "Transport & Time Burden",
    description:
      "Explore transport access and time burden across Singapore HDB neighbourhoods using MRT distance, station coverage, and a Transport Burden Index.",
    url: "/transport/",
  },
};

export default function TransportLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}

