/**
 * Unified Compare Neighbourhoods CTA Component
 * Light UI component for sub-pages to redirect users back to Compare Neighbourhoods
 */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface CompareTownsCTAProps {
  text: string
}

export default function CompareTownsCTA({ text }: CompareTownsCTAProps) {
  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="bg-gray-50 rounded-lg p-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">🧭</span>
          <p className="text-sm font-medium text-gray-700">Ready to decide?</p>
        </div>
        <Link
          href="/hdb/compare-towns"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {text}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

