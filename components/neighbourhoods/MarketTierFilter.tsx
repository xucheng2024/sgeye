/**
 * Market Tier Filter Component (CCR/RCR/OCR)
 */

interface MarketTierFilterProps {
  region: string
  onRegionChange: (region: string) => void
}

export function MarketTierFilter({ region, onRegionChange }: MarketTierFilterProps) {
  return (
    <div className="shrink-0">
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        Market Tier
      </label>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onRegionChange('all')}
          className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
            region === 'all'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onRegionChange('CCR')}
          className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
            region === 'CCR'
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:bg-purple-50'
          }`}
          title="Core Central Region"
        >
          CCR
        </button>
        <button
          onClick={() => onRegionChange('RCR')}
          className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
            region === 'RCR'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
          title="Rest of Central Region"
        >
          RCR
        </button>
        <button
          onClick={() => onRegionChange('OCR')}
          className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
            region === 'OCR'
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50'
          }`}
          title="Outside Central Region"
        >
          OCR
        </button>
      </div>
    </div>
  )
}

