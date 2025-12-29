'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getHousingData } from '@/lib/data'

export default function HousingChart() {
  const [data, setData] = useState<Array<{ year: string; hdb: number; private: number }>>([])

  useEffect(() => {
    getHousingData().then(result => {
      setData(result.map(item => ({
        year: item.year.toString(),
        hdb: item.hdb_percentage,
        private: item.private_percentage,
      })))
    })
  }, [])

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-gray-500">Loading...</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="hdb" stroke="#3b82f6" name="HDB (%)" strokeWidth={2} />
        <Line type="monotone" dataKey="private" stroke="#10b981" name="Private (%)" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}

