/**
 * Market Tier Filter Component (CCR/RCR/OCR)
 */

interface MarketTierFilterProps {
  regions: Set<string>
  onRegionsChange: (regions: Set<string>) => void
}

const MARKET_TIERS = ['CCR', 'RCR', 'OCR'] as const

export function MarketTierFilter({ regions, onRegionsChange }: MarketTierFilterProps) {
  const hasSelection = regions.size > 0
  return (
    <div className="shrink-0">
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        Market Tier
      </label>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onRegionsChange(new Set())}
          className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
            !hasSelection
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          All
        </button>
        {MARKET_TIERS.map((tier) => {
          const isSelected = regions.has(tier)
          const titles: Record<string, string> = {
            CCR: 'Core Central Region',
            RCR: 'Rest of Central Region',
            OCR: 'Outside Central Region'
          }
          return (
            <button
              key={tier}
              onClick={() => {
                const newSet = new Set(regions)
                if (isSelected) {
                  newSet.delete(tier)
                } else {
                  newSet.add(tier)
                }
                onRegionsChange(newSet)
              }}
              className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
              title={titles[tier]}
            >
              {tier}
            </button>
          )
        })}
      </div>
    </div>
  )
}

