import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { GuideData } from "../types"

export const guide: GuideData = {
  title: 'MRT distance vs real convenience',
    description: 'Understanding MRT distance vs real convenience when choosing HDB neighbourhoods in Singapore. Learn what factors affect daily transport convenience beyond just MRT proximity, including Transport Burden Index.',
    relatedGuides: ['how-to-choose-hdb-neighbourhood', 'why-cheap-hdb-feel-uncomfortable'],
    content: (
      <div className="guide-prose prose prose-lg max-w-none">
        <p className="text-lg text-slate-700 leading-relaxed mb-6">
          Distance to MRT is often the first thing people check when buying a resale flat. But “near MRT” doesn’t always mean “easy to get around”. What matters more is how easy it actually is to get to work, school, or shops — door-to-door time, crowding, and bus options all matter.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
          <p className="text-slate-800 text-sm">
            <strong>In this guide, “real convenience”</strong> = how easy it actually is to get around day to day (not just metres from MRT). Door-to-door time, crowding, and bus quality matter as much as raw distance.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">When MRT distance really matters</h2>
        <p className="text-slate-700 mb-4">
          Being near MRT tends to matter most if you:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li>Commute daily to the city or business districts</li>
          <li>Rely on public transport for most trips</li>
          <li>Want flexibility for spontaneous outings</li>
          <li>Find long walks difficult (e.g. mobility, heat)</li>
          <li>Work odd hours and need late-night transport</li>
        </ul>
        <p className="text-slate-700 mb-6">
          In these cases, living within walking distance of MRT usually makes daily life easier.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Beyond metres: what else affects convenience?</h2>
        <p className="text-slate-700 mb-4">
          Convenience isn’t just “how far to MRT”. It also depends on:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li><strong>Station type:</strong> Interchange stations give you more routes and options</li>
          <li><strong>Line reliability:</strong> Some lines (e.g. Circle Line, East-West Line) are generally more reliable</li>
          <li><strong>Buses:</strong> Good bus links can make a place farther from MRT still feel convenient</li>
          <li><strong>Shelter:</strong> Covered walkways and bus stops make longer walks bearable in rain or heat</li>
          <li><strong>Crowding:</strong> Some stations are less crowded in peak hours</li>
          <li><strong>Future MRT:</strong> Don’t rely on planned stations — buy for what exists today</li>
        </ul>
        <p className="text-slate-700 mb-6">
          A neighbourhood 800 m from MRT with good buses can feel more convenient than one 400 m away with poor bus links. <Link href="/guides/why-cheap-hdb-feel-uncomfortable/" className="text-blue-600 hover:text-blue-700 underline">See: judging living comfort beyond price</Link>.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Transport Burden Index (TBI): one number for convenience</h2>
        <p className="text-slate-700 mb-4">
          Our <strong>Transport Burden Index (TBI)</strong> summarises how much time and effort transport takes in a neighbourhood. It includes:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li>Walking distance to MRT</li>
          <li>How many MRT stations are in or near the area</li>
          <li>Quality of bus services</li>
          <li>How easy it is to reach key places (CBD, schools, amenities)</li>
        </ul>
        <p className="text-slate-700 mb-6">
          <strong>Lower TBI = less time and effort on transport.</strong> Higher TBI = more commuting. When comparing neighbourhoods, check the TBI — it often tells you more than “X metres to MRT”.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">When MRT distance matters less</h2>
        <p className="text-slate-700 mb-4">
          MRT distance may be less important if you:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li>Drive regularly or have a car</li>
          <li>Work from home (less daily commute)</li>
          <li>Live in an area with very good bus links</li>
          <li>Care more about price, lease, or schools than transport</li>
          <li>Travel outside peak hours (buses are more viable then)</li>
        </ul>
        <p className="text-slate-700 mb-6">
          Even then, check the TBI to see the full picture. A place with good buses can still be better value than one slightly closer to MRT but with poor alternatives.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">How transport needs can change over time</h2>
        <p className="text-slate-700 mb-4">
          When you buy, think about how your life might change:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li><strong>New job:</strong> A different workplace might make MRT access more important</li>
          <li><strong>Children:</strong> Schools and activities can increase how much you travel</li>
          <li><strong>Future MRT:</strong> Don’t count on planned stations — buy for what’s there now</li>
          <li><strong>Age:</strong> Long walks may get harder over time</li>
          <li><strong>Lifestyle:</strong> More outings can make MRT proximity more valuable</li>
        </ul>
        <p className="text-slate-700 mb-6">
          Choosing a neighbourhood with good transport overall (not just “near MRT”) usually gives you more flexibility. <Link href="/guides/how-to-choose-hdb-neighbourhood/" className="text-blue-600 hover:text-blue-700 underline">See: how to choose an HDB neighbourhood</Link>.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <p className="text-slate-900 font-medium mb-2">Check transport by neighbourhood</p>
          <p className="text-slate-700 mb-4">
            Use our transport page to compare TBI, MRT access, and bus connectivity across neighbourhoods.
          </p>
          <Link
            href="/transport"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Explore transport
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    ),
}
