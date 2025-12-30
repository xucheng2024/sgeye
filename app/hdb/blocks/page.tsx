'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getBlocksWithMetrics } from '@/lib/hdb-data/block-fetch'
import type { BlockWithMetrics, BlockFilters } from '@/lib/hdb-data/block-types'
import { formatCurrency } from '@/lib/utils'
import { TOWNS, FLAT_TYPES } from '../compare-towns/constants'
import { Filter, Star, Bell, Info, X } from 'lucide-react'
import BlockCard from './components/BlockCard'
import WatchlistSidebar from './components/WatchlistSidebar'

function BlocksPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Parse URL params for default towns
  const townsParam = searchParams.get('towns')
  const defaultTowns = townsParam
    ? townsParam.split(',').map(t => decodeURIComponent(t.trim()))
    : []

  const [selectedTowns, setSelectedTowns] = useState<string[]>(
    defaultTowns.length > 0 ? defaultTowns : []
  )
  const [flatType, setFlatType] = useState(searchParams.get('flatType') || '4 ROOM')
  const [window, setWindow] = useState<'5' | '10'>(
    (searchParams.get('window') || '10') as '5' | '10'
  )
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false)
  const [leaseMinYears, setLeaseMinYears] = useState<number | undefined>(undefined)
  const [mrtBand, setMrtBand] = useState<'<400' | '<800' | 'any'>('any')
  const [busStopsMin, setBusStopsMin] = useState<number | undefined>(undefined)
  const [priceVsTown, setPriceVsTown] = useState<'below' | 'any'>('any')
  const [sort, setSort] = useState<BlockFilters['sort']>('balanced')
  const [blocks, setBlocks] = useState<BlockWithMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [watchlistOpen, setWatchlistOpen] = useState(false)

  useEffect(() => {
    const fetchBlocks = async () => {
      if (selectedTowns.length === 0) {
        setBlocks([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const filters: BlockFilters = {
          towns: selectedTowns,
          flatType,
          window: window === '5' ? 5 : 10,
          leaseMinYears,
          mrtBand,
          busStopsMin,
          priceVsTown,
          sort,
        }

        const data = await getBlocksWithMetrics(filters)
        setBlocks(data)
      } catch (error) {
        console.error('Error fetching blocks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlocks()
  }, [selectedTowns, flatType, window, leaseMinYears, mrtBand, busStopsMin, priceVsTown, sort])

  const handleClearTowns = () => {
    setSelectedTowns([])
  }

  const handleAddTowns = () => {
    // Can add logic to open town selector
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blocks Explorer (Advanced)</h1>
          <p className="text-lg text-gray-600 mb-4">
            Shortlist blocks within selected towns. Watch price changes.
          </p>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <strong>Note:</strong> Block metrics are structural & comparative (not unit-level guarantees).
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Default towns banner */}
        {defaultTowns.length > 0 && selectedTowns.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Showing blocks within:
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {selectedTowns.join(', ')} (from Compare)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearTowns}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear
                </button>
                <button
                  onClick={handleAddTowns}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Add more towns
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Town Multi-select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Town
              </label>
              <select
                multiple
                value={selectedTowns}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value)
                  setSelectedTowns(selected)
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                size={5}
              >
                {TOWNS.map(town => (
                  <option key={town} value={town}>
                    {town}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
            </div>

            {/* Flat Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flat Type
              </label>
              <select
                value={flatType}
                onChange={(e) => setFlatType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {FLAT_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Window */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Window
              </label>
              <select
                value={window}
                onChange={(e) => setWindow(e.target.value as '5' | '10')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="5">Last 5 years</option>
                <option value="10">Last 10 years</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as BlockFilters['sort'])}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="balanced">Balanced</option>
                <option value="lease_healthiest">Lease Healthiest</option>
                <option value="closest_mrt">Closest MRT</option>
                <option value="best_value">Best Value</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters (Collapsible) */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <button
              onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <Filter className="w-4 h-4" />
              <span>Advanced Filters</span>
            </button>

            {advancedFiltersOpen && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lease ≥ (years)
                  </label>
                  <input
                    type="number"
                    value={leaseMinYears || ''}
                    onChange={(e) => setLeaseMinYears(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="60"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MRT band
                  </label>
                  <select
                    value={mrtBand}
                    onChange={(e) => setMrtBand(e.target.value as typeof mrtBand)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="any">Any</option>
                    <option value="<400">&lt;400m</option>
                    <option value="<800">&lt;800m</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bus stops (400m)
                  </label>
                  <input
                    type="number"
                    value={busStopsMin || ''}
                    onChange={(e) => setBusStopsMin(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price vs town median
                  </label>
                  <select
                    value={priceVsTown}
                    onChange={(e) => setPriceVsTown(e.target.value as typeof priceVsTown)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="any">Any</option>
                    <option value="below">Below</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Watchlist Toggle */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setWatchlistOpen(!watchlistOpen)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <Bell className="w-4 h-4" />
              <span>Watchlist</span>
            </button>
          </div>
        </div>

        {/* Blocks Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500">Loading blocks...</p>
            </div>
          </div>
        ) : blocks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 mb-4">
              {selectedTowns.length === 0 
                ? 'Please select at least one town to view blocks.'
                : 'No blocks found. The blocks table may not be set up yet.'}
            </p>
            {selectedTowns.length > 0 && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200 text-left max-w-2xl mx-auto">
                <p className="text-sm font-semibold text-amber-900 mb-2">Setup Required</p>
                <p className="text-sm text-amber-800 mb-3">
                  The blocks and block_metrics tables need to be created in your database. 
                  Run the migration file to create the tables:
                </p>
                <code className="block text-xs bg-amber-100 p-2 rounded mb-3">
                  supabase/migrations/add_blocks_tables.sql
                </code>
                <p className="text-xs text-amber-700">
                  After running the migration, you'll need to populate the tables with block data.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {blocks.map(block => (
              <BlockCard key={block.id} block={block} />
            ))}
          </div>
        )}

        {/* Results count */}
        {!loading && blocks.length > 0 && (
          <div className="text-center text-sm text-gray-500 mb-8">
            Showing {blocks.length} block{blocks.length !== 1 ? 's' : ''}
          </div>
        )}
      </main>

      {/* Watchlist Sidebar */}
      <WatchlistSidebar isOpen={watchlistOpen} onClose={() => setWatchlistOpen(false)} />
    </div>
  )
}

export default function BlocksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <BlocksPageContent />
    </Suspense>
  )
}

