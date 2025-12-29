'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getPopulationData } from '@/lib/data'

export default function PopulationChart() {
  const [data, setData] = useState<Array<{ year: string; citizens: number; permanent: number; nonResident: number }>>([])

  useEffect(() => {
    getPopulationData().then(result => {
      setData(result.map(item => ({
        year: item.year.toString(),
        citizens: item.citizens,
        permanent: item.permanent,
        nonResident: item.non_resident,
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
        <Tooltip />
        <Legend />
        <Bar dataKey="citizens" fill="#3b82f6" name="Citizens" />
        <Bar dataKey="permanent" fill="#10b981" name="Permanent Residents" />
        <Bar dataKey="nonResident" fill="#f59e0b" name="Non-Residents" />
      </BarChart>
    </ResponsiveContainer>
  )
}

