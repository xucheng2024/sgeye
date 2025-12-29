'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const educationData = [
  { level: 'Primary', enrollment: 95.2 },
  { level: 'Secondary', enrollment: 97.8 },
  { level: 'Post-Secondary', enrollment: 92.5 },
  { level: 'University', enrollment: 45.3 },
]

export default function EducationChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={educationData}>
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

