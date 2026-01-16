import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sgeye.vercel.app').replace(/\/+$/, '')
  
  // Static pages (without trailing slashes to avoid redirect errors)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/neighbourhoods`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/transport`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/family/psle-school`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hdb`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hdb/lease-price`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // Guide pages
  const guidePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/guides/how-to-choose-hdb-neighbourhood`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides/why-cheap-hdb-feel-uncomfortable`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides/does-mrt-distance-really-matter`,
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
      const { data, error } = await supabase
        .from('neighbourhoods')
        .select('id')
        .order('id', { ascending: true })
        .limit(5000) // Use limit instead of range for better compatibility

      if (error) {
        console.error('Supabase query error in sitemap:', error.message)
      } else if (data && Array.isArray(data) && data.length > 0) {
        for (const row of data) {
          if (!row?.id) continue
          neighbourhoodDetailPages.push({
            url: `${baseUrl}/neighbourhood/${row.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          })
        }
      }
    }
  } catch (err) {
    // Silently fail - sitemap will still work with static pages
    // Log error in development but don't break sitemap generation
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to generate neighbourhood detail sitemap entries:', err)
    }
  }

  return [...staticPages, ...guidePages, ...neighbourhoodDetailPages]
}
