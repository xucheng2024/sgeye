/**
 * Decision Profile Tracking and Calculation
 * 
 * Tracks user behavior to infer decision profile:
 * - Budget-First Family
 * - Long-Term Stability Family
 * - School-Stability Family
 * - Convenience-Driven Family
 */

export type DecisionProfileType = 
  | 'budget-first'
  | 'long-term-stability'
  | 'school-stability'
  | 'convenience-driven'

export interface DecisionProfile {
  type: DecisionProfileType
  score: number
  reason: string
}

export interface BehaviorEvent {
  type: 'affordability_calculator' | 'price_filter' | 'low_price_click' | 
        'lease_view' | 'short_lease_warning' | 'lease_filter' | 
        'psle_page' | 'school_compare' | 
        'mrt_filter_close' | 'transport_section' |
        'compare_page' | 'neighbourhood_detail'
  timestamp: number
  metadata?: Record<string, any>
}

const STORAGE_KEY = 'decision_profile_events'
const MAX_EVENTS = 100 // Keep last 100 events

// Scoring rules
const SCORE_RULES: Record<string, Partial<Record<DecisionProfileType, number>>> = {
  affordability_calculator: { 'budget-first': 2 },
  price_filter: { 'budget-first': 1 },
  low_price_click: { 'budget-first': 1 },
  lease_view: { 'long-term-stability': 2 },
  short_lease_warning: { 'long-term-stability': 2 },
  lease_filter: { 'long-term-stability': 1 },
  psle_page: { 'school-stability': 2 },
  school_compare: { 'school-stability': 1 },
  mrt_filter_close: { 'convenience-driven': 2 },
  transport_section: { 'convenience-driven': 1 },
}

// Profile definitions
const PROFILE_DEFINITIONS: Record<DecisionProfileType, {
  name: string
  emoji: string
  description: string
  tradeOff: string
}> = {
  'budget-first': {
    name: 'Budget-First Family',
    emoji: '🟦',
    description: 'You tend to prioritise entry price and affordability over other factors.',
    tradeOff: 'Accepting longer commutes or less ideal locations in exchange for lower prices.',
  },
  'long-term-stability': {
    name: 'Long-Term Stability Family',
    emoji: '🟩',
    description: 'You prioritise remaining lease and long-term value over immediate convenience.',
    tradeOff: 'Willing to pay more or accept less convenience for greater future flexibility.',
  },
  'school-stability': {
    name: 'School-Stability Family',
    emoji: '🟨',
    description: 'You prioritise predictable school environments and lower competition pressure.',
    tradeOff: 'Accepting higher prices or longer leases to secure better educational outcomes.',
  },
  'convenience-driven': {
    name: 'Convenience-Driven Family',
    emoji: '🟥',
    description: 'You prioritise daily commute convenience and location accessibility.',
    tradeOff: 'Willing to pay premium prices or accept shorter leases for better transport access.',
  },
}

/**
 * Get all stored behavior events
 */
export function getBehaviorEvents(): BehaviorEvent[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const events: BehaviorEvent[] = JSON.parse(stored)
    return events.filter(e => e.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
  } catch {
    return []
  }
}

/**
 * Record a behavior event
 */
export function recordBehaviorEvent(event: Omit<BehaviorEvent, 'timestamp'>): void {
  if (typeof window === 'undefined') return
  
  try {
    const events = getBehaviorEvents()
    events.push({
      ...event,
      timestamp: Date.now(),
    })
    
    // Keep only last MAX_EVENTS
    const recent = events.slice(-MAX_EVENTS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent))
  } catch (error) {
    console.error('Failed to record behavior event:', error)
  }
}

/**
 * Calculate decision profile from behavior events
 */
export function calculateDecisionProfile(): DecisionProfile | null {
  const events = getBehaviorEvents()
  if (events.length === 0) return null
  
  const scores: Record<DecisionProfileType, number> = {
    'budget-first': 0,
    'long-term-stability': 0,
    'school-stability': 0,
    'convenience-driven': 0,
  }
  
  // Score each event
  events.forEach(event => {
    const rule = SCORE_RULES[event.type]
    if (rule) {
      Object.entries(rule).forEach(([profile, score]) => {
        scores[profile as DecisionProfileType] += score || 0
      })
    }
  })
  
  // Find highest score
  const entries = Object.entries(scores) as [DecisionProfileType, number][]
  const sorted = entries.sort((a, b) => b[1] - a[1])
  const [topProfile, topScore] = sorted[0]
  
  // Need minimum score to show profile
  if (topScore < 2) return null
  
  // Generate reason
  const reason = generateReason(topProfile, events)
  
  return {
    type: topProfile,
    score: topScore,
    reason,
  }
}

/**
 * Generate explanation for why this profile was inferred
 */
function generateReason(profile: DecisionProfileType, events: BehaviorEvent[]): string {
  const recentEvents = events
    .filter(e => e.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    .map(e => e.type)
  
  switch (profile) {
    case 'budget-first':
      if (recentEvents.includes('affordability_calculator')) {
        return 'Because you used the affordability calculator and focused on price considerations.'
      }
      return 'Because you frequently filter by price and prioritize affordable options.'
      
    case 'long-term-stability':
      if (recentEvents.includes('short_lease_warning') || recentEvents.includes('lease_view')) {
        return 'Because you focused on remaining lease and compared long-term value trade-offs.'
      }
      return 'Because you prioritized lease length and long-term holding potential.'
      
    case 'school-stability':
      if (recentEvents.includes('psle_page')) {
        return 'Because you explored school pressure and planning area-level education considerations.'
      }
      return 'Because you compared school competition and prioritized educational environment.'
      
    case 'convenience-driven':
      if (recentEvents.includes('mrt_filter_close')) {
        return 'Because you filtered by close MRT access and prioritized transport convenience.'
      }
      return 'Because you focused on transport accessibility and daily commute convenience.'
      
    default:
      return 'Based on your recent browsing patterns.'
  }
}

/**
 * Get profile display information
 */
export function getProfileDisplay(profile: DecisionProfileType) {
  return PROFILE_DEFINITIONS[profile]
}

/**
 * Clear all behavior events (for testing)
 */
export function clearBehaviorEvents(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

