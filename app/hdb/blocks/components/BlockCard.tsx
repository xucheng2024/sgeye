'use client'

import { useState } from 'react'
import type { BlockWithMetrics } from '@/lib/hdb-data/block-types'
import { formatCurrency } from '@/lib/utils'
import { Star, Info, MapPin } from 'lucide-react'

interface BlockCardProps {
  block: BlockWithMetrics
}

export default function BlockCard({ block }: BlockCardProps) {
  const [isWatched, setIsWatched] = useState(false)
  const metrics = block.metrics

  // Helper functions for chip labels
  const getLeaseLabel = (): { label: string; color: string; tooltip: string } => {
    if (!metrics?.medianRemainingLeaseYears) {
      return { label: 'N/A', color: 'gray', tooltip: 'Lease data not available' }
    }

    const lease = metrics.medianRemainingLeaseYears
    const percentile = metrics.leasePercentileInTown ?? 50

    if (lease >= 70) {
      return {
        label: 'Healthy',
        color: 'green',
        tooltip: `Remaining lease: ${Math.round(lease)} years (${Math.round(percentile)}th percentile in town)`,
      }
    } else if (lease >= 60) {
      return {
        label: 'Similar',
        color: 'yellow',
        tooltip: `Remaining lease: ${Math.round(lease)} years (${Math.round(percentile)}th percentile in town)`,
      }
    } else {
      return {
        label: 'Weaker',
        color: 'red',
        tooltip: `Remaining lease: ${Math.round(lease)} years (${Math.round(percentile)}th percentile in town)`,
      }
    }
  }

  const getAccessLabel = (): { label: string; color: string; tooltip: string } => {
    if (!metrics?.mrtBand || !metrics.nearestMrtName) {
      return { label: 'N/A', color: 'gray', tooltip: 'MRT data not available' }
    }

    const band = metrics.mrtBand
    const station = metrics.nearestMrtName
    const dist = metrics.nearestMrtDistM

    if (band === '<400') {
      return {
        label: `<400m`,
        color: 'green',
        tooltip: `Nearest MRT: ${station} (~${dist}m)`,
      }
    } else if (band === '400-800') {
      return {
        label: `400-800m`,
        color: 'yellow',
        tooltip: `Nearest MRT: ${station} (~${dist}m)`,
      }
    } else {
      return {
        label: `>800m`,
        color: 'gray',
        tooltip: `Nearest MRT: ${station} (~${dist}m)`,
      }
    }
  }

  const getBusLabel = (): { label: string; color: string; tooltip: string } => {
    if (!metrics) {
      return { label: 'N/A', color: 'gray', tooltip: 'Bus data not available' }
    }

    const stops = metrics.busStops400m

    if (stops >= 6) {
      return {
        label: `6+`,
        color: 'green',
        tooltip: `${stops} bus stops within 400m`,
      }
    } else if (stops >= 3) {
      return {
        label: `3-5`,
        color: 'yellow',
        tooltip: `${stops} bus stops within 400m`,
      }
    } else {
      return {
        label: `0-2`,
        color: 'gray',
        tooltip: `${stops} bus stops within 400m`,
      }
    }
  }

  const getPrimaryLabel = (): { label: string; tooltip: string } => {
    if (!metrics) {
      return { label: 'N/A', tooltip: 'School data not available' }
    }

    const count = metrics.primaryWithin1km
    return {
      label: `${count}`,
      tooltip: `${count} primary schools within 1km`,
    }
  }

  const leaseInfo = getLeaseLabel()
  const accessInfo = getAccessLabel()
  const busInfo = getBusLabel()
  const primaryInfo = getPrimaryLabel()

  const chipColorClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{block.address}</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
              {block.town}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>{block.street}</span>
          </div>
        </div>
        <button
          onClick={() => setIsWatched(!isWatched)}
          className={`p-2 rounded-lg transition-colors ${
            isWatched
              ? 'text-yellow-500 bg-yellow-50'
              : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
          }`}
          title={isWatched ? 'Remove from watchlist' : 'Watch block'}
        >
          <Star className={`w-5 h-5 ${isWatched ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Metrics Chips */}
      {metrics ? (
        <>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {/* Lease */}
            <div
              className={`px-3 py-2 rounded-lg border text-xs font-medium cursor-help ${chipColorClasses[leaseInfo.color as keyof typeof chipColorClasses]}`}
              title={leaseInfo.tooltip}
            >
              <div className="flex items-center gap-1">
                <span>Lease: {leaseInfo.label}</span>
                <Info className="w-3 h-3 opacity-60" />
              </div>
            </div>

            {/* Access */}
            <div
              className={`px-3 py-2 rounded-lg border text-xs font-medium cursor-help ${chipColorClasses[accessInfo.color as keyof typeof chipColorClasses]}`}
              title={accessInfo.tooltip}
            >
              <div className="flex items-center gap-1">
                <span>Access: {accessInfo.label}</span>
                <Info className="w-3 h-3 opacity-60" />
              </div>
            </div>

            {/* Bus */}
            <div
              className={`px-3 py-2 rounded-lg border text-xs font-medium cursor-help ${chipColorClasses[busInfo.color as keyof typeof chipColorClasses]}`}
              title={busInfo.tooltip}
            >
              <div className="flex items-center gap-1">
                <span>Bus: {busInfo.label}</span>
                <Info className="w-3 h-3 opacity-60" />
              </div>
            </div>

            {/* Primary */}
            <div
              className="px-3 py-2 rounded-lg border text-xs font-medium bg-gray-100 text-gray-800 border-gray-200 cursor-help"
              title={primaryInfo.tooltip}
            >
              <div className="flex items-center gap-1">
                <span>Primary: {primaryInfo.label}</span>
                <Info className="w-3 h-3 opacity-60" />
              </div>
            </div>
          </div>

          {/* Price Information */}
          <div className="border-t border-gray-200 pt-4 mb-4">
            {metrics.medianPricePsm && (
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm text-gray-600">Median price psm ({metrics.windowYears}y):</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(metrics.medianPricePsm)}
                </span>
              </div>
            )}
            {metrics.medianResalePrice && (
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm text-gray-600">Median resale price:</span>
                <span className="text-base font-semibold text-gray-900">
                  {formatCurrency(metrics.medianResalePrice)}
                </span>
              </div>
            )}
            {metrics.rolling6mChangePsm !== null && metrics.rolling6mChangePsm !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Change (6m):</span>
                <span
                  className={`text-sm font-medium ${
                    metrics.rolling6mChangePsm > 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {metrics.rolling6mChangePsm > 0 ? '+' : ''}
                  {metrics.rolling6mChangePsm.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {/* Transaction Count */}
          <div className="text-xs text-gray-500">
            {metrics.txCount} transaction{metrics.txCount !== 1 ? 's' : ''} ({metrics.windowYears}y)
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-400 text-sm">
          Metrics data not available
        </div>
      )}
    </div>
  )
}

