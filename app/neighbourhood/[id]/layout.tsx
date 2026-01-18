import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 300;

function toTitleCase(str: string): string {
  return (str || "")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function getNeighbourhoodSeoData(id: string): Promise<{
  name: string | null;
  one_liner: string | null;
  planning_area_name: string | null;
  median_price_12m: number | null;
  avg_distance_to_mrt: number | null;
}> {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-key";

  if (
    !supabaseUrl ||
    supabaseUrl === "https://placeholder.supabase.co" ||
    !supabaseKey ||
    supabaseKey === "placeholder-key"
  ) {
    return {
      name: null,
      one_liner: null,
      planning_area_name: null,
      median_price_12m: null,
      avg_distance_to_mrt: null,
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("neighbourhoods")
    .select(
      `
        name,
        one_liner,
        planning_areas(id, name),
        neighbourhood_summary(median_price_12m),
        neighbourhood_access(avg_distance_to_mrt)
      `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return {
      name: null,
      one_liner: null,
      planning_area_name: null,
      median_price_12m: null,
      avg_distance_to_mrt: null,
    };
  }

  const planningArea =
    Array.isArray((data as any).planning_areas) &&
    (data as any).planning_areas.length > 0
      ? (data as any).planning_areas[0]
      : null;

  const summary =
    Array.isArray((data as any).neighbourhood_summary) &&
    (data as any).neighbourhood_summary.length > 0
      ? (data as any).neighbourhood_summary[0]
      : null;

  const access =
    Array.isArray((data as any).neighbourhood_access) &&
    (data as any).neighbourhood_access.length > 0
      ? (data as any).neighbourhood_access[0]
      : null;

  return {
    name: (data as any).name ?? null,
    one_liner: (data as any).one_liner ?? null,
    planning_area_name: planningArea?.name ?? null,
    median_price_12m: summary?.median_price_12m ?? null,
    avg_distance_to_mrt: access?.avg_distance_to_mrt ?? null,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const data = await getNeighbourhoodSeoData(id);
  // Use canonical without trailing slash to match sitemap and avoid redirects
  const canonical = `/neighbourhood/${id}`;

  const titleName = data.name ? toTitleCase(data.name) : "Neighbourhood Profile";
  const planningAreaSuffix = data.planning_area_name
    ? ` (${toTitleCase(data.planning_area_name)})`
    : "";

  const title = `${titleName} Neighbourhood – Prices, Living Comfort & Transport${planningAreaSuffix}`;

  const parts: string[] = [];
  if (data.planning_area_name) {
    parts.push(`Planning area: ${toTitleCase(data.planning_area_name)}.`);
  }
  if (typeof data.median_price_12m === "number" && data.median_price_12m > 0) {
    const priceK = Math.round(data.median_price_12m / 1000);
    parts.push(`Median resale price (12m): ~$${priceK}k.`);
  }
  if (typeof data.avg_distance_to_mrt === "number" && data.avg_distance_to_mrt > 0) {
    parts.push(`Avg MRT distance: ${Math.round(data.avg_distance_to_mrt)}m.`);
  }

  const fallback =
    data.one_liner?.trim() ||
    `Neighbourhood-level profile for ${titleName}: prices, lease safety, transport access, and living notes.`;
  const description = parts.length > 0 ? parts.join(" ") : fallback;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default function NeighbourhoodIdLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}

