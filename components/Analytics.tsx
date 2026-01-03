'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initGA4, initClarity, trackPageView } from '@/lib/analytics'

/**
 * Analytics component that initializes GA4 and Clarity
 * and tracks page views
 */
export default function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    // Initialize analytics on mount
    initGA4()
    initClarity()
  }, [])

  useEffect(() => {
    // Track page view on route change
    if (pathname) {
      trackPageView(pathname)
    }
  }, [pathname])

  return null
}

