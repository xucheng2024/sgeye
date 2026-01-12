'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, TrendingUp, Clock, Home } from 'lucide-react'

export default function GlobalNav() {
  const pathname = usePathname()
  const [isHouseMenuOpen, setIsHouseMenuOpen] = useState(false)

  const isOverviewActive = pathname === '/'
  const isTransportActive = pathname.startsWith('/transport')
  const isFamilyActive = pathname.startsWith('/family')
  const isHouseActive = pathname.startsWith('/hdb')

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
            <Link href="/" className="text-sm text-gray-600 hidden md:block hover:text-gray-900 transition-colors">
              Resale HDB decisions
            </Link>
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

            {/* House - Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setIsHouseMenuOpen(!isHouseMenuOpen)}
                onBlur={() => setTimeout(() => setIsHouseMenuOpen(false), 200)}
                className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isHouseActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>House</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isHouseMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isHouseMenuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 min-w-[180px] z-50">
                  <Link
                    href="/hdb/"
                    onClick={() => setIsHouseMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                      pathname === '/hdb' || pathname === '/hdb/'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Trends</span>
                  </Link>
                  <Link
                    href="/hdb/lease-price/"
                    onClick={() => setIsHouseMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                      pathname === '/hdb/lease-price' || pathname === '/hdb/lease-price/'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Lease</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Transport */}
            <Link
              href="/transport/"
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
              href="/family/psle-school/"
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
