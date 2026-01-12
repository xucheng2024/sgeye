import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Family",
  description:
    "Family-focused data tools for housing decisions in Singapore, including school pressure insights by planning area.",
  openGraph: {
    title: "Family",
    description:
      "Family-focused data tools for housing decisions in Singapore, including school pressure insights by planning area.",
  },
};

export default function FamilyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}

