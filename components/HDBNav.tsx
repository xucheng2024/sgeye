'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, Map, Clock, Calculator, Home, Train } from 'lucide-react'

const navItems = [
  { href: '/hdb', label: 'Trends', icon: TrendingUp },
  { href: '/hdb/heatmap', label: 'Heatmap', icon: Map },
  { href: '/hdb/lease-price', label: 'Lease Analysis', icon: Clock },
  { href: '/hdb/affordability', label: 'Affordability', icon: Calculator },
  { href: '/hdb/transport', label: 'Transport', icon: Train },
]

export default function HDBNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-lg font-semibold text-gray-900">HDB Resale</span>
          </div>
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

