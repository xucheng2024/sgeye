import type { Metadata } from "next";
import HDBNav from '@/components/HDBNav'

export const metadata: Metadata = {
  title: "Neighbourhood Price Trends",
  description:
    "Explore HDB resale price trends across Singapore neighbourhoods and compare recent market movements.",
  alternates: {
    canonical: "/hdb/",
  },
  openGraph: {
    title: "Neighbourhood Price Trends",
    description:
      "Explore HDB resale price trends across Singapore neighbourhoods and compare recent market movements.",
    url: "/hdb/",
  },
};

export default function HDBLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <HDBNav />
      {children}
    </>
  )
}

