import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { GuideData } from "../types"

export const guide: GuideData = {
  title: 'HDB Resale: Using an Agent vs DIY — When It\'s Worth It',
    description: 'Pros and cons of using a real estate agent vs DIY for HDB resale — process, viewings, negotiation, complex deals, commission, and who each option suits.',
    relatedGuides: ['old-hdb-resale-pros-and-cons', 'how-to-choose-hdb-neighbourhood', 'moving-from-hdb-to-condo-inconveniences'],
    content: (
      <div className="guide-prose prose prose-lg max-w-none">
        <p className="text-lg text-slate-700 leading-relaxed mb-6">
          Use an agent or do it yourself (DIY) for HDB resale? Below we compare both options — pro-agent vs pro-DIY — so you can decide what fits your time, budget, and comfort level.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
          <p className="text-slate-800 text-sm mb-2"><strong>Terms used below:</strong></p>
          <ul className="list-disc pl-5 text-slate-700 text-sm space-y-1">
            <li><strong>OTP</strong> = Option to Purchase (the document that secures the flat for a period while you complete the deal)</li>
            <li><strong>COV</strong> = Cash Over Valuation (extra cash above the bank’s valuation; only valuation amount can be financed)</li>
          </ul>
        </div>

        <h2 id="core-reason" className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Core reason</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-slate-700">Saves effort, time and worry.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent (DIY)</p>
            <p className="text-slate-700">You can DIY; the process is already systematised.</p>
          </div>
        </div>

        <h2 id="what-you-buy" className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. What you actually buy</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-slate-700">Project management + communication proxy + risk outsourcing.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-slate-700">You save 1–2% commission.</p>
          </div>
        </div>

        <h2 id="process-documents" className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Process / documents</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-slate-700">Agent knows the process; fewer wrong turns.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-slate-700">HDB Resale Portal already handles eligibility, OTP, submission and completion.</p>
          </div>
        </div>

        <h2 id="finding-viewing" className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Finding / viewing homes</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-slate-700">Agent arranges viewings, contacts the other party, tracks schedule.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-slate-700">You can shortlist and book viewings yourself; it just takes time.</p>
          </div>
        </div>

        <h2 id="selling-exposure" className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Selling / exposure</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-slate-700">Agent has platforms (e.g. PropertyGuru) and network for viewings.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-slate-700">Sellers are more tied to platforms: many big portals don’t allow individuals to list directly.</p>
          </div>
        </div>

        <h2 id="negotiation" className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Negotiation / price</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-slate-700">May help you push price down or up, reduce COV.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-slate-700">No guarantee; many negotiate -50k / -90k using data themselves.</p>
          </div>
        </div>

        <h2 id="emotions-conflicts" className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Emotions and conflicts</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-slate-700">Acts as buffer; avoids buyer and seller arguing directly.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-slate-700">Many feel this isn’t worth the cost; communication should be direct and efficient anyway.</p>
          </div>
        </div>

        <h2 id="complex-deals" className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Complex transactions</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-slate-700">Contra, timeline, extension, handover details are more stable with an agent.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-slate-700">These are minority cases; ordinary buy/sell is not that complex.</p>
          </div>
        </div>

        <h2 id="sense-of-security" className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. &quot;Insurance&quot; feeling</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-slate-700">Someone responsible / to rely on / to blame if things go wrong (psychological safety).</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-slate-700">Commission is high but doesn’t equal quality; incentives are misaligned (closing fast matters more).</p>
          </div>
        </div>

        <h2 id="quality-difference" className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Quality difference</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-slate-700">Good agent = experience + network + attention to detail.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-slate-700">Market isn’t stratified: new and veteran agents charge the same %; many just run SOP.</p>
          </div>
        </div>

        <h2 id="suitable-for" className="text-2xl font-bold text-slate-900 mt-8 mb-4">11. Who it suits</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-slate-700">Busy; afraid of mistakes; don’t want to handle communication; complex transaction.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-slate-700">Have time to research; rational about negotiation; cost-sensitive; willing to push the process yourself.</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <p className="text-slate-900 font-medium mb-2">Compare neighbourhoods</p>
          <p className="text-slate-700 mb-2">Check price, transport, and lease by area before you buy or sell.</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link>
        </div>
      </div>
    ),
}
