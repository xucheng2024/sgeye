'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function GlobalNav() {
  const pathname = usePathname()

  const isOverviewActive = pathname === '/'
  const isNeighbourhoodsActive = pathname.startsWith('/neighbourhoods') || pathname.startsWith('/neighbourhood/') || pathname.startsWith('/compare')
  const isTransportActive = pathname.startsWith('/transport')
  const isFamilyActive = pathname.startsWith('/family')

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Logo/Brand */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                Singapore Data Eye
              </span>
            </Link>
            <span className="text-gray-300 hidden md:block">|</span>
            <span className="text-sm text-gray-600 hidden md:block">Living in Singapore</span>
          </div>

          {/* Right: Navigation Items */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {/* Overview */}
            <Link
              href="/"
              className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isOverviewActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Overview
            </Link>

            {/* Neighbourhoods */}
            <Link
              href="/neighbourhoods"
              className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isNeighbourhoodsActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Neighbourhoods
            </Link>

            {/* Transport */}
            <Link
              href="/transport"
              className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isTransportActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Transport
            </Link>

            {/* Family with Children */}
            <Link
              href="/family/psle-school"
              className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isFamilyActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="hidden lg:inline">Family with Children</span>
              <span className="lg:hidden">Family</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
