import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sgeye.vercel.app'
  
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
      priority: 1,
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
      priority: 0.8,
    },
    {
      url: withTrailingSlash(`${baseUrl}/transport`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: withTrailingSlash(`${baseUrl}/family/psle-school`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: withTrailingSlash(`${baseUrl}/hdb`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: withTrailingSlash(`${baseUrl}/hdb/lease-price`),
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

  return [...staticPages, ...guidePages]
}
