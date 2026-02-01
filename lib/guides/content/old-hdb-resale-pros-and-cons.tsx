import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { GuideData } from "../types"

export const guide: GuideData = {
  title: 'Old HDB Resale: Is It Worth It? Location, Space, Renovation & Lease',
    description: 'A balanced comparison of buying (or not) older resale HDB flats — core reasons, location, space, renovation costs, neighbours, lease decay, and who it suits.',
    relatedGuides: ['hdb-vs-condo-living-experience', 'how-to-choose-hdb-neighbourhood', 'hdb-resale-agent-vs-diy'],
    content: (
      <div className="guide-prose prose prose-lg max-w-none">
        <p className="text-lg text-slate-700 leading-relaxed mb-6">
          Should you buy an older resale HDB flat? We compare 12 aspects side by side — pros (reasons to buy) and cons (reasons to avoid or higher risk) — so you can weigh both views.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
          <p className="text-slate-800 text-sm mb-2"><strong>Terms used below:</strong></p>
          <ul className="list-disc pl-5 text-slate-700 text-sm space-y-1">
            <li><strong>BTO</strong> = Build-To-Order (new HDB flats bought directly from the government)</li>
            <li><strong>Lease decay</strong> = as the 99-year lease shortens, resale value and loan options tend to fall</li>
            <li><strong>Exit strategy</strong> = a plan for when you might sell or move (e.g. when you’re older)</li>
          </ul>
        </div>

        <h2 id="core-reason" className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Core reason</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros (would buy / buy again)</p>
            <p className="text-slate-700">Location and space matter most; old areas are often &quot;better to live in&quot;.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons (not recommended / higher risk)</p>
            <p className="text-slate-700">Who lives in the area and how the neighbourhood is run can be hard to control — and that can lead to discomfort (noise, upkeep, etc.).</p>
          </div>
        </div>

        <h2 id="location-transport" className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Location / transport</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-slate-700">Mature areas, often near MRT or interchange; convenient commute. Some feel quieter and lower-traffic (depends on block and street).</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-slate-700">Some old areas have a complex environment with lots of foot traffic; experience varies by specific location and building type.</p>
          </div>
        </div>

        <h2 id="space-layout" className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Space / layout</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-slate-700">Often larger, squarish layouts with less wasted corridor space; cheaper price per square foot (PSF); many find them more practical than newer BTO layouts.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-slate-700">Old layouts can be odd; uneven beams or walls affect renovation and aesthetics.</p>
          </div>
        </div>

        <h2 id="hardware" className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Condition (leaks / cracks / ageing)</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-slate-700">Structure is generally acceptable; most hardware issues can be &quot;solved with money&quot;; a full gut renovation can greatly improve the flat.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-slate-700">Hidden problems and future ageing risks (e.g. spalling concrete, clogged pipes, uneven walls); repairs can be costly and problems may come back.</p>
          </div>
        </div>

        <h2 id="renovation-cost" className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Renovation cost and complexity</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-slate-700">You’ll renovate anyway; cheap old unit plus heavy renovation can be worthwhile. Controllable items: wiring, plumbing, ceiling, enclosing garbage chutes.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-slate-700">&quot;Invisible costs&quot; are high — rewiring, replacing pipes, correcting uneven walls/floors add up. The external environment cannot be changed even with more money.</p>
          </div>
        </div>

        <h2 id="facilities" className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Facility maintenance (lifts / common areas)</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-slate-700">HDB lifts are usually repaired quickly; some old estates have good infrastructure after upgrading (e.g. running tracks, fitness corners).</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-slate-700">Cleanliness and facility condition vary; lifts and common areas can be worse (trash, odours).</p>
          </div>
        </div>

        <h2 id="neighbours" className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Neighbours / population structure</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-slate-700">Neighbours are largely luck — even new BTOs can have difficult neighbours. Some feel mature estates have a more settled resident mix (varies by block).</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-slate-700">Some estates have more incense, smoking, bird feeding, noise, hoarding, or littering. A difficult neighbour can significantly affect daily life.</p>
          </div>
        </div>

        <h2 id="customs" className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Living environment (customs and habits)</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-slate-700">If you’re fine with them, no problem; some like the “lively” feel and familiarity of older estates.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-slate-700">Funerals and customs (e.g. Hungry Ghost Festival) may be more common; opening windows can be affected. Hard for those sensitive to smells or noise.</p>
          </div>
        </div>

        <h2 id="hygiene-pests" className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Hygiene / pests</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-slate-700">Good garbage chute management (e.g. magnetic lids, sealed chutes) can reduce cockroach problems.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-slate-700">Garbage chutes, pests and bird droppings are more common; lower floors tend to be more affected.</p>
          </div>
        </div>

        <h2 id="selection-strategy" className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Property selection strategy</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-slate-700">Prefer point blocks, high floors, fewer shared walls, fewer units per floor; avoid garbage collection points, schools, coffee shops, bus stops.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-slate-700">Even with good selection you cannot prevent neighbour changes (e.g. estates deteriorating after 2010); &quot;old exterior, old neighbours&quot; cannot be changed.</p>
          </div>
        </div>

        <h2 id="value-lease" className="text-2xl font-bold text-slate-900 mt-8 mb-4">11. Value / exit strategy (lease)</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-slate-700">Focus on owner-occupier value (location + space + living convenience); acceptable if you plan to live there a long time.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-slate-700">Lease decay affects future resale and loan eligibility; do not assume it is a &quot;forever home&quot; — have an exit strategy (e.g. moving to a more elder-friendly home later).</p>
          </div>
        </div>

        <h2 id="suitable-crowd" className="text-2xl font-bold text-slate-900 mt-8 mb-4">12. Who it suits</h2>
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold text-green-800 mb-2">✓ Pros</p>
            <p className="text-slate-700">Suitable for those who value location, commute and space; are willing to invest in renovation; and can accept a mature community atmosphere.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">✗ Cons</p>
            <p className="text-slate-700">Not suitable if you’re sensitive to noise, smells, or neighbours; dislike uncertainty; can’t absorb renovation costs; or need future resale flexibility.</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <p className="text-slate-900 font-medium mb-2">Compare neighbourhoods</p>
          <p className="text-slate-700 mb-2">See price trends, transport access, and lease profiles by area.</p>
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700 underline font-medium">Browse neighbourhoods</Link>
        </div>
      </div>
    ),
}
