'use client'

import { GraduationCap } from 'lucide-react'
import ChartCard from '@/components/ChartCard'

export default function PSLESchoolPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">PSLE & School Location</h1>
          <p className="mt-2 text-gray-600">Understand school zones, PSLE cut-off points, and housing location trade-offs</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ChartCard
          title="Coming Soon"
          description="This feature is under development"
          icon={<GraduationCap className="w-6 h-6" />}
        >
          <div className="flex items-center justify-center h-[400px] text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">PSLE & School Location Analysis</p>
              <p className="text-sm">This feature will help you understand:</p>
              <ul className="text-sm mt-4 space-y-2 text-left max-w-md mx-auto">
                <li>• School zones and proximity to HDB estates</li>
                <li>• PSLE cut-off points by school</li>
                <li>• Housing price impact of school location</li>
                <li>• Trade-offs between location and affordability</li>
              </ul>
            </div>
          </div>
        </ChartCard>
      </main>
    </div>
  )
}

