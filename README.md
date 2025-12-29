# Singapore Data Insights

A Next.js web application that visualizes Singapore's public data and key livelihood indicators using interactive charts and graphs.

## Features

- **Population Trends**: Visualize population breakdown by citizenship status
- **Housing Distribution**: Track HDB vs Private housing percentages
- **Employment Rate**: Monitor employment and unemployment trends
- **Household Income**: Analyze median and mean income statistics
- **Healthcare Facilities**: View healthcare infrastructure distribution
- **Education Enrollment**: Track enrollment rates across education levels

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Database**: Supabase (configured, ready for data integration)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (optional, for future data integration)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd sgeye
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional for Supabase):
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard (if using Supabase)
4. Deploy!

The project is configured for Vercel deployment with `vercel.json`.

## Project Structure

```
sgeye/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main dashboard page
│   └── globals.css      # Global styles
├── components/
│   ├── ChartCard.tsx    # Reusable chart container
│   ├── PopulationChart.tsx
│   ├── HousingChart.tsx
│   ├── EmploymentChart.tsx
│   ├── IncomeChart.tsx
│   ├── HealthcareChart.tsx
│   └── EducationChart.tsx
├── lib/
│   └── supabase.ts      # Supabase client configuration
└── public/              # Static assets
```

## Data Sources

The current visualizations use sample data based on Singapore's public statistics. To integrate real-time data:

1. Set up a Supabase project
2. Create tables for your data
3. Update the chart components to fetch from Supabase
4. Add data fetching logic using the Supabase client

## License

MIT
