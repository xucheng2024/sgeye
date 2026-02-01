import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { GuideData } from "../types"

export const guide: GuideData = {
  title: 'HDB Resale: How to Compare Neighbourhoods Beyond Price and MRT',
    description: 'A practical guide to comparing HDB neighbourhoods beyond price and MRT — including daily living comfort, transport, and long-term livability.',
    featured: true,
    relatedGuides: ['how-to-choose-hdb-neighbourhood', 'why-cheap-hdb-feel-uncomfortable', 'does-mrt-distance-really-matter'],
    content: (
      <div className="guide-prose prose prose-lg max-w-none">
        <p className="text-lg text-slate-700 leading-relaxed mb-6">
          When people talk about buying a resale HDB flat, the conversation usually starts and ends with <strong>price</strong> and <strong>distance to MRT</strong>. Both matter — but they’re not enough to know what it’s really like to live in a place.
        </p>
        <p className="text-lg text-slate-700 leading-relaxed mb-8">
          This guide shows a practical way to compare neighbourhoods: price and lease, transport and daily convenience, family fit, and long-term livability. Especially useful if you plan to stay for many years, not just resell quickly.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">In this guide</h3>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li><a href="#price-vs-lease-safety" className="text-blue-600 hover:text-blue-700 underline">Price vs lease</a></li>
            <li><a href="#mrt-vs-daily-convenience" className="text-blue-600 hover:text-blue-700 underline">MRT distance vs daily convenience</a></li>
            <li><a href="#daily-living-comfort" className="text-blue-600 hover:text-blue-700 underline">Daily living comfort</a></li>
            <li><a href="#family-routines" className="text-blue-600 hover:text-blue-700 underline">Family routines and long-term fit</a></li>
            <li><a href="#long-term-livability" className="text-blue-600 hover:text-blue-700 underline">Thinking long-term</a></li>
          </ol>
        </div>

        <h2 id="price-vs-lease-safety" className="text-2xl font-bold text-slate-900 mt-8 mb-4">
          1. Price vs lease: what are you really paying for?
        </h2>
        <p className="text-slate-700 mb-4">
          Two flats can have similar prices today but behave very differently in 10 or 20 years. <strong>Remaining lease</strong> is how many years are left on the 99-year lease — the shorter it is, the harder it is to sell or get a full loan later. A flat with 50 years left may be cheaper now but much harder to sell when you need to move.
        </p>
        <p className="text-slate-700 mb-4">
          Besides the price tag, look at:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li>Remaining lease and how it affects resale and loans</li>
          <li>Whether the estate is mature (older, established) or newer</li>
          <li>Whether prices reflect real demand or short-term hype</li>
        </ul>
        <p className="text-slate-700 mb-6">
          A lower price can look good, but often comes with less flexibility later (e.g. harder to sell, shorter loan).
        </p>
        <p className="text-slate-700 mb-6">
          👉 Start by comparing neighbourhoods across price and lease profiles:{' '}
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline">
            Browse all neighbourhoods
          </Link>
        </p>

        <h2 id="mrt-vs-daily-convenience" className="text-2xl font-bold text-slate-900 mt-8 mb-4">
          2. MRT distance vs daily convenience
        </h2>
        <p className="text-slate-700 mb-4">
          “Near MRT” is one of the most common phrases in property ads. What actually matters for daily life is:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li>How long the whole journey takes (door to door)</li>
          <li>Whether you depend on buses, changing trains, or long walks</li>
          <li>How crowded it gets in peak hours</li>
          <li>How tiring the commute feels every day</li>
        </ul>
        <p className="text-slate-700 mb-6">
          Some areas a bit farther from MRT can still feel easier day to day — for example if buses are good, or shops and parks are nearby.
        </p>
        <p className="text-slate-700 mb-4">
          Places like{' '}
          <Link href="/neighbourhood/bishan-east" className="text-blue-600 hover:text-blue-700 underline">
            Bishan East
          </Link>{' '}
          and{' '}
          <Link href="/neighbourhood/clementi-west" className="text-blue-600 hover:text-blue-700 underline">
            Clementi West
          </Link>{' '}
          are often called “well-connected”. But the real experience depends on crowds, how often you change trains, and how far you walk to shops and MRT.
        </p>
        <p className="text-slate-700 mb-6">
          👉 See how transport access differs across neighbourhoods:{' '}
          <Link href="/transport" className="text-blue-600 hover:text-blue-700 underline">
            Explore transport factors
          </Link>
        </p>

        <h2 id="daily-living-comfort" className="text-2xl font-bold text-slate-900 mt-8 mb-4">
          3. Daily living comfort (often ignored, always felt)
        </h2>
        <p className="text-slate-700 mb-4">
          This is the hardest to measure — and what many buyers wish they had paid more attention to. Think about:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li>How crowded it is at different times of day</li>
          <li>Noise and foot traffic</li>
          <li>How easy it is to walk to food, parks, and everyday shops</li>
          <li>How the area feels on a normal weekday evening (not just on weekends)</li>
        </ul>
        <p className="text-slate-700 mb-4">
          These rarely show up in listings, but they affect your day-to-day life more than floor plans or renovation photos.
        </p>
        <p className="text-slate-700 mb-4">
          Neighbourhoods in the same area (same “planning area” — the zone used for statistics and school allocation) can still feel very different.
        </p>
        <p className="text-slate-700 mb-6">
          For example,{' '}
          <Link href="/neighbourhood/bukit-batok-west" className="text-blue-600 hover:text-blue-700 underline">
            Bukit Batok West
          </Link>{' '}
          and nearby areas can differ a lot in layout, green space, and traffic — and that affects how comfortable they feel.
        </p>
        <p className="text-slate-700 mb-6">
          👉 Compare neighbourhoods beyond listings and brochures:{' '}
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline">
            View neighbourhood profiles
          </Link>
        </p>

        <h2 id="family-routines" className="text-2xl font-bold text-slate-900 mt-8 mb-4">
          4. Family routines and long-term fit
        </h2>
        <p className="text-slate-700 mb-4">
          If you’re buying with family in mind, the neighbourhood affects more than the size of the flat. Think about:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li>How close primary schools are and how competitive they are to get into</li>
          <li>Parks, playgrounds, and other child-friendly facilities</li>
          <li>Whether daily routines (school run, groceries, activities) will be easy for years</li>
          <li>Whether the area still fits your life as your children grow</li>
        </ul>
        <p className="text-slate-700 mb-6">
          Even if you don’t have children yet, many buyers later wish they had thought more about schools and family life.
        </p>
        <p className="text-slate-700 mb-6">
          👉 Understand how neighbourhoods relate to family considerations:{' '}
          <Link href="/family/psle-school" className="text-blue-600 hover:text-blue-700 underline">
            See family-related insights
          </Link>
        </p>

        <h2 id="long-term-livability" className="text-2xl font-bold text-slate-900 mt-8 mb-4">
          5. Thinking long-term: will it still work later?
        </h2>
        <p className="text-slate-700 mb-4">
          A good neighbourhood isn’t just comfortable today — it should still work when your life changes (new job, kids, ageing).
        </p>
        <p className="text-slate-700 mb-4">
          Ask yourself:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li>Will this area still work if your routine changes (e.g. different workplace, kids in school)?</li>
          <li>Is the estate well maintained, or is it ageing badly?</li>
          <li>Is it easy to get around without a car, and will that still matter to you in 10 years?</li>
        </ul>
        <p className="text-slate-700 mb-4">
          The “wow” of a new flat fades quickly. What stays is how easy and pleasant daily life is.
        </p>
        <p className="text-slate-700 mb-4">
          That’s why some buyers visit areas like{' '}
          <Link href="/neighbourhood/tampines-north" className="text-blue-600 hover:text-blue-700 underline">
            Tampines North
          </Link>{' '}
          at different times of day before deciding — to see what it’s really like.
        </p>
        <p className="text-slate-700 mb-6">
          👉 Compare neighbourhoods with a long-term lens:{' '}
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline">
            Compare neighbourhoods
          </Link>
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
          Putting it all together
        </h2>
        <p className="text-slate-700 mb-4">
          Choosing a resale HDB flat isn’t just about getting the “best deal”. It’s about finding a neighbourhood that:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li>Fits your daily routines (work, school, errands)</li>
          <li>Matches how much crowding and commuting you can accept</li>
          <li>Works for your family and lifestyle over many years</li>
          <li>Still feels right years later, after the “new flat” feeling fades</li>
        </ul>
        <p className="text-slate-700 mb-6">
          To explore neighbourhoods using real data on prices, transport, and living comfort:
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <p className="text-slate-900 font-medium mb-2">
            👉 Start here:{' '}
            <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-semibold">
              Browse all neighbourhood profiles
            </Link>
          </p>
        </div>
      </div>
    ),
}
