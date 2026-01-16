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
