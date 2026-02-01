import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { GuideData } from "../types"

export const guide: GuideData = {
  title: 'How to judge living comfort beyond price',
    description: 'Understanding how to judge living comfort beyond price when buying HDB resale flats in Singapore. Learn about hidden trade-offs in lower-priced neighbourhoods including transport, amenities, and lease safety.',
    relatedGuides: ['how-to-choose-hdb-neighbourhood', 'does-mrt-distance-really-matter'],
    content: (
      <div className="guide-prose prose prose-lg max-w-none">
        <p className="text-lg text-slate-700 leading-relaxed mb-6">
          Price is often the first thing people look at when buying a resale HDB flat. But the cheapest areas often come with hidden costs: longer commutes, fewer shops and schools, or shorter leases. This guide helps you see what you might be giving up when you choose a lower-priced neighbourhood.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Transport: the hidden cost of cheaper areas</h2>
        <p className="text-slate-700 mb-4">
          Cheaper neighbourhoods are often farther from MRT. The price difference can look attractive, but the transport trade-off adds up. “Just 15 minutes more” each way can mean:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li>Longer walks to MRT in heat and rain</li>
          <li>More crowded trains in peak hours</li>
          <li>Less flexibility for spontaneous trips and family outings</li>
          <li>A higher <strong>Transport Burden Index (TBI)</strong> — meaning more time and effort spent on transport, year after year</li>
          <li>More reliance on buses, which can be less reliable than MRT</li>
        </ul>
        <p className="text-slate-700 mb-6">
          When comparing flats, look at the TBI (not just MRT distance). A neighbourhood with good buses can feel easier than one slightly closer to MRT but with poor bus links. <Link href="/guides/does-mrt-distance-really-matter/" className="text-blue-600 hover:text-blue-700 underline">Read more: MRT distance vs real convenience</Link>.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Amenities and daily life</h2>
        <p className="text-slate-700 mb-4">
          Comfort isn’t just about the flat — it’s about what’s nearby. Cheaper areas often have fewer amenities:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li><strong>Food options:</strong> Limited hawker centres and quality restaurants nearby</li>
          <li><strong>Healthcare access:</strong> Fewer clinics and hospitals within walking distance</li>
          <li><strong>Recreational facilities:</strong> Limited parks, community centres, and sports facilities</li>
          <li><strong>Shopping convenience:</strong> Fewer supermarkets, malls, and essential services</li>
          <li><strong>Childcare and schools:</strong> Limited options may require longer commutes</li>
        </ul>
        <p className="text-slate-700 mb-6">
          These rarely show up in price comparisons but they affect daily comfort and convenience.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">School pressure (for families)</h2>
        <p className="text-slate-700 mb-4">
          Schools are allocated by <strong>planning area</strong> (a larger zone that includes several neighbourhoods). In cheaper areas, popular primary schools are often harder to get into. That can mean:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li>Higher competition for popular primary schools (PSLE decides secondary school placement; more competition = more “school pressure”)</li>
          <li>Longer journeys for children to reach preferred schools</li>
          <li>Fewer backup schools if your first choice is oversubscribed</li>
          <li>More stress for parents managing applications</li>
        </ul>
        <p className="text-slate-700 mb-6">
          Check PSLE cutoff trends and oversubscription in the planning area — not just the neighbourhood. <Link href="/guides/how-to-choose-hdb-neighbourhood/" className="text-blue-600 hover:text-blue-700 underline">See how to choose an HDB neighbourhood</Link>.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Lease: remaining years matter</h2>
        <p className="text-slate-700 mb-4">
          Some cheaper neighbourhoods have flats with shorter <strong>remaining lease</strong> (fewer years left on the 99-year lease). A lower price can look good now, but it affects your finances later:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li><strong>Loans:</strong> Banks may offer shorter loan terms or ask for a bigger down payment</li>
          <li><strong>Resale:</strong> Flats with under 60 years left tend to lose value and are harder to sell</li>
          <li><strong>Flexibility:</strong> If you need to move or upgrade later, options are more limited</li>
          <li><strong>CPF:</strong> Rules restrict how much CPF you can use for flats with shorter leases</li>
        </ul>
        <p className="text-slate-700 mb-6">
          Check the typical remaining lease in the neighbourhood. Flats with 70+ years left usually give you more flexibility and better loan terms.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">The real cost of choosing the cheapest option</h2>
        <p className="text-slate-700 mb-4">
          The cheapest flat isn’t always the best value. Hidden costs often include:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li><strong>Time cost:</strong> Extra commute time compounds over years, reducing family time</li>
          <li><strong>Quality of life:</strong> Daily inconveniences from limited amenities add stress</li>
          <li><strong>Future flexibility:</strong> Limited resale options if your needs change</li>
          <li><strong>Resale value:</strong> Cheaper areas may be harder to sell, especially with short leases</li>
          <li><strong>Family impact:</strong> School pressure and longer commutes affect children's daily experience</li>
        </ul>
        <p className="text-slate-700 mb-6">
          Our comparison tool shows price, transport, lease, and school pressure together — so you can judge real living comfort, not just upfront cost.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <p className="text-slate-900 font-medium mb-2">See the full picture</p>
          <p className="text-slate-700 mb-4">
            Compare neighbourhoods by price, transport, lease, and school pressure — not just the price tag.
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
