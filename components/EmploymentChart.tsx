'use client'

import { useEffect, useState, memo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getEmploymentData } from '@/lib/data'

function EmploymentChartComponent() {
  const [data, setData] = useState<Array<{ year: string; unemployment: number; employment: number }>>([])

  useEffect(() => {
    getEmploymentData().then(result => {
      setData(result.map(item => ({
        year: item.year.toString(),
        unemployment: item.unemployment_rate,
        employment: item.employment_rate,
      })))
    })
  }, [])

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-gray-500">Loading...</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="employment" stackId="1" stroke="#10b981" fill="#10b981" name="Employment Rate (%)" />
        <Area type="monotone" dataKey="unemployment" stackId="1" stroke="#ef4444" fill="#ef4444" name="Unemployment Rate (%)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default memo(EmploymentChartComponent)

