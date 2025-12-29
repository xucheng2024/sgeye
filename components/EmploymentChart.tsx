'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const employmentData = [
  { year: '2018', unemployment: 2.1, employment: 97.9 },
  { year: '2019', unemployment: 2.3, employment: 97.7 },
  { year: '2020', unemployment: 3.0, employment: 97.0 },
  { year: '2021', unemployment: 2.7, employment: 97.3 },
  { year: '2022', unemployment: 2.1, employment: 97.9 },
  { year: '2023', unemployment: 1.9, employment: 98.1 },
]

export default function EmploymentChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={employmentData}>
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

