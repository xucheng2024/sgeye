import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { GuideData } from "../types"

export const guide: GuideData = {
  title: '15 Reality Checks When Moving from HDB to Condo',
    description: 'What you give up when moving from HDB to condo: delivery, security SOP, management fees, renovation rules, visitor flow, neighbours, and more.',
    relatedGuides: ['hdb-vs-condo-living-experience', 'old-hdb-resale-pros-and-cons', 'how-to-compare-hdb-neighbourhoods'],
    content: (
      <div className="guide-prose prose prose-lg max-w-none">
        <p className="text-lg text-slate-700 leading-relaxed mb-6">
          Moving from HDB to condo? Many people notice day-to-day hassles they didn’t expect. Below: 15 reality checks — what tends to happen in condos and why HDB is often smoother in these areas.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
          <p className="text-slate-800 text-sm"><strong>MCST</strong> = Management Corporation Strata Title (condo management). <strong>Sinking fund</strong> = reserve for major repairs and upgrades; you pay into it via monthly fees.</p>
        </div>

        <h2 id="delivery" className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Delivery / takeaway upstairs is harder</h2>
        <p className="text-slate-700 mb-2"><strong>Condo:</strong> Often requires security card or password for lifts, or intercom to grant access. If you’re not home or in a meeting, delivery can fail; packages may be left at mailbox or lobby.</p>
        <p className="text-slate-700 mb-6"><strong>HDB:</strong> Most blocks allow direct access to corridors; delivery failure rate tends to be lower.</p>

        <h2 id="security-sop" className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Security / management SOP can feel rigid</h2>
        <p className="text-slate-700 mb-2"><strong>Condo:</strong> Some security / management teams enforce rules strictly (e.g. needing to swipe to exit a back gate), which can feel frustrating in day-to-day life.</p>
        <p className="text-slate-700 mb-6"><strong>HDB:</strong> Generally free entry and exit; movement is more straightforward.</p>

        <h2 id="monthly-fees" className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Monthly management / sinking fund burden</h2>
        <p className="text-slate-700 mb-2"><strong>Condo:</strong> Maintenance and sinking fund keep rising. You pay for facilities even if you don’t use them; anxiety like &quot;I should use the pool/BBQ or it’s a waste&quot;.</p>
        <p className="text-slate-700 mb-6"><strong>HDB:</strong> No such high fixed monthly cost (or the perceived cost is much lower).</p>

        <h2 id="facility-maintenance" className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Facility maintenance not as good as imagined</h2>
        <p className="text-slate-700 mb-2"><strong>Condo:</strong> Facilities can show rust, aging, slow repairs; system upgrades (e.g. facial recognition, apps) can take a long time to roll out.</p>
        <p className="text-slate-700 mb-6"><strong>HDB / Town Council:</strong> Also depends on luck, but expectations for &quot;imperfect public facilities&quot; are generally lower.</p>

        <h2 id="renovation-time" className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Renovation / repair time limits</h2>
        <p className="text-slate-700 mb-2"><strong>Condo:</strong> Renovation and AC servicing often restricted to certain time slots and days; work may not be allowed after certain hours. Appliance or furniture delivery may have time windows (e.g. not after 4pm).</p>
        <p className="text-slate-700 mb-6"><strong>HDB:</strong> Relatively more flexibility and fewer restrictions.</p>

        <h2 id="moving-deposit" className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Moving / large items / renovation: deposit + procedures</h2>
        <p className="text-slate-700 mb-2"><strong>Condo:</strong> Refundable deposit ($500–$1000+), forms, coordination and approval for moving, large items or renovation.</p>
        <p className="text-slate-700 mb-6"><strong>HDB:</strong> Generally fewer procedures.</p>

        <h2 id="exterior-rules" className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Exterior uniformity rules</h2>
        <p className="text-slate-700 mb-2"><strong>Condo:</strong> Balcony may have restrictions on certain drying racks (e.g. Steigen, smart racks). Facade, balcony fans, colour schemes often regulated.</p>
        <p className="text-slate-700 mb-6"><strong>HDB:</strong> Usually more &quot;pragmatic&quot;; fewer restrictions (though some area-specific rules may apply).</p>

        <h2 id="common-areas" className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Stricter &quot;common area&quot; usage</h2>
        <p className="text-slate-700 mb-2"><strong>Condo:</strong> Corridors and space outside your door are largely common area; shoe racks, bicycles and clutter more likely to attract complaints or removal requests.</p>
        <p className="text-slate-700 mb-6"><strong>HDB:</strong> More relaxed corridor culture (though this can sometimes lead to neighbour disputes).</p>

        <h2 id="bulky-waste" className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Disposing of bulky waste is more troublesome</h2>
        <p className="text-slate-700 mb-2"><strong>Condo:</strong> You can’t just dump bulky items downstairs. Often need to find removal/disposal companies or vendors offering &quot;free disposal&quot;. Some MCSTs don’t provide bulky disposal.</p>
        <p className="text-slate-700 mb-6"><strong>HDB:</strong> Generally easier via Town Council procedures.</p>

        <h2 id="location-convenience" className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Location / amenities not as convenient as imagined</h2>
        <p className="text-slate-700 mb-2"><strong>Condo:</strong> Some are further from MRT/bus stops with no sheltered walkways; nearby supermarket may be small and expensive; forgetting an item means a long walk.</p>
        <p className="text-slate-700 mb-6"><strong>HDB:</strong> Wet market, hawker centre, supermarket, transport nodes are often downstairs or nearby, with more sheltered linkways.</p>

        <h2 id="visitor-flow" className="text-2xl font-bold text-slate-900 mt-8 mb-4">11. Visitor and vehicle flow is more complex</h2>
        <p className="text-slate-700 mb-2"><strong>Condo:</strong> Grab or delivery drivers may struggle to find the right entrance, pickup point or service lift. Visitors often need to register via QR or license plate.</p>
        <p className="text-slate-700 mb-6"><strong>HDB:</strong> Simpler traffic flow and more intuitive for visitors.</p>

        <h2 id="neighbour-sensitivity" className="text-2xl font-bold text-slate-900 mt-8 mb-4">12. Neighbours / residents can be more &quot;sensitive&quot;</h2>
        <p className="text-slate-700 mb-2"><strong>Condo:</strong> Sometimes there are more complaints about noise and shared-space rules (e.g. moving furniture, BBQ rules), which can increase day-to-day friction.</p>
        <p className="text-slate-700 mb-6"><strong>HDB:</strong> These issues exist too, but the &quot;pay more + more rules&quot; environment in condos can make mutual complaints more common.</p>

        <h2 id="short-term-tenants" className="text-2xl font-bold text-slate-900 mt-8 mb-4">13. Short-term rental / tenant turnover</h2>
        <p className="text-slate-700 mb-2"><strong>Condo:</strong> Often a higher proportion of tenants; less neighbourhood stability and more noticeable differences in living habits.</p>
        <p className="text-slate-700 mb-6"><strong>HDB:</strong> Generally more stable communities due to policy and lease structure.</p>

        <h2 id="false-security" className="text-2xl font-bold text-slate-900 mt-8 mb-4">14. Safety can be &quot;false sense of security&quot;</h2>
        <p className="text-slate-700 mb-2"><strong>Condo:</strong> Perimeter walls and guards can create a false sense of security. Ground-floor balconies may sometimes be left unlocked; package or shoe theft can still happen.</p>
        <p className="text-slate-700 mb-6"><strong>HDB:</strong> In recent years, more visible CCTV and police presence; a more tangible sense of deterrence.</p>

        <h2 id="pets" className="text-2xl font-bold text-slate-900 mt-8 mb-4">15. Pet-related externalities</h2>
        <p className="text-slate-700 mb-2"><strong>Condo:</strong> Often more dog owners; issues like feces or odours in common areas.</p>
        <p className="text-slate-700 mb-6"><strong>HDB:</strong> Can occur too; but in condos, higher density and concentrated shared spaces tend to make pet-related friction more apparent.</p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <p className="text-slate-900 font-medium mb-2">Compare HDB neighbourhoods</p>
          <p className="text-slate-700 mb-2">See price, transport, and lease by area when weighing HDB vs condo.</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link>
        </div>
      </div>
    ),
}
