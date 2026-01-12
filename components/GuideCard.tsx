import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface GuideCardProps {
  slug: string
  title: string
  description: string
  className?: string
}

export default function GuideCard({ slug, title, description, className = '' }: GuideCardProps) {
  return (
    <Link
      href={`/guides/${slug}/`}
      className={`block bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
        Read guide
        <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  )
}
