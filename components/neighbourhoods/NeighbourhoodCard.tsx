/**
 * Neighbourhood Card Component
 */

import { useState, useEffect, memo, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Plus, ArrowRight, Check } from 'lucide-react'
import { NeighbourhoodWithFlatType } from '@/lib/types/neighbourhood'
import { toTitleCase, formatFlatType, formatCurrency, getMRTAccessLabel } from '@/lib/utils/neighbourhood-utils'
import { getRegionInfo, getMajorRegionInfo, type RegionType } from '@/lib/region-mapping'
import { getLivingNotesForNeighbourhood, type LivingNotes } from '@/lib/neighbourhood-living-notes'
import LivingDimensions from '@/components/LivingDimensions'

interface NeighbourhoodCardProps {
  neighbourhood: NeighbourhoodWithFlatType
  isSelected: boolean
  onToggleCompare: (uniqueKey: string, e: React.MouseEvent) => void
  filterParams: string
  uniqueKey: string
  livingNotes?: LivingNotes | null
}

function NeighbourhoodCardComponent({ 
  neighbourhood, 
  isSelected, 
  onToggleCompare, 
  filterParams,
  uniqueKey,
  livingNotes: propLivingNotes
}: NeighbourhoodCardProps) {
  const displayFlatType = neighbourhood.display_flat_type
  const [livingNotesState, setLivingNotesState] = useState<LivingNotes | null>(propLivingNotes || null)
  
  // Use prop if provided, otherwise fetch (fallback for backward compatibility)
  const livingNotes = propLivingNotes !== undefined ? propLivingNotes : livingNotesState

  useEffect(() => {
    // Only fetch if not provided as prop
    if (propLivingNotes === undefined) {
      getLivingNotesForNeighbourhood(neighbourhood.name).then(setLivingNotesState)
    }
  }, [neighbourhood.name, propLivingNotes])

  // Helper function to get variance level text
  const getVarianceLevelText = (level: string | null | undefined): string | null => {
    if (!level) return null
    const mapping: Record<string, string> = {
      'compact': 'Consistent across blocks',
      'moderate': 'Some variation by block',
      'spread_out': 'Block choice matters a lot'
    }
    return mapping[level] || null
  }

  // Check if this is a planning area level neighbourhood (name matches planning area name)
  // Planning area level neighbourhoods should ALWAYS be scored, even if DB says not_scored
  const isPlanningAreaLevel = neighbourhood.planning_area && 
    neighbourhood.name.toUpperCase().trim() === neighbourhood.planning_area.name.toUpperCase().trim()
  
  // Check if neighbourhood has HDB resale data
  // If it has HDB data, it means there are HDB flats there, so it should be scored
  const hasHdbData = neighbourhood.summary && 
    neighbourhood.summary.tx_12m > 0 && 
    (neighbourhood.summary.median_price_12m != null || neighbourhood.summary.median_lease_years_12m != null)
  
  // Only show not_scored for subzone-level neighbourhoods WITHOUT HDB data
  // Planning area / town level neighbourhoods must always be scored
  // Neighbourhoods with HDB data should always be scored (they have HDB flats)
  if (neighbourhood.rating_mode === 'not_scored' && !isPlanningAreaLevel && !hasHdbData) {
    return (
      <div
        id={`neighbourhood-${neighbourhood.id}`}
        className="bg-gray-100 rounded-lg border-2 border-gray-300 p-6 opacity-75"
      >
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-1">{toTitleCase(neighbourhood.name)}</h3>
          {neighbourhood.planning_area && (
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded inline-block">
              {toTitleCase(neighbourhood.planning_area.name)}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-600 font-medium mb-1">
          Not scored for residential living
        </div>
        <div className="text-xs text-gray-500">
          {neighbourhood.short_note || 'Industrial / non-residential zone — daily living patterns don\'t apply.'}
        </div>
      </div>
    )
  }

  return (
    <div
      id={`neighbourhood-${neighbourhood.id}`}
      className={`bg-white rounded-lg border-2 p-6 hover:shadow-lg transition-all relative ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link 
            href={`/neighbourhood/${neighbourhood.id}${filterParams ? `?return_to=${encodeURIComponent('/neighbourhoods?' + filterParams)}` : ''}`}
            className="group inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{toTitleCase(neighbourhood.name)}</h3>
            <span className="text-xs text-gray-400 group-hover:text-blue-500 font-medium">see more &gt;</span>
          </Link>
          <div className="flex flex-wrap gap-2 mt-1">
            {neighbourhood.planning_area && (
              <>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
                  {toTitleCase(neighbourhood.planning_area.name)}
                </span>
                {neighbourhood.planning_area.region && (() => {
                  const regionInfo = getRegionInfo(neighbourhood.planning_area.region as RegionType)
                  if (!regionInfo) return null
                  return (
                    <span className={`text-xs px-2 py-1 rounded border font-medium ${regionInfo.bgColor} ${regionInfo.color} ${regionInfo.borderColor}`} title={regionInfo.fullName}>
                      {regionInfo.code}
                    </span>
                  )
                })()}
              </>
            )}
            {neighbourhood.subzone_region && (() => {
              const majorRegionInfo = getMajorRegionInfo(neighbourhood.subzone_region)
              if (!majorRegionInfo) return null
              return (
                <span className={`text-xs px-2 py-1 rounded border font-medium ${majorRegionInfo.bgColor} ${majorRegionInfo.color} ${majorRegionInfo.borderColor}`} title={majorRegionInfo.name}>
                  {majorRegionInfo.code}
                </span>
              )
            })()}
            {displayFlatType && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block font-medium">
                {formatFlatType(displayFlatType)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => onToggleCompare(uniqueKey, e)}
          className={`ml-2 p-1.5 rounded-md transition-colors ${
            isSelected
              ? 'bg-blue-50 text-blue-600 border border-blue-200'
              : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent'
          }`}
          title={isSelected ? 'Remove from compare' : 'Add to compare'}
        >
          {isSelected ? (
            <Check className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Living Dimensions */}
      {livingNotes && <LivingDimensions notes={livingNotes} variant="compressed" className="mb-4" neighbourhoodId={neighbourhood.id} />}

      {/* Key Metrics */}
      <div className="space-y-1.5 text-sm mb-4">
        {/* Price */}
        {neighbourhood.summary?.median_price_12m != null && Number(neighbourhood.summary.median_price_12m) > 0 && (
          <Link 
            href={`/neighbourhood/${neighbourhood.id}${filterParams ? `?return_to=${encodeURIComponent('/neighbourhoods?' + filterParams)}` : ''}`}
            className="flex items-center justify-between group hover:bg-blue-50 -mx-2 px-2 py-1 rounded transition-colors"
          >
            <span className="text-gray-600">Price:</span>
            <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
              {formatCurrency(Number(neighbourhood.summary.median_price_12m))}
              <span className="text-gray-400 group-hover:text-blue-500">&gt;</span>
            </span>
          </Link>
        )}
        
        {/* Area */}
        {neighbourhood.summary?.avg_floor_area_12m != null && Number(neighbourhood.summary.avg_floor_area_12m) > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Area:</span>
            <span className="font-semibold text-gray-900">{Number(neighbourhood.summary.avg_floor_area_12m).toFixed(1)} m²</span>
          </div>
        )}
        
        {/* Lease */}
        {neighbourhood.summary?.median_lease_years_12m != null && Number(neighbourhood.summary.median_lease_years_12m) > 0 && (() => {
          const leaseYears = Number(neighbourhood.summary.median_lease_years_12m)
          const isShortLease = leaseYears < 60
          const isTypicalLease = leaseYears >= 60 && leaseYears < 70
          const isSafeLease = leaseYears >= 70
          return (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Lease:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{leaseYears.toFixed(1)} years</span>
                {isShortLease && (
                  <div className="relative group">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 cursor-help">
                      ⚠ Short
                    </span>
                    <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <p className="mb-2">Flats with shorter leases may face resale and financing constraints.</p>
                      <Link
                        href="/hdb/lease-price/"
                        className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        See how lease length affects long-term value
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
                {isTypicalLease && (
                  <div className="relative group">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 cursor-help">
                      Typical
                    </span>
                    <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <p className="mb-2">Typical remaining lease length with moderate resale and financing flexibility.</p>
                      <Link
                        href="/hdb/lease-price/"
                        className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        See how lease length affects long-term value
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
                {isSafeLease && (
                  <div className="relative group">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 cursor-help">
                      ✓ Safe
                    </span>
                    <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <p className="mb-2">Longer remaining leases provide more flexibility for resale and financing.</p>
                      <Link
                        href="/hdb/lease-price/"
                        className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        See how lease length affects long-term value
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })()}
        
        {/* MRT */}
        {neighbourhood.access && (() => {
          const stationNames = neighbourhood.access.mrt_station_names || []
          const mrtInfo = getMRTAccessLabel(
            neighbourhood.access.mrt_access_type,
            neighbourhood.access.avg_distance_to_mrt ? Number(neighbourhood.access.avg_distance_to_mrt) : null,
            neighbourhood.access.mrt_station_count ? Number(neighbourhood.access.mrt_station_count) : null,
            stationNames
          )
          return (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">MRT:</span>
              {mrtInfo.isInArea ? (
                <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                  ✓ {mrtInfo.text}
                </span>
              ) : mrtInfo.text !== 'None' ? (
                <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  {mrtInfo.text}
                </span>
              ) : (
                <span className="font-semibold text-gray-500">
                  {mrtInfo.text}
                </span>
              )}
            </div>
          )
        })()}
        
        {/* Show message if no transaction data */}
        {(!neighbourhood.summary || 
          neighbourhood.summary.tx_12m === 0 ||
          ((!neighbourhood.summary.median_price_12m || Number(neighbourhood.summary.median_price_12m) <= 0) && 
           (!neighbourhood.summary.median_lease_years_12m || Number(neighbourhood.summary.median_lease_years_12m) <= 0))) && (
          <div className="text-xs text-gray-500 italic mt-2">
            No recent transaction data (last 12 months)
          </div>
        )}
      </div>

      {/* Variance Level - Only show if it's compact or spread_out (not moderate) */}
      {neighbourhood.variance_level && neighbourhood.variance_level !== 'moderate' && getVarianceLevelText(neighbourhood.variance_level) && (
        <div className={`text-xs pt-2 border-t border-gray-100 ${
          neighbourhood.variance_level === 'spread_out' 
            ? 'text-amber-700 font-medium' 
            : 'text-gray-500'
        }`}>
          {neighbourhood.variance_level === 'spread_out' && '⚠️ '}
          {getVarianceLevelText(neighbourhood.variance_level)}
        </div>
      )}
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders
export const NeighbourhoodCard = memo(NeighbourhoodCardComponent, (prevProps, nextProps) => {
  // Custom comparison function for better memoization
  return (
    prevProps.uniqueKey === nextProps.uniqueKey &&
    prevProps.neighbourhood.id === nextProps.neighbourhood.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.filterParams === nextProps.filterParams &&
    prevProps.livingNotes === nextProps.livingNotes &&
    prevProps.neighbourhood.summary?.median_price_12m === nextProps.neighbourhood.summary?.median_price_12m &&
    prevProps.neighbourhood.summary?.median_lease_years_12m === nextProps.neighbourhood.summary?.median_lease_years_12m &&
    prevProps.neighbourhood.access?.mrt_station_count === nextProps.neighbourhood.access?.mrt_station_count
  )
})

