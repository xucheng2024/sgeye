'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const populationData = [
  { year: '2018', total: 5638, citizens: 3503, permanent: 527, nonResident: 1608 },
  { year: '2019', total: 5704, citizens: 3525, permanent: 532, nonResident: 1647 },
  { year: '2020', total: 5686, citizens: 3520, permanent: 505, nonResident: 1661 },
  { year: '2021', total: 5454, citizens: 3500, permanent: 490, nonResident: 1464 },
  { year: '2022', total: 5637, citizens: 3550, permanent: 518, nonResident: 1569 },
  { year: '2023', total: 5917, citizens: 3610, permanent: 538, nonResident: 1769 },
]

export default function PopulationChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={populationData}>
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

