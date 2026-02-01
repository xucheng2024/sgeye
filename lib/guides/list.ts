import { guideContent } from './content'
import { isGuidePublished } from './constants'
import type { GuideListItem } from './types'

export function getGuideList(): GuideListItem[] {
  return Object.entries(guideContent)
    .filter(([slug]) => isGuidePublished(slug))
    .map(([slug, guide]) => ({
      slug,
      title: guide.title,
      description: guide.description,
      featured: Boolean(guide.featured),
    }))
}
