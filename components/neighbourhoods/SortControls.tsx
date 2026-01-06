/**
 * Sort Controls Component
 */

import { SortPreset } from '@/lib/types/neighbourhood'

interface SortControlsProps {
  sortPreset: SortPreset
  onSortPresetChange: (preset: SortPreset) => void
}

export function SortControls({ sortPreset, onSortPresetChange }: SortControlsProps) {
  const toggleSort = (preset: SortPreset) => {
    onSortPresetChange(sortPreset === preset ? 'default' : preset)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500 mr-2">Sort by:</span>
        <button
          onClick={() => toggleSort('price')}
          className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
            sortPreset === 'price'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          Price
        </button>
        <button
          onClick={() => toggleSort('area')}
          className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
            sortPreset === 'area'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          Area
        </button>
        <button
          onClick={() => toggleSort('psm')}
          className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
            sortPreset === 'psm'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          Price/m²
        </button>
      </div>
    </div>
  )
}

