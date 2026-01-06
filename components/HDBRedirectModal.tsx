'use client'

import { ExternalLink, X } from 'lucide-react'
import { AnalyticsEvents } from '@/lib/analytics'

interface HDBRedirectModalProps {
  onClose: () => void
}

export default function HDBRedirectModal({ onClose }: HDBRedirectModalProps) {
  const handleOpenHDB = () => {
    // HDB official affordability calculator URL
    const hdbUrl = 'https://services2.hdb.gov.sg/webapp/BB33RTIS/BB33PResaleCalculator'
    window.open(hdbUrl, '_blank', 'noopener,noreferrer')
    AnalyticsEvents.ctaStartGuided()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          We use HDB's official calculator
        </h2>
        
        <div className="space-y-3 mb-6">
          <p className="text-sm text-gray-600">
            To ensure accuracy, we rely on HDB's official affordability calculator.
          </p>
          <p className="text-sm text-gray-600">
            You'll be redirected in a new tab.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-sm font-medium text-blue-900">
              👉 After checking your result, come back and paste the price here.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleOpenHDB}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
          >
            Open HDB calculator
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

