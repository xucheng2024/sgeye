/**
 * MRT Distance Filter Component
 */

interface MRTDistanceFilterProps {
  mrtTiers: Set<string>
  onMrtTiersChange: (tiers: Set<string>) => void
}

const MRT_TIERS = [
  { tier: 'close', label: '<500m' },
  { tier: 'medium', label: '500m~1km' },
  { tier: 'far', label: '>1km' }
] as const

export function MRTDistanceFilter({ mrtTiers, onMrtTiersChange }: MRTDistanceFilterProps) {
  const hasSelection = mrtTiers.size > 0
  return (
    <div className="shrink-0">
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        MRT Distance
      </label>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => {
            onMrtTiersChange(new Set())
          }}
          className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
            !hasSelection
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          All
        </button>
        {MRT_TIERS.map(({ tier, label }) => {
          const isSelected = mrtTiers.has(tier)
          return (
            <button
              key={tier}
              onClick={() => {
                const newSet = new Set(mrtTiers)
                if (isSelected) {
                  newSet.delete(tier)
                } else {
                  newSet.add(tier)
                }
                onMrtTiersChange(newSet)
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

