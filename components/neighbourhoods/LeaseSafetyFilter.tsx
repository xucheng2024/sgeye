/**
 * Lease Safety Filter Component
 */

import Link from 'next/link'
import { Info, ArrowRight } from 'lucide-react'

interface LeaseSafetyFilterProps {
  leaseTiers: Set<string>
  onLeaseTiersChange: (tiers: Set<string>) => void
}

const LEASE_TIERS = [
  { tier: 'low', label: 'Short', title: '< 60 years remaining lease', selectedColor: 'bg-red-600 text-white border-red-600', hoverColor: 'hover:border-red-400 hover:bg-red-50' },
  { tier: 'medium', label: 'Typical', title: '60-69 years remaining lease', selectedColor: 'bg-yellow-600 text-white border-yellow-600', hoverColor: 'hover:border-yellow-400 hover:bg-yellow-50' },
  { tier: 'high', label: 'Safe', title: '≥ 70 years remaining lease', selectedColor: 'bg-green-600 text-white border-green-600', hoverColor: 'hover:border-green-400 hover:bg-green-50' }
] as const

export function LeaseSafetyFilter({ leaseTiers, onLeaseTiersChange }: LeaseSafetyFilterProps) {
  const hasSelection = leaseTiers.size > 0
  return (
    <div className="shrink-0">
      <div className="flex items-center gap-1 mb-1.5">
        <label className="block text-xs font-semibold text-gray-700">
          Lease safety
        </label>
        <div className="relative group">
          <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
          <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <p className="mb-2">Why lease safety matters?</p>
            <p className="mb-2 text-gray-300">Shorter leases may face resale and financing constraints.</p>
            <Link
              href="/hdb/lease-price"
              className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              Understand lease decay and long-term risk
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => {
            onLeaseTiersChange(new Set())
          }}
          className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
            !hasSelection
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          All
        </button>
        {LEASE_TIERS.map(({ tier, label, title, selectedColor, hoverColor }) => {
          const isSelected = leaseTiers.has(tier)
          return (
            <button
              key={tier}
              onClick={() => {
                const newSet = new Set(leaseTiers)
                if (isSelected) {
                  newSet.delete(tier)
                } else {
                  newSet.add(tier)
                }
                onLeaseTiersChange(newSet)
              }}
              className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                isSelected
                  ? selectedColor
                  : `bg-white text-gray-700 border-gray-300 ${hoverColor}`
              }`}
              title={title}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

