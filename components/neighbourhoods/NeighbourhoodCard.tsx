/**
 * Neighbourhood Card Component
 */

import Link from 'next/link'
import { Plus, ArrowRight } from 'lucide-react'
import { NeighbourhoodWithFlatType } from '@/lib/types/neighbourhood'
import { toTitleCase, formatFlatType, formatCurrency, getMRTAccessLabel } from '@/lib/utils/neighbourhood-utils'
import { getRegionInfo, getMajorRegionInfo, type RegionType } from '@/lib/region-mapping'
import { getLivingNotesForNeighbourhood } from '@/lib/neighbourhood-living-notes'
import LivingDimensions from '@/components/LivingDimensions'

interface NeighbourhoodCardProps {
  neighbourhood: NeighbourhoodWithFlatType
  isSelected: boolean
  onToggleCompare: (id: string, e: React.MouseEvent) => void
  filterParams: string
}

export function NeighbourhoodCard({ 
  neighbourhood, 
  isSelected, 
  onToggleCompare, 
  filterParams 
}: NeighbourhoodCardProps) {
  const displayFlatType = neighbourhood.display_flat_type
  const livingNotes = getLivingNotesForNeighbourhood(neighbourhood.name)

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
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{toTitleCase(neighbourhood.name)}</h3>
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
          onClick={(e) => onToggleCompare(neighbourhood.id, e)}
          className={`ml-2 p-2 rounded-lg transition-colors ${
            isSelected
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={isSelected ? 'Remove from compare' : 'Add to compare'}
        >
          <Plus className={`w-4 h-4 ${isSelected ? 'rotate-45' : ''} transition-transform`} />
        </button>
      </div>

      {/* Living Dimensions */}
      {livingNotes && <LivingDimensions notes={livingNotes} variant="compressed" className="mb-4" neighbourhoodId={neighbourhood.id} />}

      {/* Key Metrics */}
      <div className="space-y-1.5 text-sm mb-4">
        {/* Price */}
        {neighbourhood.summary?.median_price_12m != null && Number(neighbourhood.summary.median_price_12m) > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Price:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(Number(neighbourhood.summary.median_price_12m))}</span>
          </div>
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
          const isShortLease = leaseYears < 70
          const isTypicalLease = leaseYears >= 70 && leaseYears < 80
          const isSafeLease = leaseYears >= 80
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
                        href="/hdb/lease-price"
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
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 cursor-help">
                      Typical
                    </span>
                    <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <p className="mb-2">Typical remaining lease length with moderate resale and financing flexibility.</p>
                      <Link
                        href="/hdb/lease-price"
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
                        href="/hdb/lease-price"
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

      {/* Action Button */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <Link
          href={`/neighbourhood/${neighbourhood.id}${filterParams ? `?return_to=${encodeURIComponent('/neighbourhoods?' + filterParams)}` : ''}`}
          className="flex-1 text-center text-sm font-medium text-blue-600 hover:text-blue-700 py-2 rounded hover:bg-blue-50 transition-colors"
        >
          View details
        </Link>
      </div>
    </div>
  )
}

