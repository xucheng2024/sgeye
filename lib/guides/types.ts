import type { ReactNode } from 'react'

export interface GuideData {
  title: string
  description: string
  content: ReactNode
  relatedGuides?: string[]
  /** Shown as featured on the guides index */
  featured?: boolean
}

export interface GuideListItem {
  slug: string
  title: string
  description: string
  featured: boolean
}
