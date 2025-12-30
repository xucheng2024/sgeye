'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { TrendingUp, Map, Clock, Calculator, GraduationCap, Heart, Train, ChevronDown, Users, GitCompare, Star } from 'lucide-react'

export default function GlobalNav() {
  const pathname = usePathname()
  const [housingOpen, setHousingOpen] = useState(false)
  const [familyOpen, setFamilyOpen] = useState(false)
  const [futureOpen, setFutureOpen] = useState(false)

  // Housing sub-items: Buy / Rent / Risk
  const buyRentRiskItems = [
    { href: '/hdb', label: 'Market Trends', icon: TrendingUp },
    { href: '/hdb/heatmap', label: 'Prices by Town', icon: Map },
    { href: '/hdb/lease-price', label: 'Lease & Long-term Risk', icon: Clock },
    { href: '/hdb/compare-towns', label: 'Compare Towns', icon: GitCompare, recommended: true },
  ]

  // Family with Children items
  const familyItems = [
    { href: '/family/psle-school', label: 'PSLE & School Location', icon: GraduationCap },
    { href: '#', label: 'Childcare', icon: Users, disabled: true },
    { href: '#', label: 'Secondary', icon: GraduationCap, disabled: true },
  ]

  const isHousingActive = pathname.startsWith('/hdb')
  const isFamilyActive = pathname.startsWith('/family')
  const isOverviewActive = pathname === '/'

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo/Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">Singapore Data Eye</span>
            </Link>
            <span className="text-gray-300 hidden md:block">|</span>
            <span className="text-sm text-gray-600 hidden md:block">Living in Singapore</span>
          </div>

          {/* Right: Navigation Items */}
          <div className="flex items-center gap-1">
            {/* Overview */}
            <Link
              href="/"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isOverviewActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Overview
            </Link>

            {/* Housing Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setHousingOpen(true)}
              onMouseLeave={() => setHousingOpen(false)}
            >
              <button
                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isHousingActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Housing
                <ChevronDown className={`w-4 h-4 transition-transform ${housingOpen ? 'rotate-180' : ''}`} />
              </button>
              {housingOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  {/* Affordability - First (entry point) */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <Link
                      href="/hdb/affordability"
                      className={`flex items-center gap-3 px-2 py-2 text-sm transition-colors rounded ${
                        pathname === '/hdb/affordability'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Calculator className="w-4 h-4" />
                      Affordability
                    </Link>
                  </div>
                  {/* Buy / Rent / Risk Section */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Analysis & Comparison
                    </div>
                    {buyRentRiskItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center justify-between px-2 py-2 text-sm transition-colors rounded ${
                            isActive
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {item.recommended ? (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                            {item.label}
                          </div>
                          {('badge' in item) && (item as any).badge && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                              {(item as any).badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Family with Children Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setFamilyOpen(true)}
              onMouseLeave={() => setFamilyOpen(false)}
            >
              <button
                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isFamilyActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Family with Children
                <ChevronDown className={`w-4 h-4 transition-transform ${familyOpen ? 'rotate-180' : ''}`} />
              </button>
              {familyOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  {familyItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href && !item.disabled
                    if (item.disabled) {
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400"
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                          <span className="text-xs ml-auto">(Coming later)</span>
                        </div>
                      )
                    }
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* More: Transport / Healthcare */}
            <div
              className="relative"
              onMouseEnter={() => setFutureOpen(true)}
              onMouseLeave={() => setFutureOpen(false)}
            >
              <button
                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/hdb/transport'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                More
                <ChevronDown className={`w-4 h-4 transition-transform ${futureOpen ? 'rotate-180' : ''}`} />
              </button>
              {futureOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <Link
                    href="/hdb/transport"
                    className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      pathname === '/hdb/transport'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Train className="w-4 h-4" />
                    Transport
                  </Link>
                  <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400">
                    <Heart className="w-4 h-4" />
                    Healthcare <span className="text-xs ml-auto">(Coming later)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
