/**
 * MRT Distance Filter Component
 */

interface MRTDistanceFilterProps {
  mrtTier: string
  onMrtTierChange: (tier: string) => void
}

const MRT_TIERS = [
  { tier: 'all', label: 'All' },
  { tier: 'close', label: '≤500m' },
  { tier: 'medium', label: '≤1km' },
  { tier: 'far', label: '≤2km' }
] as const

export function MRTDistanceFilter({ mrtTier, onMrtTierChange }: MRTDistanceFilterProps) {
  return (
    <div className="shrink-0">
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        MRT Distance
      </label>
      <div className="flex flex-wrap gap-1.5">
        {MRT_TIERS.map(({ tier, label }) => {
          const isSelected = mrtTier === tier || (!mrtTier && tier === 'all')
          return (
            <button
              key={tier}
              onClick={() => {
                onMrtTierChange(tier)
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

