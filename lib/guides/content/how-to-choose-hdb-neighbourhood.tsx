import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { GuideData } from "../types"

export const guide: GuideData = {
  title: 'How to choose a HDB neighbourhood',
    description: 'A step-by-step guide to evaluating Singapore HDB neighbourhoods based on your family\'s priorities, transport convenience, lease safety, and school pressure. Learn how to make informed HDB buying decisions.',
    relatedGuides: ['why-cheap-hdb-feel-uncomfortable', 'does-mrt-distance-really-matter'],
    content: (
      <div className="guide-prose prose prose-lg max-w-none">
        <p className="text-lg text-slate-700 leading-relaxed mb-6">
          Choosing the right HDB neighbourhood is one of the biggest decisions when buying a resale flat. The area you pick will shape your commute, your children’s schools, and how comfortable you feel at home for years.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Step 1: Know your priorities</h2>
        <p className="text-slate-700 mb-4">
          Before diving into data, decide what matters most to your household:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li>Commute time and how easy it is to get around</li>
          <li>Schools and how competitive they are to get into</li>
          <li>How many years are left on the lease (affects loans and resale)</li>
          <li>Budget</li>
          <li>Whether you prefer a quieter or busier area</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Step 2: Look at price vs value</h2>
        <p className="text-slate-700 mb-4">
          Cheaper neighbourhoods often come with trade-offs (longer commutes, fewer amenities). When comparing, check:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li>Median resale prices in the last 12 months</li>
          <li>Whether prices are stable or jumpy</li>
          <li>How prices compare to nearby areas</li>
          <li>Price per square metre (PSM) to compare value for size</li>
        </ul>
        <p className="text-slate-700 mb-6">
          The cheapest area may not be the best value once you count transport, amenities, and how long you plan to stay. <Link href="/guides/why-cheap-hdb-feel-uncomfortable/" className="text-blue-600 hover:text-blue-700 underline">See how to judge living comfort beyond price</Link>.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Step 3: Check transport</h2>
        <p className="text-slate-700 mb-4">
          Distance to MRT matters, but so do other things: bus links, how crowded it gets, and door-to-door time. Consider:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li>How many MRT stations are in or near the neighbourhood</li>
          <li>Walking distance to the nearest MRT</li>
          <li>Quality of bus services</li>
          <li><strong>Transport Burden Index (TBI)</strong> — a score that reflects how much time and effort you spend on transport; lower is better</li>
          <li>Crowding and reliability in peak hours</li>
        </ul>
        <p className="text-slate-700 mb-6">
          A place with good buses can feel more convenient than one slightly closer to MRT but with poor bus links. <Link href="/guides/does-mrt-distance-really-matter/" className="text-blue-600 hover:text-blue-700 underline">Read more: MRT distance vs real convenience</Link>.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Step 4: Check lease (remaining years)</h2>
        <p className="text-slate-700 mb-4">
          HDB flats have a 99-year lease. The fewer years left, the harder it is to get a long loan or sell later. Rough guide:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li><strong>70+ years left:</strong> Usually fine for long-term stay; banks offer better loan terms</li>
          <li><strong>60–69 years:</strong> OK to live in, but resale value and loan options may be weaker</li>
          <li><strong>Under 60 years:</strong> Higher risk; CPF use and bank loans are more restricted</li>
        </ul>
        <p className="text-slate-700 mb-6">
          When comparing neighbourhoods, check the typical remaining lease there — it affects both your comfort and your finances.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Step 5: Check school pressure (for families)</h2>
        <p className="text-slate-700 mb-4">
          Schools are allocated by <strong>planning area</strong> (a larger zone that contains several neighbourhoods). In competitive areas, popular primary schools are harder to get into. Check:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li>PSLE cutoff trends in the planning area (PSLE decides secondary school placement; cutoffs show how hard it is to get into each school)</li>
          <li>Which schools are oversubscribed and how much pressure there is</li>
          <li>Backup school options if your first choice is full</li>
          <li>Distance from the neighbourhood to schools you care about</li>
        </ul>
        <p className="text-slate-700 mb-6">
          School pressure affects stress and daily routines — so look at the planning area, not just one neighbourhood.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Step 6: Compare and decide</h2>
        <p className="text-slate-700 mb-4">
          Use our comparison tool to see 2–3 neighbourhoods side by side. Compare:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li>Prices and price trends</li>
          <li>Remaining lease and lease safety</li>
          <li>Transport Burden Index (TBI) and how easy it is to get around</li>
          <li>School pressure in the planning area</li>
          <li>Other living-comfort factors (amenities, noise, etc.)</li>
        </ul>
        <p className="text-slate-700 mb-6">
          Comparing side by side helps you see the full picture before you decide.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <p className="text-slate-900 font-medium mb-2">Ready to compare?</p>
          <p className="text-slate-700 mb-4">
            Use our tools to compare price, transport, lease, and school pressure across neighbourhoods.
          </p>
          <Link
            href="/neighbourhoods"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Browse neighbourhoods
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    ),
}
