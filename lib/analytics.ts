/**
 * Analytics tracking utility
 * Supports Google Analytics 4 (GA4) and Microsoft Clarity
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
    clarity?: (...args: any[]) => void
  }
}

// GA4 Measurement ID from environment variable
const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || ''

// Microsoft Clarity ID from environment variable
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || ''

/**
 * Initialize Google Analytics 4
 */
export function initGA4() {
  if (typeof window === 'undefined' || !GA4_MEASUREMENT_ID) return

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || []
  function gtag(...args: any[]) {
    window.dataLayer?.push(args)
  }
  window.gtag = gtag

  // Load GA4 script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`
  document.head.appendChild(script)

  // Configure GA4
  gtag('js', new Date())
  gtag('config', GA4_MEASUREMENT_ID, {
    send_page_view: false, // We'll track page views manually for better control
  })
}

/**
 * Initialize Microsoft Clarity
 */
export function initClarity() {
  if (typeof window === 'undefined' || !CLARITY_PROJECT_ID) return

  // Initialize Clarity
  ;(function (c: any, l: any, a: any, r: any, i: any) {
    let t: any, y: any
    c[a] =
      c[a] ||
      function () {
        ;(c[a].q = c[a].q || []).push(arguments)
      }
    t = l.createElement(r)
    t.async = 1
    t.src = 'https://www.clarity.ms/tag/' + i
    y = l.getElementsByTagName(r)[0]
    y.parentNode?.insertBefore(t, y)
  })(window, document, 'clarity', 'script', CLARITY_PROJECT_ID)
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
  if (typeof window === 'undefined') return

  // GA4 page view
  if (window.gtag && GA4_MEASUREMENT_ID) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
    })
  }
}

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (typeof window === 'undefined') return

  // GA4 custom event
  if (window.gtag && GA4_MEASUREMENT_ID) {
    window.gtag('event', eventName, eventParams)
  }
}

/**
 * Track key conversion events (as specified in requirements)
 */
export const AnalyticsEvents = {
  // Page views
  viewHome: () => trackEvent('view_home'),
  viewExplore: () => trackEvent('view_explore'),
  viewCompare: () => trackEvent('view_compare'),
  viewSchool: () => trackEvent('view_school'),

  // Conversion events
  ctaStartGuided: () => trackEvent('cta_start_guided'),
  ctaBrowseDirect: () => trackEvent('cta_browse_direct'),
  addToCompare: (params?: { neighbourhoodId?: string }) =>
    trackEvent('add_to_compare', params),
  compareView: (params?: { count?: number }) =>
    trackEvent('compare_view', params),
  neighbourDetailView: (params?: { neighbourhoodId?: string }) =>
    trackEvent('neighbour_detail_view', params),
  schoolCompareClick: () => trackEvent('school_compare_click'),
}

