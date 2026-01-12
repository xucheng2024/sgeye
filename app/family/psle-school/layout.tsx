import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PSLE & School Pressure by Planning Area",
  description:
    "Compare PSLE-related school pressure across Singapore planning areas and see how it relates to housing trade-offs.",
  alternates: {
    canonical: "/family/psle-school/",
  },
  openGraph: {
    title: "PSLE & School Pressure by Planning Area",
    description:
      "Compare PSLE-related school pressure across Singapore planning areas and see how it relates to housing trade-offs.",
    url: "/family/psle-school/",
  },
};

export default function PsleSchoolLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}

