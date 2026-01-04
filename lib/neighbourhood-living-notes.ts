export type LivingRating = 'good' | 'mixed' | 'bad'

export type LivingDimension = {
  rating: LivingRating
  note: string
}

export type LivingNotes = {
  noiseDensity: LivingDimension
  dailyConvenience: LivingDimension
  greenOutdoor: LivingDimension
  crowdVibe: LivingDimension
  longTermComfort: LivingDimension
}

function norm(name: string): string {
  return (name || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
}

function mk(
  noiseDensity: LivingDimension,
  dailyConvenience: LivingDimension,
  greenOutdoor: LivingDimension,
  crowdVibe: LivingDimension,
  longTermComfort: LivingDimension
): LivingNotes {
  return { noiseDensity, dailyConvenience, greenOutdoor, crowdVibe, longTermComfort }
}

const NOTES_BY_KEY: Record<string, LivingNotes> = {
  ADMIRALTY: {
    noiseDensity: { rating: 'mixed', note: 'North-side estate; quieter inside blocks but peak-hour traffic can show up near arterials.' },
    dailyConvenience: { rating: 'good', note: 'Town-style convenience near transport nodes; errands are generally straightforward.' },
    greenOutdoor: { rating: 'good', note: 'Easy access to north greenery and longer walking/cycling routes.' },
    crowdVibe: { rating: 'good', note: 'Family-oriented, residential rhythm; calmer evenings than city-fringe belts.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if your commute pattern fits the north location.' },
  },

  'AIRPORT ROAD': {
    noiseDensity: { rating: 'mixed', note: 'Arterial roads nearby; noise depends heavily on block orientation and distance from main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong everyday convenience: food, quick errands, and islandwide access are easy.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets and connectors, but it’s still a road-network-heavy area.' },
    crowdVibe: { rating: 'mixed', note: 'Busy, practical, “get-things-done” vibe with a mix of residents and pass-through traffic.' },
    longTermComfort: { rating: 'mixed', note: 'Great for convenience-first living; less ideal if you’re very noise-sensitive.' },
  },

  'ALEXANDRA HILL': {
    noiseDensity: { rating: 'mixed', note: 'Mature estate close to major roads; interior blocks are usually more livable at night.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate amenities; daily errands are generally easy.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks/park connectors around the Alexandra–Telok Blangah belt.' },
    crowdVibe: { rating: 'good', note: 'Stable, local household feel; less transient than downtown zones.' },
    longTermComfort: { rating: 'good', note: 'A solid “mature estate” pick if you want central-ish access without full CBD intensity.' },
  },

  'ALEXANDRA NORTH': {
    noiseDensity: { rating: 'mixed', note: 'More urban and road-adjacent; noise varies a lot by pocket.' },
    dailyConvenience: { rating: 'good', note: 'Good access to amenities and transit; workday conveniences are strong.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green connectors, but overall more urban fabric than park-first estates.' },
    crowdVibe: { rating: 'mixed', note: 'You’ll see more young professionals and renters mixed with locals.' },
    longTermComfort: { rating: 'mixed', note: 'Comfort depends on your tolerance for urban energy and traffic-adjacent living.' },
  },

  ALJUNIED: {
    noiseDensity: { rating: 'mixed', note: 'Dense city-fringe belt; traffic and activity are noticeable, especially near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Very convenient for food, transit, and daily services.' },
    greenOutdoor: { rating: 'mixed', note: 'Green is present but not the dominant feel; you’ll travel for bigger park time.' },
    crowdVibe: { rating: 'mixed', note: 'Mixed local and renter crowd; busier streets and higher churn.' },
    longTermComfort: { rating: 'mixed', note: 'Works well if you want convenience; less ideal if you prioritise quiet evenings.' },
  },

  'ANAK BUKIT': {
    noiseDensity: { rating: 'mixed', note: 'Near major Bukit Timah corridors; quieter inside residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Convenience is strong around nearby hubs; errands are usually easy.' },
    greenOutdoor: { rating: 'good', note: 'Strong greenery access (Bukit Timah side); good for walks and outdoor time.' },
    crowdVibe: { rating: 'good', note: 'More family/owner-occupier feel; less transient than city core.' },
    longTermComfort: { rating: 'good', note: 'A comfortable long-term base if you like greener, central-west living.' },
  },

  ANCHORVALE: {
    noiseDensity: { rating: 'mixed', note: 'Planned-town density; typically calm in blocks, noisier near schools/main roads.' },
    dailyConvenience: { rating: 'good', note: 'Designed for daily life: shops, food, and services are easy to access.' },
    greenOutdoor: { rating: 'good', note: 'Strong park-connector network; very kid/stroller-friendly.' },
    crowdVibe: { rating: 'good', note: 'Young families and active weekends; strong “new town” community feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable for family living if you’re OK with being further from the CBD.' },
  },

  'ANG MO KIO TOWN CENTRE': {
    noiseDensity: { rating: 'bad', note: 'Town-centre intensity: buses, traffic, and footfall are part of daily life.' },
    dailyConvenience: { rating: 'good', note: 'Top-tier convenience: malls, markets, services—everything is nearby.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets, but the town-centre core is more hardscape-heavy.' },
    crowdVibe: { rating: 'mixed', note: 'Always-busy hub vibe; lots of pass-through crowd.' },
    longTermComfort: { rating: 'mixed', note: 'Great for convenience-first; choose pockets away from the hub if you want quieter nights.' },
  },

  ANSON: {
    noiseDensity: { rating: 'bad', note: 'CBD edge: traffic, construction cycles, and nightlife spillover can be unavoidable.' },
    dailyConvenience: { rating: 'good', note: 'Everything is close—transit, food, services, work.' },
    greenOutdoor: { rating: 'bad', note: 'More concrete-core; you’ll go out of the area for park-first living.' },
    crowdVibe: { rating: 'mixed', note: 'Commuter/renter-heavy, high churn, weekday intensity.' },
    longTermComfort: { rating: 'mixed', note: 'Excellent for convenience and short commutes; less “settle down” comfortable.' },
  },

  BAHAR: {
    noiseDensity: { rating: 'good', note: 'More residential and quieter than town-centre/city-fringe belts.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is decent but you’ll lean on nearby hubs for bigger errands.' },
    greenOutdoor: { rating: 'good', note: 'Good access to west greenery and connectors.' },
    crowdVibe: { rating: 'good', note: 'Local family vibe; calmer evenings.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you prefer quieter residential pockets over dense hubs.' },
  },

  BALESTIER: {
    noiseDensity: { rating: 'mixed', note: 'Main-road corridor feel; traffic noise is a common trade-off.' },
    dailyConvenience: { rating: 'good', note: 'Strong food/errand convenience; plenty of “walk downstairs” options.' },
    greenOutdoor: { rating: 'mixed', note: 'Greenery exists but it’s not a park-centric environment.' },
    crowdVibe: { rating: 'mixed', note: 'Older shophouse corridor energy; mix of locals, renters, and pass-through crowd.' },
    longTermComfort: { rating: 'mixed', note: 'Good if you like city-fringe convenience; choose pockets away from the loudest roads.' },
  },

  BANGKIT: {
    noiseDensity: { rating: 'good', note: 'Generally calmer residential vibe; less late-night intensity.' },
    dailyConvenience: { rating: 'good', note: 'Daily errands are easy with nearby town amenities.' },
    greenOutdoor: { rating: 'good', note: 'Strong access to Bukit Panjang/Dairy Farm-side greenery.' },
    crowdVibe: { rating: 'good', note: 'Family-first, neighbourhood feel; slower evenings.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term base if you like greenery and a quieter west-side rhythm.' },
  },

  'BAYFRONT SUBZONE': {
    noiseDensity: { rating: 'mixed', note: 'Event/tourist intensity can spike; traffic is generally present.' },
    dailyConvenience: { rating: 'good', note: 'High convenience for transit and city amenities.' },
    greenOutdoor: { rating: 'mixed', note: 'Iconic outdoor spaces nearby, but the core feel is still highly urban.' },
    crowdVibe: { rating: 'bad', note: 'Tourist-heavy and event-driven; less “neighbourhood” calm.' },
    longTermComfort: { rating: 'mixed', note: 'Great for city lovers; less comfortable if you want a stable, quiet residential feel.' },
  },

  BAYSHORE: {
    noiseDensity: { rating: 'mixed', note: 'Coastal-expressway influence; quieter inside residential pockets.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is improving; you may still rely on nearby hubs for bigger errands.' },
    greenOutdoor: { rating: 'good', note: 'Strong coastal/outdoor living potential (walks, cycling, sea breeze).' },
    crowdVibe: { rating: 'good', note: 'More relaxed, family-friendly east-coast rhythm.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you value outdoor life and are OK with some expressway noise trade-offs.' },
  },

  'BEDOK NORTH': {
    noiseDensity: { rating: 'mixed', note: 'Mature estate noise: generally calm inside blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Very strong daily convenience—markets, food, schools, clinics are plentiful.' },
    greenOutdoor: { rating: 'mixed', note: 'Green pockets are common; bigger park access depends on exact pocket.' },
    crowdVibe: { rating: 'good', note: 'Local household rhythm; stable “heartland” feel.' },
    longTermComfort: { rating: 'good', note: 'Solid long-term comfort if you like mature-east convenience.' },
  },

  'BEDOK RESERVOIR': {
    noiseDensity: { rating: 'mixed', note: 'Generally residential; traffic noise depends on proximity to reservoir-adjacent roads.' },
    dailyConvenience: { rating: 'good', note: 'Good everyday convenience with mature estate amenities nearby.' },
    greenOutdoor: { rating: 'good', note: 'Reservoir-side outdoor space is a real daily-living advantage.' },
    crowdVibe: { rating: 'good', note: 'Family + jogger/cyclist energy; more outdoorsy weekends.' },
    longTermComfort: { rating: 'good', note: 'Often a comfortable long-term pick if you value daily walks and open space.' },
  },

  'BEDOK SOUTH': {
    noiseDensity: { rating: 'mixed', note: 'Coastal/expressway adjacency can add background noise in some pockets.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-east convenience; errands are easy.' },
    greenOutdoor: { rating: 'good', note: 'Better access to coastal parks and outdoor space than most inner estates.' },
    crowdVibe: { rating: 'good', note: 'Relaxed east-side rhythm; family-friendly feel in many pockets.' },
    longTermComfort: { rating: 'good', note: 'Great if you like east-side living + outdoor access and can accept some road noise.' },
  },

  BENCOOLEN: {
    noiseDensity: { rating: 'bad', note: 'City-core density with traffic and constant footfall.' },
    dailyConvenience: { rating: 'good', note: 'Extremely convenient for transit, food, and services.' },
    greenOutdoor: { rating: 'bad', note: 'More hard-city environment; parks exist but are not the default feel.' },
    crowdVibe: { rating: 'mixed', note: 'Student/office/tourist mix; high daily churn.' },
    longTermComfort: { rating: 'mixed', note: 'Works for convenience-first; less comfortable if you want calm, residential evenings.' },
  },

  BENDEMEER: {
    noiseDensity: { rating: 'mixed', note: 'City-fringe traffic and activity; quieter in interior blocks.' },
    dailyConvenience: { rating: 'good', note: 'Strong “everyday Singapore” convenience (food, services, transit access).' },
    greenOutdoor: { rating: 'mixed', note: 'Some connectors and small parks; not a big-park-first environment.' },
    crowdVibe: { rating: 'good', note: 'Local household vibe with practical city-fringe energy.' },
    longTermComfort: { rating: 'mixed', note: 'Comfortable if you like city-fringe convenience and can accept some noise.' },
  },

  'BENOI SECTOR': {
    noiseDensity: { rating: 'bad', note: 'Industrial zone; heavy vehicles and shift cycles can add noise/traffic spikes.' },
    dailyConvenience: { rating: 'bad', note: 'Residential-style errands typically require travel outside the zone.' },
    greenOutdoor: { rating: 'bad', note: 'Hardscape-heavy; limited daily green space.' },
    crowdVibe: { rating: 'mixed', note: 'Workforce-heavy feel; limited neighbourhood street-life.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential environment.' },
  },

  BIDADARI: {
    noiseDensity: { rating: 'mixed', note: 'Newer, denser estate; noise clusters around schools and main roads.' },
    dailyConvenience: { rating: 'good', note: 'Convenience is improving fast; planned amenities make daily life easier.' },
    greenOutdoor: { rating: 'good', note: 'Large park/outdoor spaces are a standout plus for families.' },
    crowdVibe: { rating: 'good', note: 'Young-family and new-estate energy; active weekends.' },
    longTermComfort: { rating: 'good', note: 'Good long-term comfort if you like newer estates with strong outdoor access.' },
  },

  'BISHAN EAST': {
    noiseDensity: { rating: 'mixed', note: 'Central location; generally calm in estates, noisier near arterials and hubs.' },
    dailyConvenience: { rating: 'good', note: 'Very convenient with mature amenities and excellent connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Strong access to major park spaces and park connectors.' },
    crowdVibe: { rating: 'good', note: 'Stable family/owner-occupier feel; mature town rhythm.' },
    longTermComfort: { rating: 'good', note: 'A strong all-rounder for long-term family living with central access.' },
  },

  'BOAT QUAY': {
    noiseDensity: { rating: 'bad', note: 'Nightlife/riverfront activity makes quiet nights hard.' },
    dailyConvenience: { rating: 'good', note: 'City-core convenience is excellent.' },
    greenOutdoor: { rating: 'bad', note: 'More hard-city; outdoor time is mostly promenades rather than park living.' },
    crowdVibe: { rating: 'bad', note: 'Tourist/nightlife crowd; high churn and late-night activity.' },
    longTermComfort: { rating: 'bad', note: 'Usually not ideal for long-term quiet family living.' },
  },

  'BOON KENG': {
    noiseDensity: { rating: 'mixed', note: 'Dense city-fringe residential; main-road noise depends on block location.' },
    dailyConvenience: { rating: 'good', note: 'Strong daily convenience with MRT and plenty of food options nearby.' },
    greenOutdoor: { rating: 'mixed', note: 'Some small parks/connectors; bigger green spaces require travel.' },
    crowdVibe: { rating: 'good', note: 'Local, lived-in vibe; practical and busy but not purely touristy.' },
    longTermComfort: { rating: 'mixed', note: 'Comfortable if you like convenience and can accept city-fringe density.' },
  },

  'BOON LAY PLACE': {
    noiseDensity: { rating: 'mixed', note: 'West hub with nearby industry; noise/traffic can spike near major roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong west-side convenience: markets, malls, and transit access.' },
    greenOutdoor: { rating: 'mixed', note: 'Green pockets exist; larger parks depend on exact pocket.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of families and workforce flow; busier daytime feel.' },
    longTermComfort: { rating: 'mixed', note: 'Good if you work nearby; comfort depends on noise tolerance and commute.' },
  },

  'BOON TECK': {
    noiseDensity: { rating: 'good', note: 'Mature Toa Payoh pockets are generally calm at night.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience (food, services, errands).' },
    greenOutdoor: { rating: 'mixed', note: 'Green pockets are there; larger parks are a short trip away.' },
    crowdVibe: { rating: 'good', note: 'Stable, local household vibe; familiar estate rhythm.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you prefer mature-estate stability over flashy hubs.' },
  },

  BOULEVARD: {
    noiseDensity: { rating: 'bad', note: 'Orchard fringe: traffic and city intensity are constant.' },
    dailyConvenience: { rating: 'good', note: 'Extremely convenient for shopping, food, and transit.' },
    greenOutdoor: { rating: 'mixed', note: 'Some greenery nearby, but the dominant feel is urban core.' },
    crowdVibe: { rating: 'mixed', note: 'More affluent/office/tourist mix; higher churn.' },
    longTermComfort: { rating: 'mixed', note: 'Works if you want prime convenience; not ideal if you want quiet, local estate life.' },
  },

  // Anchors: Braddell MRT station is at Lorong 1/2 Toa Payoh junction; Toa Payoh HDB estate nearby.
  BRADDELL: {
    noiseDensity: { rating: 'good', note: 'Residential (Toa Payoh), generally calmer nights; traffic mainly around the junction.' },
    dailyConvenience: { rating: 'mixed', note: 'Everyday needs are there, but some errands feel “walk a bit / cross roads”.' },
    greenOutdoor: { rating: 'mixed', note: 'More neighbourhood green pockets than big parks; decent for short walks.' },
    crowdVibe: { rating: 'good', note: 'More local households; steady, familiar estate feel.' },
    longTermComfort: { rating: 'mixed', note: 'Quiet trade-off: not as plug-and-play convenient as city-fringe areas.' },
  },

  'BRAS BASAH': {
    noiseDensity: { rating: 'bad', note: 'Civic-core density with constant traffic and footfall.' },
    dailyConvenience: { rating: 'good', note: 'Top convenience for transit, culture, and everyday services.' },
    greenOutdoor: { rating: 'mixed', note: 'Some nearby park space, but overall still city-core hardscape.' },
    crowdVibe: { rating: 'mixed', note: 'Students, tourists, office crowd; higher daily churn.' },
    longTermComfort: { rating: 'mixed', note: 'Great for central convenience; less calm than mature residential estates.' },
  },

  BRICKLAND: {
    noiseDensity: { rating: 'good', note: 'Mostly residential; nights tend to be calmer than city-fringe zones.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is decent; bigger errands may lean on nearby hubs.' },
    greenOutdoor: { rating: 'good', note: 'Good access to west-side greenery and longer walk/cycle routes.' },
    crowdVibe: { rating: 'good', note: 'Local family rhythm; quieter evenings.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like quieter, greener west pockets.' },
  },

  BRICKWORKS: {
    noiseDensity: { rating: 'mixed', note: 'More urban-adjacent; noise varies depending on proximity to main roads.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is OK; some errands may require a short ride to bigger clusters.' },
    greenOutdoor: { rating: 'good', note: 'Good access to nearby green corridors and parks.' },
    crowdVibe: { rating: 'good', note: 'More residential than nightlife; steadier daily rhythm.' },
    longTermComfort: { rating: 'good', note: 'Good for long-term if you want greener living without going far from central-west.' },
  },

  BUGIS: {
    noiseDensity: { rating: 'bad', note: 'Urban core with constant activity; quiet nights are uncommon.' },
    dailyConvenience: { rating: 'good', note: 'Extremely convenient for transit, food, and services.' },
    greenOutdoor: { rating: 'bad', note: 'Hard-city environment; greenery exists but is not the dominant feel.' },
    crowdVibe: { rating: 'bad', note: 'Tourist/office/nightlife mix; high churn and busy streets.' },
    longTermComfort: { rating: 'mixed', note: 'Excellent for convenience-first; less ideal for long-term calm family living.' },
  },

  'BUKIT BATOK CENTRAL': {
    noiseDensity: { rating: 'mixed', note: 'Town-centre-adjacent: busier near the hub, calmer inside residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Strong convenience with shops, food, and services clustered nearby.' },
    greenOutdoor: { rating: 'mixed', note: 'Green pockets are common; larger park access varies by pocket.' },
    crowdVibe: { rating: 'good', note: 'Local heartland vibe; steady daily rhythm.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like west heartland living with decent connectivity.' },
  },

  'BUKIT BATOK EAST': {
    noiseDensity: { rating: 'good', note: 'Mostly residential; nights tend to be calmer away from arterials.' },
    dailyConvenience: { rating: 'mixed', note: 'Daily needs are covered; for bigger errands you may head to the central hub.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the Bukit Batok area.' },
    crowdVibe: { rating: 'good', note: 'Family-oriented heartland feel.' },
    longTermComfort: { rating: 'good', note: 'Good if you want quieter residential pockets and don’t need CBD-adjacent living.' },
  },

  'BUKIT BATOK SOUTH': {
    noiseDensity: { rating: 'mixed', note: 'Noise depends on proximity to major roads/expressways; interior pockets are calmer.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is decent; larger amenities cluster around nearby hubs.' },
    greenOutdoor: { rating: 'good', note: 'Strong west-side greenery access for walks and outdoor time.' },
    crowdVibe: { rating: 'good', note: 'Stable residential rhythm; fewer late-night hotspots.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you prioritise space/quiet over prime-city convenience.' },
  },

  'BUKIT BATOK WEST': {
    noiseDensity: { rating: 'good', note: 'Generally calmer residential vibe; traffic noise mainly near arterials.' },
    dailyConvenience: { rating: 'mixed', note: 'Everyday errands are fine; bigger choices require a short hop to hubs.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors; more “walkable greenery” than city belts.' },
    crowdVibe: { rating: 'good', note: 'Local households and families; quieter evenings.' },
    longTermComfort: { rating: 'good', note: 'Good long-term comfort if your commute is west-friendly.' },
  },

  'BUKIT HO SWEE': {
    noiseDensity: { rating: 'mixed', note: 'Central-adjacent mature estate; road noise depends on exact pocket.' },
    dailyConvenience: { rating: 'good', note: 'Mature-estate convenience: food, markets, and services are well-covered.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets and connectors; bigger park time is nearby but not always next-door.' },
    crowdVibe: { rating: 'good', note: 'Local, lived-in vibe; stable household mix.' },
    longTermComfort: { rating: 'good', note: 'A practical long-term pick if you want central access without full CBD intensity.' },
  },

  'BUKIT MERAH': {
    noiseDensity: { rating: 'mixed', note: 'Mature, central belt: roads and activity vary by pocket; interior estates are calmer.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-town convenience across markets, food, and daily services.' },
    greenOutdoor: { rating: 'good', note: 'Good access to park connectors and hill/park pockets in the area.' },
    crowdVibe: { rating: 'good', note: 'Stable family + working adults mix; mature-estate rhythm.' },
    longTermComfort: { rating: 'good', note: 'Often a strong balance of convenience, central access, and livability.' },
  },

  CAIRNHILL: {
    noiseDensity: { rating: 'mixed', note: 'Close to Orchard; pockets can be calmer, but arterial traffic is nearby.' },
    dailyConvenience: { rating: 'good', note: 'Top-tier convenience for shopping, dining, and transit.' },
    greenOutdoor: { rating: 'mixed', note: 'Some nearby greenery, but it’s still very city-core adjacent.' },
    crowdVibe: { rating: 'mixed', note: 'More affluent/expat and city-lifestyle vibe; higher churn than heartlands.' },
    longTermComfort: { rating: 'mixed', note: 'Great for city convenience; long-term comfort depends on noise tolerance and lifestyle.' },
  },

  CECIL: {
    noiseDensity: { rating: 'bad', note: 'CBD core: constant traffic/works cycles; quiet nights are uncommon.' },
    dailyConvenience: { rating: 'good', note: 'Everything is close—transit, food, work.' },
    greenOutdoor: { rating: 'bad', note: 'Hard-city environment; outdoor time is mostly promenades and small pockets.' },
    crowdVibe: { rating: 'bad', note: 'Commuter-heavy, high churn; weekday intensity dominates.' },
    longTermComfort: { rating: 'mixed', note: 'Great if you prioritise proximity; less comfortable for family-style quiet living.' },
  },

  'CENTRAL SUBZONE': {
    noiseDensity: { rating: 'bad', note: 'City core intensity: traffic and footfall are persistent.' },
    dailyConvenience: { rating: 'good', note: 'High convenience for transit, dining, and services.' },
    greenOutdoor: { rating: 'bad', note: 'More hardscape than greenery; parks require a short trip.' },
    crowdVibe: { rating: 'bad', note: 'Tourist/office mix with high churn.' },
    longTermComfort: { rating: 'mixed', note: 'Good for city-lifestyle convenience, not for quiet long-term family living.' },
  },

  'CENTRAL WATER CATCHMENT': {
    noiseDensity: { rating: 'good', note: 'Nature-dominant area; typically quieter and less traffic-driven.' },
    dailyConvenience: { rating: 'bad', note: 'Daily errands require travel; not a convenience-first location.' },
    greenOutdoor: { rating: 'good', note: 'Exceptional greenery and outdoor access (trails/parks).' },
    crowdVibe: { rating: 'good', note: 'Outdoor-oriented, slower pace.' },
    longTermComfort: { rating: 'mixed', note: 'Great if you want nature-first living and accept travel for errands.' },
  },

  'CHANGI AIRPORT': {
    noiseDensity: { rating: 'mixed', note: 'Aircraft/arterial activity can be noticeable depending on proximity.' },
    dailyConvenience: { rating: 'mixed', note: 'Excellent for air travel; everyday town errands depend on nearby nodes.' },
    greenOutdoor: { rating: 'mixed', note: 'Coastal/park access is a plus, but the core area is infrastructure-heavy.' },
    crowdVibe: { rating: 'bad', note: 'Transit/travel flow dominates; less neighbourhood feel.' },
    longTermComfort: { rating: 'mixed', note: 'Works for travel-heavy lifestyles; less ideal as a calm, settled family base.' },
  },

  'CHANGI BAY': {
    noiseDensity: { rating: 'good', note: 'More remote and quieter overall; activity is lower than urban cores.' },
    dailyConvenience: { rating: 'bad', note: 'Errands generally require travel; not an amenity-dense area.' },
    greenOutdoor: { rating: 'good', note: 'Strong coastal/outdoor environment.' },
    crowdVibe: { rating: 'good', note: 'Quiet, nature/space-oriented feel.' },
    longTermComfort: { rating: 'mixed', note: 'Great if you value space/coast; challenging if you need daily convenience.' },
  },

  'CHANGI POINT': {
    noiseDensity: { rating: 'good', note: 'More laid-back coastal pocket; generally calmer nights.' },
    dailyConvenience: { rating: 'mixed', note: 'Basics are available, but many errands still point you to larger hubs.' },
    greenOutdoor: { rating: 'good', note: 'Coastal walks and outdoor time are a strong daily-living plus.' },
    crowdVibe: { rating: 'good', note: 'Slower, village-like rhythm compared to city belts.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you like quieter coastal living and accept travel for some errands.' },
  },

  'CHANGI WEST': {
    noiseDensity: { rating: 'mixed', note: 'More logistics/arterial influence; noise depends on exact pocket.' },
    dailyConvenience: { rating: 'bad', note: 'Not amenity-dense; errands usually require travel.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets, but the area is more infrastructure-driven.' },
    crowdVibe: { rating: 'mixed', note: 'Workforce/transit feel; less neighbourhood street-life.' },
    longTermComfort: { rating: 'bad', note: 'Generally not a comfortable long-term residential environment.' },
  },

  CHATSWORTH: {
    noiseDensity: { rating: 'good', note: 'Lower-density, quieter pocket; less late-night intensity.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is decent, but many errands rely on nearby hubs.' },
    greenOutdoor: { rating: 'good', note: 'Good access to greenery in the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'More private, residential feel; calmer streets.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like quieter, lower-density living.' },
  },

  'CHENG SAN': {
    noiseDensity: { rating: 'mixed', note: 'Mature AMK pocket; busier near arterials, calmer inside estates.' },
    dailyConvenience: { rating: 'good', note: 'Strong heartland convenience with plenty of food and services.' },
    greenOutdoor: { rating: 'mixed', note: 'Green pockets exist; bigger park access depends on pocket.' },
    crowdVibe: { rating: 'good', note: 'Local household rhythm; stable and familiar.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like mature-heartland living.' },
  },

  'CHIN BEE': {
    noiseDensity: { rating: 'bad', note: 'Industrial zone; heavy vehicles and operations can be noisy.' },
    dailyConvenience: { rating: 'bad', note: 'Not amenity-dense; residential errands require travel.' },
    greenOutdoor: { rating: 'bad', note: 'Hardscape-heavy with limited daily green space.' },
    crowdVibe: { rating: 'mixed', note: 'Workforce-heavy feel.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential environment.' },
  },

  'CHINA SQUARE': {
    noiseDensity: { rating: 'bad', note: 'CBD intensity: traffic/footfall and workday crowd are constant.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience for work, transit, and meals.' },
    greenOutdoor: { rating: 'bad', note: 'Hard-city environment with limited “daily greenery” feel.' },
    crowdVibe: { rating: 'bad', note: 'Commuter-heavy and high churn.' },
    longTermComfort: { rating: 'mixed', note: 'Great if you want CBD proximity; less ideal for calm long-term living.' },
  },

  CHINATOWN: {
    noiseDensity: { rating: 'bad', note: 'Busy heritage/tourist belt; footfall and traffic are noticeable.' },
    dailyConvenience: { rating: 'good', note: 'Very convenient for food, transit, and services.' },
    greenOutdoor: { rating: 'bad', note: 'Dense urban fabric; parks are not the default daily feel.' },
    crowdVibe: { rating: 'bad', note: 'Tourist + nightlife + office mix; high churn.' },
    longTermComfort: { rating: 'mixed', note: 'Works for city lovers; less comfortable if you want quiet residential life.' },
  },

  'CHOA CHU KANG CENTRAL': {
    noiseDensity: { rating: 'mixed', note: 'Hub-adjacent: busier near the centre, calmer in the estates.' },
    dailyConvenience: { rating: 'good', note: 'Town-centre convenience is strong; daily errands are easy.' },
    greenOutdoor: { rating: 'good', note: 'Good access to west-side parks/connectors.' },
    crowdVibe: { rating: 'good', note: 'Family-oriented heartland rhythm.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you’re OK with a west/north-west commute profile.' },
  },

  'CHOA CHU KANG NORTH': {
    noiseDensity: { rating: 'good', note: 'More residential and calmer; less hub intensity.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is decent; you’ll head to central hubs for bigger errands.' },
    greenOutdoor: { rating: 'good', note: 'Strong greenery access for walks and outdoor time.' },
    crowdVibe: { rating: 'good', note: 'Local family vibe; quieter evenings.' },
    longTermComfort: { rating: 'good', note: 'Good for long-term living if you prefer quieter heartland pockets.' },
  },

  'CHONG BOON': {
    noiseDensity: { rating: 'mixed', note: 'Mature heartland pocket; traffic noise depends on proximity to arterials.' },
    dailyConvenience: { rating: 'good', note: 'Strong daily convenience; lots of food and services nearby.' },
    greenOutdoor: { rating: 'mixed', note: 'Green pockets exist; bigger park time depends on pocket.' },
    crowdVibe: { rating: 'good', note: 'Local, lived-in vibe; stable daily rhythm.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you like mature-heartland living with good amenities.' },
  },

  'CITY HALL': {
    noiseDensity: { rating: 'bad', note: 'Civic/downtown core with constant activity and traffic.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience for transit, food, and services.' },
    greenOutdoor: { rating: 'mixed', note: 'Some nearby parks, but the dominant feel is still urban core.' },
    crowdVibe: { rating: 'bad', note: 'Tourist/office crowd with high churn.' },
    longTermComfort: { rating: 'mixed', note: 'Great for city-lifestyle; less comfortable if you want quiet family living.' },
  },

  'CITY TERMINALS': {
    noiseDensity: { rating: 'bad', note: 'Port/logistics influence; heavy vehicles and operations can be noisy.' },
    dailyConvenience: { rating: 'bad', note: 'Not amenity-dense for residential life; errands require travel.' },
    greenOutdoor: { rating: 'bad', note: 'Hardscape-heavy; limited daily green space.' },
    crowdVibe: { rating: 'mixed', note: 'Workforce/logistics feel rather than neighbourhood living.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential environment.' },
  },

  'CLARKE QUAY': {
    noiseDensity: { rating: 'bad', note: 'Nightlife belt: late-night noise and crowd are common.' },
    dailyConvenience: { rating: 'good', note: 'High convenience for transit and city amenities.' },
    greenOutdoor: { rating: 'bad', note: 'More hard-city; outdoor time is mostly river promenade style.' },
    crowdVibe: { rating: 'bad', note: 'Nightlife/tourist crowd; high churn.' },
    longTermComfort: { rating: 'bad', note: 'Generally not ideal for long-term quiet living.' },
  },

  CLEANTECH: {
    noiseDensity: { rating: 'mixed', note: 'Business/industrial-adjacent; quieter at night but not residential in feel.' },
    dailyConvenience: { rating: 'bad', note: 'Limited day-to-day amenities; errands require travel.' },
    greenOutdoor: { rating: 'mixed', note: 'Some greenery by design, but still a business park environment.' },
    crowdVibe: { rating: 'mixed', note: 'Workplace-oriented crowd; low neighbourhood street-life.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential base.' },
  },

  'CLEMENTI CENTRAL': {
    noiseDensity: { rating: 'mixed', note: 'Hub-adjacent: busier near the centre, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Strong Clementi hub convenience for errands and commuting.' },
    greenOutdoor: { rating: 'mixed', note: 'Green pockets exist; bigger park access depends on pocket.' },
    crowdVibe: { rating: 'good', note: 'Family/student mix; practical, lived-in vibe.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you value west connectivity and mature amenities.' },
  },

  'CLEMENTI NORTH': {
    noiseDensity: { rating: 'good', note: 'Mostly residential; calmer away from major roads.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is good overall, but bigger errands point you to the central hub.' },
    greenOutdoor: { rating: 'good', note: 'Good greenery access for walks and outdoor time.' },
    crowdVibe: { rating: 'good', note: 'Family-first heartland rhythm.' },
    longTermComfort: { rating: 'good', note: 'Good long-term comfort if you like west-side residential living.' },
  },

  'CLEMENTI WEST': {
    noiseDensity: { rating: 'mixed', note: 'Noise depends on proximity to arterials; interior pockets are calmer.' },
    dailyConvenience: { rating: 'mixed', note: 'Daily needs are fine; larger errands rely on hubs nearby.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors in the area.' },
    crowdVibe: { rating: 'good', note: 'Stable local household vibe.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if commute works and you prefer quieter pockets.' },
  },

  'CLEMENTI WOODS': {
    noiseDensity: { rating: 'good', note: 'More residential and calmer; less hub intensity.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is decent; you may travel for bigger choices.' },
    greenOutdoor: { rating: 'good', note: 'Green access is a strong plus; good for daily walks.' },
    crowdVibe: { rating: 'good', note: 'Family-friendly, quieter neighbourhood rhythm.' },
    longTermComfort: { rating: 'good', note: 'Great if you want a calmer west-side pocket with greenery nearby.' },
  },

  'CLIFFORD PIER': {
    noiseDensity: { rating: 'mixed', note: 'Marina/civic core: events and traffic can spike.' },
    dailyConvenience: { rating: 'good', note: 'Very convenient for transit and downtown amenities.' },
    greenOutdoor: { rating: 'mixed', note: 'Promenade-style outdoor space; less “park-first neighbourhood” feel.' },
    crowdVibe: { rating: 'bad', note: 'Tourist/office intensity; high churn.' },
    longTermComfort: { rating: 'mixed', note: 'Works for downtown lifestyle; not ideal for quiet long-term family living.' },
  },

  COMMONWEALTH: {
    noiseDensity: { rating: 'mixed', note: 'MRT/arterial adjacency can add noise; many pockets remain livable at night.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate amenities and good connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks/connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Stable family + working adults mix; mature estate rhythm.' },
    longTermComfort: { rating: 'good', note: 'A strong long-term pick if you want mature amenities with central-west access.' },
  },

  COMPASSVALE: {
    noiseDensity: { rating: 'mixed', note: 'New-town density; noise clusters near schools and main roads.' },
    dailyConvenience: { rating: 'good', note: 'Planned-town convenience makes daily errands easy.' },
    greenOutdoor: { rating: 'good', note: 'Strong park connectors; kid-friendly outdoor spaces.' },
    crowdVibe: { rating: 'good', note: 'Young families and active weekends; strong community feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you prefer planned-town living and are OK with distance from CBD.' },
  },

  'CONEY ISLAND': {
    noiseDensity: { rating: 'good', note: 'Nature-dominant; generally quiet with low urban traffic intensity.' },
    dailyConvenience: { rating: 'bad', note: 'Not amenity-dense; errands require travel.' },
    greenOutdoor: { rating: 'good', note: 'Exceptional outdoor access for cycling, walks, and nature time.' },
    crowdVibe: { rating: 'good', note: 'Outdoor-oriented crowd; slower pace.' },
    longTermComfort: { rating: 'mixed', note: 'Great for nature lovers; not convenience-first.' },
  },

  'CORONATION ROAD': {
    noiseDensity: { rating: 'mixed', note: 'Quieter residential pocket, but arterial traffic can be nearby.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is decent; many errands rely on nearby hubs.' },
    greenOutdoor: { rating: 'good', note: 'Strong greenery access around the Bukit Timah belt.' },
    crowdVibe: { rating: 'good', note: 'More private, family/owner-occupier feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like quieter, greener central-west living.' },
  },

  CRAWFORD: {
    noiseDensity: { rating: 'bad', note: 'City-fringe junctions and traffic make noise a common trade-off.' },
    dailyConvenience: { rating: 'good', note: 'Very convenient for food, errands, and city access.' },
    greenOutdoor: { rating: 'bad', note: 'More hard-city; greenery is limited in daily feel.' },
    crowdVibe: { rating: 'mixed', note: 'Renter/office mix; busy streets and higher churn.' },
    longTermComfort: { rating: 'mixed', note: 'Great for convenience; less ideal if you want calm residential nights.' },
  },

  'DAIRY FARM': {
    noiseDensity: { rating: 'good', note: 'Nature-adjacent; generally quieter and calmer.' },
    dailyConvenience: { rating: 'mixed', note: 'Errands often require short travel; not a dense amenity core.' },
    greenOutdoor: { rating: 'good', note: 'Excellent park/trail access; strong daily outdoor option set.' },
    crowdVibe: { rating: 'good', note: 'Outdoor-oriented and family-friendly; slower pace.' },
    longTermComfort: { rating: 'good', note: 'Great long-term if you value greenery and can accept travel for some errands.' },
  },

  'DEFU INDUSTRIAL PARK': {
    noiseDensity: { rating: 'bad', note: 'Industrial logistics mean heavy vehicles and potential noise peaks.' },
    dailyConvenience: { rating: 'bad', note: 'Not amenity-dense for residential life; errands require travel.' },
    greenOutdoor: { rating: 'bad', note: 'Hardscape-heavy; limited daily green space.' },
    crowdVibe: { rating: 'mixed', note: 'Workforce-heavy feel.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential environment.' },
  },

  'DEPOT ROAD': {
    noiseDensity: { rating: 'mixed', note: 'Central-adjacent; noise depends on road proximity, calmer within estates.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; errands are easy.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks/connectors around Bukit Merah/Alexandra.' },
    crowdVibe: { rating: 'good', note: 'Local household rhythm; stable and lived-in.' },
    longTermComfort: { rating: 'good', note: 'A practical long-term pick if you want central access and mature amenities.' },
  },

  'DHOBY GHAUT': {
    noiseDensity: { rating: 'bad', note: 'Major interchange/city core: constant activity and traffic.' },
    dailyConvenience: { rating: 'good', note: 'One of the most convenient transit/amenity nodes.' },
    greenOutdoor: { rating: 'mixed', note: 'Some nearby parks, but daily feel is still urban core.' },
    crowdVibe: { rating: 'bad', note: 'High footfall and pass-through crowd all day.' },
    longTermComfort: { rating: 'mixed', note: 'Best for city-lifestyle convenience; not for quiet long-term living.' },
  },

  DOVER: {
    noiseDensity: { rating: 'mixed', note: 'Mixed residential + campus/business adjacency; quieter at night in estates.' },
    dailyConvenience: { rating: 'good', note: 'Strong convenience with good transit and nearby hubs.' },
    greenOutdoor: { rating: 'good', note: 'Good access to greenery and connectors in the west/central-west belt.' },
    crowdVibe: { rating: 'mixed', note: 'Student/young professional mix alongside families.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you like west-side access and don’t mind some campus-area buzz.' },
  },

  DUNEARN: {
    noiseDensity: { rating: 'bad', note: 'Arterial-road corridor: traffic noise can be significant near the main road.' },
    dailyConvenience: { rating: 'good', note: 'Good convenience via nearby hubs and central-west connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Strong access to Bukit Timah-side greenery and parks.' },
    crowdVibe: { rating: 'good', note: 'More family/owner-occupier vibe than downtown belts.' },
    longTermComfort: { rating: 'good', note: 'Good long-term if you choose pockets buffered from the main road.' },
  },

  'EAST COAST': {
    noiseDensity: { rating: 'mixed', note: 'Expressway influence can add background noise; residential pockets vary.' },
    dailyConvenience: { rating: 'good', note: 'Strong east-side amenities; errands are generally easy.' },
    greenOutdoor: { rating: 'good', note: 'Excellent outdoor living: coastal park, cycling, long walks.' },
    crowdVibe: { rating: 'good', note: 'Relaxed, family-friendly rhythm; active weekends.' },
    longTermComfort: { rating: 'good', note: 'A strong long-term choice if you value outdoors and east-side convenience.' },
  },

  'EVERTON PARK': {
    noiseDensity: { rating: 'mixed', note: 'CBD-adjacent; quieter than core CBD but still gets traffic/urban noise.' },
    dailyConvenience: { rating: 'good', note: 'Strong convenience near major nodes; errands and food are easy.' },
    greenOutdoor: { rating: 'mixed', note: 'Limited “park-first” feel; outdoor options are more urban.' },
    crowdVibe: { rating: 'mixed', note: 'Local pocket with some renter/office spillover.' },
    longTermComfort: { rating: 'mixed', note: 'Good if you want CBD proximity; comfort depends on noise tolerance.' },
  },

  FABER: {
    noiseDensity: { rating: 'good', note: 'More residential and park-adjacent; generally calmer nights.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is decent; you may travel for bigger errands.' },
    greenOutdoor: { rating: 'good', note: 'Strong greenery and hill/park access is a daily-living plus.' },
    crowdVibe: { rating: 'good', note: 'Family-friendly, quieter neighbourhood feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you value greenery and a calmer pace.' },
  },

  FAJAR: {
    noiseDensity: { rating: 'good', note: 'Generally calm residential pocket; less city-fringe intensity.' },
    dailyConvenience: { rating: 'mixed', note: 'Daily needs are covered; for bigger choices you’ll head to nearby hubs.' },
    greenOutdoor: { rating: 'good', note: 'Good access to greenery and park connectors.' },
    crowdVibe: { rating: 'good', note: 'Local family vibe; quieter evenings.' },
    longTermComfort: { rating: 'good', note: 'Good long-term comfort if you like quieter west/north-west living.' },
  },

  'FARRER COURT': {
    noiseDensity: { rating: 'mixed', note: 'Central-adjacent; noise varies by pocket, calmer away from arterials.' },
    dailyConvenience: { rating: 'good', note: 'Very convenient for transit and daily services.' },
    greenOutdoor: { rating: 'good', note: 'Good access to greenery in the central belt.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of families and city-lifestyle crowd.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you want central access without living in the CBD core.' },
  },

  'FARRER PARK': {
    noiseDensity: { rating: 'bad', note: 'Dense city-fringe area with traffic and constant activity.' },
    dailyConvenience: { rating: 'good', note: 'Very convenient for food, transit, and errands.' },
    greenOutdoor: { rating: 'bad', note: 'Hard-city environment; limited daily green feel.' },
    crowdVibe: { rating: 'mixed', note: 'High churn with a mix of locals and renters.' },
    longTermComfort: { rating: 'mixed', note: 'Works if you prioritise convenience; less ideal for calm family living.' },
  },

  FERNVALE: {
    noiseDensity: { rating: 'mixed', note: 'Planned-town density; noise clusters near main roads and schools.' },
    dailyConvenience: { rating: 'good', note: 'Designed for families; daily errands are generally easy.' },
    greenOutdoor: { rating: 'good', note: 'Strong park connectors and outdoor spaces.' },
    crowdVibe: { rating: 'good', note: 'Young-family and community vibe.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like planned-town living.' },
  },

  'FLORA DRIVE': {
    noiseDensity: { rating: 'good', note: 'More residential and quieter than central belts; noise mainly from nearby arterials.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is decent but not hub-dense; errands may require travel.' },
    greenOutdoor: { rating: 'good', note: 'Good access to east-side greenery and outdoor routes.' },
    crowdVibe: { rating: 'good', note: 'Calmer, residential rhythm.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you like quieter east pockets and don’t need a dense hub downstairs.' },
  },

  'FOREST HILL': {
    noiseDensity: { rating: 'good', note: 'More nature-adjacent feel; generally calmer nights.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience depends on nearby nodes; plan errands.' },
    greenOutdoor: { rating: 'good', note: 'Green access is a strong daily-living advantage.' },
    crowdVibe: { rating: 'good', note: 'Quieter, more residential pace.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you value greenery and accept travel for some errands.' },
  },

  'FORT CANNING': {
    noiseDensity: { rating: 'mixed', note: 'City-adjacent but buffered by park; noise varies by exact pocket.' },
    dailyConvenience: { rating: 'good', note: 'Excellent access to city amenities and transit.' },
    greenOutdoor: { rating: 'good', note: 'Park access is a standout plus for daily walks.' },
    crowdVibe: { rating: 'mixed', note: 'City-lifestyle crowd; some tourist spillover around attractions.' },
    longTermComfort: { rating: 'mixed', note: 'Great if you want city access + park buffer; comfort depends on pocket and noise tolerance.' },
  },

  FRANKEL: {
    noiseDensity: { rating: 'good', note: 'More landed/residential feel; generally calmer than dense hubs.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is decent, but you’ll rely on nearby town hubs for bigger errands.' },
    greenOutdoor: { rating: 'good', note: 'Good outdoor options around the east/coastal belt.' },
    crowdVibe: { rating: 'good', note: 'Quieter, more owner-occupier feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like calmer east-side living.' },
  },

  'GALI BATU': {
    noiseDensity: { rating: 'bad', note: 'More industrial/logistics influence; heavy vehicles can be a daily reality.' },
    dailyConvenience: { rating: 'bad', note: 'Not amenity-dense for residential life; errands require travel.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets exist, but the core feel is still industrial-adjacent.' },
    crowdVibe: { rating: 'mixed', note: 'Workforce-heavy feel; limited neighbourhood street-life.' },
    longTermComfort: { rating: 'bad', note: 'Generally not comfortable as a long-term residential base.' },
  },

  GARDEN: {
    noiseDensity: { rating: 'mixed', note: 'Noise profile varies by pocket; check proximity to major roads.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience depends on surrounding hubs; not always “everything downstairs”.' },
    greenOutdoor: { rating: 'good', note: 'More greenery-oriented feel than downtown cores.' },
    crowdVibe: { rating: 'good', note: 'More residential rhythm; calmer evenings.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you prefer quieter residential pockets and greenery access.' },
  },

  'GEYLANG EAST': {
    noiseDensity: { rating: 'mixed', note: 'Dense city-fringe belt; traffic and activity depend on which road you’re on.' },
    dailyConvenience: { rating: 'good', note: 'Very convenient for food and daily services.' },
    greenOutdoor: { rating: 'mixed', note: 'Green pockets exist, but it’s still an urban-fringe environment.' },
    crowdVibe: { rating: 'mixed', note: 'Local + renter mix; busier streets.' },
    longTermComfort: { rating: 'mixed', note: 'Works if you value convenience; less ideal if you want quiet and low density.' },
  },

  'GHIM MOH': {
    noiseDensity: { rating: 'mixed', note: 'Mature estate; generally calm in blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience and good connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around Buona Vista/central-west.' },
    crowdVibe: { rating: 'good', note: 'Local household vibe; stable and lived-in.' },
    longTermComfort: { rating: 'good', note: 'A strong long-term choice if you want mature amenities with central-west access.' },
  },

  GOMBAK: {
    noiseDensity: { rating: 'good', note: 'More residential and calmer; less hub intensity.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is decent; bigger errands may require a short trip to hubs.' },
    greenOutdoor: { rating: 'good', note: 'Good access to west greenery and outdoor routes.' },
    crowdVibe: { rating: 'good', note: 'Family-oriented heartland rhythm.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you prefer quieter west pockets and don’t need CBD-adjacent living.' },
  },

  'GOODWOOD PARK': {
    noiseDensity: { rating: 'mixed', note: 'Central and premium; pockets can be quieter but arterial traffic is nearby.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience around Orchard/central belt.' },
    greenOutdoor: { rating: 'mixed', note: 'Some greenery, but still city-core adjacent.' },
    crowdVibe: { rating: 'mixed', note: 'Affluent/expat city-lifestyle mix.' },
    longTermComfort: { rating: 'mixed', note: 'Comfort depends on pocket; great if you value central convenience and accept urban noise.' },
  },

  'GREENWOOD PARK': {
    noiseDensity: { rating: 'good', note: 'Lower-density, quieter residential pocket.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is decent but not hub-dense; errands may require a short trip.' },
    greenOutdoor: { rating: 'good', note: 'Strong greenery access around the Bukit Timah belt.' },
    crowdVibe: { rating: 'good', note: 'Family/owner-occupier feel; calmer streets.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you want quieter, greener central-west living.' },
  },

  GUILIN: {
    noiseDensity: { rating: 'good', note: 'Mostly residential; generally calmer than city-fringe belts.' },
    dailyConvenience: { rating: 'mixed', note: 'Daily needs are covered; bigger errands cluster around nearby hubs.' },
    greenOutdoor: { rating: 'good', note: 'Green access is a plus; good for short walks.' },
    crowdVibe: { rating: 'good', note: 'Local household rhythm; quieter evenings.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like quieter west heartland pockets.' },
  },

  'GUL BASIN': {
    noiseDensity: { rating: 'bad', note: 'Industrial/port-adjacent; heavy vehicles and operations can be noisy.' },
    dailyConvenience: { rating: 'bad', note: 'Not amenity-dense for residential life; errands require travel.' },
    greenOutdoor: { rating: 'bad', note: 'Hardscape-heavy; limited daily green space.' },
    crowdVibe: { rating: 'mixed', note: 'Workforce-heavy feel.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential environment.' },
  },

  'GUL CIRCLE': {
    noiseDensity: { rating: 'bad', note: 'Industrial logistics and heavy vehicles are common.' },
    dailyConvenience: { rating: 'bad', note: 'Residential errands require travel; limited local amenities.' },
    greenOutdoor: { rating: 'bad', note: 'Hardscape-heavy with limited daily green space.' },
    crowdVibe: { rating: 'mixed', note: 'Workplace-oriented feel.' },
    longTermComfort: { rating: 'bad', note: 'Not comfortable for long-term residential living.' },
  },

  'HENDERSON HILL': {
    noiseDensity: { rating: 'mixed', note: 'Hilly mature estate; road noise varies by pocket.' },
    dailyConvenience: { rating: 'good', note: 'Mature-estate convenience with good city access.' },
    greenOutdoor: { rating: 'good', note: 'Good greenery and walk options (hills/parks/connectors).' },
    crowdVibe: { rating: 'good', note: 'Local household vibe; stable and lived-in.' },
    longTermComfort: { rating: 'good', note: 'Strong long-term comfort if you like central access with greener pockets.' },
  },

  HILLCREST: {
    noiseDensity: { rating: 'good', note: 'Lower-density and generally quieter; less hub intensity.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is decent but not hub-dense; errands may require a short trip.' },
    greenOutdoor: { rating: 'good', note: 'Strong greenery access in the Bukit Timah belt.' },
    crowdVibe: { rating: 'good', note: 'Family/owner-occupier feel; calmer streets.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you want quieter, greener central-west living.' },
  },

  HILLVIEW: {
    noiseDensity: { rating: 'mixed', note: 'Close to major roads/rail; noise depends on how buffered your block is.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is improving; many errands still rely on nearby hubs.' },
    greenOutdoor: { rating: 'good', note: 'Strong access to greenery and trails around the Hillview/Dairy Farm belt.' },
    crowdVibe: { rating: 'good', note: 'More residential and calmer than city-fringe belts.' },
    longTermComfort: { rating: 'good', note: 'Good long-term if you value greenery and accept some arterial noise trade-offs.' },
  },

  'HOLLAND DRIVE': {
    noiseDensity: { rating: 'mixed', note: 'Near Holland Village energy; can be lively, but pockets vary a lot.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience for food, errands, and central access.' },
    greenOutdoor: { rating: 'good', note: 'Good access to greenery in the central-west belt.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of locals and expats; more “lifestyle” energy than heartlands.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you like central-west convenience with a bit of lively neighbourhood character.' },
  },

  // Anchors: Geylang Bahru is a Kallang subzone with both residential and industrial developments; near Kallang River/ABC waterfront.
  'GEYLANG BAHRU': {
    noiseDensity: { rating: 'mixed', note: 'Mixed residential/industrial; busier in the day, more manageable at night.' },
    dailyConvenience: { rating: 'good', note: 'Strong “local living” convenience: food options and daily services are easy.' },
    greenOutdoor: { rating: 'mixed', note: 'More street/block feel; waterfront/river-side pockets help for quick strolls.' },
    crowdVibe: { rating: 'good', note: 'Local, lived-in vibe (families + long-time residents), less “new condo” feel.' },
    longTermComfort: { rating: 'mixed', note: 'Comfortable if you like city-fringe grit; ageing pockets and road noise can be a factor.' },
  },

  // Anchors: Lavender MRT is under Kallang Road; near ICA Building and Jalan Besar Stadium (dense, major roads).
  LAVENDER: {
    noiseDensity: { rating: 'bad', note: 'City-fringe density + major roads; traffic noise is hard to avoid.' },
    dailyConvenience: { rating: 'good', note: 'Extremely convenient: transit + food + errands within short walks.' },
    greenOutdoor: { rating: 'bad', note: 'More hard-city fabric; greenery exists but not the “park next door” vibe.' },
    crowdVibe: { rating: 'mixed', note: 'More renters/office crowd mix; higher churn and busier streets.' },
    longTermComfort: { rating: 'mixed', note: 'Great for convenience-first lifestyles; less ideal if you prioritise calm family living.' },
  },

  // Anchors: Redhill MRT is on Tiong Bahru Road (mature Bukit Merah area, good connectivity).
  REDHILL: {
    noiseDensity: { rating: 'mixed', note: 'Mature estate with MRT/roads nearby; noise is present but generally controllable.' },
    dailyConvenience: { rating: 'good', note: 'Mature-town convenience: markets, food, and daily amenities are well-covered.' },
    greenOutdoor: { rating: 'good', note: 'Better balance of greenery and walkable outdoor options than denser city cores.' },
    crowdVibe: { rating: 'good', note: 'Family + working adults mix; stable “mature estate” rhythm.' },
    longTermComfort: { rating: 'good', note: 'Often the best-balanced choice: convenience + stability without feeling too hectic.' },
  },
}

export function getLivingNotesForNeighbourhood(name: string): LivingNotes | null {
  const key = norm(name)
  if (!key) return null

  // Exact match first
  if (NOTES_BY_KEY[key]) return NOTES_BY_KEY[key]

  // Fuzzy contains match (handles names like "Braddell (Toa Payoh)" or similar)
  for (const knownKey of Object.keys(NOTES_BY_KEY)) {
    if (key.includes(knownKey)) return NOTES_BY_KEY[knownKey]
  }

  return null
}


