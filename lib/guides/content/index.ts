import type { GuideData } from '../types'
import { guide as howToCompareHdbNeighbourhoods } from './how-to-compare-hdb-neighbourhoods'
import { guide as howToChooseHdbNeighbourhood } from './how-to-choose-hdb-neighbourhood'
import { guide as whyCheapHdbFeelUncomfortable } from './why-cheap-hdb-feel-uncomfortable'
import { guide as doesMrtDistanceReallyMatter } from './does-mrt-distance-really-matter'
import { guide as oldHdbResaleProsAndCons } from './old-hdb-resale-pros-and-cons'
import { guide as hdbVsCondoLivingExperience } from './hdb-vs-condo-living-experience'
import { guide as hdbResaleAgentVsDiy } from './hdb-resale-agent-vs-diy'
import { guide as movingFromHdbToCondoInconveniences } from './moving-from-hdb-to-condo-inconveniences'
import { guide as hdbResalePriceAndNegotiationViews } from './hdb-resale-price-and-negotiation-views'
import { guide as hdbAddToiletProsAndCons } from './hdb-add-toilet-pros-and-cons'

export const guideContent: Record<string, GuideData> = {
  'how-to-compare-hdb-neighbourhoods': howToCompareHdbNeighbourhoods,
  'how-to-choose-hdb-neighbourhood': howToChooseHdbNeighbourhood,
  'why-cheap-hdb-feel-uncomfortable': whyCheapHdbFeelUncomfortable,
  'does-mrt-distance-really-matter': doesMrtDistanceReallyMatter,
  'old-hdb-resale-pros-and-cons': oldHdbResaleProsAndCons,
  'hdb-vs-condo-living-experience': hdbVsCondoLivingExperience,
  'hdb-resale-agent-vs-diy': hdbResaleAgentVsDiy,
  'moving-from-hdb-to-condo-inconveniences': movingFromHdbToCondoInconveniences,
  'hdb-resale-price-and-negotiation-views': hdbResalePriceAndNegotiationViews,
  'hdb-add-toilet-pros-and-cons': hdbAddToiletProsAndCons,
}
