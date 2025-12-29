'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const incomeData = [
  { year: '2018', median: 4434, mean: 5850 },
  { year: '2019', median: 4563, mean: 6020 },
  { year: '2020', median: 4534, mean: 5950 },
  { year: '2021', median: 4680, mean: 6150 },
  { year: '2022', median: 5070, mean: 6650 },
  { year: '2023', median: 5197, mean: 6820 },
]

export default function IncomeChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={incomeData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip formatter={(value) => `S$${(value as number)?.toLocaleString() || 0}`} />
        <Legend />
        <Bar dataKey="median" fill="#3b82f6" name="Median Income (S$)" />
        <Bar dataKey="mean" fill="#10b981" name="Mean Income (S$)" />
      </BarChart>
    </ResponsiveContainer>
  )
}

