/**
 * Price Range Filter Component
 */

interface PriceRangeFilterProps {
  priceTiers: Set<string>
  onPriceTiersChange: (tiers: Set<string>) => void
}

const PRICE_TIERS = [
  { tier: 'low', label: '<$500k' },
  { tier: 'medium', label: '$500k-$1M' },
  { tier: 'high', label: '$1M-$2M' }
] as const

export function PriceRangeFilter({ priceTiers, onPriceTiersChange }: PriceRangeFilterProps) {
  const hasSelection = priceTiers.size > 0
  return (
    <div className="shrink-0">
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        Price Range
      </label>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => {
            onPriceTiersChange(new Set())
          }}
          className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
            !hasSelection
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          All
        </button>
        {PRICE_TIERS.map(({ tier, label }) => {
          const isSelected = priceTiers.has(tier)
          return (
            <button
              key={tier}
              onClick={() => {
                const newSet = new Set(priceTiers)
                if (isSelected) {
                  newSet.delete(tier)
                } else {
                  newSet.add(tier)
                }
                onPriceTiersChange(newSet)
              }}
              className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

