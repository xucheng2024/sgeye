import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { GuideData } from "../types"

export const guide: GuideData = {
  title: 'HDB Resale Price & How Much You Can Negotiate: Two Views',
    description: 'Realist vs skeptic: is the market price fair and hard to cut, or inflated with room to negotiate? Compare views on 800k, COV, seller mindset, and strategy.',
    relatedGuides: ['hdb-resale-agent-vs-diy', 'old-hdb-resale-pros-and-cons', 'how-to-choose-hdb-neighbourhood'],
    content: (
      <div className="guide-prose prose prose-lg max-w-none">
        <p className="text-lg text-slate-700 leading-relaxed mb-6">
          Is resale price “fair and hard to cut” or “high but negotiable”? Below we set out two views — realist vs skeptic — so you can see both angles before making an offer.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
          <p className="text-slate-800 text-sm mb-2"><strong>Terms used below:</strong></p>
          <ul className="list-disc pl-5 text-slate-700 text-sm space-y-1">
            <li><strong>COV (Cash Over Valuation)</strong> = extra cash above the official valuation. Banks lend only up to valuation; the rest is COV and must be paid in cash. In hot areas, COV can be high.</li>
            <li><strong>Listing price</strong> = what the seller asks; <strong>transacted price</strong> = what the flat actually sells for (often lower).</li>
          </ul>
        </div>

        <h2 id="view-on-800k" className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. View on high prices (e.g. 800k)</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist: &quot;Prices are reasonable / hard to cut&quot;</p>
            <p className="text-slate-700">Central area (e.g. Toa Payoh) + long remaining lease — it’s naturally expensive; this is market price.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic: &quot;Prices are inflated / still room to negotiate&quot;</p>
            <p className="text-slate-700">Listing price is just &quot;asking price&quot;, not the same as transacted price.</p>
          </div>
        </div>

        <h2 id="price-basis" className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Price basis</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist</p>
            <p className="text-slate-700">Sellers all look at recent transacted prices; they won’t sell below what the neighbour sold for.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic</p>
            <p className="text-slate-700">Some sellers list to &quot;test the water&quot;; not every listing will sell at asking.</p>
          </div>
        </div>

        <h2 id="how-much-negotiate" className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. How much can you negotiate?</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist</p>
            <p className="text-slate-700">Typical room: 0–30k; hot units may even need to go above asking.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic</p>
            <p className="text-slate-700">Some get 40–50k off — but more often when the unit isn’t moving or the seller is urgent.</p>
          </div>
        </div>

        <h2 id="cov-inevitable" className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Is COV always there?</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist</p>
            <p className="text-slate-700">Prime location, high floor, near MRT: COV is almost the default.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic</p>
            <p className="text-slate-700">If valuation catches up, or the seller prices close to valuation, you can get low or zero COV.</p>
          </div>
        </div>

        <h2 id="compare-pasir-ris" className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Comparing with Pasir Ris</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist</p>
            <p className="text-slate-700">You can’t compare: one is central, one is fringe — different markets.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic</p>
            <p className="text-slate-700">The comparison is to see that overall prices have really been pushed up.</p>
          </div>
        </div>

        <h2 id="seller-mindset" className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Seller mindset</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist</p>
            <p className="text-slate-700">If not urgent, they’ll wait for someone willing to pay more.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic</p>
            <p className="text-slate-700">If urgent (upgrading / cash pressure), they’re more willing to give discount.</p>
          </div>
        </div>

        <h2 id="buyer-room" className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Buyer negotiation room</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist</p>
            <p className="text-slate-700">Depends on competition: many buyers = almost no room.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic</p>
            <p className="text-slate-700">Depends on how long it’s been unsold: the longer, the more room.</p>
          </div>
        </div>

        <h2 id="real-reference" className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. What to really use as reference</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist</p>
            <p className="text-slate-700">Recent transacted prices + bank / HDB valuation.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic</p>
            <p className="text-slate-700">Same block older transactions + unit condition differences can justify a lower offer.</p>
          </div>
        </div>

        <h2 id="strategy" className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Strategy suggestion</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist</p>
            <p className="text-slate-700">Accept reality: adjust budget or change area.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic</p>
            <p className="text-slate-700">Put out more offers, try low-ball, wait for urgent listings.</p>
          </div>
        </div>

        <h2 id="risk-reminder" className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Risk reminder</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist</p>
            <p className="text-slate-700">Cheaper units may have a catch (neighbourhood or unit issues).</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic</p>
            <p className="text-slate-700">If you don’t try, you’ll never know — the market is a game of negotiation.</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <p className="text-slate-900 font-medium mb-2">Check neighbourhood prices</p>
          <p className="text-slate-700 mb-2">Use resale price and transport data by area to inform your offer before negotiating.</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link>
        </div>
      </div>
    ),
}
