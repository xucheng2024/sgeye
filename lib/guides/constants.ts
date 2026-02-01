// Unpublished / removed guides: keep source around but do not serve publicly.
export const unpublishedGuideSlugs = new Set<string>([
  'hdb-bto-views-positive-vs-negative',
  'hdb-secondhand-smoke-window-smoking-views',
  'condo-vs-hdb-two-views',
  'high-income-couples-cant-get-bto-views',
  'hdb-bto-system-debate-views',
  'condo-vs-hdb-worth-premium-views',
  'housing-price-rise-support-vs-oppose',
  'hdb-empty-until-mop-views',
  'home-design-problem-vs-preference-views',
  'condo-vs-hdb-core-views',
])

export function isGuidePublished(slug: string) {
  return !unpublishedGuideSlugs.has(slug)
}
