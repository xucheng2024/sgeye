'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'

const guides = [
  {
    slug: 'how-to-choose-hdb-neighbourhood',
    title: 'How to choose a HDB neighbourhood',
    description: 'A step-by-step guide to evaluating Singapore HDB neighbourhoods based on your family\'s priorities, transport convenience, and long-term needs.',
  },
  {
    slug: 'why-cheap-hdb-feel-uncomfortable',
    title: 'How to judge living comfort beyond price',
    description: 'Understanding how to judge living comfort beyond price when buying HDB resale flats in Singapore. Learn about hidden trade-offs in lower-priced neighbourhoods.',
  },
  {
    slug: 'does-mrt-distance-really-matter',
    title: 'MRT distance vs real convenience',
    description: 'Understanding MRT distance vs real convenience when choosing HDB neighbourhoods in Singapore. Learn what factors affect daily transport convenience beyond just proximity.',
  },
]

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Guides</h1>
          </div>
          <p className="text-lg text-gray-600">
            Learn how to make better HDB decisions with data-driven insights.
          </p>
        </div>

        <div className="space-y-4">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="block bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {guide.title}
              </h2>
              <p className="text-gray-600 mb-4">{guide.description}</p>
              <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                Read guide
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
