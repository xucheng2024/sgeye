'use client'

import { useEffect, useState, memo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getEducationData } from '@/lib/data'

function EducationChartComponent() {
  const [data, setData] = useState<Array<{ level: string; enrollment: number }>>([])

  useEffect(() => {
    getEducationData().then(result => {
      setData(result.map(item => ({
        level: item.level,
        enrollment: item.enrollment_rate,
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
        <XAxis dataKey="level" />
        <YAxis domain={[0, 100]} />
        <Tooltip formatter={(value) => `${(value as number) || 0}%`} />
        <Legend />
        <Bar dataKey="enrollment" fill="#8b5cf6" name="Enrollment Rate (%)" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default memo(EducationChartComponent)

