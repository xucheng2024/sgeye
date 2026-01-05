/**
 * Planning Region Filter Component (5 major regions)
 */

import { getMajorRegionInfo } from '@/lib/region-mapping'

interface PlanningRegionFilterProps {
  majorRegions: Set<string>
  onMajorRegionsChange: (regions: Set<string>) => void
}

const MAJOR_REGIONS = ['Central', 'East', 'North', 'North-East', 'West'] as const

export function PlanningRegionFilter({ majorRegions, onMajorRegionsChange }: PlanningRegionFilterProps) {
  const hasSelection = majorRegions.size > 0
  return (
    <div className="shrink-0">
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        Planning Region
      </label>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => {
            onMajorRegionsChange(new Set())
          }}
          className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
            !hasSelection
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          All
        </button>
        {MAJOR_REGIONS.map((majorRegion) => {
          const isSelected = majorRegions.has(majorRegion)
          const majorRegionInfo = getMajorRegionInfo(majorRegion)
          return (
            <button
              key={majorRegion}
              onClick={() => {
                const newSet = new Set(majorRegions)
                if (isSelected) {
                  newSet.delete(majorRegion)
                } else {
                  newSet.add(majorRegion)
                }
                onMajorRegionsChange(newSet)
              }}
              className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                isSelected
                  ? majorRegionInfo 
                    ? `${majorRegionInfo.bgColor} ${majorRegionInfo.color} ${majorRegionInfo.borderColor} border-2`
                    : 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
              title={majorRegionInfo?.name || majorRegion}
            >
              {majorRegion}
            </button>
          )
        })}
      </div>
    </div>
  )
}

