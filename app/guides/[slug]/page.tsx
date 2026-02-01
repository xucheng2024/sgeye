import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { notFound } from 'next/navigation'

interface GuideData {
  title: string
  description: string
  content: React.ReactNode
  relatedGuides?: string[]
}

const guideContent: Record<string, GuideData> = {
  'how-to-compare-hdb-neighbourhoods': {
    title: 'HDB Resale: How to Compare Neighbourhoods Beyond Price and MRT',
    description: 'A practical guide to comparing HDB neighbourhoods beyond price and MRT — including daily living comfort, transport, and long-term livability.',
    relatedGuides: ['how-to-choose-hdb-neighbourhood', 'why-cheap-hdb-feel-uncomfortable', 'does-mrt-distance-really-matter'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          When people talk about buying a resale HDB flat in Singapore, the conversation often starts — and ends — with price and MRT distance.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Those two factors matter. But after speaking with many buyers and analysing real neighbourhood data, one thing becomes clear:
        </p>
        <p className="text-lg text-gray-700 leading-relaxed mb-8 font-medium">
          Price and MRT alone are not enough to understand how it actually feels to live in a place.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          This guide walks through a more practical way to compare HDB neighbourhoods — especially if you're planning to stay for years, not just flip for value.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">In this guide</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li><a href="#price-vs-lease-safety" className="text-blue-600 hover:text-blue-700 underline">Price vs Lease Safety</a></li>
            <li><a href="#mrt-vs-daily-convenience" className="text-blue-600 hover:text-blue-700 underline">MRT Distance vs Real Daily Convenience</a></li>
            <li><a href="#daily-living-comfort" className="text-blue-600 hover:text-blue-700 underline">Daily Living Comfort</a></li>
            <li><a href="#family-routines" className="text-blue-600 hover:text-blue-700 underline">Family Routines and Long-Term Fit</a></li>
            <li><a href="#long-term-livability" className="text-blue-600 hover:text-blue-700 underline">Thinking Long-Term: Livability Over Time</a></li>
          </ol>
        </div>

        <h2 id="price-vs-lease-safety" className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          1. Price vs Lease Safety: What Are You Really Paying For?
        </h2>
        <p className="text-gray-700 mb-4">
          Two flats can be priced similarly today but behave very differently over time.
        </p>
        <p className="text-gray-700 mb-4">
          Beyond headline prices, it's important to consider:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li>Remaining lease and how it affects future resale</li>
          <li>How mature the estate is</li>
          <li>Whether prices are driven by genuine demand or short-term factors</li>
        </ul>
        <p className="text-gray-700 mb-6">
          A lower entry price can look attractive, but may come with trade-offs in long-term flexibility.
        </p>
        <p className="text-gray-700 mb-6">
          👉 Start by comparing neighbourhoods across price and lease profiles:{' '}
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline">
            Browse all neighbourhoods
          </Link>
        </p>

        <h2 id="mrt-vs-daily-convenience" className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          2. MRT Distance vs Real Daily Convenience
        </h2>
        <p className="text-gray-700 mb-4">
          "Near MRT" is one of the most overused phrases in property listings.
        </p>
        <p className="text-gray-700 mb-4">
          What matters more in daily life is:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li>How long it actually takes door-to-door</li>
          <li>Whether you rely on buses, transfers, or walking</li>
          <li>Crowding during peak hours</li>
          <li>The mental load of commuting every day</li>
        </ul>
        <p className="text-gray-700 mb-6">
          Some neighbourhoods slightly farther from MRT stations still offer smoother daily routines due to better bus connectivity, walkability, or local amenities.
        </p>
        <p className="text-gray-700 mb-4">
          For example, some neighbourhoods like{' '}
          <Link href="/neighbourhood/bishan-east" className="text-blue-600 hover:text-blue-700 underline">
            Bishan East
          </Link>{' '}
          and{' '}
          <Link href="/neighbourhood/clementi-west" className="text-blue-600 hover:text-blue-700 underline">
            Clementi West
          </Link>{' '}
          are often described as "well-connected".
        </p>
        <p className="text-gray-700 mb-6">
          But their daily experience differs once you factor in crowd levels, transfer patterns, and walking distance to amenities.
        </p>
        <p className="text-gray-700 mb-6">
          👉 See how transport access differs across neighbourhoods:{' '}
          <Link href="/transport" className="text-blue-600 hover:text-blue-700 underline">
            Explore transport factors
          </Link>
        </p>

        <h2 id="daily-living-comfort" className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          3. Daily Living Comfort (Often Ignored, Always Felt)
        </h2>
        <p className="text-gray-700 mb-4">
          This is the hardest part to quantify — and the one buyers most often regret ignoring.
        </p>
        <p className="text-gray-700 mb-4">
          Daily living comfort includes:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li>Crowd density at different times of day</li>
          <li>Noise levels and foot traffic</li>
          <li>Ease of walking to food, parks, and daily errands</li>
          <li>How the neighbourhood feels on a weekday evening (not just weekends)</li>
        </ul>
        <p className="text-gray-700 mb-4">
          These factors rarely appear in listings, but they shape everyday experience far more than floor plans or renovation photos.
        </p>
        <p className="text-gray-700 mb-4">
          Neighbourhoods within the same planning area can also feel very different.
        </p>
        <p className="text-gray-700 mb-6">
          For instance, comparing{' '}
          <Link href="/neighbourhood/bukit-batok-west" className="text-blue-600 hover:text-blue-700 underline">
            Bukit Batok West
          </Link>{' '}
          and nearby profiles highlights how block layout, green space, and traffic patterns influence everyday comfort.
        </p>
        <p className="text-gray-700 mb-6">
          👉 Compare neighbourhoods beyond listings and brochures:{' '}
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline">
            View neighbourhood profiles
          </Link>
        </p>

        <h2 id="family-routines" className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          4. Family Routines and Long-Term Fit
        </h2>
        <p className="text-gray-700 mb-4">
          If you're buying with family considerations in mind, neighbourhood choice affects more than just space.
        </p>
        <p className="text-gray-700 mb-4">
          Think about:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li>Primary school proximity and competition</li>
          <li>Child-friendly amenities</li>
          <li>Ease of daily routines over many years</li>
          <li>Whether the area supports your lifestyle as children grow</li>
        </ul>
        <p className="text-gray-700 mb-6">
          Even buyers without children today often underestimate how much neighbourhood context matters later.
        </p>
        <p className="text-gray-700 mb-6">
          👉 Understand how neighbourhoods relate to family considerations:{' '}
          <Link href="/family/psle-school" className="text-blue-600 hover:text-blue-700 underline">
            See family-related insights
          </Link>
        </p>

        <h2 id="long-term-livability" className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          5. Thinking Long-Term: Livability Over Time
        </h2>
        <p className="text-gray-700 mb-4">
          A good neighbourhood isn't just livable today — it remains livable as circumstances change.
        </p>
        <p className="text-gray-700 mb-4">
          Ask:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li>Will this area still work if routines change?</li>
          <li>Is the environment resilient to ageing infrastructure?</li>
          <li>Does it support both convenience and sustainability?</li>
        </ul>
        <p className="text-gray-700 mb-4">
          Short-term excitement fades quickly. Daily livability compounds quietly.
        </p>
        <p className="text-gray-700 mb-4">
          This is why some buyers revisit areas like{' '}
          <Link href="/neighbourhood/tampines-north" className="text-blue-600 hover:text-blue-700 underline">
            Tampines North
          </Link>{' '}
          multiple times at different hours before deciding.
        </p>
        <p className="text-gray-700 mb-6">
          👉 Compare neighbourhoods with a long-term lens:{' '}
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline">
            Compare neighbourhoods
          </Link>
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          Putting It All Together
        </h2>
        <p className="text-gray-700 mb-4">
          Choosing a resale HDB flat isn't just about finding the "best deal".
        </p>
        <p className="text-gray-700 mb-4">
          It's about finding a neighbourhood that:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li>Fits your daily routines</li>
          <li>Matches your tolerance for crowding and commuting</li>
          <li>Supports your family and lifestyle over time</li>
          <li>Still makes sense years after the novelty wears off</li>
        </ul>
        <p className="text-gray-700 mb-6">
          If you want to explore Singapore neighbourhoods using real data on prices, transport access, and living comfort:
        </p>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">
            👉 Start here:{' '}
            <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-semibold">
              Browse all neighbourhood profiles
            </Link>
          </p>
        </div>
      </div>
    ),
  },
  'how-to-choose-hdb-neighbourhood': {
    title: 'How to choose a HDB neighbourhood',
    description: 'A step-by-step guide to evaluating Singapore HDB neighbourhoods based on your family\'s priorities, transport convenience, lease safety, and school pressure. Learn how to make informed HDB buying decisions.',
    relatedGuides: ['why-cheap-hdb-feel-uncomfortable', 'does-mrt-distance-really-matter'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Choosing the right HDB neighbourhood in Singapore is one of the most important decisions 
          you'll make when buying HDB resale flats. The neighbourhood you select will shape your daily 
          life for years to come — from your commute and transport convenience to your children's school 
          options, to your long-term financial security and living comfort.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Step 1: Understand your priorities</h2>
        <p className="text-gray-700 mb-4">
          Before diving into data, clarify what matters most to your family:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li>Daily commute time and convenience</li>
          <li>School options and competition levels</li>
          <li>Long-term lease safety (remaining years)</li>
          <li>Budget constraints</li>
          <li>Lifestyle preferences (quiet vs. vibrant)</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Step 2: Evaluate HDB price vs. value and living comfort</h2>
        <p className="text-gray-700 mb-4">
          When choosing HDB neighbourhoods in Singapore, lower prices often come with trade-offs in 
          living comfort. Use our HDB neighbourhood comparison tool to evaluate:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li>Median HDB resale prices over the past 12 months</li>
          <li>Price stability trends to understand market volatility</li>
          <li>How prices compare to nearby Singapore neighbourhoods</li>
          <li>Price per square meter (PSM) for better value comparison</li>
        </ul>
        <p className="text-gray-700 mb-6">
          Remember: The cheapest HDB neighbourhood may not offer the best value when you consider 
          transport burden, amenities, and long-term living comfort. <Link href="/guides/why-cheap-hdb-feel-uncomfortable/" className="text-blue-600 hover:text-blue-700 underline">Learn how to judge living comfort beyond price</Link>.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Step 3: Check transport access and real convenience</h2>
        <p className="text-gray-700 mb-4">
          When choosing HDB neighbourhoods in Singapore, MRT distance matters, but real convenience 
          depends on more than just proximity. Consider these factors:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li>Number of MRT stations within the neighbourhood (more stations = better connectivity)</li>
          <li>Average walking distance to nearest MRT station</li>
          <li>Bus connectivity as backup transport option</li>
          <li>Transport Burden Index (TBI) for overall real convenience assessment</li>
          <li>Peak hour crowding and reliability of transport options</li>
        </ul>
        <p className="text-gray-700 mb-6">
          Understanding <Link href="/guides/does-mrt-distance-really-matter/" className="text-blue-600 hover:text-blue-700 underline">MRT distance vs real convenience</Link> helps you evaluate true transport convenience 
          for daily living in Singapore. A neighbourhood with good bus connectivity may offer better 
          real convenience than one slightly closer to MRT.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Step 4: Assess HDB lease safety and long-term value</h2>
        <p className="text-gray-700 mb-4">
          When buying HDB resale flats in Singapore, remaining lease affects both your living comfort 
          and long-term financial security:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li><strong>70+ years remaining:</strong> Generally safe for long-term ownership, better financing options</li>
          <li><strong>60-69 years:</strong> Acceptable for owner-occupation but may affect future HDB resale value</li>
          <li><strong>Less than 60 years:</strong> Higher risk, may limit CPF usage and bank financing options</li>
        </ul>
        <p className="text-gray-700 mb-6">
          Check the median remaining lease years in the neighbourhood when comparing HDB options. 
          Lease safety is crucial for long-term living comfort and financial flexibility in Singapore.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Step 5: Research school pressure in Singapore planning areas</h2>
        <p className="text-gray-700 mb-4">
          For families buying HDB resale flats, school competition at the planning area level is crucial 
          for daily living comfort:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li>Check PSLE cutoff trends in the planning area to understand competition levels</li>
          <li>Understand school oversubscription rates and admission pressure</li>
          <li>Consider backup school options if primary choices are oversubscribed</li>
          <li>Evaluate school quality and proximity to your HDB neighbourhood</li>
        </ul>
        <p className="text-gray-700 mb-6">
          School pressure affects family stress levels and daily routines. When choosing HDB neighbourhoods, 
          check school competition data at the planning area level, not just individual neighbourhood level.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Step 6: Compare HDB neighbourhoods and decide</h2>
        <p className="text-gray-700 mb-4">
          Use our Singapore HDB neighbourhood comparison tool to see side-by-side trade-offs between 
          2-3 neighbourhoods. Compare:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li>HDB resale prices and price stability</li>
          <li>Lease safety and remaining lease years</li>
          <li>Transport burden index (TBI) and real convenience</li>
          <li>School pressure at planning area level</li>
          <li>Living comfort factors beyond price</li>
        </ul>
        <p className="text-gray-700 mb-6">
          This comprehensive comparison helps you judge living comfort beyond price and understand 
          MRT distance vs real convenience when choosing HDB neighbourhoods in Singapore.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Ready to choose your HDB neighbourhood?</p>
          <p className="text-gray-700 mb-4">
            Start comparing Singapore HDB neighbourhoods with our data-driven tools. Evaluate price, 
            transport convenience, lease safety, and school pressure to make an informed decision.
          </p>
          <Link
            href="/neighbourhoods"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Explore HDB neighbourhoods in Singapore
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    ),
  },
  'why-cheap-hdb-feel-uncomfortable': {
    title: 'How to judge living comfort beyond price',
    description: 'Understanding how to judge living comfort beyond price when buying HDB resale flats in Singapore. Learn about hidden trade-offs in lower-priced neighbourhoods including transport, amenities, and lease safety.',
    relatedGuides: ['how-to-choose-hdb-neighbourhood', 'does-mrt-distance-really-matter'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          When buying HDB resale flats in Singapore, price is often the first consideration. However, 
          many buyers discover that the cheapest HDB neighbourhoods come with hidden costs that affect 
          daily living comfort and long-term satisfaction. Understanding how to judge living comfort 
          beyond price is crucial for making the right HDB purchase decision.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Transport access: The hidden cost of cheap HDB flats</h2>
        <p className="text-gray-700 mb-4">
          Lower-priced HDB neighbourhoods in Singapore are often located further from MRT stations. 
          While the price difference might seem attractive, the transport trade-off affects daily 
          living comfort significantly. What appears as "just 15 minutes more" on paper translates to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li>Longer walks to MRT stations in Singapore's heat and frequent rain</li>
          <li>More crowded trains during peak hours, reducing commute comfort</li>
          <li>Less flexibility for spontaneous trips and family activities</li>
          <li>Higher transport burden index (TBI) that compounds over years</li>
          <li>Increased reliance on buses, which can be less reliable than MRT</li>
        </ul>
        <p className="text-gray-700 mb-6">
          When evaluating HDB resale flats, consider the Transport Burden Index (TBI) rather than 
          just MRT distance. <Link href="/guides/does-mrt-distance-really-matter/" className="text-blue-600 hover:text-blue-700 underline">Understanding MRT distance vs real convenience</Link> helps you see that a neighbourhood 
          with good bus connectivity and multiple transport options may offer better living comfort 
          than one that's slightly closer to MRT but lacks alternatives.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Amenities and daily living comfort</h2>
        <p className="text-gray-700 mb-4">
          Living comfort in Singapore HDB neighbourhoods extends beyond the flat itself. Lower-priced 
          areas often have fewer amenities that affect daily quality of life:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li><strong>Food options:</strong> Limited hawker centres and quality restaurants nearby</li>
          <li><strong>Healthcare access:</strong> Fewer clinics and hospitals within walking distance</li>
          <li><strong>Recreational facilities:</strong> Limited parks, community centres, and sports facilities</li>
          <li><strong>Shopping convenience:</strong> Fewer supermarkets, malls, and essential services</li>
          <li><strong>Childcare and schools:</strong> Limited options may require longer commutes</li>
        </ul>
        <p className="text-gray-700 mb-6">
          These factors don't show up in HDB price comparisons but significantly impact daily living 
          comfort and convenience for families in Singapore.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">School pressure and family living comfort</h2>
        <p className="text-gray-700 mb-4">
          For families buying HDB resale flats, school competition at the planning area level is a 
          critical factor affecting living comfort. Lower-priced neighbourhoods often face:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li>Higher competition for popular primary schools, increasing PSLE pressure</li>
          <li>Longer commutes for children to reach preferred schools</li>
          <li>Fewer backup school options if primary choice is oversubscribed</li>
          <li>Higher stress levels for parents managing school applications</li>
        </ul>
        <p className="text-gray-700 mb-6">
          When judging living comfort beyond price, check PSLE cutoff trends and school oversubscription 
          rates in the planning area. This data helps families understand the real daily experience beyond 
          just HDB flat prices. <Link href="/guides/how-to-choose-hdb-neighbourhood/" className="text-blue-600 hover:text-blue-700 underline">Learn more about choosing HDB neighbourhoods</Link>.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Lease safety and long-term living comfort</h2>
        <p className="text-gray-700 mb-4">
          Some lower-priced HDB neighbourhoods in Singapore have shorter remaining leases. While the 
          initial price may be attractive, this affects long-term living comfort and financial security:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li><strong>Financing limitations:</strong> Banks may offer shorter loan tenures or require higher down payments</li>
          <li><strong>Resale value decay:</strong> HDB flats with less than 60 years remaining lease face declining value</li>
          <li><strong>Future uncertainty:</strong> Limited options if you need to move or upgrade later</li>
          <li><strong>CPF usage:</strong> Restrictions on using CPF for flats with shorter leases</li>
        </ul>
        <p className="text-gray-700 mb-6">
          When evaluating HDB resale flats, check the median remaining lease years in the neighbourhood. 
          Flats with 70+ years offer better long-term living comfort and financial flexibility.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">The real cost of choosing cheap HDB flats</h2>
        <p className="text-gray-700 mb-4">
          When buying HDB resale flats in Singapore, the cheapest option isn't always the best value. 
          To judge living comfort beyond price, consider these hidden costs:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li><strong>Time cost:</strong> Extra commute time compounds over years, reducing family time</li>
          <li><strong>Quality of life:</strong> Daily inconveniences from limited amenities add stress</li>
          <li><strong>Future flexibility:</strong> Limited resale options if your needs change</li>
          <li><strong>Resale value:</strong> Cheaper areas may be harder to sell, especially with short leases</li>
          <li><strong>Family impact:</strong> School pressure and longer commutes affect children's daily experience</li>
        </ul>
        <p className="text-gray-700 mb-6">
          Use our HDB neighbourhood comparison tool to see the complete picture: price, transport burden, 
          lease safety, and school pressure. This helps you judge true living comfort, not just initial cost.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Judge living comfort with data</p>
          <p className="text-gray-700 mb-4">
            Use our Singapore HDB neighbourhood comparison tool to see exactly what you gain and 
            what you trade off when choosing a lower-priced neighbourhood. Compare transport burden, 
            lease safety, amenities, and school pressure to make an informed HDB buying decision.
          </p>
          <Link
            href="/neighbourhoods"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Compare HDB neighbourhoods
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    ),
  },
  'does-mrt-distance-really-matter': {
    title: 'MRT distance vs real convenience',
    description: 'Understanding MRT distance vs real convenience when choosing HDB neighbourhoods in Singapore. Learn what factors affect daily transport convenience beyond just MRT proximity, including Transport Burden Index.',
    relatedGuides: ['how-to-choose-hdb-neighbourhood', 'why-cheap-hdb-feel-uncomfortable'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          When buying HDB resale flats in Singapore, MRT proximity is often the first thing buyers check. 
          However, the relationship between MRT distance and real convenience is more nuanced than it appears. 
          Understanding MRT distance vs real convenience helps you make better HDB buying decisions based on 
          actual daily living experience, not just proximity metrics.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">When MRT distance matters for real convenience</h2>
        <p className="text-gray-700 mb-4">
          For HDB buyers in Singapore, MRT proximity translates to real convenience if you:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li>Commute daily to Singapore's city center or business districts</li>
          <li>Rely primarily on public transport for most daily trips</li>
          <li>Value flexibility for spontaneous family outings and activities</li>
          <li>Have mobility constraints that make walking long distances challenging</li>
          <li>Work irregular hours and need reliable late-night transport options</li>
        </ul>
        <p className="text-gray-700 mb-6">
          In these cases, choosing an HDB neighbourhood with MRT stations within walking distance 
          significantly improves daily living convenience in Singapore.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">MRT distance vs real convenience: Beyond meters</h2>
        <p className="text-gray-700 mb-4">
          When evaluating HDB neighbourhoods in Singapore, real convenience depends on more than just 
          walking distance to MRT stations. Consider these factors:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li><strong>MRT station quality:</strong> Interchange stations offer better connectivity and more route options</li>
          <li><strong>Line efficiency:</strong> Some Singapore MRT lines (like Circle Line, East-West Line) are more reliable</li>
          <li><strong>Bus connectivity:</strong> Good bus networks can offset longer MRT walks, improving real convenience</li>
          <li><strong>Weather protection:</strong> Covered walkways and sheltered bus stops make longer distances more bearable</li>
          <li><strong>Peak hour crowding:</strong> Some MRT stations are less crowded, making commutes more comfortable</li>
          <li><strong>Future MRT expansion:</strong> Planned stations may improve convenience, but don't count on them</li>
        </ul>
        <p className="text-gray-700 mb-6">
          A neighbourhood 800m from an MRT station with excellent bus connectivity may offer better 
          real convenience than one 400m away with poor bus options. This is why <Link href="/guides/why-cheap-hdb-feel-uncomfortable/" className="text-blue-600 hover:text-blue-700 underline">judging living comfort beyond price</Link> requires looking at the full transport picture.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Transport Burden Index: Measuring real convenience</h2>
        <p className="text-gray-700 mb-4">
          Our Transport Burden Index (TBI) measures real convenience for HDB neighbourhoods in Singapore, 
          considering multiple factors beyond just MRT distance:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li><strong>MRT distance:</strong> Walking distance to nearest MRT stations</li>
          <li><strong>Station count:</strong> Number of MRT stations within the neighbourhood area</li>
          <li><strong>Bus connectivity:</strong> Quality and frequency of bus services</li>
          <li><strong>Transport infrastructure:</strong> Overall public transport network quality</li>
          <li><strong>Accessibility:</strong> Ease of reaching key destinations (CBD, schools, amenities)</li>
        </ul>
        <p className="text-gray-700 mb-6">
          A low TBI score means you'll spend less time and effort on daily transport, translating to 
          better real convenience. A high TBI means you'll need to invest more time in commuting, 
          affecting daily living comfort in Singapore. When comparing HDB neighbourhoods, check the TBI 
          rather than just MRT distance to understand true transport convenience.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">When MRT distance is less critical for real convenience</h2>
        <p className="text-gray-700 mb-4">
          For some HDB buyers in Singapore, MRT distance may be less critical for real convenience if you:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li><strong>Drive regularly:</strong> Own a car or have consistent access to one</li>
          <li><strong>Work from home:</strong> Remote work reduces daily commute needs</li>
          <li><strong>Strong bus network:</strong> Excellent bus connectivity can offset longer MRT walks</li>
          <li><strong>Other priorities:</strong> Price, lease safety, or school options matter more than transport</li>
          <li><strong>Flexible schedule:</strong> Non-peak hour travel makes bus alternatives more viable</li>
        </ul>
        <p className="text-gray-700 mb-6">
          However, even if MRT distance isn't your top priority, consider the Transport Burden Index 
          to understand overall real convenience. A neighbourhood with good bus connectivity may offer 
          better value than one that's slightly closer to MRT but lacks alternatives.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Long-term real convenience: How transport needs change</h2>
        <p className="text-gray-700 mb-4">
          When buying HDB resale flats in Singapore, consider how your transport needs and real convenience 
          requirements might evolve over time:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li><strong>Career changes:</strong> New jobs may require different commute patterns, making MRT access more important</li>
          <li><strong>Family evolution:</strong> Children's schools and activities may increase transport needs</li>
          <li><strong>MRT expansion:</strong> Singapore's MRT network grows, but don't count on future stations when buying</li>
          <li><strong>Aging and mobility:</strong> Tolerance for longer walks may decrease as you age</li>
          <li><strong>Lifestyle changes:</strong> More frequent outings may make MRT proximity more valuable</li>
        </ul>
        <p className="text-gray-700 mb-6">
          Choosing an HDB neighbourhood with good transport infrastructure (not just MRT distance) provides 
          better long-term real convenience and flexibility for changing needs. This is part of <Link href="/guides/how-to-choose-hdb-neighbourhood/" className="text-blue-600 hover:text-blue-700 underline">choosing the right HDB neighbourhood</Link> for your family.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Understand real convenience with Transport Burden Index</p>
          <p className="text-gray-700 mb-4">
            When buying HDB resale flats in Singapore, check the Transport Burden Index (TBI) for any 
            neighbourhood to understand real convenience beyond just MRT distance. Compare transport 
            burden, MRT access, and bus connectivity to make informed decisions about daily living comfort.
          </p>
          <Link
            href="/transport"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Explore Singapore HDB transport access
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    ),
  },
  'old-hdb-resale-pros-and-cons': {
    title: 'Old HDB Resale: Is It Worth It? Location, Space, Renovation & Lease',
    description: 'A balanced comparison of buying (or not) older resale HDB flats — core reasons, location, space, renovation costs, neighbours, lease decay, and who it suits.',
    relatedGuides: ['hdb-vs-condo-living-experience', 'how-to-choose-hdb-neighbourhood', 'hdb-resale-agent-vs-diy'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Should you buy or buy again an old resale HDB flat? This guide condenses two views into one table: the case for buying older resale (pros) and the case against / higher risk (cons), so you can see what each side emphasises.
        </p>

        <h2 id="core-reason" className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Core reason</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros (would buy / buy again)</p>
            <p className="text-gray-700">Location and space matter most; old areas are often &quot;better to live in&quot;.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons (not recommended / higher risk)</p>
            <p className="text-gray-700">Population structure and neighbourhood issues are hard to control, leading to potential discomfort.</p>
          </div>
        </div>

        <h2 id="location-transport" className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Location / transport</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-gray-700">Mature areas, near MRT or interchange, convenient commute; some feel &quot;quiet like a graveyard&quot;.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-gray-700">Some old areas have a complex environment with lots of foot traffic; experience varies by specific location and building type.</p>
          </div>
        </div>

        <h2 id="space-layout" className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Space / layout</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-gray-700">Large, squarish layouts with less wasted corridor space; cheaper price per square foot (PSF); often more practical than many BTO flats.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-gray-700">Old layouts can be odd; uneven beams or walls affect renovation and aesthetics.</p>
          </div>
        </div>

        <h2 id="hardware" className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Housing hardware (leaks / cracks / aging)</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-gray-700">Structure is generally acceptable; most hardware issues can be &quot;solved with money&quot;; a full gut renovation can greatly improve the flat.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-gray-700">Hidden problems and future aging risks (spalling, clogged pipes, uneven walls); repairs are expensive and issues may recur.</p>
          </div>
        </div>

        <h2 id="renovation-cost" className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Renovation cost and complexity</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-gray-700">You will renovate to your liking anyway; cheap old unit plus heavy renovation can be worthwhile. Common controllable items: wiring, plumbing, ceiling, enclosing garbage chutes.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-gray-700">&quot;Invisible costs&quot; are high — rewiring, replacing pipes, correcting uneven walls/floors add up. The external environment cannot be changed even with more money.</p>
          </div>
        </div>

        <h2 id="facilities" className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Facility maintenance (lifts / common areas)</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-gray-700">HDB lifts are usually repaired quickly; some old estates have good infrastructure after upgrading (e.g. running tracks, fitness corners).</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-gray-700">Cleanliness and facility condition vary; lifts and common areas can be worse (trash, odours).</p>
          </div>
        </div>

        <h2 id="neighbours" className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Neighbours / population structure</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-gray-700">Neighbours are largely luck — even new BTOs can have bad ones; mature central prime areas may have &quot;better quality&quot;, more &quot;civilised&quot; residents.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-gray-700">Old areas can have a high proportion of elderly, incense, smoking, bird feeding/droppings, noise, hoarding, littering; a &quot;hellish neighbour&quot; can ruin daily life.</p>
          </div>
        </div>

        <h2 id="customs" className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Living environment &quot;customs&quot;</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-gray-700">If you can accept them, it is fine; some feel old areas have a &quot;lively atmosphere&quot; and familiarity.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-gray-700">More frequent funerals and customs (e.g. Hungry Ghost Festival) can affect opening windows; tough for those sensitive to smells or noise.</p>
          </div>
        </div>

        <h2 id="hygiene-pests" className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Hygiene / pests</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-gray-700">Good garbage chute management (e.g. magnetic lids, sealed chutes) can reduce cockroach problems.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-gray-700">Garbage chutes, pests and bird droppings are more common; lower floors tend to be more affected.</p>
          </div>
        </div>

        <h2 id="selection-strategy" className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Property selection strategy</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-gray-700">Prefer point blocks, high floors, fewer shared walls, fewer units per floor; avoid garbage collection points, schools, coffee shops, bus stops.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-gray-700">Even with good selection you cannot prevent neighbour changes (e.g. estates deteriorating after 2010); &quot;old exterior, old neighbours&quot; cannot be changed.</p>
          </div>
        </div>

        <h2 id="value-lease" className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Value / exit strategy (lease)</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-gray-700">Focus on owner-occupier value (location + space + living convenience); acceptable if you plan to live there a long time.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-gray-700">Lease decay affects future resale and loan eligibility; do not assume it is a &quot;forever home&quot; — have an exit strategy (e.g. moving to a more elder-friendly home later).</p>
          </div>
        </div>

        <h2 id="suitable-crowd" className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Who it suits</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-gray-700">Suitable for those who value location, commute and space; are willing to invest in renovation; and can accept a mature community atmosphere.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-gray-700">Not suitable for those sensitive to noise, smells or neighbours; who dislike uncertainty; whose budget cannot absorb renovation costs; or who need future resale flexibility.</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Compare neighbourhoods with data</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link> to see price trends, transport access and lease profiles.
        </div>
      </div>
    ),
  },
  'hdb-vs-condo-living-experience': {
    title: 'HDB vs Condo Living Experience (Based on Real Reviews)',
    description: 'Side-by-side comparison of HDB and condo living in Singapore: delivery, monthly costs, convenience, space, facilities, security, visitors, and mindset.',
    relatedGuides: ['old-hdb-resale-pros-and-cons', 'moving-from-hdb-to-condo-inconveniences', 'how-to-compare-hdb-neighbourhoods'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          This table compares HDB and condo living experience in Singapore based on real comments (e.g. from r/singapore). Each row is one dimension: ✓ = advantage, ✗ = disadvantage, ▲ = mixed or caution.
        </p>

        <div className="overflow-x-auto mb-8">
          <table className="w-full border border-gray-300 text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border-b font-semibold">Dimension</th>
                <th className="p-3 border-b font-semibold">HDB (public housing)</th>
                <th className="p-3 border-b font-semibold">Condo (private)</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr><td className="p-3 border-b font-medium">Delivery / takeaway</td><td className="p-3 border-b">✓ Very convenient — leave at door, photo and go.</td><td className="p-3 border-b">✗ Common pain: intercom, card swipe, lift limits; deliveries easily missed.</td></tr>
              <tr><td className="p-3 border-b font-medium">Monthly cost</td><td className="p-3 border-b">✓ Low management fees (town council / misc).</td><td className="p-3 border-b">✗ High management fees; you pay whether you use facilities or not.</td></tr>
              <tr><td className="p-3 border-b font-medium">Daily convenience</td><td className="p-3 border-b">✓ Kopitiam, supermarket, convenience store downstairs.</td><td className="p-3 border-b">✗ Often in quiet locations; eating and shopping less convenient.</td></tr>
              <tr><td className="p-3 border-b font-medium">Space size</td><td className="p-3 border-b">✓ Usually larger for same price (especially older resale).</td><td className="p-3 border-b">✗ Units tend small — &quot;pretty outside, cramped inside&quot;.</td></tr>
              <tr><td className="p-3 border-b font-medium">Facilities (pool / gym)</td><td className="p-3 border-b">✗ No private facilities.</td><td className="p-3 border-b">▲ Available but quality varies; gyms often criticised as &quot;lousy&quot;.</td></tr>
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

        <p className="text-gray-700 mb-6">
          In short: HDB is often described as &quot;good to live in, convenient, worry-free&quot;; condo as &quot;good-looking, many rules, mentally tiring&quot;. Your choice depends on whether you prioritise daily ease or asset value and facilities.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Compare HDB neighbourhoods</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link> for price, transport and lease data.
        </div>
      </div>
    ),
  },
  'hdb-resale-agent-vs-diy': {
    title: 'HDB Resale: Using an Agent vs DIY — When It\'s Worth It',
    description: 'Pros and cons of using a real estate agent vs DIY for HDB resale — process, viewings, negotiation, complex deals, commission, and who each option suits.',
    relatedGuides: ['old-hdb-resale-pros-and-cons', 'how-to-choose-hdb-neighbourhood', 'moving-from-hdb-to-condo-inconveniences'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Should you use an agent or go DIY for HDB resale? This guide condenses two views: the case for using an agent (pro) and the case against (con), so you can see what each side &quot;buys&quot; or rebuts.
        </p>

        <h2 id="core-reason" className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Core reason</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-gray-700">Saves effort, time and worry.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent (DIY)</p>
            <p className="text-gray-700">You can DIY; the process is already systematised.</p>
          </div>
        </div>

        <h2 id="what-you-buy" className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. What you actually buy</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-gray-700">Project management + communication proxy + risk outsourcing.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-gray-700">You save 1–2% commission.</p>
          </div>
        </div>

        <h2 id="process-documents" className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Process / documents</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-gray-700">Agent knows the process; fewer wrong turns.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-gray-700">HDB Resale Portal already handles eligibility, OTP, submission and completion.</p>
          </div>
        </div>

        <h2 id="finding-viewing" className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Finding / viewing homes</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-gray-700">Agent arranges viewings, contacts the other party, tracks schedule.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-gray-700">You can shortlist and book viewings yourself; it just takes time.</p>
          </div>
        </div>

        <h2 id="selling-exposure" className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Selling / exposure</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-gray-700">Agent has platforms (e.g. PropertyGuru) and network for viewings.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-gray-700">Sellers are more tied to platforms: many big portals don’t allow individuals to list directly.</p>
          </div>
        </div>

        <h2 id="negotiation" className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Negotiation / price</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-gray-700">May help you push price down or up, reduce COV.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-gray-700">No guarantee; many negotiate -50k / -90k using data themselves.</p>
          </div>
        </div>

        <h2 id="emotions-conflicts" className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Emotions and conflicts</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-gray-700">Acts as buffer; avoids buyer and seller arguing directly.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-gray-700">Many feel this isn’t worth the cost; communication should be direct and efficient anyway.</p>
          </div>
        </div>

        <h2 id="complex-deals" className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Complex transactions</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-gray-700">Contra, timeline, extension, handover details are more stable with an agent.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-gray-700">These are minority cases; ordinary buy/sell is not that complex.</p>
          </div>
        </div>

        <h2 id="sense-of-security" className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. &quot;Insurance&quot; feeling</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-gray-700">Someone responsible / to rely on / to blame if things go wrong (psychological safety).</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-gray-700">Commission is high but doesn’t equal quality; incentives are misaligned (closing fast matters more).</p>
          </div>
        </div>

        <h2 id="quality-difference" className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Quality difference</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-gray-700">Good agent = experience + network + attention to detail.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-gray-700">Market isn’t stratified: new and veteran agents charge the same %; many just run SOP.</p>
          </div>
        </div>

        <h2 id="suitable-for" className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Who it suits</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro-agent</p>
            <p className="text-gray-700">Busy; afraid of mistakes; don’t want to handle communication; complex transaction.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con-agent</p>
            <p className="text-gray-700">Have time to research; rational about negotiation; cost-sensitive; willing to push the process yourself.</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Compare neighbourhoods</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link> for HDB resale context and data.
        </div>
      </div>
    ),
  },
  'moving-from-hdb-to-condo-inconveniences': {
    title: '15 Reality Checks When Moving from HDB to Condo',
    description: 'What you give up when moving from HDB to condo: delivery, security SOP, management fees, renovation rules, visitor flow, neighbours, and more.',
    relatedGuides: ['hdb-vs-condo-living-experience', 'old-hdb-resale-pros-and-cons', 'how-to-compare-hdb-neighbourhoods'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Many people who move from HDB to condo notice day-to-day inconveniences they didn’t expect. This guide lists 15 reality checks: what happens in condos and why HDB is often &quot;smoother&quot; in these areas.
        </p>

        <h2 id="delivery" className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Delivery / takeaway upstairs is harder</h2>
        <p className="text-gray-700 mb-2"><strong>Condo:</strong> Often requires security card or password for lifts, or intercom to grant access. If you’re not home or in a meeting, delivery can fail; packages may be left at mailbox or lobby.</p>
        <p className="text-gray-700 mb-6"><strong>HDB:</strong> Most blocks allow direct access to corridors; delivery failure rate tends to be lower.</p>

        <h2 id="security-sop" className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Security / management SOP can feel rigid</h2>
        <p className="text-gray-700 mb-2"><strong>Condo:</strong> Some security are very strict, unwilling to bend rules for fear of reprimand — e.g. having to swipe to exit a back gate can feel &quot;anti-human&quot;.</p>
        <p className="text-gray-700 mb-6"><strong>HDB:</strong> Generally free entry and exit; movement is more straightforward.</p>

        <h2 id="monthly-fees" className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Monthly management / sinking fund burden</h2>
        <p className="text-gray-700 mb-2"><strong>Condo:</strong> Maintenance and sinking fund keep rising. You pay for facilities even if you don’t use them; anxiety like &quot;I should use the pool/BBQ or it’s a waste&quot;.</p>
        <p className="text-gray-700 mb-6"><strong>HDB:</strong> No such high fixed monthly cost (or the perceived cost is much lower).</p>

        <h2 id="facility-maintenance" className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Facility maintenance not as good as imagined</h2>
        <p className="text-gray-700 mb-2"><strong>Condo:</strong> Facilities can show rust, aging, slow repairs; system upgrades (e.g. facial recognition, apps) can take a long time to roll out.</p>
        <p className="text-gray-700 mb-6"><strong>HDB / Town Council:</strong> Also depends on luck, but expectations for &quot;imperfect public facilities&quot; are generally lower.</p>

        <h2 id="renovation-time" className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Renovation / repair time limits</h2>
        <p className="text-gray-700 mb-2"><strong>Condo:</strong> Renovation and AC servicing often restricted to certain time slots and days; work may not be allowed after certain hours. Appliance or furniture delivery may have time windows (e.g. not after 4pm).</p>
        <p className="text-gray-700 mb-6"><strong>HDB:</strong> Relatively more flexibility and fewer restrictions.</p>

        <h2 id="moving-deposit" className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Moving / large items / renovation: deposit + procedures</h2>
        <p className="text-gray-700 mb-2"><strong>Condo:</strong> Refundable deposit ($500–$1000+), forms, coordination and approval for moving, large items or renovation.</p>
        <p className="text-gray-700 mb-6"><strong>HDB:</strong> Generally fewer procedures.</p>

        <h2 id="exterior-rules" className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Exterior uniformity rules</h2>
        <p className="text-gray-700 mb-2"><strong>Condo:</strong> Balcony may have restrictions on certain drying racks (e.g. Steigen, smart racks). Facade, balcony fans, colour schemes often regulated.</p>
        <p className="text-gray-700 mb-6"><strong>HDB:</strong> Usually more &quot;pragmatic&quot;; fewer restrictions (though some area-specific rules may apply).</p>

        <h2 id="common-areas" className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Stricter &quot;common area&quot; usage</h2>
        <p className="text-gray-700 mb-2"><strong>Condo:</strong> Corridors and space outside your door are largely common area; shoe racks, bicycles and clutter more likely to attract complaints or removal requests.</p>
        <p className="text-gray-700 mb-6"><strong>HDB:</strong> More relaxed corridor culture (though this can sometimes lead to neighbour disputes).</p>

        <h2 id="bulky-waste" className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Disposing of bulky waste is more troublesome</h2>
        <p className="text-gray-700 mb-2"><strong>Condo:</strong> You can’t just dump bulky items downstairs. Often need to find removal/disposal companies or vendors offering &quot;free disposal&quot;. Some MCSTs don’t provide bulky disposal.</p>
        <p className="text-gray-700 mb-6"><strong>HDB:</strong> Generally easier via Town Council procedures.</p>

        <h2 id="location-convenience" className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Location / amenities not as convenient as imagined</h2>
        <p className="text-gray-700 mb-2"><strong>Condo:</strong> Some are further from MRT/bus stops with no sheltered walkways; nearby supermarket may be small and expensive; forgetting an item means a long walk.</p>
        <p className="text-gray-700 mb-6"><strong>HDB:</strong> Wet market, hawker centre, supermarket, transport nodes are often downstairs or nearby, with more sheltered linkways.</p>

        <h2 id="visitor-flow" className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Visitor and vehicle flow is more complex</h2>
        <p className="text-gray-700 mb-2"><strong>Condo:</strong> Grab or delivery drivers may struggle to find the right entrance, pickup point or service lift. Visitors often need to register via QR or license plate.</p>
        <p className="text-gray-700 mb-6"><strong>HDB:</strong> Simpler traffic flow and more intuitive for visitors.</p>

        <h2 id="neighbour-sensitivity" className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Neighbours / residents can be more &quot;sensitive&quot;</h2>
        <p className="text-gray-700 mb-2"><strong>Condo:</strong> More prone to complaining about &quot;anything&quot; — more &quot;Karens&quot; who are particular about noise, moving chairs, BBQ rules.</p>
        <p className="text-gray-700 mb-6"><strong>HDB:</strong> These issues exist too, but the &quot;pay more + more rules&quot; environment in condos can make mutual complaints more common.</p>

        <h2 id="short-term-tenants" className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Short-term rental / tenant turnover</h2>
        <p className="text-gray-700 mb-2"><strong>Condo:</strong> Often a higher proportion of tenants; less neighbourhood stability and more noticeable differences in living habits.</p>
        <p className="text-gray-700 mb-6"><strong>HDB:</strong> Generally more stable communities due to policy and lease structure.</p>

        <h2 id="false-security" className="text-2xl font-bold text-gray-900 mt-8 mb-4">14. Safety can be &quot;false sense of security&quot;</h2>
        <p className="text-gray-700 mb-2"><strong>Condo:</strong> Perimeter walls and guards can create a false sense of security. Ground-floor balconies may sometimes be left unlocked; package or shoe theft can still happen.</p>
        <p className="text-gray-700 mb-6"><strong>HDB:</strong> In recent years, more visible CCTV and police presence; a more tangible sense of deterrence.</p>

        <h2 id="pets" className="text-2xl font-bold text-gray-900 mt-8 mb-4">15. Pet-related externalities</h2>
        <p className="text-gray-700 mb-2"><strong>Condo:</strong> Often more dog owners; issues like feces or odours in common areas.</p>
        <p className="text-gray-700 mb-6"><strong>HDB:</strong> Can occur too; but in condos, higher density and concentrated shared spaces tend to make pet-related friction more apparent.</p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Compare HDB neighbourhoods</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link> for price, transport and lease data when weighing HDB vs condo.
        </div>
      </div>
    ),
  },
  'hdb-resale-price-and-negotiation-views': {
    title: 'HDB Resale Price & How Much You Can Negotiate: Two Views',
    description: 'Realist vs skeptic: is the market price fair and hard to cut, or inflated with room to negotiate? Compare views on 800k, COV, seller mindset, and strategy.',
    relatedGuides: ['hdb-resale-agent-vs-diy', 'old-hdb-resale-pros-and-cons', 'how-to-choose-hdb-neighbourhood'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Is HDB resale price &quot;reasonable and hard to cut&quot; or &quot;inflated with room to negotiate&quot;? This guide sets out two views side by side: the realist view (prices are fair, little room to cut) and the skeptic view (prices are high, you can still negotiate). Use it to see both angles before you offer.
        </p>

        <h2 id="view-on-800k" className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. View on 800k</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist: &quot;Prices are reasonable / hard to cut&quot;</p>
            <p className="text-gray-700">Central area (e.g. Toa Payoh) + long remaining lease — it’s naturally expensive; this is market price.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic: &quot;Prices are inflated / still room to negotiate&quot;</p>
            <p className="text-gray-700">Listing price is just &quot;asking price&quot;, not the same as transacted price.</p>
          </div>
        </div>

        <h2 id="price-basis" className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Price basis</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist</p>
            <p className="text-gray-700">Sellers all look at recent transacted prices; they won’t sell below what the neighbour sold for.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic</p>
            <p className="text-gray-700">Some sellers list to &quot;test the water&quot;; not every listing will sell at asking.</p>
          </div>
        </div>

        <h2 id="how-much-negotiate" className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. How much can you negotiate?</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist</p>
            <p className="text-gray-700">Typical room: 0–30k; hot units may even need to go above asking.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic</p>
            <p className="text-gray-700">Some get 40–50k off — but more often when the unit isn’t moving or the seller is urgent.</p>
          </div>
        </div>

        <h2 id="cov-inevitable" className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Is COV always there?</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist</p>
            <p className="text-gray-700">Prime location, high floor, near MRT: COV is almost the default.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic</p>
            <p className="text-gray-700">If valuation catches up, or the seller prices close to valuation, you can get low or zero COV.</p>
          </div>
        </div>

        <h2 id="compare-pasir-ris" className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Comparing with Pasir Ris</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist</p>
            <p className="text-gray-700">You can’t compare: one is central, one is fringe — different markets.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic</p>
            <p className="text-gray-700">The comparison is to see that overall prices have really been pushed up.</p>
          </div>
        </div>

        <h2 id="seller-mindset" className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Seller mindset</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist</p>
            <p className="text-gray-700">If not urgent, they’ll wait for someone willing to pay more.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic</p>
            <p className="text-gray-700">If urgent (upgrading / cash pressure), they’re more willing to give discount.</p>
          </div>
        </div>

        <h2 id="buyer-room" className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Buyer negotiation room</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist</p>
            <p className="text-gray-700">Depends on competition: many buyers = almost no room.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic</p>
            <p className="text-gray-700">Depends on how long it’s been unsold: the longer, the more room.</p>
          </div>
        </div>

        <h2 id="real-reference" className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. What to really use as reference</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist</p>
            <p className="text-gray-700">Recent transacted prices + bank / HDB valuation.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic</p>
            <p className="text-gray-700">Same block older transactions + unit condition differences can justify a lower offer.</p>
          </div>
        </div>

        <h2 id="strategy" className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Strategy suggestion</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist</p>
            <p className="text-gray-700">Accept reality: adjust budget or change area.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic</p>
            <p className="text-gray-700">Put out more offers, try low-ball, wait for urgent listings.</p>
          </div>
        </div>

        <h2 id="risk-reminder" className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Risk reminder</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Realist</p>
            <p className="text-gray-700">Cheap units may have a catch (neighbourhood or unit issues).</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Skeptic</p>
            <p className="text-gray-700">If you don’t try, you’ll never know — the market is a game of negotiation.</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Check neighbourhood prices and trends</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link> for resale price data and transport to inform your offer.
        </div>
      </div>
    ),
  },
  'hdb-add-toilet-pros-and-cons': {
    title: 'HDB Add a Toilet: Support vs Opposition at a Glance',
    description: 'Can you add or split a toilet in HDB? Rules, technical feasibility, approval, grey-area risks, cost vs benefit, and practical alternatives.',
    relatedGuides: ['old-hdb-resale-pros-and-cons', 'hdb-resale-agent-vs-diy', 'how-to-choose-hdb-neighbourhood'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Adding or splitting a toilet in an HDB flat is a common wish. This guide sets out two views side by side: the support / feasible view and the opposition / not-feasible view — covering rules, technical feasibility, approval, grey-area risks, cost vs benefit, and practical alternatives.
        </p>

        <h2 id="regulatory" className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Regulatory / legal</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Support / feasible</p>
            <p className="text-gray-700 mb-2">In a few cases, alteration may be allowed:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Older 3-room, 1-toilet units</li>
              <li>Split within the existing wet area (toilet + shower separate)</li>
              <li>No new sewer connection</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Opposition / not feasible</p>
            <p className="text-gray-700 mb-2">HDB rules clearly state:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>You cannot add new sewer outlets</li>
              <li>You cannot enlarge the wet area</li>
              <li>Sewer pipes are a building-wide vertical system — you cannot tap in arbitrarily</li>
            </ul>
          </div>
        </div>

        <h2 id="technical" className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Technical feasibility</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Support / feasible</p>
            <p className="text-gray-700 mb-2">There are reported success cases:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Convert store room into shower room</li>
              <li>Connect to the existing toilet drain</li>
              <li>Use louvres / ventilation to address airflow</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Opposition / not feasible</p>
            <p className="text-gray-700 mb-2">Technical risks are high:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Insufficient fall on drainage can cause backflow</li>
              <li>Failed waterproofing can leak to the unit below</li>
              <li>If something goes wrong, liability rests with the owner</li>
            </ul>
          </div>
        </div>

        <h2 id="approval" className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Approval process</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Support / feasible</p>
            <p className="text-gray-700 mb-2">You can go the formal route:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Use a licensed contractor</li>
              <li>They apply to HDB for permit</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Opposition / not feasible</p>
            <p className="text-gray-700 mb-2">In most cases:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>HDB does not approve</li>
              <li>Or they allow &quot;alteration within existing toilet&quot; only, not &quot;new toilet&quot;</li>
            </ul>
          </div>
        </div>

        <h2 id="grey-illegal" className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Grey-area / illegal work</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">⚠️ Support (grey)</p>
            <p className="text-gray-700 mb-2">Some contractors are willing to do it &quot;under the table&quot;:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Tap into sewer pipe without approval</li>
              <li>Do not report to HDB</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">🚨 Opposition / risk</p>
            <p className="text-gray-700 mb-2">Risk is very high:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Neighbour complaint can lead to mandatory removal</li>
              <li>Leakage can result in fines</li>
              <li>At resale, the alteration may be deemed illegal</li>
            </ul>
          </div>
        </div>

        <h2 id="cost-benefit" className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Cost vs benefit</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">👍 Support</p>
            <p className="text-gray-700">If the household is crowded for the long term, quality of life can improve a lot.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">👎 Opposition</p>
            <p className="text-gray-700 mb-2">Cost is high (S$20k+):</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Structural risk</li>
              <li>When selling, it may become a negative point</li>
            </ul>
          </div>
        </div>

        <h2 id="alternatives" className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Practical alternatives</h2>
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mb-6">
          <p className="font-semibold text-blue-800 mb-2">✔️ Compromise options</p>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Split one toilet into two spaces: shower room + WC</li>
            <li>Add a wash basin in the service yard</li>
            <li>Stagger shower times to reduce peak use</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Compare neighbourhoods</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link> for HDB resale context and layout types.
        </div>
      </div>
    ),
  },
  'hdb-bto-views-positive-vs-negative': {
    title: 'HDB / BTO in Singapore: Positive vs Negative Views at a Glance',
    description: 'How outsiders and locals view Singapore HDB and BTO: subsidy, quality, ballot, price, leasehold, international comparison, lifestyle, and culture.',
    relatedGuides: ['old-hdb-resale-pros-and-cons', 'how-to-compare-hdb-neighbourhoods', 'hdb-resale-price-and-negotiation-views'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          How do people — outsiders and locals — talk about Singapore HDB and BTO? This guide sets out two views side by side: positive views (praise / agreement) and negative views (skepticism / criticism) on subsidy, quality, ballot, price, leasehold, international comparison, lifestyle, and culture.
        </p>

        <h2 id="overall-subsidy" className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Overall view of government-subsidized housing</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive (praise / agree)</p>
            <p className="text-gray-700">&quot;This is so good — better than what we call luxury housing.&quot; &quot;The government has the capacity; the system runs well.&quot;</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative (skepticism / criticism)</p>
            <p className="text-gray-700">&quot;Don’t romanticise it: housing is so expensive that most people have to rely on the government system.&quot;</p>
          </div>
        </div>

        <h2 id="subsidized-quality" className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. &quot;Subsidized&quot; = low quality?</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">Pushback on Western stereotype: subsidized doesn’t mean shabby; HDB can be decent and well-maintained.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">Some assume subsidized housing should be poor quality and are surprised or disbelieving when it isn’t.</p>
          </div>
        </div>

        <h2 id="bto-mechanism" className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. BTO mechanism (ballot / waiting)</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">&quot;Congrats on winning the BTO lottery.&quot; &quot;Buying directly from the government feels great.&quot;</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">&quot;You have to queue for years.&quot; &quot;Can’t get one / even if you do it’s not stress-free.&quot;</p>
          </div>
        </div>

        <h2 id="price-affordability" className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Price and affordability</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">OP’s figures (e.g. 168k after subsidy) make it look &quot;such good value&quot;.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">Others stress: the resale market is not cheap, and you shouldn’t judge affordability by entry price alone.</p>
          </div>
        </div>

        <h2 id="leasehold" className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. 99-year leasehold debate</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">Most feel &quot;enough for a lifetime&quot; or &quot;at least better than renting&quot;.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">&quot;After 99 years it reverts to the government; you may end up with nothing&quot; — raises doubt and concern.</p>
          </div>
        </div>

        <h2 id="international-comparison" className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. International comparison (US / UK / Canada)</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">Lots of &quot;crying in America / UK / Canada&quot; — they see Singapore’s public housing as &quot;luxurious&quot;.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">Turns into political venting: US captured by capital / military / landlords (emotional, contentious).</p>
          </div>
        </div>

        <h2 id="lifestyle-culture" className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Lifestyle / cultural differences</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">&quot;Wet room (whole bathroom gets wet) is fine as long as there’s a floor drain.&quot;</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">&quot;Walking in to use the toilet is slippery and feels unsafe.&quot; &quot;Not used to it culturally.&quot;</p>
          </div>
        </div>

        <h2 id="local-easter-eggs" className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Local easter eggs / meme culture</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">&quot;Army green towel&quot; gets recognised and creates shared vibe. &quot;Tengah?&quot; — one look at the window frame / style and people know; strong community feel.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">Jokes like &quot;Better sleep with one eye open&quot; (hinting at address being recognised) make some people uneasy.</p>
          </div>
        </div>

        <h2 id="renovation-aesthetic" className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Renovation / aesthetic advice</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">Suggestions for OP: lighting, bedding, rugs, plants — to make the place feel more like &quot;home&quot;.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">Some think &quot;no need to change, it’s already good&quot;; or find the red/blue/black pipe markings &quot;a bit funny&quot;.</p>
          </div>
        </div>

        <h2 id="personal-situation" className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Personal situation reflection</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">Many compare the post to their own worse housing and feel &quot;envious&quot;.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">A few push back: they feel the costs are glossed over — &quot;living with parents long-term&quot;, &quot;waiting for years&quot;, etc.</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Compare neighbourhoods</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link> for HDB resale and BTO context, price and transport data.
        </div>
      </div>
    ),
  },
  'hdb-secondhand-smoke-window-smoking-views': {
    title: 'HDB Secondhand Smoke & Window-Side Smoking: Two Views',
    description: 'Non-smokers vs smokers: rights, harm, enforcement, policy, community, and personal responses to neighbour smoking and secondhand smoke in HDB.',
    relatedGuides: ['old-hdb-resale-pros-and-cons', 'moving-from-hdb-to-condo-inconveniences', 'hdb-vs-condo-living-experience'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Secondhand smoke and window-side smoking in HDB often spark strong views. This guide sets out two sides side by side: support / sympathy for non-smokers (want regulation / ban / stricter rules) and support for smokers’ &quot;freedom at home&quot; (less regulation / hard to regulate / need to coexist). Use it to see both arguments on rights, harm, enforcement, policy, and personal responses.
        </p>

        <h2 id="rights-boundary" className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Rights boundary</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support non-smokers (regulate / ban / stricter)</p>
            <p className="text-gray-700">&quot;I don’t want to breathe what you exhale; smoke drifting into my home violates my right to breathe and to live in my flat.&quot;</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✓ Support smokers’ &quot;freedom at home&quot; (less / hard to regulate / coexist)</p>
            <p className="text-gray-700">&quot;Smoking at home is personal freedom within the law; neighbourly living means mutual accommodation.&quot;</p>
          </div>
        </div>

        <h2 id="nature-of-harm" className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Nature of harm</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support non-smokers</p>
            <p className="text-gray-700">Secondhand smoke has real health risks (children, asthma, elderly) — it’s not just &quot;disliking the smell&quot;.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✓ Support smokers</p>
            <p className="text-gray-700">Many neighbour issues affect others too: cooking fumes, strong scents, noise, baby crying; you can’t single out smoke.</p>
          </div>
        </div>

        <h2 id="enforceability" className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Enforceability</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support non-smokers</p>
            <p className="text-gray-700">Common areas (corridors, stairwells, void deck, lift lobby) must be strictly checked and penalised. NEA.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✓ Support smokers</p>
            <p className="text-gray-700">If it happens indoors / at the window, evidence is hard to get, enforcement cost is high, and conflict can escalate — not realistic.</p>
          </div>
        </div>

        <h2 id="current-enforcement" className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Current enforcement</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support non-smokers</p>
            <p className="text-gray-700">Too lax now; reports are often dismissed as &quot;no one caught in the act&quot;. Need more effective mechanisms (CCTV / lower threshold).</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✓ Support smokers</p>
            <p className="text-gray-700">Enforcement difficulty isn’t laziness — it’s real limits. Over-enforcement can turn into neighbour-vs-neighbour abuse and weaponised reporting.</p>
          </div>
        </div>

        <h2 id="solutions-institutional" className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Solutions: institutional</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support non-smokers</p>
            <p className="text-gray-700">Push for policy: stricter no-smoking zones, higher tax, even limits on smoking at home by the window; keep raising it in Parliament. (Louis Ng)</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✓ Support smokers</p>
            <p className="text-gray-700">Don’t wait for policy; solve it at personal level first. A total ban is too extreme and will create more conflict.</p>
          </div>
        </div>

        <h2 id="solutions-community" className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Solutions: community / management</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support non-smokers</p>
            <p className="text-gray-700">Contact HDB / Town Council / OneService: put up notices, check CCTV, improve design of smoking corners. Town Council.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✓ Support smokers</p>
            <p className="text-gray-700">Town Council can’t control behaviour inside the flat; don’t dump every problem on the authorities.</p>
          </div>
        </div>

        <h2 id="personal-moderate" className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Personal response: moderate</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support non-smokers</p>
            <p className="text-gray-700">Talk first, ask for consideration; remind &quot;don’t blow smoke this way&quot;; encourage smoking downstairs.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✓ Support smokers</p>
            <p className="text-gray-700">Affected person can close window / improve ventilation / use air purifier; don’t escalate every time.</p>
          </div>
        </div>

        <h2 id="personal-hardline" className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Personal response: hardline / shaming</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support non-smokers</p>
            <p className="text-gray-700">Shout, call out in public, make the neighbour &quot;socially dead&quot; in the block; use social pressure to stop it.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✓ Support smokers</p>
            <p className="text-gray-700">That only worsens conflict and can trigger retaliation; the other party may already be unreasonable.</p>
          </div>
        </div>

        <h2 id="personal-revenge" className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Personal response: tit-for-tat / revenge ideas</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support non-smokers</p>
            <p className="text-gray-700">Spray water, spray insecticide, fan / blower to blow back, BBQ / stinky tofu / burn joss paper in response (often venting / memes).</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✓ Support smokers</p>
            <p className="text-gray-700">Many of these can harm other neighbours, dirty common areas, or even break the law; they shouldn’t be encouraged.</p>
          </div>
        </div>

        <h2 id="safety-risk" className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Safety risk</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support non-smokers</p>
            <p className="text-gray-700">Direct confrontation can turn violent; that’s why we need institutional protection and effective enforcement.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✓ Support smokers</p>
            <p className="text-gray-700">Escalation is exactly why &quot;don’t push it&quot;; tolerating, changing routine, avoiding conflict is safer.</p>
          </div>
        </div>

        <h2 id="values-conflict" className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Underlying value conflict</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support non-smokers</p>
            <p className="text-gray-700">Smokers externalise the cost: they don’t want their own home smelly, so others breathe it.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✓ Support smokers</p>
            <p className="text-gray-700">High-density living can’t have zero impact; wanting zero disturbance means paying for a higher-cost living environment.</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Compare neighbourhoods</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link> for HDB living context and layout.
        </div>
      </div>
    ),
  },
  'condo-vs-hdb-two-views': {
    title: 'Condo vs HDB: Two Views at a Glance',
    description: 'Pro-Condo vs pro-HDB: living environment, neighbours, facilities, space, quiet, security, investment, convenience, cost, and community.',
    relatedGuides: ['hdb-vs-condo-living-experience', 'moving-from-hdb-to-condo-inconveniences', 'old-hdb-resale-pros-and-cons'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Condo vs HDB: two views side by side. One side thinks Condo is better (pro-Condo); the other thinks HDB is better value (pro-HDB). This guide sets out both across living environment, neighbours, facilities, space, quiet, security, investment, convenience, cost, and community.
        </p>

        <h2 id="living-environment" className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Living environment</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Pro-Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Gated estate</li>
              <li>Quieter, fewer random people</li>
              <li>Less door-to-door sales, less clutter in corridors</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Pro-HDB</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>More shared space, more foot traffic</li>
              <li>Easier to run into noise, smoking, messy stacking</li>
            </ul>
          </div>
        </div>

        <h2 id="neighbour-structure" className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Neighbour structure</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Pro-Condo</p>
            <p className="text-gray-700">Residents’ SES more similar; &quot;fewer oddballs&quot;.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Pro-HDB</p>
            <p className="text-gray-700">Condo has oddballs too, just different (complaints, politics). HDB also mixes high- and low-income.</p>
          </div>
        </div>

        <h2 id="facilities" className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Facilities</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Pro-Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Pool, gym, BBQ pit, tennis downstairs</li>
              <li>Very convenient for families with kids</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Pro-HDB</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Actually use them little = waste of money</li>
              <li>External gym + public pool cheaper</li>
            </ul>
          </div>
        </div>

        <h2 id="space-layout" className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Space &amp; layout</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Pro-Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Old condos can be big (1000–1700 sqft)</li>
              <li>Varied layouts, balconies</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Pro-HDB</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>New condos mostly small</li>
              <li>Same budget buys more space in HDB</li>
            </ul>
          </div>
        </div>

        <h2 id="quiet" className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Quiet level</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Pro-Condo</p>
            <p className="text-gray-700">Thick walls and floors; better sound insulation.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Pro-HDB</p>
            <p className="text-gray-700">New condos also getting &quot;thin-skinned&quot;.</p>
          </div>
        </div>

        <h2 id="security" className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Sense of security</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Pro-Condo</p>
            <p className="text-gray-700">Gate, guard, CCTV; fewer strangers wandering.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Pro-HDB</p>
            <p className="text-gray-700">People can still get in; security is largely psychological.</p>
          </div>
        </div>

        <h2 id="investment" className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Investment attributes</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Pro-Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Can sell to foreigners</li>
              <li>No MOP; sell or rent anytime</li>
              <li>Easier to use as part of asset allocation</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Pro-HDB</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Higher entry price, higher risk</li>
              <li>Not everyone needs to &quot;play&quot; assets</li>
            </ul>
          </div>
        </div>

        <h2 id="liquidity" className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Liquidity</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Pro-Condo</p>
            <p className="text-gray-700">Market more international; banks treat it more favourably as collateral.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Pro-HDB</p>
            <p className="text-gray-700">HDB has income ceiling, ethnic quota; different liquidity story.</p>
          </div>
        </div>

        <h2 id="status" className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Status / face</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Pro-Condo</p>
            <p className="text-gray-700">Some care about &quot;I live in a condo&quot;.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Pro-HDB</p>
            <p className="text-gray-700">It’s psychological value; doesn’t change how you actually live.</p>
          </div>
        </div>

        <h2 id="convenience" className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Daily convenience</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Pro-Condo</p>
            <p className="text-gray-700">Basement carpark to lift; lobby feels like a hotel.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Pro-HDB</p>
            <p className="text-gray-700">HDB closer to MRT, wet market, hawker centre.</p>
          </div>
        </div>

        <h2 id="management" className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Management</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Pro-Condo</p>
            <p className="text-gray-700">MCST; can complain and get things handled.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Pro-HDB</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>MCST can be bad too</li>
              <li>Management fees go up every year</li>
            </ul>
          </div>
        </div>

        <h2 id="cost" className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Cost structure</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Pro-Condo</p>
            <p className="text-gray-700">—</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Pro-Condo / ✔️ Pro-HDB</p>
            <p className="text-gray-700">Condo: management fees + property tax high. HDB S&amp;CC is cheap.</p>
          </div>
        </div>

        <h2 id="social-freedom" className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Social freedom</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Pro-Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Singles under 35 can buy</li>
              <li>No income ceiling</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Pro-HDB</p>
            <p className="text-gray-700">HDB has more rules (MOP, eligibility, income).</p>
          </div>
        </div>

        <h2 id="community" className="text-2xl font-bold text-gray-900 mt-8 mb-4">14. Community feel</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Pro-Condo</p>
            <p className="text-gray-700">Small &quot;gated kampung&quot;; activity groups.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Pro-HDB</p>
            <p className="text-gray-700">HDB kampung spirit is more real.</p>
          </div>
        </div>

        <h2 id="extreme-views" className="text-2xl font-bold text-gray-900 mt-8 mb-4">15. Extreme views (emotional)</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔️ Pro-Condo</p>
            <p className="text-gray-700">&quot;Fewer crazies, less secondhand smoke, less joss-paper burning.&quot;</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Pro-HDB</p>
            <p className="text-gray-700">&quot;Just a wall paid for by money.&quot;</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Compare neighbourhoods</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link> for HDB price, transport and lease data. See also <Link href="/guides/hdb-vs-condo-living-experience/" className="text-blue-600 hover:text-blue-700 underline">HDB vs Condo living experience</Link> and <Link href="/guides/moving-from-hdb-to-condo-inconveniences/" className="text-blue-600 hover:text-blue-700 underline">moving from HDB to condo</Link>.
        </div>
      </div>
    ),
  },
  'high-income-couples-cant-get-bto-views': {
    title: 'High-Income Young Couples Can\'t Get BTO: Two Views',
    description: 'Sympathisers vs critics: is BTO a lottery, is 14k too high, is it unfair, gaming the system, resale, policy, and moral judgment.',
    relatedGuides: ['hdb-bto-views-positive-vs-negative', 'hdb-resale-price-and-negotiation-views', 'how-to-choose-hdb-neighbourhood'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          When high-income young couples say they can’t get BTO, reactions split: some sympathise (support OP); others criticise (oppose OP). This guide sets out both views side by side on the nature of BTO, income, fairness, gaming the system, affordability, resale, policy, and moral judgment.
        </p>

        <h2 id="nature-of-bto" className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Nature of BTO</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support OP (sympathisers)</p>
            <p className="text-gray-700">BTO has become a &quot;lottery&quot;, not really helping those in need.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose OP (critics)</p>
            <p className="text-gray-700">BTO is meant for middle- and lower-income, not the top 25%.</p>
          </div>
        </div>

        <h2 id="income-14k" className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Is 14k income &quot;too high&quot;?</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support OP</p>
            <p className="text-gray-700">14k doesn’t mean lots of cash — there’s student debt, supporting parents, etc.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose OP</p>
            <p className="text-gray-700">14k fresh grad = above most Singaporeans; they should step aside.</p>
          </div>
        </div>

        <h2 id="unfair" className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Is not getting BTO unfair?</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support OP</p>
            <p className="text-gray-700">Can’t even get non-mature estates; the system has failed.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose OP</p>
            <p className="text-gray-700">Statistically a tiny minority; often selective complaining.</p>
          </div>
        </div>

        <h2 id="gaming-system" className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Is it &quot;gaming the system&quot;?</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support OP</p>
            <p className="text-gray-700">Adjusting salary structure is legal; no law broken.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose OP</p>
            <p className="text-gray-700">Moral issue: they’re crowding out those who really need the subsidy.</p>
          </div>
        </div>

        <h2 id="cant-afford" className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Is it really &quot;can’t afford&quot;?</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support OP</p>
            <p className="text-gray-700">Resale COV is high; down-payment pressure is real.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose OP</p>
            <p className="text-gray-700">It’s not that they can’t afford — they don’t want to buy &quot;unsubsidised&quot;.</p>
          </div>
        </div>

        <h2 id="resale-market" className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Resale market</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support OP</p>
            <p className="text-gray-700">COV is crazy; it’s like subsidising the previous owner.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose OP</p>
            <p className="text-gray-700">They can choose older or further units.</p>
          </div>
        </div>

        <h2 id="condo-ec" className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Condo / EC option</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support OP</p>
            <p className="text-gray-700">Down-payment too high; not suitable for those just starting work.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose OP</p>
            <p className="text-gray-700">Income trajectory is high; they’ll be able to afford it sooner or later.</p>
          </div>
        </div>

        <h2 id="social-perception" className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Social perception</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support OP</p>
            <p className="text-gray-700">The &quot;sandwich class&quot; problem is real.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose OP</p>
            <p className="text-gray-700">More like &quot;wanting BTO upside&quot;.</p>
          </div>
        </div>

        <h2 id="housing-positioning" className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Housing positioning</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support OP</p>
            <p className="text-gray-700">Housing should be a basic need.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose OP</p>
            <p className="text-gray-700">Housing has been designed by the system as an asset.</p>
          </div>
        </div>

        <h2 id="policy-responsibility" className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Policy responsibility</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support OP</p>
            <p className="text-gray-700">Government should build more and lower prices.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose OP</p>
            <p className="text-gray-700">Government can’t hurt existing owners’ asset value.</p>
          </div>
        </div>

        <h2 id="fertility-impact" className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Fertility impact</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support OP</p>
            <p className="text-gray-700">Can’t get a flat → afraid to have kids.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose OP</p>
            <p className="text-gray-700">The ones really worse off are low-income families.</p>
          </div>
        </div>

        <h2 id="moral-judgment" className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Moral judgment</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support OP</p>
            <p className="text-gray-700">The emotion is understandable.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose OP</p>
            <p className="text-gray-700">The behaviour is off-putting (especially trying to get around the income cap).</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Compare neighbourhoods</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link> for BTO and resale context, price and transport data.
        </div>
      </div>
    ),
  },
  'hdb-bto-system-debate-views': {
    title: 'HDB / BTO System Debate: Two Views at a Glance',
    description: 'Support vs criticism: overall evaluation, BTO nature, price rise, HDB as asset, intergenerational fairness, supply, lease vs own, and sustainability.',
    relatedGuides: ['hdb-bto-views-positive-vs-negative', 'high-income-couples-cant-get-bto-views', 'how-to-choose-hdb-neighbourhood'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          The HDB / BTO system sparks strong views. This guide sets out two sides side by side: positive views (support / affirmation) and negative views (concern / criticism) on overall evaluation, BTO nature, price rise, HDB as asset, intergenerational fairness, supply, lease vs own, and long-term sustainability.
        </p>

        <h2 id="overall-evaluation" className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Overall evaluation</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive (support / affirmation)</p>
            <p className="text-gray-700">HDB is one of Singapore’s most successful public policies — it lets most people &quot;have a roof and build an asset&quot;.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative (concern / criticism)</p>
            <p className="text-gray-700">Success belongs to the past; the system is starting to fail now.</p>
          </div>
        </div>

        <h2 id="nature-of-bto" className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Nature of BTO</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">Rational approach: build after demand, avoid empty estates.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">Leads to excessively long waits (4–7 years); supply collapsed when pandemic hit.</p>
          </div>
        </div>

        <h2 id="price-rise" className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. House price rise</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">Mainly COVID short-term supply shock; before that (2013–2019) prices were falling.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">Resale surge is now the norm; young people face more pressure.</p>
          </div>
        </div>

        <h2 id="hdb-as-asset" className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. HDB = investment?</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">Gives ordinary people a &quot;low-risk asset&quot;, helps wealth accumulation.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">Turns housing into a &quot;lottery&quot;, distorting its original &quot;live in&quot; function.</p>
          </div>
        </div>

        <h2 id="intergenerational" className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Intergenerational fairness</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">Each generation has different challenges; you can’t simply compare with parents.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">Clearly harder now: parents had an easier buy, bigger flats, less pressure.</p>
          </div>
        </div>

        <h2 id="international-comparison" className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. International comparison</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">Much better than New York, London, Hong Kong, etc.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">Shouldn’t compare to &quot;worse&quot;; compare to Singapore’s own past.</p>
          </div>
        </div>

        <h2 id="supply-logic" className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Supply logic</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">Can’t build infinitely; land is limited; need overall planning.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">Government too conservative; missed the window to build ahead.</p>
          </div>
        </div>

        <h2 id="lease-vs-own" className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Lease vs own</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">Singapore lets most people &quot;own&quot; rather than &quot;rent forever&quot;.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">99-year lease ≠ freehold; it goes back to zero in the end.</p>
          </div>
        </div>

        <h2 id="population-immigration" className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Population and immigration</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">A city must attract people; housing will stay tight — that’s reality.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">Population growth too fast; worsens supply–demand mismatch.</p>
          </div>
        </div>

        <h2 id="policy-orientation" className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Policy orientation</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">Must balance: housing security + asset stability.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">The two conflict: prices can’t be both cheap and rising forever.</p>
          </div>
        </div>

        <h2 id="singles-lgbt" className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Singles / LGBT</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">Subsidy should prioritise families and those with children.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">Excluding these groups creates structural unfairness.</p>
          </div>
        </div>

        <h2 id="sustainability" className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Long-term sustainability</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Positive</p>
            <p className="text-gray-700">Still better than most countries’ models.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Negative</p>
            <p className="text-gray-700">Already &quot;in a dead end&quot;: either prices fall (hurt owners) or keep rising (hurt young people).</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Compare neighbourhoods</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link> for HDB and BTO context, price and transport data.
        </div>
      </div>
    ),
  },
  'condo-vs-hdb-worth-premium-views': {
    title: 'Condo vs HDB: Is the Premium Worth It? Two Views',
    description: 'Support Condo premium vs oppose: ownership, investment, eligibility, quiet, neighbours, security, facilities, space, cost, and opportunity cost.',
    relatedGuides: ['condo-vs-hdb-two-views', 'hdb-vs-condo-living-experience', 'moving-from-hdb-to-condo-inconveniences'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Is the Condo premium worth it? This guide sets out two views side by side: support for Condo (think the premium is justified) and opposition to Condo (think not worth it / HDB can replace). Use it to see both arguments on ownership, investment, eligibility, quiet, neighbours, security, facilities, space, and opportunity cost.
        </p>

        <h2 id="ownership-system" className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Ownership and system</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Support Condo (premium worth it)</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Private property has no MOP; buy, sell or rent with more freedom</li>
              <li>Inheritable: parents can leave condo to children without &quot;one HDB per person&quot; rules</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Oppose Condo (not worth it / replaceable)</p>
            <p className="text-gray-700">That’s mostly system arbitrage, not value from living there.</p>
          </div>
        </div>

        <h2 id="market-investment" className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Market and investment</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Support Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Can sell to foreigners; bigger buyer pool</li>
              <li>Higher upside; en-bloc potential</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Oppose Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Higher risk, more leverage</li>
              <li>Management fees and interest eat a lot of returns</li>
            </ul>
          </div>
        </div>

        <h2 id="eligibility" className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Eligibility</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Support Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Singles under 35 can only buy private</li>
              <li>High income can’t buy BTO; condo is the option</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Oppose Condo</p>
            <p className="text-gray-700">That’s being &quot;pushed by the system&quot; to buy; doesn’t mean condo is inherently better.</p>
          </div>
        </div>

        <h2 id="quiet-privacy" className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Quiet and privacy</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Support Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>No void deck, no funeral/wedding, no door-to-door sales</li>
              <li>Fewer strangers walking the corridors</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Oppose Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Can still have karaoke neighbours, noisy tenants</li>
              <li>HDB can also have good neighbours</li>
            </ul>
          </div>
        </div>

        <h2 id="neighbour-ses" className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Neighbour structure (SES)</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Support Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Statistically fewer oddballs</li>
              <li>Less low-quality nuisance (PMD, litter)</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Oppose Condo</p>
            <p className="text-gray-700">Money ≠ manners; condo has entitled neighbours too.</p>
          </div>
        </div>

        <h2 id="security" className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Sense of security</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Support Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Guard, access control, basement carpark</li>
              <li>Packages and shoes less likely to be stolen</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Oppose Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>People can still tailgate in</li>
              <li>Singapore is already safe</li>
            </ul>
          </div>
        </div>

        <h2 id="facilities" className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Facilities</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Support Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Pool, gym, BBQ, function room downstairs</li>
              <li>Convenient for families with kids</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Oppose Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>None of it is &quot;free&quot; — it’s in the management fee</li>
              <li>Many people hardly use them</li>
            </ul>
          </div>
        </div>

        <h2 id="space-design" className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Space and design</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Support Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>High ceiling, full-height windows, balcony</li>
              <li>Common areas with landscaping, water features</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Oppose Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>New condo units getting smaller</li>
              <li>Same budget buys more space in HDB</li>
            </ul>
          </div>
        </div>

        <h2 id="environment-clean" className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Environment and cleanliness</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Support Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>MCST manages; corridors not cluttered</li>
              <li>Less smoke, urine, lift odours</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Oppose Condo</p>
            <p className="text-gray-700">Old condos with bad management can be dirty and messy too.</p>
          </div>
        </div>

        <h2 id="parking-commute" className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Parking and commute</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Support Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Basement carpark to lift</li>
              <li>Some provide shuttle bus</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Oppose Condo</p>
            <p className="text-gray-700">HDB has MSCP too; the gap is &quot;convenience feel&quot;, not fundamental.</p>
          </div>
        </div>

        <h2 id="community-governance" className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Community and governance</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Support Condo</p>
            <p className="text-gray-700">Bylaws; can complain about noise, pets, illegal parking.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Oppose Condo</p>
            <p className="text-gray-700">MCST can have infighting and low efficiency too.</p>
          </div>
        </div>

        <h2 id="pet-freedom" className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Pet freedom</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Support Condo</p>
            <p className="text-gray-700">Generally more relaxed than HDB.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Oppose Condo</p>
            <p className="text-gray-700">Still subject to each condo’s rules.</p>
          </div>
        </div>

        <h2 id="psychology-identity" className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Psychology and identity</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Support Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Feels &quot;more private, more respectable&quot;</li>
              <li>Don’t have to face the publicity of the void deck</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Oppose Condo</p>
            <p className="text-gray-700">A lot of it is psychological premium and class signalling.</p>
          </div>
        </div>

        <h2 id="opportunity-cost" className="text-2xl font-bold text-gray-900 mt-8 mb-4">14. Opportunity cost</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Support Condo (acknowledges downside)</p>
            <p className="text-gray-700">Pro-Condo side admits: you carry a bigger mortgage.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Oppose Condo (not worth it / replaceable)</p>
            <p className="text-gray-700">HDB = lower debt; more freedom for travel, investment, FIRE.</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Compare neighbourhoods</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link> for HDB price and transport. See also <Link href="/guides/condo-vs-hdb-two-views/" className="text-blue-600 hover:text-blue-700 underline">Condo vs HDB two views</Link> and <Link href="/guides/hdb-vs-condo-living-experience/" className="text-blue-600 hover:text-blue-700 underline">HDB vs Condo living experience</Link>.
        </div>
      </div>
    ),
  },
  'housing-price-rise-support-vs-oppose': {
    title: 'Housing Price Rise: Support vs Oppose at a Glance',
    description: 'Minority (support rise) vs mainstream (oppose rise): core values, existing owners, young people, fairness, government role, and long-term risk.',
    relatedGuides: ['hdb-bto-system-debate-views', 'hdb-resale-price-and-negotiation-views', 'high-income-couples-cant-get-bto-views'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Should housing prices rise or not? This guide sets out two stances side by side: support for price rise (minority) and opposition to price rise (mainstream). Use it to see both arguments on core values, existing owners, young people, fairness, intergenerational impact, economic logic, who benefits, government role, and long-term risk.
        </p>

        <h2 id="core-values" className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Core values</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support rise (minority)</p>
            <p className="text-gray-700">Housing is also an asset; it can appreciate.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose rise (mainstream)</p>
            <p className="text-gray-700">Housing is first for &quot;living&quot;, not &quot;speculating&quot;.</p>
          </div>
        </div>

        <h2 id="existing-owners" className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. For existing owners</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support rise</p>
            <p className="text-gray-700">Asset appreciation; strong psychological security.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose rise</p>
            <p className="text-gray-700">Just paper gains; selling means buying high again.</p>
          </div>
        </div>

        <h2 id="young-people" className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. For young people</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support rise</p>
            <p className="text-gray-700">&quot;Can’t afford is a personal problem.&quot;</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose rise</p>
            <p className="text-gray-700">Young people are priced out; marriage and children get harder.</p>
          </div>
        </div>

        <h2 id="social-fairness" className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. For social fairness</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support rise</p>
            <p className="text-gray-700">Market sets price; that’s fair.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose rise</p>
            <p className="text-gray-700">Public housing shouldn’t become a speculation tool.</p>
          </div>
        </div>

        <h2 id="intergenerational" className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. For intergenerational impact</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support rise</p>
            <p className="text-gray-700">Don’t think much about the next generation.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose rise</p>
            <p className="text-gray-700">Worry the next generation won’t be able to afford.</p>
          </div>
        </div>

        <h2 id="economic-logic" className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Economic logic</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support rise</p>
            <p className="text-gray-700">Rising prices = nation getting richer.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose rise</p>
            <p className="text-gray-700">High prices = high rent + high cost of living.</p>
          </div>
        </div>

        <h2 id="who-benefits" className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Who really benefits</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support rise</p>
            <p className="text-gray-700">Multiple-property owners; BTO &quot;lottery winners&quot; who upgrade.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose rise</p>
            <p className="text-gray-700">Almost no one (owner-occupiers are zero-sum).</p>
          </div>
        </div>

        <h2 id="government-role" className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. On government role</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support rise</p>
            <p className="text-gray-700">Government shouldn’t interfere with the market.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose rise</p>
            <p className="text-gray-700">Government should control, stabilise, or even lower prices.</p>
          </div>
        </div>

        <h2 id="long-term-risk" className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Long-term risk</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support rise</p>
            <p className="text-gray-700">Believe it will keep rising.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose rise</p>
            <p className="text-gray-700">Worry about a Hong Kong / China-style property bubble.</p>
          </div>
        </div>

        <h2 id="common-sayings" className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Common sayings</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support rise</p>
            <p className="text-gray-700">&quot;Work harder and you can afford it.&quot;</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose rise</p>
            <p className="text-gray-700">&quot;Public housing shouldn’t be solved by speculation.&quot;</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Compare neighbourhoods</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link> for HDB price and transport data.
        </div>
      </div>
    ),
  },
  'hdb-empty-until-mop-views': {
    title: 'HDB Empty Until MOP, Barely Lived In: Two Views',
    description: 'Support vs oppose: view on empty units, legality, market logic, impact on young buyers and rental, fairness, policy, and enforcement.',
    relatedGuides: ['hdb-bto-system-debate-views', 'housing-price-rise-support-vs-oppose', 'high-income-couples-cant-get-bto-views'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          When an HDB flat is left empty until MOP (minimum occupation period) and barely lived in, reactions split: some support or rationalise it (pro); others oppose or criticise (con). This guide sets out both views on the practice itself, legality, market logic, impact on young buyers and rental, fairness, policy, and enforcement.
        </p>

        <h2 id="view-on-empty" className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. View on &quot;empty until MOP, barely lived in&quot;</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Support / rationalise (pro)</p>
            <p className="text-gray-700">Could be investment or family planning: secure a slot first, sell and upgrade after 5 years; or genuinely working / caring for parents and living elsewhere long-term.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Oppose / criticise (con)</p>
            <p className="text-gray-700">Betrays the purpose of public housing: it’s for &quot;living&quot;, not &quot;holding a spot for appreciation&quot;; leaving it empty = wasting scarce resource.</p>
          </div>
        </div>

        <h2 id="legality" className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Might it be illegal? (MOP requires self-occupation)</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro</p>
            <p className="text-gray-700">Some say there may be lawful exceptions (special family / work reasons), or &quot;formally occupied / registered&quot;.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con</p>
            <p className="text-gray-700">Critics: if they really didn’t live there and still list &quot;bare unit&quot;, it’s like openly hinting at a breach; worse, &quot;no enforcement = tacitly allowed&quot;.</p>
          </div>
        </div>

        <h2 id="market-logic" className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Market and incentive logic</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro</p>
            <p className="text-gray-700">&quot;If the system allows it, people will use it&quot; — people are rational: BTO / subsidy / arbitrage exists → some will maximise returns.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con</p>
            <p className="text-gray-700">&quot;System design is the problem&quot;: subsidy + arbitrage → turns public housing into a wealth tool, pushes up resale / rent, hurts real owner-occupiers.</p>
          </div>
        </div>

        <h2 id="impact-young-buyers" className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Impact on young / first-time buyers</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro</p>
            <p className="text-gray-700">Some argue: these cases are a minority; the real issue is overall supply, construction delays, population and rental demand.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con</p>
            <p className="text-gray-700">Direct harm: uses up supply, raises expectations, pushes resale prices up; transfers &quot;future buyers’ money&quot; to arbitrageurs.</p>
          </div>
        </div>

        <h2 id="impact-rental" className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Impact on rental market</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro</p>
            <p className="text-gray-700">Supporters often say: if these units were rented out, they’d add rental supply (BTO waiters, foreign workers, etc. need it).</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con</p>
            <p className="text-gray-700">Con side: rental supply can come from government / public rental; shouldn’t rely on &quot;people holding subsidised public flats&quot; to supply rent.</p>
          </div>
        </div>

        <h2 id="fairness" className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Fairness (who benefits)</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro</p>
            <p className="text-gray-700">&quot;You could do it too&quot;: everyone survives within the rules; shouldn’t only morally judge the individual.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con</p>
            <p className="text-gray-700">Con side: it’s not &quot;everyone can do it&quot; — usually needs parents’ money / resources; result is the richer can arbitrage more.</p>
          </div>
        </div>

        <h2 id="policy" className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Policy positions (common)</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>① Don’t one-size-fits-all: allow ownership but use tax / limits to adjust;</li>
              <li>② Focus on building faster and improving supply–demand.</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>① Mandate: buy private → must sell HDB;</li>
              <li>② Strict MOP self-occupation enforcement;</li>
              <li>③ Limit second BTO / tighten resale rules;</li>
              <li>④ Reform buyback / pricing.</li>
            </ul>
          </div>
        </div>

        <h2 id="enforcement" className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Enforcement difficulty and side effects</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro (against strict enforcement)</p>
            <p className="text-gray-700">Worry: strict rules would shock the market and cause backlash; strict checks on occupancy raise privacy concerns.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Con (for stricter enforcement)</p>
            <p className="text-gray-700">Hard or not, it should be done; can use softer means (spot checks, utility anomalies, complaint mechanism, penalties for agents’ false marketing, etc.).</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Compare neighbourhoods</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link> for HDB price and transport data.
        </div>
      </div>
    ),
  },
  'home-design-problem-vs-preference-views': {
    title: 'Home Design: Problem vs Preference — Two Views',
    description: 'Design is off / has problems vs just different taste / reality limits: built-in, colour, lighting, ID industry, budget, resale, and clutter.',
    relatedGuides: ['old-hdb-resale-pros-and-cons', 'hdb-add-toilet-pros-and-cons', 'hdb-bto-views-positive-vs-negative'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Is home design in Singapore generally off / problematic, or is it just different taste and reality limits? This guide sets out two stances side by side: pro (design is often wrong / has problems) and con (just preference / constraints). Use it to see both arguments on built-in, colour, lighting, designing for life, the ID industry, budget, resale, and clutter.
        </p>

        <h2 id="core-judgment" className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Core judgment</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro: design is often off / has problems</p>
            <p className="text-gray-700">A lot of home design is &quot;template-driven and lacks understanding of how people live&quot; — neither practical nor pleasing.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Con: just different taste / reality limits</p>
            <p className="text-gray-700">There’s no &quot;good or bad&quot;, only &quot;what fits you&quot;.</p>
          </div>
        </div>

        <h2 id="built-in" className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Built-in (full-wall carpentry)</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro</p>
            <p className="text-gray-700">Too much built-in → heavy, inflexible, hard to change later; hurts light and flow.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Con</p>
            <p className="text-gray-700">Small space + lots of stuff → built-in saves the most space, is most practical and dust-proof.</p>
          </div>
        </div>

        <h2 id="colour-style" className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Colour and style</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro</p>
            <p className="text-gray-700">Too much &quot;fake Nordic / fake minimal&quot;: white + grey + cold lights — feels cold, like a show flat.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Con</p>
            <p className="text-gray-700">Simple, bright, easy to resell; safe and inoffensive.</p>
          </div>
        </div>

        <h2 id="lighting" className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Lighting design</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro</p>
            <p className="text-gray-700">No grasp of colour temperature and zoned lighting: one white light for the whole flat, like a clinic.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Con</p>
            <p className="text-gray-700">White light is clear and good for tasks (cooking, makeup, reading); it’s personal preference.</p>
          </div>
        </div>

        <h2 id="life-centred" className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Whether &quot;designed around life&quot;</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro</p>
            <p className="text-gray-700">Mostly &quot;life designed around the renovation&quot;, not the other way round (e.g. counter height doesn’t fit the user).</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Con</p>
            <p className="text-gray-700">First-time owners have no experience; they can only adjust bit by bit afterwards.</p>
          </div>
        </div>

        <h2 id="id-industry" className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. ID industry issues</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro</p>
            <p className="text-gray-700">Many IDs are contractors, not real designers → templates are the fastest way to make money.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Con</p>
            <p className="text-gray-700">Good IDs are expensive; most people can’t afford them.</p>
          </div>
        </div>

        <h2 id="money" className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Is money the main cause?</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro</p>
            <p className="text-gray-700">Good design ≠ necessarily expensive; can do less carpentry, use more furniture.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Con</p>
            <p className="text-gray-700">Reality: budget is limited; can only choose the safe option.</p>
          </div>
        </div>

        <h2 id="abroad" className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Comparison with abroad</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro</p>
            <p className="text-gray-700">Abroad, small homes can still have good light, proportion and flow.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Con</p>
            <p className="text-gray-700">Abroad has plenty of ugly homes too; we only see curated examples.</p>
          </div>
        </div>

        <h2 id="culture" className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Cultural factors</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro</p>
            <p className="text-gray-700">Lack of long-term exposure to design and aesthetics.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Con</p>
            <p className="text-gray-700">Singaporeans value practicality, convenience and saving money more.</p>
          </div>
        </div>

        <h2 id="resale-mindset" className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Resale mindset</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro</p>
            <p className="text-gray-700">Design from the start for &quot;selling later&quot; → not for how you actually live.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Con</p>
            <p className="text-gray-700">Rational: the flat is the biggest asset; liquidity has to be considered.</p>
          </div>
        </div>

        <h2 id="clutter-display" className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Clutter and display</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro</p>
            <p className="text-gray-700">Lots of clutter, no system for display → looks messy and tacky.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Con</p>
            <p className="text-gray-700">Stuff is part of life; it’s not a show flat.</p>
          </div>
        </div>

        <h2 id="conclusion" className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Conclusion</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pro</p>
            <p className="text-gray-700">The problem is: template-driven design + lack of thought about &quot;how people actually live&quot;.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-semibold text-amber-800 mb-2">✗ Con</p>
            <p className="text-gray-700">The problem isn’t design; it’s that everyone’s priorities differ.</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Compare neighbourhoods</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link> for HDB and resale context.
        </div>
      </div>
    ),
  },
  'condo-vs-hdb-core-views': {
    title: 'Condo vs HDB: Core Views at a Glance',
    description: 'Support Condo vs oppose Condo / support HDB: money and assets, eligibility, space, environment, facilities, security, pets, inheritance, identity, and living experience.',
    relatedGuides: ['condo-vs-hdb-two-views', 'condo-vs-hdb-worth-premium-views', 'hdb-vs-condo-living-experience'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Condo vs HDB: core views from the debate. This guide sets out two stances side by side: support Condo (pro) and oppose Condo / support HDB (con). Use it to see both arguments on money and assets, eligibility, space, environment, facilities, security, pets, inheritance, identity, living experience, and core logic.
        </p>

        <h2 id="money-assets" className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Money and assets</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Support Condo (pro)</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Private property has historically appreciated faster; leveraged capital appreciation</li>
              <li>Can sell to PRs / foreigners; bigger buyer pool</li>
              <li>Refinance, en-bloc; stronger as a financial tool</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Oppose Condo / support HDB (con)</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Mortgage pressure is huge; one job loss and it blows up</li>
              <li>Much of it is paper gains; interest + tax + management fees eat returns</li>
              <li>HDB is more stable; don’t have to carry debt for life</li>
            </ul>
          </div>
        </div>

        <h2 id="eligibility-system" className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Eligibility and system</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Pro Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Singles under 35 can’t buy HDB → only condo</li>
              <li>Income above BTO ceiling → system &quot;pushes&quot; you to private</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Con</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Being pushed by the system ≠ condo is inherently more reasonable</li>
              <li>Policy causes mismatch; doesn’t mean condo is better than HDB</li>
            </ul>
          </div>
        </div>

        <h2 id="space-design" className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Space and design</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Pro Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>High ceiling, less oppressive</li>
              <li>Bigger balcony, bigger toilet, better sound insulation</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Con</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Same budget usually buys smaller condo</li>
              <li>Many new condos have kitchens like corridors; extremely cramped</li>
            </ul>
          </div>
        </div>

        <h2 id="environment-neighbours" className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Environment and neighbours</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Pro Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Cleaner; someone cleans daily</li>
              <li>Less void-deck gathering, less door-knocking sales</li>
              <li>Psychologically &quot;neighbours’ SES similar&quot;</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Con</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Money ≠ manners; condo has crazy neighbours too</li>
              <li>HDB can also have good communities</li>
            </ul>
          </div>
        </div>

        <h2 id="facilities-convenience" className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Facilities and convenience</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Pro Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Pool, gym, BBQ, function room downstairs</li>
              <li>Basement carpark, lift direct to unit</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Con</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Many people don’t use facilities</li>
              <li>Condo gym small and crowded; external gym is better</li>
            </ul>
          </div>
        </div>

        <h2 id="security" className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Sense of security</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Pro Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Guard, access control, fencing</li>
              <li>Packages less likely to be stolen</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Con</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Mostly &quot;psychological security&quot;</li>
              <li>Singapore is already safe</li>
            </ul>
          </div>
        </div>

        <h2 id="pets" className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Pet freedom</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Pro Condo</p>
            <p className="text-gray-700">More relaxed for dogs.</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Con</p>
            <p className="text-gray-700">Still subject to MCST rules; not fully free.</p>
          </div>
        </div>

        <h2 id="inheritance" className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Passing to next generation</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Pro Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Private property can be inherited; not bound by &quot;one HDB per person&quot;</li>
              <li>Seen as &quot;family asset&quot;</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Con</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>99-year lease ages too</li>
              <li>Kids mostly still have to sell to realise value</li>
            </ul>
          </div>
        </div>

        <h2 id="identity-psychology" className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Identity and psychology</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Pro Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Represents &quot;upgrade&quot;, &quot;success&quot;</li>
              <li>Gives self and family a more respectable living experience</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Con</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>A lot of it is class anxiety and comparison</li>
              <li>Taking risk for face isn’t worth it</li>
            </ul>
          </div>
        </div>

        <h2 id="living-experience" className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Living experience</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Pro Condo</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Quieter, more private; &quot;resort living&quot;</li>
              <li>No urine smell, no door-knocking</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Con</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>HDB has stronger community feel</li>
              <li>More space, more grounded, more convenient for daily life</li>
            </ul>
          </div>
        </div>

        <h2 id="core-logic" className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Core logic</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✔ Pro Condo</p>
            <p className="text-gray-700">&quot;If money allows → buy a freer, more asset-like home.&quot;</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">❌ Con</p>
            <p className="text-gray-700">&quot;A home is for living, not a wealth tool.&quot;</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-gray-900 font-medium mb-2">Compare neighbourhoods</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link> for HDB price and transport. See also <Link href="/guides/condo-vs-hdb-two-views/" className="text-blue-600 hover:text-blue-700 underline">Condo vs HDB two views</Link>, <Link href="/guides/condo-vs-hdb-worth-premium-views/" className="text-blue-600 hover:text-blue-700 underline">is the premium worth it</Link>, and <Link href="/guides/hdb-vs-condo-living-experience/" className="text-blue-600 hover:text-blue-700 underline">HDB vs Condo living experience</Link>.
        </div>
      </div>
    ),
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }): Promise<Metadata> {
  const resolvedParams = await params
  const guide = guideContent[resolvedParams.slug]

  if (!guide) {
    return {
      title: 'Guide not found | Singapore Data Eye',
      description: 'The guide you are looking for does not exist.',
    }
  }

  return {
    title: `${guide.title} | Singapore Data Eye`,
    description: guide.description,
    alternates: {
      canonical: `/guides/${resolvedParams.slug}/`,
    },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `/guides/${resolvedParams.slug}/`,
    },
    twitter: {
      title: guide.title,
      description: guide.description,
    },
  }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const resolvedParams = await params
  const guide = guideContent[resolvedParams.slug]

  if (!guide) {
    notFound()
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sgeye.vercel.app'
  const canonicalPath = `/guides/${resolvedParams.slug}/`
  const nowIso = new Date().toISOString()
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    mainEntityOfPage: `${siteUrl}${canonicalPath}`,
    datePublished: nowIso,
    dateModified: nowIso,
    publisher: {
      '@type': 'Organization',
      name: 'Singapore Data Eye',
      url: siteUrl,
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/guides/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to guides
          </Link>

        <article className="bg-white rounded-lg border border-gray-200 p-8 md:p-12">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
          />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {guide.title}
          </h1>
          {guide.content}
          
          {/* Related Guides */}
          {guide.relatedGuides && guide.relatedGuides.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Related guides</h2>
              <div className="space-y-3">
                {guide.relatedGuides.map((relatedSlug) => {
                  const relatedGuide = guideContent[relatedSlug]
                  if (!relatedGuide) return null
                  return (
                    <Link
                      key={relatedSlug}
                      href={`/guides/${relatedSlug}/`}
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">{relatedGuide.title}</h3>
                      <p className="text-sm text-gray-600">{relatedGuide.description.substring(0, 120)}...</p>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Next steps</h2>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/neighbourhoods"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Browse all neighbourhoods
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </li>
            </ul>
            <p className="text-sm text-gray-600 mt-4">
              Explore neighbourhoods to see price trends, transport access, lease safety, and school pressure data.
            </p>
          </div>
        </article>
      </div>
    </div>
  )
}
