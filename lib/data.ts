import { supabase } from './supabase'

export interface PopulationData {
  year: number
  total: number
  citizens: number
  permanent: number
  non_resident: number
}

export interface HousingData {
  year: number
  hdb_percentage: number
  private_percentage: number
}

export interface EmploymentData {
  year: number
  unemployment_rate: number
  employment_rate: number
}

export interface IncomeData {
  year: number
  median_income: number
  mean_income: number
}

export interface HealthcareData {
  facility_type: string
  percentage: number
}

export interface EducationData {
  level: string
  enrollment_rate: number
}

// Fetch functions with fallback to static data
export async function getPopulationData(): Promise<PopulationData[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('population_data')
        .select('*')
        .order('year', { ascending: true })

      if (error) throw error
      if (data && data.length > 0) {
        return data.map(item => ({
          year: item.year,
          total: Number(item.total),
          citizens: Number(item.citizens),
          permanent: Number(item.permanent),
          non_resident: Number(item.non_resident),
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching population data:', error)
  }

  // Fallback static data
  return [
    { year: 2018, total: 5638, citizens: 3503, permanent: 527, non_resident: 1608 },
    { year: 2019, total: 5704, citizens: 3525, permanent: 532, non_resident: 1647 },
    { year: 2020, total: 5686, citizens: 3520, permanent: 505, non_resident: 1661 },
    { year: 2021, total: 5454, citizens: 3500, permanent: 490, non_resident: 1464 },
    { year: 2022, total: 5637, citizens: 3550, permanent: 518, non_resident: 1569 },
    { year: 2023, total: 5917, citizens: 3610, permanent: 538, non_resident: 1769 },
  ]
}

export async function getHousingData(): Promise<HousingData[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('housing_data')
        .select('*')
        .order('year', { ascending: true })

      if (error) throw error
      if (data && data.length > 0) {
        return data.map(item => ({
          year: item.year,
          hdb_percentage: Number(item.hdb_percentage),
          private_percentage: Number(item.private_percentage),
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching housing data:', error)
  }

  return [
    { year: 2018, hdb_percentage: 82.5, private_percentage: 17.5 },
    { year: 2019, hdb_percentage: 82.3, private_percentage: 17.7 },
    { year: 2020, hdb_percentage: 82.1, private_percentage: 17.9 },
    { year: 2021, hdb_percentage: 81.9, private_percentage: 18.1 },
    { year: 2022, hdb_percentage: 81.7, private_percentage: 18.3 },
    { year: 2023, hdb_percentage: 81.5, private_percentage: 18.5 },
  ]
}

export async function getEmploymentData(): Promise<EmploymentData[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('employment_data')
        .select('*')
        .order('year', { ascending: true })

      if (error) throw error
      if (data && data.length > 0) {
        return data.map(item => ({
          year: item.year,
          unemployment_rate: Number(item.unemployment_rate),
          employment_rate: Number(item.employment_rate),
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching employment data:', error)
  }

  return [
    { year: 2018, unemployment_rate: 2.1, employment_rate: 97.9 },
    { year: 2019, unemployment_rate: 2.3, employment_rate: 97.7 },
    { year: 2020, unemployment_rate: 3.0, employment_rate: 97.0 },
    { year: 2021, unemployment_rate: 2.7, employment_rate: 97.3 },
    { year: 2022, unemployment_rate: 2.1, employment_rate: 97.9 },
    { year: 2023, unemployment_rate: 1.9, employment_rate: 98.1 },
  ]
}

export async function getIncomeData(): Promise<IncomeData[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('income_data')
        .select('*')
        .order('year', { ascending: true })

      if (error) throw error
      if (data && data.length > 0) {
        return data.map(item => ({
          year: item.year,
          median_income: Number(item.median_income),
          mean_income: Number(item.mean_income),
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching income data:', error)
  }

  return [
    { year: 2018, median_income: 4434, mean_income: 5850 },
    { year: 2019, median_income: 4563, mean_income: 6020 },
    { year: 2020, median_income: 4534, mean_income: 5950 },
    { year: 2021, median_income: 4680, mean_income: 6150 },
    { year: 2022, median_income: 5070, mean_income: 6650 },
    { year: 2023, median_income: 5197, mean_income: 6820 },
  ]
}

export async function getHealthcareData(): Promise<HealthcareData[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('healthcare_data')
        .select('*')

      if (error) throw error
      if (data && data.length > 0) {
        return data.map(item => ({
          facility_type: item.facility_type,
          percentage: Number(item.percentage),
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching healthcare data:', error)
  }

  return [
    { facility_type: 'Public Hospitals', percentage: 65 },
    { facility_type: 'Private Hospitals', percentage: 20 },
    { facility_type: 'Community Hospitals', percentage: 10 },
    { facility_type: 'Specialty Centers', percentage: 5 },
  ]
}

export async function getEducationData(): Promise<EducationData[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('education_data')
        .select('*')

      if (error) throw error
      if (data && data.length > 0) {
        return data.map(item => ({
          level: item.level,
          enrollment_rate: Number(item.enrollment_rate),
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching education data:', error)
  }

  return [
    { level: 'Primary', enrollment_rate: 95.2 },
    { level: 'Secondary', enrollment_rate: 97.8 },
    { level: 'Post-Secondary', enrollment_rate: 92.5 },
    { level: 'University', enrollment_rate: 45.3 },
  ]
}

