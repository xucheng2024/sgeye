'use client'

import { useState } from 'react'
import { X, Star, Bell, Settings } from 'lucide-react'

interface WatchlistSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function WatchlistSidebar({ isOpen, onClose }: WatchlistSidebarProps) {
  const [watchedTowns] = useState<string[]>([])
  const [watchedBlocks] = useState<string[]>([])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Watchlist</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Watched Towns */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Watched Towns</h3>
            </div>
            {watchedTowns.length === 0 ? (
              <div className="text-sm text-gray-500 py-4">
                No towns watched yet. Click the watch button on a town to add it.
              </div>
            ) : (
              <div className="space-y-2">
                {watchedTowns.map(town => (
                  <div
                    key={town}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="font-medium text-gray-900">{town}</span>
                    <button className="text-gray-400 hover:text-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Watched Blocks */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Watched Blocks</h3>
            </div>
            {watchedBlocks.length === 0 ? (
              <div className="text-sm text-gray-500 py-4">
                No blocks watched yet. Click the star button on a block card to add it.
              </div>
            ) : (
              <div className="space-y-2">
                {watchedBlocks.map(blockId => (
                  <div
                    key={blockId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="text-sm text-gray-700">Block {blockId}</span>
                    <button className="text-gray-400 hover:text-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alert Settings */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Alert Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Frequency
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="weekly">Weekly</option>
                  <option value="instant">Instant</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Change Threshold (%)
                </label>
                <input
                  type="number"
                  defaultValue={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Transactions
                </label>
                <input
                  type="number"
                  defaultValue={15}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

