import ChartCard from '@/components/ChartCard'
import PopulationChart from '@/components/PopulationChart'
import HousingChart from '@/components/HousingChart'
import EmploymentChart from '@/components/EmploymentChart'
import IncomeChart from '@/components/IncomeChart'
import HealthcareChart from '@/components/HealthcareChart'
import EducationChart from '@/components/EducationChart'
import { Users, Home as HomeIcon, Briefcase, DollarSign, Heart, GraduationCap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Singapore Data Insights</h1>
          <p className="mt-2 text-gray-600">Visualizing key livelihood indicators and public data</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Population Trends"
            description="Total population breakdown by citizenship status (in thousands)"
            icon={<Users className="w-6 h-6" />}
          >
            <PopulationChart />
          </ChartCard>

          <ChartCard
            title="Housing Distribution"
            description="Percentage of HDB vs Private housing over time"
            icon={<HomeIcon className="w-6 h-6" />}
          >
            <HousingChart />
          </ChartCard>

          <ChartCard
            title="Employment Rate"
            description="Employment and unemployment trends"
            icon={<Briefcase className="w-6 h-6" />}
          >
            <EmploymentChart />
          </ChartCard>

          <ChartCard
            title="Household Income"
            description="Median and mean monthly household income (S$)"
            icon={<DollarSign className="w-6 h-6" />}
          >
            <IncomeChart />
          </ChartCard>

          <ChartCard
            title="Healthcare Facilities"
            description="Distribution of healthcare infrastructure"
            icon={<Heart className="w-6 h-6" />}
          >
            <HealthcareChart />
          </ChartCard>

          <ChartCard
            title="Education Enrollment"
            description="Enrollment rates across education levels"
            icon={<GraduationCap className="w-6 h-6" />}
          >
            <EducationChart />
          </ChartCard>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Dashboard</h2>
          <p className="text-gray-600 leading-relaxed">
            This dashboard provides visual insights into Singapore&apos;s key public data and livelihood indicators.
            The data covers population demographics, housing, employment, income, healthcare, and education - 
            reflecting the issues that matter most to Singaporeans. All visualizations are based on publicly 
            available data from Singapore government sources.
          </p>
        </div>
      </main>

      <footer className="mt-12 bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p>Singapore Data Insights - Built with Next.js, Vercel & Supabase</p>
        </div>
      </footer>
    </div>
  )
}
