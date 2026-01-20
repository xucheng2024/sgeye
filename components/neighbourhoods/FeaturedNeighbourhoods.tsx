/**
 * Featured Neighbourhoods Component
 * Displays 8-12 high-value neighbourhoods with pure <a> links for SEO
 * Server component for better SEO and smaller client bundle
 */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface FeaturedNeighbourhood {
  id: string
  name: string
  description: string
}

// Featured neighbourhoods list (8-12 items)
// Mix of mature and non-mature estates, different price ranges, different regions
// NOTE: If your database uses different IDs, update the `id` values below.
const FEATURED_NEIGHBOURHOODS: FeaturedNeighbourhood[] = [
  { id: 'bishan-east', name: 'Bishan East', description: 'Mature estate · MRT access · Stable resale demand' },
  { id: 'clementi-west', name: 'Clementi West', description: 'Mature estate · Strong MRT connectivity · Family-oriented' },
  { id: 'queenstown', name: 'Queenstown', description: 'Mature estate · Central location · Established amenities' },
  { id: 'toa-payoh-central', name: 'Toa Payoh Central', description: 'Mature estate · Central location · Older flats' },
  { id: 'ang-mo-kio-central', name: 'Ang Mo Kio Central', description: 'Mature estate · Good connectivity · Family-friendly' },
  { id: 'bukit-batok-west', name: 'Bukit Batok West', description: 'Lower entry price · Longer MRT distance · Family-oriented' },
  { id: 'punggol-north', name: 'Punggol North', description: 'Non-mature estate · Newer flats · Growing area' },
  { id: 'sengkang-east', name: 'Sengkang East', description: 'Non-mature estate · Good transport links · Modern amenities' },
  { id: 'tampines-north', name: 'Tampines North', description: 'Non-mature estate · Affordable options · Good connectivity' },
  { id: 'woodlands-south', name: 'Woodlands South', description: 'Non-mature estate · Lower prices · Longer commute' },
]

export default function FeaturedNeighbourhoods() {
  return (
    <section className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Featured HDB Neighbourhoods
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Commonly viewed neighbourhoods based on price, transport access, and daily living comfort.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURED_NEIGHBOURHOODS.map((neighbourhood) => (
          <Link
            key={neighbourhood.id}
            href={`/neighbourhood/${neighbourhood.id}`}
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
          >
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              {neighbourhood.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {neighbourhood.description}
            </p>
            <span className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
              View neighbourhood profile
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
