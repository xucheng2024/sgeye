'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const housingData = [
  { year: '2018', hdb: 82.5, private: 17.5 },
  { year: '2019', hdb: 82.3, private: 17.7 },
  { year: '2020', hdb: 82.1, private: 17.9 },
  { year: '2021', hdb: 81.9, private: 18.1 },
  { year: '2022', hdb: 81.7, private: 18.3 },
  { year: '2023', hdb: 81.5, private: 18.5 },
]

export default function HousingChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={housingData}>
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

