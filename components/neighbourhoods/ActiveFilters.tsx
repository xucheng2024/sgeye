/**
 * Active Filters Display Component
 * Shows currently applied filters as removable tags
 */

'use client'

import { X } from 'lucide-react'
import { formatFlatType } from '@/lib/utils/neighbourhood-utils'
import { PlanningArea } from '@/lib/types/neighbourhood'

interface ActiveFiltersProps {
  selectedFlatTypes: Set<string>
  onFlatTypesChange: (flatTypes: Set<string>) => void
  priceTiers: Set<string>
  onPriceTiersChange: (tiers: Set<string>) => void
  leaseTiers: Set<string>
  onLeaseTiersChange: (tiers: Set<string>) => void
  mrtTier: string
  onMrtTierChange: (tier: string) => void
  region: string
  onRegionChange: (region: string) => void
  majorRegions: Set<string>
  onMajorRegionsChange: (regions: Set<string>) => void
  selectedPlanningAreas: Set<string>
  onPlanningAreasChange: (areas: Set<string>) => void
  selectedSubzones: Set<string>
  onSubzonesChange: (subzones: Set<string>) => void
  planningAreas: PlanningArea[]
}

const PRICE_TIER_LABELS: Record<string, string> = {
  low: 'Budget',
  medium: 'Mid-range',
  high: 'Premium',
}

const LEASE_TIER_LABELS: Record<string, string> = {
  low: 'Short lease',
  medium: 'Typical lease',
  high: 'Long lease',
}

const MRT_TIER_LABELS: Record<string, string> = {
  close: 'Near MRT',
  walkable: 'Walkable to MRT',
  accessible: 'MRT accessible',
}

const REGION_LABELS: Record<string, string> = {
  core: 'Core',
  fringe: 'Fringe',
  outside: 'Outside',
}

const MAJOR_REGION_LABELS: Record<string, string> = {
  central: 'Central',
  east: 'East',
  north: 'North',
  northeast: 'Northeast',
  west: 'West',
}

export function ActiveFilters({
  selectedFlatTypes,
  onFlatTypesChange,
  priceTiers,
  onPriceTiersChange,
  leaseTiers,
  onLeaseTiersChange,
  mrtTier,
  onMrtTierChange,
  region,
  onRegionChange,
  majorRegions,
  onMajorRegionsChange,
  selectedPlanningAreas,
  onPlanningAreasChange,
  selectedSubzones,
  onSubzonesChange,
  planningAreas,
}: ActiveFiltersProps) {
  const hasActiveFilters = 
    (selectedFlatTypes.size > 0 && !selectedFlatTypes.has('All')) ||
    priceTiers.size > 0 ||
    leaseTiers.size > 0 ||
    (mrtTier && mrtTier !== 'all') ||
    (region && region !== 'all') ||
    majorRegions.size > 0 ||
    selectedPlanningAreas.size > 0 ||
    selectedSubzones.size > 0

  if (!hasActiveFilters) return null

  const removeFilter = (type: string, value?: string) => {
    switch (type) {
      case 'flatType':
        if (value) {
          const newSet = new Set(selectedFlatTypes)
          newSet.delete(value)
          onFlatTypesChange(newSet.size === 0 ? new Set(['All']) : newSet)
        }
        break
      case 'priceTier':
        if (value) {
          const newSet = new Set(priceTiers)
          newSet.delete(value)
          onPriceTiersChange(newSet)
        }
        break
      case 'leaseTier':
        if (value) {
          const newSet = new Set(leaseTiers)
          newSet.delete(value)
          onLeaseTiersChange(newSet)
        }
        break
      case 'mrtTier':
        onMrtTierChange('all')
        break
      case 'region':
        onRegionChange('all')
        break
      case 'majorRegion':
        if (value) {
          const newSet = new Set(majorRegions)
          newSet.delete(value)
          onMajorRegionsChange(newSet)
        }
        break
      case 'planningArea':
        if (value) {
          const newSet = new Set(selectedPlanningAreas)
          newSet.delete(value)
          onPlanningAreasChange(newSet)
        }
        break
      case 'subzone':
        if (value) {
          const newSet = new Set(selectedSubzones)
          newSet.delete(value)
          onSubzonesChange(newSet)
        }
        break
    }
  }

  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start gap-2">
        <span className="text-xs font-medium text-blue-700 mt-1.5">Active filters:</span>
        <div className="flex-1 flex flex-wrap gap-2">
          {/* Flat Types */}
          {Array.from(selectedFlatTypes)
            .filter(ft => ft !== 'All')
            .map(flatType => (
              <button
                key={flatType}
                onClick={() => removeFilter('flatType', flatType)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white text-blue-700 text-xs font-medium rounded border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                {formatFlatType(flatType)}
                <X className="w-3 h-3" />
              </button>
            ))}
          
          {/* Price Tiers */}
          {Array.from(priceTiers).map(tier => (
            <button
              key={tier}
              onClick={() => removeFilter('priceTier', tier)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white text-blue-700 text-xs font-medium rounded border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              {PRICE_TIER_LABELS[tier] || tier}
              <X className="w-3 h-3" />
            </button>
          ))}
          
          {/* Lease Tiers */}
          {Array.from(leaseTiers).map(tier => (
            <button
              key={tier}
              onClick={() => removeFilter('leaseTier', tier)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white text-blue-700 text-xs font-medium rounded border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              {LEASE_TIER_LABELS[tier] || tier}
              <X className="w-3 h-3" />
            </button>
          ))}
          
          {/* MRT Tier */}
          {mrtTier && mrtTier !== 'all' && (
            <button
              onClick={() => removeFilter('mrtTier')}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white text-blue-700 text-xs font-medium rounded border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              {MRT_TIER_LABELS[mrtTier] || mrtTier}
              <X className="w-3 h-3" />
            </button>
          )}
          
          {/* Region */}
          {region && region !== 'all' && (
            <button
              onClick={() => removeFilter('region')}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white text-blue-700 text-xs font-medium rounded border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              {REGION_LABELS[region] || region}
              <X className="w-3 h-3" />
            </button>
          )}
          
          {/* Major Regions */}
          {Array.from(majorRegions).map(majorRegion => (
            <button
              key={majorRegion}
              onClick={() => removeFilter('majorRegion', majorRegion)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white text-blue-700 text-xs font-medium rounded border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              {MAJOR_REGION_LABELS[majorRegion] || majorRegion}
              <X className="w-3 h-3" />
            </button>
          ))}
          
          {/* Planning Areas */}
          {Array.from(selectedPlanningAreas).map(areaId => {
            const area = planningAreas.find(pa => pa.id === areaId)
            if (!area) return null
            return (
              <button
                key={areaId}
                onClick={() => removeFilter('planningArea', areaId)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white text-blue-700 text-xs font-medium rounded border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                {area.name}
                <X className="w-3 h-3" />
              </button>
            )
          })}
          
          {/* Subzones */}
          {Array.from(selectedSubzones).map(subzoneId => (
            <button
              key={subzoneId}
              onClick={() => removeFilter('subzone', subzoneId)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white text-blue-700 text-xs font-medium rounded border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              Subzone: {subzoneId}
              <X className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
