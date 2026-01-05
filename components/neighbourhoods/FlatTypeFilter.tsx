/**
 * Flat Type Filter Component
 */

import { formatFlatType } from '@/lib/utils/neighbourhood-utils'

interface FlatTypeFilterProps {
  selectedFlatTypes: Set<string>
  onFlatTypesChange: (flatTypes: Set<string>) => void
}

const FLAT_TYPES = ['All', '3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE'] as const

export function FlatTypeFilter({ selectedFlatTypes, onFlatTypesChange }: FlatTypeFilterProps) {
  return (
    <div className="min-w-[200px]">
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        Flat size
      </label>
      <div className="flex flex-wrap gap-1.5">
        {FLAT_TYPES.map((ft) => {
          const isAll = ft === 'All'
          const showAll = isAll && (selectedFlatTypes.size === 0 || selectedFlatTypes.has('All'))
          const isSelected = isAll ? showAll : selectedFlatTypes.has(ft)
          const displayLabel = formatFlatType(ft)
          
          return (
            <button
              key={ft}
              onClick={() => {
                const newSet = new Set(selectedFlatTypes)
                if (isAll) {
                  if (isSelected) {
                    newSet.clear()
                  } else {
                    newSet.clear()
                    newSet.add('All')
                  }
                } else {
                  if (newSet.has('All')) {
                    newSet.delete('All')
                  }
                  if (isSelected) {
                    newSet.delete(ft)
                    if (newSet.size === 0) {
                      newSet.add('All')
                    }
                  } else {
                    newSet.add(ft)
                  }
                }
                onFlatTypesChange(newSet)
              }}
              className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {displayLabel}
            </button>
          )
        })}
      </div>
    </div>
  )
}

