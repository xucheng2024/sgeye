import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { GuideData } from "../types"

export const guide: GuideData = {
  title: 'HDB vs Condo Living Experience (Based on Real Reviews)',
    description: 'Side-by-side comparison of HDB and condo living in Singapore: delivery, monthly costs, convenience, space, facilities, security, visitors, and mindset.',
    relatedGuides: ['old-hdb-resale-pros-and-cons', 'moving-from-hdb-to-condo-inconveniences', 'how-to-compare-hdb-neighbourhoods'],
    content: (
      <div className="guide-prose prose prose-lg max-w-none">
        <p className="text-lg text-slate-700 leading-relaxed mb-6">
          How does HDB compare to condo in daily life? Below is a side-by-side view from real experiences. <strong>✓</strong> = advantage, <strong>✗</strong> = disadvantage, <strong>▲</strong> = mixed. <strong>MCST</strong> = condo management (Management Corporation Strata Title).
        </p>

        <div className="overflow-x-auto mb-8 -mx-1">
          <table className="responsive-table w-full border border-slate-200 text-left text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-3 border-b border-slate-200 font-semibold text-slate-900">Dimension</th>
                <th className="p-3 border-b border-slate-200 font-semibold text-slate-900">HDB (public housing)</th>
                <th className="p-3 border-b border-slate-200 font-semibold text-slate-900">Condo (private)</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              <tr><td className="p-3 border-b font-medium">Delivery / takeaway</td><td className="p-3 border-b">✓ Very convenient — leave at door, photo and go.</td><td className="p-3 border-b">✗ Common pain: intercom, card swipe, lift limits; deliveries easily missed.</td></tr>
              <tr><td className="p-3 border-b font-medium">Monthly cost</td><td className="p-3 border-b">✓ Low management fees (town council / misc).</td><td className="p-3 border-b">✗ High management fees; you pay whether you use facilities or not.</td></tr>
              <tr><td className="p-3 border-b font-medium">Daily convenience</td><td className="p-3 border-b">✓ Kopitiam, supermarket, convenience store downstairs.</td><td className="p-3 border-b">✗ Often in quiet locations; eating and shopping less convenient.</td></tr>
              <tr><td className="p-3 border-b font-medium">Space size</td><td className="p-3 border-b">✓ Usually larger for same price (especially older resale).</td><td className="p-3 border-b">✗ Units tend small — &quot;pretty outside, cramped inside&quot;.</td></tr>
              <tr><td className="p-3 border-b font-medium">Facilities (pool / gym)</td><td className="p-3 border-b">✗ No private facilities.</td><td className="p-3 border-b">▲ Available but quality varies; gyms often criticised as &quot;basic&quot;.</td></tr>
              <tr><td className="p-3 border-b font-medium">Facility usage</td><td className="p-3 border-b">—</td><td className="p-3 border-b">✗ Many don’t use facilities but still pay.</td></tr>
              <tr><td className="p-3 border-b font-medium">Sense of security</td><td className="p-3 border-b">▲ Actually very safe.</td><td className="p-3 border-b">▲ Strict management but mainly psychological security.</td></tr>
              <tr><td className="p-3 border-b font-medium">Visitors &amp; parking</td><td className="p-3 border-b">✓ Flexible, easy to find.</td><td className="p-3 border-b">✗ Visitor parking and pickup points often frustrating.</td></tr>
              <tr><td className="p-3 border-b font-medium">Management efficiency</td><td className="p-3 border-b">▲ Depends on town council; stable but average.</td><td className="p-3 border-b">▲ MCST can be demanding; efficiency may be slow.</td></tr>
              <tr><td className="p-3 border-b font-medium">Neighbour relations</td><td className="p-3 border-b">▲ Strong community feel, casual habits.</td><td className="p-3 border-b">✗ Many rules, many complaints, more neighbour friction.</td></tr>
              <tr><td className="p-3 border-b font-medium">Noise &amp; privacy</td><td className="p-3 border-b">▲ Older flats: sound insulation generally poor.</td><td className="p-3 border-b">▲ New condos dense; privacy not necessarily better.</td></tr>
              <tr><td className="p-3 border-b font-medium">Tenant issues</td><td className="p-3 border-b">✓ Mostly owner-occupied.</td><td className="p-3 border-b">✗ Many short-term tenants; lifestyles inconsistent.</td></tr>
              <tr><td className="p-3 border-b font-medium">Distance from MRT</td><td className="p-3 border-b">✓ Most are closer.</td><td className="p-3 border-b">✗ Non-premium projects usually further.</td></tr>
              <tr><td className="p-3 border-b font-medium">Overall mindset</td><td className="p-3 border-b">✓ &quot;A place to live&quot;.</td><td className="p-3 border-b">▲ &quot;Asset + place to live&quot;.</td></tr>
              <tr><td className="p-3 font-medium">Summary in one line</td><td className="p-3">✓ Good to live in, convenient, worry-free.</td><td className="p-3">▲ Good-looking, many rules, mentally tiring.</td></tr>
            </tbody>
          </table>
        </div>

        <p className="text-slate-700 mb-6">
          In short: HDB is often &quot;good to live in, convenient, worry-free&quot;; condo &quot;good-looking, many rules, mentally tiring&quot;. Choose based on whether you value daily ease or asset value and facilities more.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <p className="text-slate-900 font-medium mb-2">Compare HDB neighbourhoods</p>
          <p className="text-slate-700 mb-2">See price, transport, and lease by area.</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link>
        </div>
      </div>
    ),
}
