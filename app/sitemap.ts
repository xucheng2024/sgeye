import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sgeye.vercel.app').replace(/\/+$/, '')
  
  // Helper function to ensure trailing slash
  const withTrailingSlash = (path: string): string => {
    return path.endsWith('/') ? path : `${path}/`
  }
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: withTrailingSlash(baseUrl),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: withTrailingSlash(`${baseUrl}/neighbourhoods`),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: withTrailingSlash(`${baseUrl}/guides`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: withTrailingSlash(`${baseUrl}/transport`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: withTrailingSlash(`${baseUrl}/family/psle-school`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: withTrailingSlash(`${baseUrl}/hdb`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: withTrailingSlash(`${baseUrl}/hdb/lease-price`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: withTrailingSlash(`${baseUrl}/compare`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // Guide pages
  const guidePages: MetadataRoute.Sitemap = [
    {
      url: withTrailingSlash(`${baseUrl}/guides/how-to-choose-hdb-neighbourhood`),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: withTrailingSlash(`${baseUrl}/guides/why-cheap-hdb-feel-uncomfortable`),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: withTrailingSlash(`${baseUrl}/guides/does-mrt-distance-really-matter`),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ]

  // Neighbourhood detail pages (best-effort; skip if no DB credentials)
  const neighbourhoodDetailPages: MetadataRoute.Sitemap = []
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'placeholder-key'

    if (
      supabaseUrl &&
      supabaseUrl !== 'https://placeholder.supabase.co' &&
      supabaseKey &&
      supabaseKey !== 'placeholder-key'
    ) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data } = await supabase
        .from('neighbourhoods')
        .select('id')
        .order('id', { ascending: true })
        .range(0, 4999)

      if (data && data.length > 0) {
        for (const row of data as Array<{ id: string }>) {
          if (!row?.id) continue
          neighbourhoodDetailPages.push({
            url: withTrailingSlash(`${baseUrl}/neighbourhood/${row.id}`),
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          })
        }
      }
    }
  } catch (err) {
    console.error('Failed to generate neighbourhood detail sitemap entries:', err)
  }

  return [...staticPages, ...guidePages, ...neighbourhoodDetailPages]
}
