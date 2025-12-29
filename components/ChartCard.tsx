'use client'

import { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  description?: string
  children: ReactNode
  icon?: ReactNode
}

export default function ChartCard({ title, description, children, icon }: ChartCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        {icon && <div className="text-blue-600">{icon}</div>}
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-4">
        {children}
      </div>
    </div>
  )
}


