'use client'

import { useEffect, useState, memo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { getHealthcareData } from '@/lib/data'

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

function HealthcareChartComponent() {
  const [data, setData] = useState<Array<{ name: string; value: number; color: string }>>([])

  useEffect(() => {
    getHealthcareData().then(result => {
      setData(result.map((item, index) => ({
        name: item.facility_type,
        value: item.percentage,
        color: colors[index % colors.length],
      })))
    })
  }, [])

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-gray-500">Loading...</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default memo(HealthcareChartComponent)

