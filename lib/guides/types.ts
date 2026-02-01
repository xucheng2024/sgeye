import type { ReactNode } from 'react'

export interface GuideData {
  title: string
  description: string
  content: ReactNode
  relatedGuides?: string[]
}
