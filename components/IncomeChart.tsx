'use client'

import { useEffect, useState, memo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getIncomeData } from '@/lib/data'

function IncomeChartComponent() {
  const [data, setData] = useState<Array<{ year: string; median: number; mean: number }>>([])

  useEffect(() => {
    getIncomeData().then(result => {
      setData(result.map(item => ({
        year: item.year.toString(),
        median: item.median_income,
        mean: item.mean_income,
      })))
    })
  }, [])

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-gray-500">Loading...</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
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

export default memo(IncomeChartComponent)

