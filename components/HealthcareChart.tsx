'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const healthcareData = [
  { name: 'Public Hospitals', value: 65, color: '#3b82f6' },
  { name: 'Private Hospitals', value: 20, color: '#10b981' },
  { name: 'Community Hospitals', value: 10, color: '#f59e0b' },
  { name: 'Specialty Centers', value: 5, color: '#ef4444' },
]

export default function HealthcareChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={healthcareData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {healthcareData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

