import ChartCard from '@/components/ChartCard'
import PopulationChart from '@/components/PopulationChart'
import HousingChart from '@/components/HousingChart'
import EmploymentChart from '@/components/EmploymentChart'
import IncomeChart from '@/components/IncomeChart'
import HealthcareChart from '@/components/HealthcareChart'
import EducationChart from '@/components/EducationChart'
import { Users, Home as HomeIcon, Briefcase, DollarSign, Heart, GraduationCap, Building2 } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Singapore Data Insights</h1>
          <p className="mt-2 text-gray-600">Visualizing key livelihood indicators and public data</p>
          <nav className="mt-4 flex gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">Overview</Link>
            <Link href="/hdb" className="text-gray-600 hover:text-gray-800 font-medium">HDB Resale Prices</Link>
          </nav>
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
          <p className="text-gray-600 leading-relaxed mb-4">
            This dashboard provides visual insights into Singapore&apos;s key public data and livelihood indicators.
            The data covers population demographics, housing, employment, income, healthcare, and education - 
            reflecting the issues that matter most to Singaporeans. All visualizations are based on publicly 
            available data from Singapore government sources.
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              HDB Resale Price & Affordability Dashboard
            </h3>
            <p className="text-gray-600 mb-3">
              Explore comprehensive HDB resale price analytics and calculate your affordability:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link href="/hdb" className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="font-medium text-blue-900">Island-wide Trends</div>
                <div className="text-sm text-blue-700">Price trends with P25/P50/P75 and transaction volume</div>
              </Link>
              <Link href="/hdb/heatmap" className="p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="font-medium text-green-900">Price Heatmap</div>
                <div className="text-sm text-green-700">Visual price distribution by town</div>
              </Link>
              <Link href="/hdb/lease-price" className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="font-medium text-purple-900">Lease Age Analysis</div>
                <div className="text-sm text-purple-700">Relationship between remaining lease and prices</div>
              </Link>
              <Link href="/hdb/affordability" className="p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <div className="font-medium text-orange-900">Affordability Calculator</div>
                <div className="text-sm text-orange-700">Calculate what you can afford based on MSR/TDSR/LTV</div>
              </Link>
            </div>
          </div>
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
