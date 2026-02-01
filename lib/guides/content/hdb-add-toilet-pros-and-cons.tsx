import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { GuideData } from "../types"

export const guide: GuideData = {
  title: 'HDB Add a Toilet: Support vs Opposition at a Glance',
    description: 'Can you add or split a toilet in HDB? Rules, technical feasibility, approval, grey-area risks, cost vs benefit, and practical alternatives.',
    relatedGuides: ['old-hdb-resale-pros-and-cons', 'hdb-resale-agent-vs-diy', 'how-to-choose-hdb-neighbourhood'],
    content: (
      <div className="guide-prose prose prose-lg max-w-none">
        <p className="text-lg text-slate-700 leading-relaxed mb-6">
          Want to add or split a toilet in an HDB flat? Below we compare “support / feasible” vs “opposition / not feasible”, plus rules, approval, grey-area risks, cost, and practical alternatives.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
          <p className="text-slate-800 text-sm mb-2"><strong>Terms used below:</strong></p>
          <ul className="list-disc pl-5 text-slate-700 text-sm space-y-1">
            <li><strong>Wet area</strong> = the bathroom/kitchen zone where water and drainage pipes run. HDB rules often don’t allow adding new pipes outside this area.</li>
            <li><strong>Sewer</strong> = the pipe system that carries waste water away. It runs through the whole block; you can’t just tap into it anywhere.</li>
          </ul>
        </div>

        <h2 id="regulatory" className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Rules and legality</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Support / feasible</p>
            <p className="text-slate-700 mb-2">In a few cases, alteration may be allowed:</p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>Older 3-room, 1-toilet units</li>
              <li>Split within the existing wet area (toilet + shower in separate spaces, same pipe zone)</li>
              <li>No new sewer connection</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Opposition / not feasible</p>
            <p className="text-slate-700 mb-2">HDB rules clearly state:</p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>You cannot add new sewer outlets</li>
              <li>You cannot enlarge the wet area</li>
              <li>Sewer pipes are a building-wide system — you cannot tap into them wherever you like</li>
            </ul>
          </div>
        </div>

        <h2 id="technical" className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Technical feasibility</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Support / feasible</p>
            <p className="text-slate-700 mb-2">There are reported success cases:</p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>Convert store room into shower room</li>
              <li>Connect to the existing toilet drain</li>
              <li>Use louvres / ventilation to address airflow</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Opposition / not feasible</p>
            <p className="text-slate-700 mb-2">Technical risks are high:</p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>Insufficient fall on drainage can cause backflow</li>
              <li>Failed waterproofing can leak to the unit below</li>
              <li>If something goes wrong, liability rests with the owner</li>
            </ul>
          </div>
        </div>

        <h2 id="approval" className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Approval process</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Support / feasible</p>
            <p className="text-slate-700 mb-2">You can go the formal route:</p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>Use a licensed contractor</li>
              <li>They apply to HDB for permit</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Opposition / not feasible</p>
            <p className="text-slate-700 mb-2">In most cases:</p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>HDB does not approve</li>
              <li>Or they allow &quot;alteration within existing toilet&quot; only, not &quot;new toilet&quot;</li>
            </ul>
          </div>
        </div>

        <h2 id="grey-illegal" className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Grey-area / illegal work</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">⚠️ Support (grey)</p>
            <p className="text-slate-700 mb-2">Some contractors are willing to do it &quot;under the table&quot;:</p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>Tap into sewer pipe without approval</li>
              <li>Do not report to HDB</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">🚨 Opposition / risk</p>
            <p className="text-slate-700 mb-2">Risk is very high:</p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>Neighbour complaint can lead to mandatory removal</li>
              <li>Leakage can result in fines</li>
              <li>At resale, the alteration may be deemed illegal</li>
            </ul>
          </div>
        </div>

        <h2 id="cost-benefit" className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Cost vs benefit</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">👍 Support</p>
            <p className="text-slate-700">If the household is crowded for the long term, quality of life can improve a lot.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">👎 Opposition</p>
            <p className="text-slate-700 mb-2">Cost is high (S$20k+):</p>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>Structural risk</li>
              <li>When selling, it may become a negative point</li>
            </ul>
          </div>
        </div>

        <h2 id="alternatives" className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Practical alternatives</h2>
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 mb-6">
          <p className="font-semibold text-blue-800 mb-2">✔️ Compromise options</p>
          <ul className="list-disc pl-5 text-slate-700 space-y-1">
            <li>Split one toilet into two spaces: shower room + WC</li>
            <li>Add a wash basin in the service yard</li>
            <li>Stagger shower times to reduce peak use</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <p className="text-slate-900 font-medium mb-2">Compare neighbourhoods</p>
          <p className="text-slate-700 mb-2">See price, transport, and layout types by area.</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link>
        </div>
      </div>
    ),
}
