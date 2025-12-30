/**
 * Town Selector Component
 * Selects two towns and flat type for comparison
 */

'use client'

import { TOWNS, FLAT_TYPES, RECOMMENDED_PAIRS } from '../constants'

interface TownSelectorProps {
  townA: string
  townB: string
  flatType: string
  holdingPeriod: 'short' | 'medium' | 'long'
  onTownAChange: (town: string) => void
  onTownBChange: (town: string) => void
  onFlatTypeChange: (type: string) => void
  onHoldingPeriodChange: (period: 'short' | 'medium' | 'long') => void
  showQuickStart?: boolean
}

export default function TownSelector({
  townA,
  townB,
  flatType,
  holdingPeriod,
  onTownAChange,
  onTownBChange,
  onFlatTypeChange,
  onHoldingPeriodChange,
  showQuickStart = false,
}: TownSelectorProps) {
  return (
    <>
      {/* Quick Start */}
      {showQuickStart && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Start</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {RECOMMENDED_PAIRS.map((pair, index) => (
              <button
                key={index}
                onClick={() => {
                  onTownAChange(pair.townA)
                  onTownBChange(pair.townB)
                }}
                className="text-left p-3 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="font-semibold text-sm text-gray-900 mb-1">{pair.label}</div>
                <div className="text-xs text-gray-600">{pair.townA} vs {pair.townB}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* My Situation */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">My situation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Town A</label>
            <select
              value={townA}
              onChange={(e) => onTownAChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
            >
              {TOWNS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="text-center text-gray-400 font-semibold text-lg">vs</div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Town B</label>
            <select
              value={townB}
              onChange={(e) => onTownBChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
            >
              {TOWNS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Flat Type</label>
            <select
              value={flatType}
              onChange={(e) => onFlatTypeChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
            >
              {FLAT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Holding period</label>
            <select
              value={holdingPeriod}
              onChange={(e) => onHoldingPeriodChange(e.target.value as 'short' | 'medium' | 'long')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
            >
              <option value="short">&lt;5 years</option>
              <option value="medium">5–15 years</option>
              <option value="long">15+ years</option>
            </select>
          </div>
        </div>
      </div>
    </>
  )
}

