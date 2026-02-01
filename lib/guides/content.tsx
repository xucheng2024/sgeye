import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { GuideData } from "./types"

export const guideContent: Record<string, GuideData> = {
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
            <p className="text-gray-700">Mature areas, near MRT or interchange, convenient commute; some feel quieter and lower-traffic (depending on the specific blocks and streets).</p>
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
            <p className="text-gray-700">Neighbours are largely luck — even new BTOs can have difficult neighbours; some buyers feel mature central estates have a more settled resident mix (varies by block).</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-gray-700">Some estates may have more exposure to incense burning, smoking, bird feeding/droppings, noise, hoarding, or littering; a difficult neighbour can significantly affect daily life.</p>
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
          This table compares HDB and condo living experience in Singapore based on real comments. Each row is one dimension: ✓ = advantage, ✗ = disadvantage, ▲ = mixed or caution.
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
        <p className="text-gray-700 mb-2"><strong>Condo:</strong> Some security / management teams enforce rules strictly (e.g. needing to swipe to exit a back gate), which can feel frustrating in day-to-day life.</p>
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
        <p className="text-gray-700 mb-2"><strong>Condo:</strong> Sometimes there are more complaints about noise and shared-space rules (e.g. moving furniture, BBQ rules), which can increase day-to-day friction.</p>
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
            <p className="text-gray-700">Cheaper units may have a catch (neighbourhood or unit issues).</p>
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
}

