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
    noiseDensity: { rating: 'mixed', note: 'Residential areas are generally calm, with traffic noise closer to arterial roads.' },
    dailyConvenience: { rating: 'good', note: 'Mature-town amenities and transport links support efficient daily routines.' },
    greenOutdoor: { rating: 'mixed', note: 'Some access to parks, though not uniformly across the area.' },
    crowdVibe: { rating: 'good', note: 'Primarily residential with stable daily activity.' },
    longTermComfort: { rating: 'good', note: 'Generally supportive of long-term family living.' },
  },

  'BEDOK RESERVOIR': {
    noiseDensity: { rating: 'good', note: 'Residential layout buffers most blocks from heavy traffic noise.' },
    dailyConvenience: { rating: 'mixed', note: 'Everyday needs are met locally, though town-centre access requires travel.' },
    greenOutdoor: { rating: 'good', note: 'Strong adjacency to Bedok Reservoir Park supports regular outdoor routines.' },
    crowdVibe: { rating: 'good', note: 'Low destination-driven foot traffic with a residential focus.' },
    longTermComfort: { rating: 'good', note: 'Well-suited for households valuing greenery and quieter living.' },
  },

  'BEDOK SOUTH': {
    noiseDensity: { rating: 'mixed', note: 'Proximity to major roads and coastal corridors introduces periodic traffic noise.' },
    dailyConvenience: { rating: 'mixed', note: 'Amenities are accessible but more dispersed compared to town centres.' },
    greenOutdoor: { rating: 'good', note: 'Good access to East Coast Park and coastal recreational spaces.' },
    crowdVibe: { rating: 'mixed', note: 'Leisure-driven activity increases during evenings and weekends.' },
    longTermComfort: { rating: 'mixed', note: 'Comfort depends on tolerance for road activity in exchange for coastal access.' },
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
    noiseDensity: { rating: 'mixed', note: 'Internal residential areas are generally calm; arterial road proximity can introduce periodic traffic noise depending on block orientation.' },
    dailyConvenience: { rating: 'good', note: 'Mature-town setting supports reliable access to amenities and transport within short distances.' },
    greenOutdoor: { rating: 'good', note: 'Close to established parks and park connectors, supporting routine outdoor access.' },
    crowdVibe: { rating: 'mixed', note: 'Primarily residential with moderate peak-hour movement linked to transport nodes.' },
    longTermComfort: { rating: 'good', note: 'Typically supportive of long-term family living with balanced convenience and greenery.' },
  },

  'BOAT QUAY': {
    noiseDensity: { rating: 'bad', note: 'Nightlife/riverfront activity makes quiet nights hard.' },
    dailyConvenience: { rating: 'good', note: 'City-core convenience is excellent.' },
    greenOutdoor: { rating: 'bad', note: 'More hard-city; outdoor time is mostly promenades rather than park living.' },
    crowdVibe: { rating: 'bad', note: 'Tourist/nightlife crowd; high churn and late-night activity.' },
    longTermComfort: { rating: 'bad', note: 'Usually not ideal for long-term quiet family living.' },
  },

  'BOON KENG': {
    noiseDensity: { rating: 'mixed', note: 'Urban density and arterial roads contribute to periodic traffic noise.' },
    dailyConvenience: { rating: 'good', note: 'Strong MRT access and local amenities support daily needs.' },
    greenOutdoor: { rating: 'mixed', note: 'Some park access exists but is not a defining feature.' },
    crowdVibe: { rating: 'mixed', note: 'Commuter-driven activity is noticeable during peak hours.' },
    longTermComfort: { rating: 'mixed', note: 'Comfort depends on tolerance for commuter and traffic intensity.' },
  },

  'BOON LAY PLACE': {
    noiseDensity: { rating: 'mixed', note: 'Residential areas experience periodic activity from nearby town-centre and industrial traffic.' },
    dailyConvenience: { rating: 'good', note: 'Town-centre adjacency provides strong access to shops, services, and transport.' },
    greenOutdoor: { rating: 'mixed', note: 'Green access is available but more limited compared to park-adjacent estates.' },
    crowdVibe: { rating: 'mixed', note: 'Higher daytime activity linked to commercial and transit usage.' },
    longTermComfort: { rating: 'mixed', note: 'Comfort depends on tolerance for busier surroundings in exchange for convenience.' },
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
    noiseDensity: { rating: 'mixed', note: 'Major road adjacency can introduce consistent traffic noise in exposed blocks.' },
    dailyConvenience: { rating: 'good', note: 'Central positioning supports efficient access to amenities and transport corridors.' },
    greenOutdoor: { rating: 'mixed', note: 'Green spaces are accessible but not immediately adjacent in all sections.' },
    crowdVibe: { rating: 'mixed', note: 'Commuter activity is noticeable during peak periods.' },
    longTermComfort: { rating: 'mixed', note: 'Long-term suitability varies with sensitivity to traffic and commuter movement.' },
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
    noiseDensity: { rating: 'mixed', note: 'Generally calm residential areas with occasional road noise from surrounding connectors.' },
    dailyConvenience: { rating: 'mixed', note: 'Basic amenities are reachable, though less concentrated than town centres.' },
    greenOutdoor: { rating: 'good', note: 'Strong access to nearby nature areas and park connectors.' },
    crowdVibe: { rating: 'good', note: 'Low destination-driven activity with a quiet residential character.' },
    longTermComfort: { rating: 'good', note: 'Well-suited for households valuing greenery and lower activity levels.' },
  },

  BUGIS: {
    noiseDensity: { rating: 'bad', note: 'Urban core with constant activity; quiet nights are uncommon.' },
    dailyConvenience: { rating: 'good', note: 'Extremely convenient for transit, food, and services.' },
    greenOutdoor: { rating: 'bad', note: 'Hard-city environment; greenery exists but is not the dominant feel.' },
    crowdVibe: { rating: 'bad', note: 'Tourist/office/nightlife mix; high churn and busy streets.' },
    longTermComfort: { rating: 'mixed', note: 'Excellent for convenience-first; less ideal for long-term calm family living.' },
  },

  'BUKIT BATOK CENTRAL': {
    noiseDensity: { rating: 'mixed', note: 'Town-centre functions bring periodic activity and traffic noise.' },
    dailyConvenience: { rating: 'good', note: 'Concentrated amenities and transport options support efficient daily living.' },
    greenOutdoor: { rating: 'mixed', note: 'Green spaces are present but secondary to commercial and residential uses.' },
    crowdVibe: { rating: 'mixed', note: 'Higher foot traffic linked to commercial and transit usage.' },
    longTermComfort: { rating: 'mixed', note: 'Comfort depends on preference for convenience over quieter surroundings.' },
  },

  'BUKIT BATOK EAST': {
    noiseDensity: { rating: 'mixed', note: 'Residential streets are calmer, with traffic noise closer to main roads.' },
    dailyConvenience: { rating: 'good', note: 'Reliable access to amenities and transport typical of a mature town.' },
    greenOutdoor: { rating: 'mixed', note: 'Some proximity to parks, though not uniformly across the area.' },
    crowdVibe: { rating: 'good', note: 'Primarily residential with limited destination-driven crowds.' },
    longTermComfort: { rating: 'good', note: 'Generally supportive of long-term living with manageable trade-offs.' },
  },

  'BUKIT BATOK SOUTH': {
    noiseDensity: { rating: 'mixed', note: 'Noise depends on proximity to major roads/expressways; interior pockets are calmer.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is decent; larger amenities cluster around nearby hubs.' },
    greenOutdoor: { rating: 'good', note: 'Strong west-side greenery access for walks and outdoor time.' },
    crowdVibe: { rating: 'good', note: 'Stable residential rhythm; fewer late-night hotspots.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you prioritise space/quiet over prime-city convenience.' },
  },

  'BUKIT BATOK WEST': {
    noiseDensity: { rating: 'good', note: 'Residential layout buffers most blocks from major traffic noise.' },
    dailyConvenience: { rating: 'mixed', note: 'Everyday needs are accessible, though some services require short travel.' },
    greenOutdoor: { rating: 'good', note: 'Close to nature reserves and park connectors supporting outdoor routines.' },
    crowdVibe: { rating: 'good', note: 'Low commercial intensity with stable neighbourhood activity.' },
    longTermComfort: { rating: 'good', note: 'Well-suited for households valuing quieter living and green access.' },
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
    noiseDensity: { rating: 'bad', note: 'Aircraft operations and airport logistics generate persistent and unavoidable noise.' },
    dailyConvenience: { rating: 'mixed', note: 'Transport connectivity is strong, but residential-oriented amenities are limited.' },
    greenOutdoor: { rating: 'mixed', note: 'Coastal and open areas exist but are not designed for residential routines.' },
    crowdVibe: { rating: 'bad', note: 'Continuous passenger, logistics, and service activity throughout the day.' },
    longTermComfort: { rating: 'bad', note: 'Aviation-related intensity significantly reduces suitability for long-term residential living.' },
  },

  'CHANGI BAY': {
    noiseDensity: { rating: 'bad', note: 'Airport operations and coastal industrial activity contribute to sustained noise exposure.' },
    dailyConvenience: { rating: 'bad', note: 'Minimal residential amenities and reliance on distant town centres.' },
    greenOutdoor: { rating: 'mixed', note: 'Open coastal spaces exist but are not residentially integrated.' },
    crowdVibe: { rating: 'bad', note: 'Industrial and infrastructure-focused activity dominates the area.' },
    longTermComfort: { rating: 'bad', note: 'Structural non-residential use limits long-term living suitability.' },
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
    noiseDensity: { rating: 'mixed', note: 'Town-centre functions introduce consistent background activity and traffic noise.' },
    dailyConvenience: { rating: 'good', note: 'Highly concentrated amenities and transport links support efficient daily routines.' },
    greenOutdoor: { rating: 'mixed', note: 'Green access exists but is not a defining characteristic of the area.' },
    crowdVibe: { rating: 'mixed', note: 'High foot traffic driven by commercial and transit usage.' },
    longTermComfort: { rating: 'mixed', note: 'Long-term suitability varies with preference for convenience over quieter living.' },
  },

  'CLEMENTI NORTH': {
    noiseDensity: { rating: 'mixed', note: 'Expressway and arterial road proximity introduces periodic traffic noise.' },
    dailyConvenience: { rating: 'mixed', note: 'Amenities are accessible, though MRT reliance often requires feeder travel.' },
    greenOutdoor: { rating: 'good', note: 'Strong adjacency to nature areas and park connectors.' },
    crowdVibe: { rating: 'good', note: 'Predominantly residential with limited destination-driven activity.' },
    longTermComfort: { rating: 'good', note: 'Generally supportive of long-term living for households valuing greenery.' },
  },

  'CLEMENTI WEST': {
    noiseDensity: { rating: 'good', note: 'Residential layout buffers most blocks from heavy traffic corridors.' },
    dailyConvenience: { rating: 'mixed', note: 'Everyday amenities are reachable, though less concentrated than the central area.' },
    greenOutdoor: { rating: 'good', note: 'Good access to nearby parks and park connectors.' },
    crowdVibe: { rating: 'good', note: 'Primarily residential with limited destination-driven activity.' },
    longTermComfort: { rating: 'good', note: 'Generally supportive of long-term family living with manageable trade-offs.' },
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
    noiseDensity: { rating: 'mixed', note: 'Traffic from surrounding arterials contributes to periodic background noise.' },
    dailyConvenience: { rating: 'good', note: 'Strong public transport access and local amenities support daily routines.' },
    greenOutdoor: { rating: 'mixed', note: 'Some park access is available but not a defining feature.' },
    crowdVibe: { rating: 'mixed', note: 'Commuter movement is noticeable, especially during peak hours.' },
    longTermComfort: { rating: 'mixed', note: 'Long-term suitability varies with tolerance for commuter-driven activity.' },
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
    noiseDensity: { rating: 'mixed', note: 'Rail and road infrastructure contribute to intermittent noise exposure.' },
    dailyConvenience: { rating: 'good', note: 'Strong connectivity via MRT and proximity to employment and education hubs.' },
    greenOutdoor: { rating: 'mixed', note: 'Some access to green spaces, though not uniformly across the area.' },
    crowdVibe: { rating: 'mixed', note: 'Commuter and student-driven activity is noticeable during peak periods.' },
    longTermComfort: { rating: 'mixed', note: 'Comfort depends on tolerance for commuter intensity and infrastructure presence.' },
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
    noiseDensity: { rating: 'mixed', note: 'Urban road networks and surrounding activity contribute to recurring background noise.' },
    dailyConvenience: { rating: 'good', note: 'Strong access to food options, local services, and public transport.' },
    greenOutdoor: { rating: 'mixed', note: 'Green spaces are available but limited in scale.' },
    crowdVibe: { rating: 'mixed', note: 'Mixed residential and commercial activity throughout the day.' },
    longTermComfort: { rating: 'mixed', note: 'Suitability depends on tolerance for urban activity in exchange for convenience.' },
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
    noiseDensity: { rating: 'mixed', note: 'Dense road networks and commercial activity contribute to ongoing background noise.' },
    dailyConvenience: { rating: 'good', note: 'Strong connectivity and dense amenity coverage support efficient routines.' },
    greenOutdoor: { rating: 'bad', note: 'Limited immediate access to substantial green spaces.' },
    crowdVibe: { rating: 'mixed', note: 'High daytime activity driven by offices, transport, and visitors.' },
    longTermComfort: { rating: 'mixed', note: 'Suitability depends on tolerance for dense urban surroundings.' },
  },

  // Anchors: Redhill MRT is on Tiong Bahru Road (mature Bukit Merah area, good connectivity).
  REDHILL: {
    noiseDensity: { rating: 'mixed', note: 'Mature estate with MRT/roads nearby; noise is present but generally controllable.' },
    dailyConvenience: { rating: 'good', note: 'Mature-town convenience: markets, food, and daily amenities are well-covered.' },
    greenOutdoor: { rating: 'good', note: 'Better balance of greenery and walkable outdoor options than denser city cores.' },
    crowdVibe: { rating: 'good', note: 'Family + working adults mix; stable “mature estate” rhythm.' },
    longTermComfort: { rating: 'good', note: 'Often the best-balanced choice: convenience + stability without feeling too hectic.' },
  },

  'JURONG WEST CENTRAL': {
    noiseDensity: { rating: 'mixed', note: 'Town-centre activity and bus interchange operations introduce regular background noise.' },
    dailyConvenience: { rating: 'good', note: 'Concentrated amenities and transport access support daily routines.' },
    greenOutdoor: { rating: 'mixed', note: 'Green spaces are available but secondary to commercial functions.' },
    crowdVibe: { rating: 'mixed', note: 'Moderate foot traffic linked to town-centre usage.' },
    longTermComfort: { rating: 'mixed', note: 'Long-term suitability varies with tolerance for town-centre activity.' },
  },

  'JURONG WEST': {
    noiseDensity: { rating: 'mixed', note: 'Mature west town; generally calm in residential blocks, busier near main roads and MRT stations.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-town convenience: shops, food, markets, and good transit access.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Jurong Lake Gardens and west-side park connectors for walks and outdoor time.' },
    crowdVibe: { rating: 'good', note: 'Local family vibe; stable heartland rhythm with quieter evenings.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you value west-side amenities and are OK with distance from CBD.' },
  },

  'JURONG EAST': {
    noiseDensity: { rating: 'mixed', note: 'Hub-adjacent area; busier near Jurong East MRT and shopping malls, calmer in residential estates.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience: major malls, food options, and strong transit connectivity.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets; larger parks require a short trip.' },
    crowdVibe: { rating: 'mixed', note: 'Busier hub energy with mix of families and commuters; higher footfall near MRT.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you like west-side hub convenience; choose pockets away from the busiest areas for quieter nights.' },
  },

  'TAMPINES': {
    noiseDensity: { rating: 'mixed', note: 'Mature east town; generally calm in residential blocks, busier near town centre and MRT.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-town convenience: Tampines Mall, markets, food courts, and excellent MRT connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Tampines Eco Green and east-side park connectors for walks and outdoor time.' },
    crowdVibe: { rating: 'good', note: 'Family-oriented heartland rhythm; stable daily life with good community feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like east heartland living with strong amenities and connectivity.' },
  },

  'PASIR RIS': {
    noiseDensity: { rating: 'good', note: 'More residential and coastal; generally calmer than town centres, some expressway influence.' },
    dailyConvenience: { rating: 'good', note: 'Strong east-side convenience: White Sands mall, markets, and good transit access.' },
    greenOutdoor: { rating: 'good', note: 'Excellent outdoor access: Pasir Ris Park, beach, and coastal walks are a daily-living plus.' },
    crowdVibe: { rating: 'good', note: 'Relaxed east-coast rhythm; family-friendly with active weekends.' },
    longTermComfort: { rating: 'good', note: 'A strong long-term choice if you value outdoor life and east-side convenience.' },
  },

  'WOODLANDS': {
    noiseDensity: { rating: 'mixed', note: 'North hub; busier near Woodlands MRT and Causeway Point, calmer in residential estates.' },
    dailyConvenience: { rating: 'good', note: 'Strong north-side convenience: Causeway Point mall, markets, and excellent MRT connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Woodlands Waterfront Park and north-side greenery for walks.' },
    crowdVibe: { rating: 'good', note: 'Family-oriented heartland rhythm; steady daily life.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-side living and are OK with distance from CBD.' },
  },

  'SENGKANG': {
    noiseDensity: { rating: 'mixed', note: 'New-town density; noise clusters near schools and main roads, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Designed for families: Compass One mall, markets, and good MRT/LRT connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Strong park connectors and outdoor spaces; very kid/stroller-friendly.' },
    crowdVibe: { rating: 'good', note: 'Young families and active weekends; strong "new town" community feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable for family living if you prefer newer estates and are OK with distance from CBD.' },
  },

  'PUNGGOL': {
    noiseDensity: { rating: 'mixed', note: 'New-town density; noise clusters near schools and main roads, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Designed for families: Waterway Point mall, markets, and good MRT/LRT connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Excellent outdoor access: Punggol Waterway, park connectors, and coastal routes.' },
    crowdVibe: { rating: 'good', note: 'Young families and active weekends; strong "new town" community feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable for family living if you value outdoor access and newer estate amenities.' },
  },

  'YISHUN': {
    noiseDensity: { rating: 'mixed', note: 'North hub; busier near Yishun MRT and Northpoint mall, calmer in residential estates.' },
    dailyConvenience: { rating: 'good', note: 'Strong north-side convenience: Northpoint mall, markets, and excellent MRT connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Lower Seletar Reservoir Park and north-side greenery for walks.' },
    crowdVibe: { rating: 'good', note: 'Family-oriented heartland rhythm; steady daily life.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-side living and are OK with distance from CBD.' },
  },

  'HOUGANG': {
    noiseDensity: { rating: 'mixed', note: 'Mature northeast town; generally calm in residential blocks, busier near town centre and MRT.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-town convenience: Hougang Mall, markets, food courts, and good MRT connectivity.' },
    greenOutdoor: { rating: 'mixed', note: 'Green pockets exist; larger parks require a short trip.' },
    crowdVibe: { rating: 'good', note: 'Local heartland vibe; stable daily rhythm.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like northeast heartland living with strong amenities.' },
  },

  'SERANGOON': {
    noiseDensity: { rating: 'mixed', note: 'Mature northeast town; generally calm in residential blocks, busier near Serangoon MRT and Nex mall.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience: Nex mall, markets, food options, and strong MRT connectivity.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets; larger parks require a short trip.' },
    crowdVibe: { rating: 'good', note: 'Family-oriented heartland rhythm; steady daily life.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like northeast heartland living with excellent connectivity.' },
  },

  'ANG MO KIO': {
    noiseDensity: { rating: 'mixed', note: 'Mature central town; generally calm in residential blocks, busier near town centre and MRT.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-town convenience: AMK Hub, markets, food courts, and excellent MRT connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Bishan-Ang Mo Kio Park and central-side park connectors.' },
    crowdVibe: { rating: 'good', note: 'Family-oriented heartland rhythm; stable daily life with good community feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central heartland living with strong amenities and connectivity.' },
  },

  'TOA PAYOH': {
    noiseDensity: { rating: 'mixed', note: 'Mature central town; generally calm in residential blocks, busier near Toa Payoh MRT and HDB Hub.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-town convenience: HDB Hub, markets, food courts, and excellent MRT connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Bishan-Ang Mo Kio Park and central-side park connectors.' },
    crowdVibe: { rating: 'good', note: 'Family-oriented heartland rhythm; stable daily life.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central heartland living with strong amenities.' },
  },

  'BISHAN': {
    noiseDensity: { rating: 'mixed', note: 'Mature central town; generally calm in residential blocks, busier near Bishan MRT and Junction 8.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-town convenience: Junction 8 mall, markets, and excellent MRT connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Excellent access to Bishan-Ang Mo Kio Park for daily walks and outdoor time.' },
    crowdVibe: { rating: 'good', note: 'Family-oriented heartland rhythm; stable daily life.' },
    longTermComfort: { rating: 'good', note: 'A strong long-term choice if you like central heartland living with park access.' },
  },

  'QUEENSTOWN': {
    noiseDensity: { rating: 'mixed', note: 'Urban road networks introduce regular background traffic noise.' },
    dailyConvenience: { rating: 'good', note: 'Mature-estate amenities and transport links support efficient daily living.' },
    greenOutdoor: { rating: 'mixed', note: 'Green spaces are available but interspersed within dense urban uses.' },
    crowdVibe: { rating: 'mixed', note: 'Moderate activity from residential, commercial, and transit functions.' },
    longTermComfort: { rating: 'mixed', note: 'Overall comfort varies with sensitivity to urban activity levels.' },
  },

  'MARINE PARADE': {
    noiseDensity: { rating: 'mixed', note: 'East-coast area; generally calm in residential blocks, busier near Parkway Parade and coastal roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong east-side convenience: Parkway Parade mall, markets, and good transit access.' },
    greenOutdoor: { rating: 'good', note: 'Excellent outdoor access: East Coast Park, beach, and coastal walks are a daily-living plus.' },
    crowdVibe: { rating: 'good', note: 'Relaxed east-coast rhythm; family-friendly with active weekends.' },
    longTermComfort: { rating: 'good', note: 'A strong long-term choice if you value outdoor life and east-side convenience.' },
  },

  'NOVENA': {
    noiseDensity: { rating: 'mixed', note: 'Major roads and institutional uses contribute to recurring traffic noise.' },
    dailyConvenience: { rating: 'good', note: 'Strong access to healthcare, retail, and public transport.' },
    greenOutdoor: { rating: 'mixed', note: 'Green spaces are present but limited in continuity.' },
    crowdVibe: { rating: 'mixed', note: 'High daytime activity driven by healthcare and commercial functions.' },
    longTermComfort: { rating: 'mixed', note: 'Comfort depends on tolerance for institutional and commuter-driven activity.' },
  },

  'TANGLIN': {
    noiseDensity: { rating: 'mixed', note: 'Central premium area; pockets can be quieter but arterial traffic is nearby.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience around Orchard/central belt with premium amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Botanic Gardens and central greenery.' },
    crowdVibe: { rating: 'mixed', note: 'More affluent/expat city-lifestyle mix.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you value central convenience and premium amenities.' },
  },

  'SEMBAWANG': {
    noiseDensity: { rating: 'good', note: 'More residential and calmer; less hub intensity.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is decent; bigger errands may require a short trip to hubs.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Sembawang Park and north-side greenery.' },
    crowdVibe: { rating: 'good', note: 'Family-oriented heartland rhythm; quieter evenings.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you prefer quieter north pockets and don\'t need CBD-adjacent living.' },
  },

  'CHOA CHU KANG': {
    noiseDensity: { rating: 'mixed', note: 'North-west hub; busier near Choa Chu Kang MRT and Lot One mall, calmer in residential estates.' },
    dailyConvenience: { rating: 'good', note: 'Strong north-west convenience: Lot One mall, markets, and excellent MRT connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Good access to north-west parks and connectors for walks.' },
    crowdVibe: { rating: 'good', note: 'Family-oriented heartland rhythm; steady daily life.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you\'re OK with a north-west commute profile.' },
  },

  'HONG KAH': {
    noiseDensity: { rating: 'mixed', note: 'Mature west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Jurong West amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to west-side parks and connectors for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like west heartland living with mature amenities.' },
  },

  'HONG KAH NORTH': {
    noiseDensity: { rating: 'mixed', note: 'Mature west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Bukit Batok amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to west-side parks and connectors for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like west heartland living with mature amenities.' },
  },

  'INSTITUTION HILL': {
    noiseDensity: { rating: 'mixed', note: 'Central area; busier near institutions, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience around Orchard/central belt with premium amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Botanic Gardens and central greenery.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of families and professionals; busier near institutions.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you value central convenience and premium amenities.' },
  },

  'ISTANA NEGARA': {
    noiseDensity: { rating: 'mixed', note: 'Central premium area; pockets can be quieter but arterial traffic is nearby.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience around Orchard/central belt with premium amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Botanic Gardens and central greenery.' },
    crowdVibe: { rating: 'mixed', note: 'More affluent/expat city-lifestyle mix.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you value central convenience and premium amenities.' },
  },

  'JELEBU': {
    noiseDensity: { rating: 'mixed', note: 'Mature north-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Bukit Panjang amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to north-west parks and connectors for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-west heartland living.' },
  },

  'JOO SENG': {
    noiseDensity: { rating: 'mixed', note: 'Mature central area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Toa Payoh amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to central-side parks and connectors.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central heartland living with mature amenities.' },
  },

  'JURONG GATEWAY': {
    noiseDensity: { rating: 'bad', note: 'Business park with traffic and workday intensity; quieter evenings but not residential-first.' },
    dailyConvenience: { rating: 'good', note: 'Strong west-side convenience: malls, markets, and excellent MRT connectivity.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green spaces but more business-park feel than residential park access.' },
    crowdVibe: { rating: 'bad', note: 'Workday crowd dominates; less neighbourhood feel.' },
    longTermComfort: { rating: 'mixed', note: 'Comfortable if you work nearby; less ideal for pure residential living.' },
  },

  // Batch 4: Missing neighbourhoods (10 items)
  'KAKI BUKIT': {
    noiseDensity: { rating: 'mixed', note: 'Mature east area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Bedok amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to east-side parks and connectors for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like east heartland living with mature amenities.' },
  },

  'KALLANG BAHRU': {
    noiseDensity: { rating: 'mixed', note: 'Industrial and arterial road proximity introduces intermittent heavy-vehicle noise.' },
    dailyConvenience: { rating: 'mixed', note: 'Basic amenities are present, though town-centre access requires travel.' },
    greenOutdoor: { rating: 'mixed', note: 'Some access to waterfront and park connectors.' },
    crowdVibe: { rating: 'mixed', note: 'Activity fluctuates between industrial daytime use and residential evenings.' },
    longTermComfort: { rating: 'mixed', note: 'Comfort varies with sensitivity to industrial and traffic patterns.' },
  },

  'KALLANG WAY': {
    noiseDensity: { rating: 'mixed', note: 'City-fringe area; busier near main roads, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Strong city-fringe convenience: food, services, and transit access.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets; larger parks require a short trip.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of local and renter crowd; busier streets.' },
    longTermComfort: { rating: 'mixed', note: 'Works well if you want convenience; less ideal if you prioritise quiet evenings.' },
  },

  'KAMPONG BUGIS': {
    noiseDensity: { rating: 'mixed', note: 'City-fringe area; busier near main roads, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Strong city-fringe convenience: food, services, and transit access.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets; larger parks require a short trip.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of local and renter crowd; busier streets.' },
    longTermComfort: { rating: 'mixed', note: 'Works well if you want convenience; less ideal if you prioritise quiet evenings.' },
  },

  'KAMPONG JAVA': {
    noiseDensity: { rating: 'mixed', note: 'City-fringe area; busier near main roads, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Strong city-fringe convenience: food, services, and transit access.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets; larger parks require a short trip.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of local and renter crowd; busier streets.' },
    longTermComfort: { rating: 'mixed', note: 'Works well if you want convenience; less ideal if you prioritise quiet evenings.' },
  },

  'KAMPONG TIONG BAHRU': {
    noiseDensity: { rating: 'mixed', note: 'Mature central-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Tiong Bahru amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central-west access with mature amenities.' },
  },

  'KAMPONG UBI': {
    noiseDensity: { rating: 'mixed', note: 'City-fringe area; busier near main roads, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Strong city-fringe convenience: food, services, and transit access.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets; larger parks require a short trip.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of local and renter crowd; busier streets.' },
    longTermComfort: { rating: 'mixed', note: 'Works well if you want convenience; less ideal if you prioritise quiet evenings.' },
  },

  'KANGKAR': {
    noiseDensity: { rating: 'mixed', note: 'Mature northeast area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Hougang amenities.' },
    greenOutdoor: { rating: 'mixed', note: 'Green pockets exist; larger parks require a short trip.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like northeast heartland living with mature amenities.' },
  },

  'KATONG': {
    noiseDensity: { rating: 'mixed', note: 'Residential streets are calmer, while arterial roads introduce periodic traffic noise.' },
    dailyConvenience: { rating: 'mixed', note: 'Lifestyle amenities are abundant, though daily errands may require short travel.' },
    greenOutdoor: { rating: 'good', note: 'Good access to East Coast Park and coastal recreational spaces.' },
    crowdVibe: { rating: 'mixed', note: 'Dining and weekend activity increases visitor foot traffic.' },
    longTermComfort: { rating: 'mixed', note: 'Suitability depends on tolerance for lifestyle-driven activity and traffic.' },
  },

  'KEAT HONG': {
    noiseDensity: { rating: 'mixed', note: 'Mature north-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Choa Chu Kang amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to north-west parks and connectors for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-west heartland living.' },
  },

  // Batch 5: Missing neighbourhoods (10 items)
  'KEBUN BAHRU': {
    noiseDensity: { rating: 'mixed', note: 'Mature central area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Ang Mo Kio amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Bishan-Ang Mo Kio Park and central-side park connectors.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central heartland living with mature amenities.' },
  },

  'KEMBANGAN': {
    noiseDensity: { rating: 'mixed', note: 'Mature east area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Bedok amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to east-side parks and connectors for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like east heartland living with mature amenities.' },
  },

  'KENT RIDGE': {
    noiseDensity: { rating: 'mixed', note: 'Near educational institutions; generally calmer, some activity during school hours.' },
    dailyConvenience: { rating: 'good', note: 'Good convenience with nearby amenities; decent transit access.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Mix of families and students; stable residential rhythm.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you like central-west access and don\'t mind some campus-area buzz.' },
  },

  'KHATIB': {
    noiseDensity: { rating: 'mixed', note: 'Mature north area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Yishun amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Lower Seletar Reservoir Park and north-side greenery for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-side living and are OK with distance from CBD.' },
  },

  'KIAN TECK': {
    noiseDensity: { rating: 'mixed', note: 'Mature west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Jurong West amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to west-side parks and connectors for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like west heartland living with mature amenities.' },
  },

  'KIM KEAT': {
    noiseDensity: { rating: 'mixed', note: 'Mature central area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Toa Payoh amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to central-side parks and connectors.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central heartland living with mature amenities.' },
  },

  'KRANJI': {
    noiseDensity: { rating: 'mixed', note: 'Rail and industrial activity introduce intermittent heavy-vehicle noise.' },
    dailyConvenience: { rating: 'bad', note: 'Limited residential services and reliance on nearby towns.' },
    greenOutdoor: { rating: 'good', note: 'Access to coastal wetlands and open rural spaces.' },
    crowdVibe: { rating: 'mixed', note: 'Activity varies between industrial operations and quiet periods.' },
    longTermComfort: { rating: 'mixed', note: 'Suitability depends on tolerance for industrial adjacency and limited amenities.' },
  },

  'LAKESIDE (BUSINESS)': {
    noiseDensity: { rating: 'bad', note: 'Business park with traffic and workday intensity; quieter evenings but not residential-first.' },
    dailyConvenience: { rating: 'bad', note: 'Not amenity-dense for residential life; errands require travel.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green spaces but more business-park feel than residential park access.' },
    crowdVibe: { rating: 'bad', note: 'Workday crowd dominates; less neighbourhood feel.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential environment.' },
  },

  'LAKESIDE (LEISURE)': {
    noiseDensity: { rating: 'mixed', note: 'Leisure area; generally calmer, some weekend activity.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is decent; bigger errands require a short trip to hubs.' },
    greenOutdoor: { rating: 'good', note: 'Excellent outdoor access: Jurong Lake Gardens and park connectors.' },
    crowdVibe: { rating: 'good', note: 'Leisure-oriented; family-friendly with active weekends.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you value outdoor access and don\'t mind distance from CBD.' },
  },

  'LEEDON PARK': {
    noiseDensity: { rating: 'mixed', note: 'Central premium area; pockets can be quieter but arterial traffic is nearby.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience around Orchard/central belt with premium amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Botanic Gardens and central greenery.' },
    crowdVibe: { rating: 'mixed', note: 'More affluent/expat city-lifestyle mix.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you value central convenience and premium amenities.' },
  },

  'LEONIE HILL': {
    noiseDensity: { rating: 'mixed', note: 'Central premium area; pockets can be quieter but arterial traffic is nearby.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience around Orchard/central belt with premium amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Botanic Gardens and central greenery.' },
    crowdVibe: { rating: 'mixed', note: 'More affluent/expat city-lifestyle mix.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you value central convenience and premium amenities.' },
  },

  'LIU FANG': {
    noiseDensity: { rating: 'mixed', note: 'West hub with nearby industry; noise/traffic can spike near major roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong west-side convenience: markets, malls, and transit access.' },
    greenOutdoor: { rating: 'mixed', note: 'Green pockets exist; larger parks depend on exact pocket.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of families and workforce flow; busier daytime feel.' },
    longTermComfort: { rating: 'mixed', note: 'Good if you work nearby; comfort depends on noise tolerance and commute.' },
  },

  'LORONG AH SOO': {
    noiseDensity: { rating: 'mixed', note: 'Mature northeast area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Hougang amenities.' },
    greenOutdoor: { rating: 'mixed', note: 'Green pockets exist; larger parks require a short trip.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like northeast heartland living with mature amenities.' },
  },

  'LORONG HALUS': {
    noiseDensity: { rating: 'mixed', note: 'Mature northeast area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Hougang amenities.' },
    greenOutdoor: { rating: 'mixed', note: 'Green pockets exist; larger parks require a short trip.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like northeast heartland living with mature amenities.' },
  },

  'LORONG HALUS NORTH': {
    noiseDensity: { rating: 'mixed', note: 'New-town density; noise clusters near schools and main roads, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Designed for families: markets and good LRT connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Strong park connectors and outdoor spaces; very kid/stroller-friendly.' },
    crowdVibe: { rating: 'good', note: 'Young families and active weekends; strong "new town" community feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable for family living if you prefer newer estates and are OK with distance from CBD.' },
  },

  'LOWER SELETAR': {
    noiseDensity: { rating: 'good', note: 'More residential and calmer; less hub intensity.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is decent; bigger errands may require a short trip to hubs.' },
    greenOutdoor: { rating: 'good', note: 'Excellent access to Lower Seletar Reservoir Park and north-side greenery.' },
    crowdVibe: { rating: 'good', note: 'Family-oriented heartland rhythm; quieter evenings.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you prefer quieter north pockets and don\'t need CBD-adjacent living.' },
  },

  'LOYANG EAST': {
    noiseDensity: { rating: 'good', note: 'More residential and coastal; generally calmer than town centres, some expressway influence.' },
    dailyConvenience: { rating: 'good', note: 'Strong east-side convenience: markets and good transit access.' },
    greenOutdoor: { rating: 'good', note: 'Excellent outdoor access: Pasir Ris Park, beach, and coastal walks.' },
    crowdVibe: { rating: 'good', note: 'Relaxed east-coast rhythm; family-friendly with active weekends.' },
    longTermComfort: { rating: 'good', note: 'A strong long-term choice if you value outdoor life and east-side convenience.' },
  },

  'LOYANG WEST': {
    noiseDensity: { rating: 'good', note: 'More residential and coastal; generally calmer than town centres, some expressway influence.' },
    dailyConvenience: { rating: 'good', note: 'Strong east-side convenience: markets and good transit access.' },
    greenOutdoor: { rating: 'good', note: 'Excellent outdoor access: Pasir Ris Park, beach, and coastal walks.' },
    crowdVibe: { rating: 'good', note: 'Relaxed east-coast rhythm; family-friendly with active weekends.' },
    longTermComfort: { rating: 'good', note: 'A strong long-term choice if you value outdoor life and east-side convenience.' },
  },

  'MACKENZIE': {
    noiseDensity: { rating: 'bad', note: 'City-fringe density + major roads; traffic noise is hard to avoid.' },
    dailyConvenience: { rating: 'good', note: 'Very convenient for food, transit, and daily services.' },
    greenOutdoor: { rating: 'bad', note: 'More hard-city fabric; greenery exists but not the "park next door" vibe.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of local and renter crowd; busier streets.' },
    longTermComfort: { rating: 'mixed', note: 'Works well if you want convenience; less ideal if you prioritise quiet evenings.' },
  },

  // Batch 7: Missing neighbourhoods (10 items)
  'MACPHERSON': {
    noiseDensity: { rating: 'mixed', note: 'City-fringe area; busier near main roads, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Strong city-fringe convenience: food, services, and transit access.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets; larger parks require a short trip.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of local and renter crowd; busier streets.' },
    longTermComfort: { rating: 'mixed', note: 'Works well if you want convenience; less ideal if you prioritise quiet evenings.' },
  },

  'MALCOLM': {
    noiseDensity: { rating: 'mixed', note: 'Central area; busier near Novena MRT and medical hub, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience: Velocity mall, medical facilities, and strong MRT connectivity.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets; larger parks require a short trip.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of families and professionals; busier near medical hub.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you like central access and can accept some hub energy.' },
  },

  'MANDAI EAST': {
    noiseDensity: { rating: 'good', note: 'More residential and calmer; less hub intensity.' },
    dailyConvenience: { rating: 'bad', note: 'Limited day-to-day amenities; errands require travel.' },
    greenOutdoor: { rating: 'good', note: 'Excellent access to natural greenery and Mandai area.' },
    crowdVibe: { rating: 'good', note: 'Very quiet, natural rhythm; minimal urban activity.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential base unless you work nearby.' },
  },

  'MANDAI ESTATE': {
    noiseDensity: { rating: 'good', note: 'More residential and calmer; less hub intensity.' },
    dailyConvenience: { rating: 'bad', note: 'Limited day-to-day amenities; errands require travel.' },
    greenOutdoor: { rating: 'good', note: 'Excellent access to natural greenery and Mandai area.' },
    crowdVibe: { rating: 'good', note: 'Very quiet, natural rhythm; minimal urban activity.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential base unless you work nearby.' },
  },

  'MANDAI WEST': {
    noiseDensity: { rating: 'good', note: 'More residential and calmer; less hub intensity.' },
    dailyConvenience: { rating: 'bad', note: 'Limited day-to-day amenities; errands require travel.' },
    greenOutdoor: { rating: 'good', note: 'Excellent access to natural greenery and Mandai area.' },
    crowdVibe: { rating: 'good', note: 'Very quiet, natural rhythm; minimal urban activity.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential base unless you work nearby.' },
  },

  'MARGARET DRIVE': {
    noiseDensity: { rating: 'mixed', note: 'Mature central-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Queenstown amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central-west access with mature amenities.' },
  },

  'MARINA EAST (MP)': {
    noiseDensity: { rating: 'mixed', note: 'Coastal development area; generally calmer, some construction activity.' },
    dailyConvenience: { rating: 'bad', note: 'Limited day-to-day amenities; errands require travel.' },
    greenOutdoor: { rating: 'good', note: 'Excellent coastal access and park spaces.' },
    crowdVibe: { rating: 'mixed', note: 'New development; less established neighbourhood feel.' },
    longTermComfort: { rating: 'mixed', note: 'Comfort depends on development completion and amenity growth.' },
  },

  'MARITIME SQUARE': {
    noiseDensity: { rating: 'bad', note: 'Port/logistics influence; heavy vehicles and operations can be noisy.' },
    dailyConvenience: { rating: 'bad', note: 'Not amenity-dense for residential life; errands require travel.' },
    greenOutdoor: { rating: 'bad', note: 'Hardscape-heavy; limited daily green space.' },
    crowdVibe: { rating: 'bad', note: 'Workforce/logistics environment; not a residential neighbourhood.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential environment.' },
  },

  'MATILDA': {
    noiseDensity: { rating: 'mixed', note: 'New-town density; noise clusters near schools and main roads, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Designed for families: markets and good LRT connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Strong park connectors and outdoor spaces; very kid/stroller-friendly.' },
    crowdVibe: { rating: 'good', note: 'Young families and active weekends; strong "new town" community feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable for family living if you prefer newer estates and are OK with distance from CBD.' },
  },

  'MAXWELL': {
    noiseDensity: { rating: 'bad', note: 'CBD core: constant traffic/works cycles; quiet nights are uncommon.' },
    dailyConvenience: { rating: 'good', note: 'City-core convenience is excellent.' },
    greenOutdoor: { rating: 'bad', note: 'Hard-city environment; outdoor time is mostly promenades and small pockets.' },
    crowdVibe: { rating: 'bad', note: 'Commuter-heavy, high churn; weekday intensity dominates.' },
    longTermComfort: { rating: 'bad', note: 'Usually not ideal for long-term quiet family living.' },
  },

  // Batch 8: Missing neighbourhoods (10 items)
  'MEI CHIN': {
    noiseDensity: { rating: 'mixed', note: 'Mature central-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Queenstown amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central-west access with mature amenities.' },
  },

  'MIDVIEW': {
    noiseDensity: { rating: 'mixed', note: 'Mature north area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Woodlands amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Woodlands Waterfront Park and north-side greenery for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-side living and are OK with distance from CBD.' },
  },

  'MONK\'S HILL': {
    noiseDensity: { rating: 'mixed', note: 'Central premium area; pockets can be quieter but arterial traffic is nearby.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience around Orchard/central belt with premium amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Botanic Gardens and central greenery.' },
    crowdVibe: { rating: 'mixed', note: 'More affluent/expat city-lifestyle mix.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you value central convenience and premium amenities.' },
  },

  'MOULMEIN': {
    noiseDensity: { rating: 'mixed', note: 'Central area; busier near Novena MRT and medical hub, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience: Velocity mall, medical facilities, and strong MRT connectivity.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets; larger parks require a short trip.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of families and professionals; busier near medical hub.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you like central access and can accept some hub energy.' },
  },

  'MOUNT EMILY': {
    noiseDensity: { rating: 'bad', note: 'City-fringe density + major roads; traffic noise is hard to avoid.' },
    dailyConvenience: { rating: 'good', note: 'Very convenient for food, transit, and daily services.' },
    greenOutdoor: { rating: 'bad', note: 'More hard-city fabric; greenery exists but not the "park next door" vibe.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of local and renter crowd; busier streets.' },
    longTermComfort: { rating: 'mixed', note: 'Works well if you want convenience; less ideal if you prioritise quiet evenings.' },
  },

  'MOUNT PLEASANT': {
    noiseDensity: { rating: 'mixed', note: 'Central area; busier near Novena MRT and medical hub, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience: Velocity mall, medical facilities, and strong MRT connectivity.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets; larger parks require a short trip.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of families and professionals; busier near medical hub.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you like central access and can accept some hub energy.' },
  },

  'MOUNTBATTEN': {
    noiseDensity: { rating: 'mixed', note: 'East-coast area; generally calm in residential blocks, busier near coastal roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong east-side convenience; good access to Marine Parade amenities.' },
    greenOutdoor: { rating: 'good', note: 'Excellent outdoor access: East Coast Park, beach, and coastal walks.' },
    crowdVibe: { rating: 'good', note: 'Relaxed east-coast rhythm; family-friendly with active weekends.' },
    longTermComfort: { rating: 'good', note: 'A strong long-term choice if you value outdoor life and east-side convenience.' },
  },

  'MURAI': {
    noiseDensity: { rating: 'good', note: 'Water catchment area; generally very calm.' },
    dailyConvenience: { rating: 'bad', note: 'Limited day-to-day amenities; errands require travel.' },
    greenOutdoor: { rating: 'good', note: 'Excellent access to natural greenery and water catchment areas.' },
    crowdVibe: { rating: 'good', note: 'Very quiet, natural rhythm; minimal urban activity.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential base.' },
  },

  'NASSIM': {
    noiseDensity: { rating: 'mixed', note: 'Central premium area; pockets can be quieter but arterial traffic is nearby.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience around Orchard/central belt with premium amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Botanic Gardens and central greenery.' },
    crowdVibe: { rating: 'mixed', note: 'More affluent/expat city-lifestyle mix.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you value central convenience and premium amenities.' },
  },

  'NATIONAL UNIVERSITY OF S\'PORE': {
    noiseDensity: { rating: 'mixed', note: 'Near educational institutions; generally calmer, some activity during school hours.' },
    dailyConvenience: { rating: 'good', note: 'Good convenience with nearby amenities; decent transit access.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Mix of families and students; stable residential rhythm.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you like central-west access and don\'t mind some campus-area buzz.' },
  },

  // Batch 9: Missing neighbourhoods (10 items)
  'NATURE RESERVE': {
    noiseDensity: { rating: 'good', note: 'Nature reserve area; generally very calm.' },
    dailyConvenience: { rating: 'bad', note: 'Limited day-to-day amenities; errands require travel.' },
    greenOutdoor: { rating: 'good', note: 'Excellent access to natural greenery and nature reserves.' },
    crowdVibe: { rating: 'good', note: 'Very quiet, natural rhythm; minimal urban activity.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential base.' },
  },

  'NEE SOON': {
    noiseDensity: { rating: 'good', note: 'Low traffic and restricted access result in generally quiet conditions.' },
    dailyConvenience: { rating: 'bad', note: 'Restricted land use limits access to everyday residential amenities.' },
    greenOutdoor: { rating: 'good', note: 'Strong presence of forested and natural areas.' },
    crowdVibe: { rating: 'good', note: 'Minimal civilian activity due to restricted access.' },
    longTermComfort: { rating: 'bad', note: 'Non-residential land use significantly limits suitability for long-term living.' },
  },

  'NEWTON CIRCUS': {
    noiseDensity: { rating: 'bad', note: 'Major interchange/city core: constant activity and traffic.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience around Orchard/central belt with premium amenities.' },
    greenOutdoor: { rating: 'bad', note: 'More hard-city; greenery exists but not the "park next door" vibe.' },
    crowdVibe: { rating: 'bad', note: 'High footfall and pass-through crowd all day.' },
    longTermComfort: { rating: 'bad', note: 'Usually not ideal for long-term quiet family living.' },
  },

  'NICOLL': {
    noiseDensity: { rating: 'bad', note: 'Expressway traffic and adjacent commercial uses generate sustained noise.' },
    dailyConvenience: { rating: 'good', note: 'Strong transport connectivity and access to city-fringe amenities.' },
    greenOutdoor: { rating: 'mixed', note: 'Some park access exists but is fragmented by infrastructure.' },
    crowdVibe: { rating: 'mixed', note: 'Activity fluctuates with events and commuter flows.' },
    longTermComfort: { rating: 'bad', note: 'Transport intensity and noise reduce long-term residential suitability.' },
  },

  'NORTH COAST': {
    noiseDensity: { rating: 'mixed', note: 'Mature north area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Woodlands amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Woodlands Waterfront Park and north-side greenery for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-side living and are OK with distance from CBD.' },
  },

  'NORTH-EASTERN ISLANDS': {
    noiseDensity: { rating: 'good', note: 'Island area; generally very calm.' },
    dailyConvenience: { rating: 'bad', note: 'Limited day-to-day amenities; errands require travel to mainland.' },
    greenOutdoor: { rating: 'good', note: 'Excellent access to natural greenery and coastal areas.' },
    crowdVibe: { rating: 'good', note: 'Very quiet, natural rhythm; minimal urban activity.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential base.' },
  },

  'NORTHLAND': {
    noiseDensity: { rating: 'mixed', note: 'Mature north area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Yishun amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Lower Seletar Reservoir Park and north-side greenery for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-side living and are OK with distance from CBD.' },
  },

  'NORTHSHORE': {
    noiseDensity: { rating: 'mixed', note: 'New-town density; noise clusters near schools and main roads, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Designed for families: markets and good LRT connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Excellent outdoor access: Punggol Waterway, park connectors, and coastal routes.' },
    crowdVibe: { rating: 'good', note: 'Young families and active weekends; strong "new town" community feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable for family living if you value outdoor access and newer estate amenities.' },
  },

  'ONE NORTH': {
    noiseDensity: { rating: 'mixed', note: 'Business park with some residential; generally calmer, some workday activity.' },
    dailyConvenience: { rating: 'good', note: 'Good convenience with nearby amenities; decent transit access.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of families and professionals; busier near business park.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you like central-west access and don\'t mind some business-park buzz.' },
  },

  'ONE TREE HILL': {
    noiseDensity: { rating: 'mixed', note: 'Central premium area; pockets can be quieter but arterial traffic is nearby.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience around Orchard/central belt with premium amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Botanic Gardens and central greenery.' },
    crowdVibe: { rating: 'mixed', note: 'More affluent/expat city-lifestyle mix.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you value central convenience and premium amenities.' },
  },

  // Batch 10: Missing neighbourhoods (10 items)
  'ORANGE GROVE': {
    noiseDensity: { rating: 'mixed', note: 'Central premium area; pockets can be quieter but arterial traffic is nearby.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience around Orchard/central belt with premium amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Botanic Gardens and central greenery.' },
    crowdVibe: { rating: 'mixed', note: 'More affluent/expat city-lifestyle mix.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you value central convenience and premium amenities.' },
  },

  'OXLEY': {
    noiseDensity: { rating: 'mixed', note: 'Central premium area; pockets can be quieter but arterial traffic is nearby.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience around Orchard/central belt with premium amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Botanic Gardens and central greenery.' },
    crowdVibe: { rating: 'mixed', note: 'More affluent/expat city-lifestyle mix.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you value central convenience and premium amenities.' },
  },

  'PANDAN': {
    noiseDensity: { rating: 'mixed', note: 'Mature central-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Clementi amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central-west access with mature amenities.' },
  },

  'PANG SUA': {
    noiseDensity: { rating: 'mixed', note: 'Mature north-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Sungei Kadut amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to north-west parks and connectors for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-west heartland living.' },
  },

  'PASIR PANJANG 1': {
    noiseDensity: { rating: 'mixed', note: 'Mature central-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Queenstown amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central-west access with mature amenities.' },
  },

  'PASIR PANJANG 2': {
    noiseDensity: { rating: 'mixed', note: 'Mature central-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Queenstown amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central-west access with mature amenities.' },
  },

  'PATERSON': {
    noiseDensity: { rating: 'mixed', note: 'Central premium area; pockets can be quieter but arterial traffic is nearby.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience around Orchard/central belt with premium amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Botanic Gardens and central greenery.' },
    crowdVibe: { rating: 'mixed', note: 'More affluent/expat city-lifestyle mix.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you value central convenience and premium amenities.' },
  },

  'PAYA LEBAR EAST': {
    noiseDensity: { rating: 'mixed', note: 'City-fringe area; busier near main roads, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Strong city-fringe convenience: food, services, and transit access.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets; larger parks require a short trip.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of local and renter crowd; busier streets.' },
    longTermComfort: { rating: 'mixed', note: 'Works well if you want convenience; less ideal if you prioritise quiet evenings.' },
  },

  'PAYA LEBAR NORTH': {
    noiseDensity: { rating: 'mixed', note: 'City-fringe area; busier near main roads, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Strong city-fringe convenience: food, services, and transit access.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets; larger parks require a short trip.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of local and renter crowd; busier streets.' },
    longTermComfort: { rating: 'mixed', note: 'Works well if you want convenience; less ideal if you prioritise quiet evenings.' },
  },

  'PAYA LEBAR WEST': {
    noiseDensity: { rating: 'mixed', note: 'City-fringe area; busier near main roads, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Strong city-fringe convenience: food, services, and transit access.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets; larger parks require a short trip.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of local and renter crowd; busier streets.' },
    longTermComfort: { rating: 'mixed', note: 'Works well if you want convenience; less ideal if you prioritise quiet evenings.' },
  },

  // Batch 11: Missing neighbourhoods (10 items)
  'PEARL\'S HILL': {
    noiseDensity: { rating: 'bad', note: 'CBD core: constant traffic/works cycles; quiet nights are uncommon.' },
    dailyConvenience: { rating: 'good', note: 'City-core convenience is excellent.' },
    greenOutdoor: { rating: 'bad', note: 'Hard-city environment; outdoor time is mostly promenades and small pockets.' },
    crowdVibe: { rating: 'bad', note: 'Commuter-heavy, high churn; weekday intensity dominates.' },
    longTermComfort: { rating: 'bad', note: 'Usually not ideal for long-term quiet family living.' },
  },

  'PEI CHUN': {
    noiseDensity: { rating: 'mixed', note: 'Mature central area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Toa Payoh amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to central-side parks and connectors.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central heartland living with mature amenities.' },
  },

  'PENG SIANG': {
    noiseDensity: { rating: 'mixed', note: 'Mature north-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Choa Chu Kang amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to north-west parks and connectors for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-west heartland living.' },
  },

  'PENJURU CRESCENT': {
    noiseDensity: { rating: 'bad', note: 'Industrial zone; heavy vehicles and shift cycles can add noise/traffic spikes.' },
    dailyConvenience: { rating: 'bad', note: 'Residential-style errands typically require travel outside the zone.' },
    greenOutdoor: { rating: 'bad', note: 'Hardscape-heavy; limited daily green space.' },
    crowdVibe: { rating: 'bad', note: 'Workforce-oriented; not a residential neighbourhood.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential environment.' },
  },

  'PEOPLE\'S PARK': {
    noiseDensity: { rating: 'bad', note: 'Busy heritage/tourist belt; footfall and traffic are noticeable.' },
    dailyConvenience: { rating: 'good', note: 'Very convenient for food, transit, and daily services.' },
    greenOutdoor: { rating: 'bad', note: 'Dense urban fabric; parks are not the default daily feel.' },
    crowdVibe: { rating: 'bad', note: 'Tourist + nightlife + office mix; high churn.' },
    longTermComfort: { rating: 'bad', note: 'Usually not ideal for long-term quiet family living.' },
  },

  'PHILLIP': {
    noiseDensity: { rating: 'bad', note: 'CBD core: constant traffic/works cycles; quiet nights are uncommon.' },
    dailyConvenience: { rating: 'good', note: 'City-core convenience is excellent.' },
    greenOutdoor: { rating: 'bad', note: 'Hard-city environment; outdoor time is mostly promenades and small pockets.' },
    crowdVibe: { rating: 'bad', note: 'Commuter-heavy, high churn; weekday intensity dominates.' },
    longTermComfort: { rating: 'bad', note: 'Usually not ideal for long-term quiet family living.' },
  },

  'PLAB': {
    noiseDensity: { rating: 'bad', note: 'Industrial zone; heavy vehicles and shift cycles can add noise/traffic spikes.' },
    dailyConvenience: { rating: 'bad', note: 'Residential-style errands typically require travel outside the zone.' },
    greenOutdoor: { rating: 'bad', note: 'Hardscape-heavy; limited daily green space.' },
    crowdVibe: { rating: 'bad', note: 'Workforce-oriented; not a residential neighbourhood.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential environment.' },
  },

  'PLANTATION': {
    noiseDensity: { rating: 'mixed', note: 'New development area; generally calmer, some construction activity.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is growing with new amenities; good MRT connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors; designed with green spaces in mind.' },
    crowdVibe: { rating: 'good', note: 'New estate feel; mix of young families and professionals.' },
    longTermComfort: { rating: 'good', note: 'Comfortable for long-term if you like newer developments with central access.' },
  },

  'PORT': {
    noiseDensity: { rating: 'bad', note: 'Port/logistics influence; heavy vehicles and operations can be noisy.' },
    dailyConvenience: { rating: 'bad', note: 'Not amenity-dense for residential life; errands require travel.' },
    greenOutdoor: { rating: 'bad', note: 'Hardscape-heavy; limited daily green space.' },
    crowdVibe: { rating: 'bad', note: 'Workforce/logistics environment; not a residential neighbourhood.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential environment.' },
  },

  'PULAU SELETAR': {
    noiseDensity: { rating: 'good', note: 'Island area; generally very calm.' },
    dailyConvenience: { rating: 'bad', note: 'Limited day-to-day amenities; errands require travel to mainland.' },
    greenOutdoor: { rating: 'good', note: 'Excellent access to natural greenery and coastal areas.' },
    crowdVibe: { rating: 'good', note: 'Very quiet, natural rhythm; minimal urban activity.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential base.' },
  },

  // Batch 12: Missing neighbourhoods (10 items)
  'QUEENSWAY': {
    noiseDensity: { rating: 'mixed', note: 'Mature central-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Queenstown amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central-west access with mature amenities.' },
  },

  'RESERVOIR VIEW': {
    noiseDensity: { rating: 'good', note: 'More residential and calmer; less hub intensity.' },
    dailyConvenience: { rating: 'mixed', note: 'Convenience is decent; bigger errands may require a short trip to hubs.' },
    greenOutdoor: { rating: 'good', note: 'Excellent access to reservoir and north-side greenery.' },
    crowdVibe: { rating: 'good', note: 'Family-oriented heartland rhythm; quieter evenings.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you prefer quieter north pockets and don\'t need CBD-adjacent living.' },
  },

  'RIDOUT': {
    noiseDensity: { rating: 'mixed', note: 'Central premium area; pockets can be quieter but arterial traffic is nearby.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience around Orchard/central belt with premium amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Botanic Gardens and central greenery.' },
    crowdVibe: { rating: 'mixed', note: 'More affluent/expat city-lifestyle mix.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you value central convenience and premium amenities.' },
  },

  'ROCHOR CANAL': {
    noiseDensity: { rating: 'bad', note: 'City-fringe density + major roads; traffic noise is hard to avoid.' },
    dailyConvenience: { rating: 'good', note: 'Very convenient for food, transit, and daily services.' },
    greenOutdoor: { rating: 'bad', note: 'More hard-city fabric; greenery exists but not the "park next door" vibe.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of local and renter crowd; busier streets.' },
    longTermComfort: { rating: 'mixed', note: 'Works well if you want convenience; less ideal if you prioritise quiet evenings.' },
  },

  'SAFTI': {
    noiseDensity: { rating: 'bad', note: 'Industrial/military zone; heavy vehicles and operations can be noisy.' },
    dailyConvenience: { rating: 'bad', note: 'Not amenity-dense for residential life; errands require travel.' },
    greenOutdoor: { rating: 'bad', note: 'Hardscape-heavy; limited daily green space.' },
    crowdVibe: { rating: 'bad', note: 'Workforce-oriented; not a residential neighbourhood.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential environment.' },
  },

  'SAMULUN': {
    noiseDensity: { rating: 'bad', note: 'Industrial zone; heavy vehicles and shift cycles can add noise/traffic spikes.' },
    dailyConvenience: { rating: 'bad', note: 'Residential-style errands typically require travel outside the zone.' },
    greenOutdoor: { rating: 'bad', note: 'Hardscape-heavy; limited daily green space.' },
    crowdVibe: { rating: 'bad', note: 'Workforce-oriented; not a residential neighbourhood.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential environment.' },
  },

  'SAUJANA': {
    noiseDensity: { rating: 'mixed', note: 'Mature north-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Bukit Panjang amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to north-west parks and connectors for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-west heartland living.' },
  },

  'SELEGIE': {
    noiseDensity: { rating: 'bad', note: 'City-fringe density + major roads; traffic noise is hard to avoid.' },
    dailyConvenience: { rating: 'good', note: 'Very convenient for food, transit, and daily services.' },
    greenOutdoor: { rating: 'bad', note: 'More hard-city fabric; greenery exists but not the "park next door" vibe.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of local and renter crowd; busier streets.' },
    longTermComfort: { rating: 'mixed', note: 'Works well if you want convenience; less ideal if you prioritise quiet evenings.' },
  },

  'SELETAR': {
    noiseDensity: { rating: 'mixed', note: 'Aviation activity from Seletar Airport introduces periodic aircraft noise.' },
    dailyConvenience: { rating: 'mixed', note: 'Amenities are limited, with reliance on nearby towns for daily needs.' },
    greenOutdoor: { rating: 'good', note: 'Strong access to open spaces, parks, and low-density green areas.' },
    crowdVibe: { rating: 'good', note: 'Low population density with minimal destination-driven activity.' },
    longTermComfort: { rating: 'mixed', note: 'Comfort depends on tolerance for aircraft noise in exchange for spacious surroundings.' },
  },

  // Batch 13: Missing neighbourhoods (10 items)
  'SELETAR HILLS': {
    noiseDensity: { rating: 'mixed', note: 'Mature northeast area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Serangoon amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the northeast belt.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like northeast heartland living with mature amenities.' },
  },

  'SEMAKAU': {
    noiseDensity: { rating: 'good', note: 'Island area; generally very calm.' },
    dailyConvenience: { rating: 'bad', note: 'Limited day-to-day amenities; errands require travel to mainland.' },
    greenOutdoor: { rating: 'good', note: 'Excellent access to natural greenery and coastal areas.' },
    crowdVibe: { rating: 'good', note: 'Very quiet, natural rhythm; minimal urban activity.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential base.' },
  },

  'SEMBAWANG CENTRAL': {
    noiseDensity: { rating: 'mixed', note: 'Town-centre development and surrounding roads contribute to periodic background noise.' },
    dailyConvenience: { rating: 'good', note: 'Integrated amenities and MRT access support daily routines.' },
    greenOutdoor: { rating: 'mixed', note: 'Green spaces are available but not continuous.' },
    crowdVibe: { rating: 'mixed', note: 'Moderate activity linked to retail and transport usage.' },
    longTermComfort: { rating: 'mixed', note: 'Comfort depends on tolerance for town-centre activity.' },
  },

  'SEMBAWANG EAST': {
    noiseDensity: { rating: 'good', note: 'Residential areas are generally shielded from major traffic corridors.' },
    dailyConvenience: { rating: 'mixed', note: 'Amenities are accessible though town-centre reliance is common.' },
    greenOutdoor: { rating: 'good', note: 'Strong proximity to coastal parks and recreational spaces.' },
    crowdVibe: { rating: 'good', note: 'Primarily residential with stable daily patterns.' },
    longTermComfort: { rating: 'good', note: 'Well-suited for long-term family living with coastal and green access.' },
  },

  'SEMBAWANG HILLS': {
    noiseDensity: { rating: 'mixed', note: 'Mature central area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Ang Mo Kio amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Bishan-Ang Mo Kio Park and central-side park connectors.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central heartland living with mature amenities.' },
  },

  'SEMBAWANG NORTH': {
    noiseDensity: { rating: 'mixed', note: 'Mature north area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Sembawang amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Sembawang Park and north-side greenery for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-side living and are OK with distance from CBD.' },
  },

  'SEMBAWANG SPRINGS': {
    noiseDensity: { rating: 'mixed', note: 'Mature north area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Sembawang amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Sembawang Park and north-side greenery for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-side living and are OK with distance from CBD.' },
  },

  'SEMBAWANG STRAITS': {
    noiseDensity: { rating: 'mixed', note: 'Mature north area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Sembawang amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Sembawang Park and north-side greenery for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-side living and are OK with distance from CBD.' },
  },

  'SENJA': {
    noiseDensity: { rating: 'mixed', note: 'Mature north-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Bukit Panjang amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to north-west parks and connectors for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-west heartland living.' },
  },

  'SENNETT': {
    noiseDensity: { rating: 'mixed', note: 'Mature central area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Toa Payoh amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to central-side parks and connectors.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central heartland living with mature amenities.' },
  },

  // Batch 14: Missing neighbourhoods (10 items)
  'SENOKO NORTH': {
    noiseDensity: { rating: 'mixed', note: 'Mature north area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Sembawang amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Sembawang Park and north-side greenery for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-side living and are OK with distance from CBD.' },
  },

  'SENOKO SOUTH': {
    noiseDensity: { rating: 'mixed', note: 'Mature north area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Sembawang amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Sembawang Park and north-side greenery for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-side living and are OK with distance from CBD.' },
  },

  'SENOKO WEST': {
    noiseDensity: { rating: 'mixed', note: 'Mature north area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Woodlands amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Woodlands Waterfront Park and north-side greenery for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-side living and are OK with distance from CBD.' },
  },

  'SHANGRI-LA': {
    noiseDensity: { rating: 'mixed', note: 'Mature central area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Ang Mo Kio amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Bishan-Ang Mo Kio Park and central-side park connectors.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central heartland living with mature amenities.' },
  },

  'SHIPYARD': {
    noiseDensity: { rating: 'bad', note: 'Industrial/port-adjacent; heavy vehicles and operations can be noisy.' },
    dailyConvenience: { rating: 'bad', note: 'Not amenity-dense for residential life; errands require travel.' },
    greenOutdoor: { rating: 'bad', note: 'Hardscape-heavy; limited daily green space.' },
    crowdVibe: { rating: 'bad', note: 'Workforce/logistics environment; not a residential neighbourhood.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential environment.' },
  },

  'SIGLAP': {
    noiseDensity: { rating: 'good', note: 'Low-density residential layout buffers most homes from heavy traffic noise.' },
    dailyConvenience: { rating: 'mixed', note: 'Amenities are accessible, though less concentrated than town centres.' },
    greenOutdoor: { rating: 'good', note: 'Good access to neighbourhood parks and coastal corridors.' },
    crowdVibe: { rating: 'good', note: 'Primarily residential with limited destination-driven activity.' },
    longTermComfort: { rating: 'good', note: 'Well-suited for households valuing quieter living with coastal proximity.' },
  },

  'SIMEI': {
    noiseDensity: { rating: 'mixed', note: 'Mature east town; generally calm in residential blocks, busier near town centre and MRT.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-town convenience: markets, food courts, and excellent MRT connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Tampines Eco Green and east-side park connectors for walks and outdoor time.' },
    crowdVibe: { rating: 'good', note: 'Family-oriented heartland rhythm; stable daily life with good community feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like east heartland living with strong amenities and connectivity.' },
  },

  'SIMPANG NORTH': {
    noiseDensity: { rating: 'good', note: 'More residential and calmer; less hub intensity.' },
    dailyConvenience: { rating: 'bad', note: 'Limited day-to-day amenities; errands require travel.' },
    greenOutdoor: { rating: 'good', note: 'Excellent access to natural greenery and Simpang area.' },
    crowdVibe: { rating: 'good', note: 'Very quiet, natural rhythm; minimal urban activity.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential base unless you work nearby.' },
  },

  'SIMPANG SOUTH': {
    noiseDensity: { rating: 'good', note: 'More residential and calmer; less hub intensity.' },
    dailyConvenience: { rating: 'bad', note: 'Limited day-to-day amenities; errands require travel.' },
    greenOutdoor: { rating: 'good', note: 'Excellent access to natural greenery and Simpang area.' },
    crowdVibe: { rating: 'good', note: 'Very quiet, natural rhythm; minimal urban activity.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential base unless you work nearby.' },
  },

  'SINGAPORE GENERAL HOSPITAL': {
    noiseDensity: { rating: 'mixed', note: 'Medical hub area; busier near hospital, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience: medical facilities, markets, and good transit access.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets; larger parks require a short trip.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of families and medical professionals; busier near hospital.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you like central access and can accept some medical-hub energy.' },
  },

  // Batch 15: Missing neighbourhoods (10 items)
  'SINGAPORE POLYTECHNIC': {
    noiseDensity: { rating: 'mixed', note: 'Near educational institutions; generally calmer, some activity during school hours.' },
    dailyConvenience: { rating: 'good', note: 'Good convenience with nearby amenities; decent transit access.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Mix of families and students; stable residential rhythm.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you like central-west access and don\'t mind some campus-area buzz.' },
  },

  'SOMERSET': {
    noiseDensity: { rating: 'bad', note: 'Orchard fringe: traffic and city intensity are constant.' },
    dailyConvenience: { rating: 'good', note: 'Extremely convenient for shopping, food, and transit.' },
    greenOutdoor: { rating: 'mixed', note: 'Some greenery nearby, but the dominant feel is urban core.' },
    crowdVibe: { rating: 'bad', note: 'More affluent/office/tourist mix; higher churn.' },
    longTermComfort: { rating: 'bad', note: 'Works if you want prime convenience; not ideal if you want quiet, local estate life.' },
  },

  'SOUTHERN GROUP': {
    noiseDensity: { rating: 'good', note: 'Island area; generally very calm.' },
    dailyConvenience: { rating: 'bad', note: 'Limited day-to-day amenities; errands require travel to mainland.' },
    greenOutdoor: { rating: 'good', note: 'Excellent access to natural greenery and coastal areas.' },
    crowdVibe: { rating: 'good', note: 'Very quiet, natural rhythm; minimal urban activity.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential base.' },
  },

  'SPRINGLEAF': {
    noiseDensity: { rating: 'good', note: 'Low traffic and minimal commercial presence create generally quiet surroundings.' },
    dailyConvenience: { rating: 'bad', note: 'Very limited amenities and reliance on distant town centres.' },
    greenOutdoor: { rating: 'good', note: 'Strong access to nature reserves and open green areas.' },
    crowdVibe: { rating: 'good', note: 'Minimal population density with little visitor-driven activity.' },
    longTermComfort: { rating: 'mixed', note: 'Suitability depends on acceptance of limited convenience in exchange for tranquillity.' },
  },

  'STRAITS VIEW': {
    noiseDensity: { rating: 'mixed', note: 'Coastal development area; generally calmer, some construction activity.' },
    dailyConvenience: { rating: 'bad', note: 'Limited day-to-day amenities; errands require travel.' },
    greenOutdoor: { rating: 'good', note: 'Excellent coastal access and park spaces.' },
    crowdVibe: { rating: 'mixed', note: 'New development; less established neighbourhood feel.' },
    longTermComfort: { rating: 'mixed', note: 'Comfort depends on development completion and amenity growth.' },
  },

  'SUDONG': {
    noiseDensity: { rating: 'good', note: 'Island area; generally very calm.' },
    dailyConvenience: { rating: 'bad', note: 'Limited day-to-day amenities; errands require travel to mainland.' },
    greenOutdoor: { rating: 'good', note: 'Excellent access to natural greenery and coastal areas.' },
    crowdVibe: { rating: 'good', note: 'Very quiet, natural rhythm; minimal urban activity.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential base.' },
  },

  'SUNGEI ROAD': {
    noiseDensity: { rating: 'bad', note: 'City-fringe density + major roads; traffic noise is hard to avoid.' },
    dailyConvenience: { rating: 'good', note: 'Very convenient for food, transit, and daily services.' },
    greenOutdoor: { rating: 'bad', note: 'More hard-city fabric; greenery exists but not the "park next door" vibe.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of local and renter crowd; busier streets.' },
    longTermComfort: { rating: 'mixed', note: 'Works well if you want convenience; less ideal if you prioritise quiet evenings.' },
  },

  'SUNSET WAY': {
    noiseDensity: { rating: 'mixed', note: 'Mature central-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Clementi amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central-west access with mature amenities.' },
  },

  'SWISS CLUB': {
    noiseDensity: { rating: 'mixed', note: 'Central premium area; pockets can be quieter but arterial traffic is nearby.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience around Orchard/central belt with premium amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Botanic Gardens and central greenery.' },
    crowdVibe: { rating: 'mixed', note: 'More affluent/expat city-lifestyle mix.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you value central convenience and premium amenities.' },
  },

  'TAGORE': {
    noiseDensity: { rating: 'mixed', note: 'Mature central area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Ang Mo Kio amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Bishan-Ang Mo Kio Park and central-side park connectors.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central heartland living with mature amenities.' },
  },

  // Batch 16: Missing neighbourhoods (10 items)
  'TAI SENG': {
    noiseDensity: { rating: 'mixed', note: 'City-fringe area; busier near main roads, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Strong city-fringe convenience: food, services, and transit access.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets; larger parks require a short trip.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of local and renter crowd; busier streets.' },
    longTermComfort: { rating: 'mixed', note: 'Works well if you want convenience; less ideal if you prioritise quiet evenings.' },
  },

  'TAMAN JURONG': {
    noiseDensity: { rating: 'mixed', note: 'Mature west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Jurong West amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to west-side parks and connectors for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like west heartland living with mature amenities.' },
  },

  'TANJONG IRAU': {
    noiseDensity: { rating: 'good', note: 'More residential and calmer; less hub intensity.' },
    dailyConvenience: { rating: 'bad', note: 'Limited day-to-day amenities; errands require travel.' },
    greenOutdoor: { rating: 'good', note: 'Excellent access to natural greenery and Simpang area.' },
    crowdVibe: { rating: 'good', note: 'Very quiet, natural rhythm; minimal urban activity.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential base unless you work nearby.' },
  },

  'TANJONG RHU': {
    noiseDensity: { rating: 'mixed', note: 'City-fringe area; busier near main roads, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Strong city-fringe convenience: food, services, and transit access.' },
    greenOutdoor: { rating: 'mixed', note: 'Some green pockets; larger parks require a short trip.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of local and renter crowd; busier streets.' },
    longTermComfort: { rating: 'mixed', note: 'Works well if you want convenience; less ideal if you prioritise quiet evenings.' },
  },

  'TEBAN GARDENS': {
    noiseDensity: { rating: 'mixed', note: 'Mature west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Jurong East amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Jurong Lake Gardens and west-side parks for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like west heartland living with mature amenities.' },
  },

  'TECK WHYE': {
    noiseDensity: { rating: 'mixed', note: 'Mature north-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Choa Chu Kang amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to north-west parks and connectors for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-west heartland living.' },
  },

  'TELOK BLANGAH DRIVE': {
    noiseDensity: { rating: 'mixed', note: 'Mature central-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Bukit Merah amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central-west access with mature amenities.' },
  },

  'TELOK BLANGAH RISE': {
    noiseDensity: { rating: 'mixed', note: 'Mature central-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Bukit Merah amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central-west access with mature amenities.' },
  },

  'TELOK BLANGAH WAY': {
    noiseDensity: { rating: 'mixed', note: 'Mature central-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Bukit Merah amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central-west access with mature amenities.' },
  },

  'TENGEH': {
    noiseDensity: { rating: 'bad', note: 'Industrial zone; heavy vehicles and shift cycles can add noise/traffic spikes.' },
    dailyConvenience: { rating: 'bad', note: 'Residential-style errands typically require travel outside the zone.' },
    greenOutdoor: { rating: 'bad', note: 'Hardscape-heavy; limited daily green space.' },
    crowdVibe: { rating: 'bad', note: 'Workforce-oriented; not a residential neighbourhood.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential environment.' },
  },

  // Batch 17: Missing neighbourhoods (10 items)
  'THE WHARVES': {
    noiseDensity: { rating: 'bad', note: 'Port/logistics influence; heavy vehicles and operations can be noisy.' },
    dailyConvenience: { rating: 'bad', note: 'Not amenity-dense for residential life; errands require travel.' },
    greenOutdoor: { rating: 'bad', note: 'Hardscape-heavy; limited daily green space.' },
    crowdVibe: { rating: 'bad', note: 'Workforce/logistics environment; not a residential neighbourhood.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential environment.' },
  },

  'TIONG BAHRU': {
    noiseDensity: { rating: 'mixed', note: 'Mature central-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Bukit Merah amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central-west access with mature amenities.' },
  },

  'TIONG BAHRU STATION': {
    noiseDensity: { rating: 'mixed', note: 'Mature central-west area; busier near Tiong Bahru MRT, calmer in residential blocks.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good MRT connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central-west access with mature amenities.' },
  },

  'TOH GUAN': {
    noiseDensity: { rating: 'mixed', note: 'Mature west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Jurong East amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Jurong Lake Gardens and west-side parks for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like west heartland living with mature amenities.' },
  },

  'TOH TUCK': {
    noiseDensity: { rating: 'mixed', note: 'Mature central-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Clementi amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central-west access with mature amenities.' },
  },

  'TOWNSVILLE': {
    noiseDensity: { rating: 'mixed', note: 'Mature central area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Ang Mo Kio amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Bishan-Ang Mo Kio Park and central-side park connectors.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central heartland living with mature amenities.' },
  },

  'TRAFALGAR': {
    noiseDensity: { rating: 'mixed', note: 'Mature northeast area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Hougang amenities.' },
    greenOutdoor: { rating: 'mixed', note: 'Green pockets exist; larger parks require a short trip.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like northeast heartland living with mature amenities.' },
  },

  'TUAS PROMENADE': {
    noiseDensity: { rating: 'bad', note: 'Industrial/port-adjacent; heavy vehicles and operations can be noisy.' },
    dailyConvenience: { rating: 'bad', note: 'Not amenity-dense for residential life; errands require travel.' },
    greenOutdoor: { rating: 'bad', note: 'Hardscape-heavy; limited daily green space.' },
    crowdVibe: { rating: 'bad', note: 'Workforce/logistics environment; not a residential neighbourhood.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential environment.' },
  },

  'TUKANG': {
    noiseDensity: { rating: 'bad', note: 'Industrial zone; heavy vehicles and shift cycles can add noise/traffic spikes.' },
    dailyConvenience: { rating: 'bad', note: 'Residential-style errands typically require travel outside the zone.' },
    greenOutdoor: { rating: 'bad', note: 'Hardscape-heavy; limited daily green space.' },
    crowdVibe: { rating: 'bad', note: 'Workforce-oriented; not a residential neighbourhood.' },
    longTermComfort: { rating: 'bad', note: 'Not a comfortable long-term residential environment.' },
  },

  'TURF CLUB': {
    noiseDensity: { rating: 'mixed', note: 'Mature north-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Sungei Kadut amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to north-west parks and connectors for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-west heartland living.' },
  },

  // Batch 18: Final missing neighbourhoods
  'TYERSALL': {
    noiseDensity: { rating: 'mixed', note: 'Central premium area; pockets can be quieter but arterial traffic is nearby.' },
    dailyConvenience: { rating: 'good', note: 'Excellent convenience around Orchard/central belt with premium amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Botanic Gardens and central greenery.' },
    crowdVibe: { rating: 'mixed', note: 'More affluent/expat city-lifestyle mix.' },
    longTermComfort: { rating: 'good', note: 'Comfortable if you value central convenience and premium amenities.' },
  },

  'ULU PANDAN': {
    noiseDensity: { rating: 'mixed', note: 'Mature central-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Bukit Timah amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central-west access with mature amenities.' },
  },

  'UPPER PAYA LEBAR': {
    noiseDensity: { rating: 'mixed', note: 'Mature northeast area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Serangoon amenities.' },
    greenOutdoor: { rating: 'mixed', note: 'Green pockets exist; larger parks require a short trip.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like northeast heartland living with mature amenities.' },
  },

  'VICTORIA': {
    noiseDensity: { rating: 'bad', note: 'City-fringe density + major roads; traffic noise is hard to avoid.' },
    dailyConvenience: { rating: 'good', note: 'Very convenient for food, transit, and daily services.' },
    greenOutdoor: { rating: 'bad', note: 'More hard-city fabric; greenery exists but not the "park next door" vibe.' },
    crowdVibe: { rating: 'mixed', note: 'Mix of local and renter crowd; busier streets.' },
    longTermComfort: { rating: 'mixed', note: 'Works well if you want convenience; less ideal if you prioritise quiet evenings.' },
  },

  'WATERWAY EAST': {
    noiseDensity: { rating: 'mixed', note: 'New-town density; noise clusters near schools and main roads, calmer in residential pockets.' },
    dailyConvenience: { rating: 'good', note: 'Designed for families: markets and good LRT connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Excellent outdoor access: Punggol Waterway, park connectors, and coastal routes.' },
    crowdVibe: { rating: 'good', note: 'Young families and active weekends; strong "new town" community feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable for family living if you value outdoor access and newer estate amenities.' },
  },

  'WENYA': {
    noiseDensity: { rating: 'mixed', note: 'Mature west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Jurong West amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to west-side parks and connectors for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like west heartland living with mature amenities.' },
  },

  'WEST COAST': {
    noiseDensity: { rating: 'mixed', note: 'Mature central-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Clementi amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to parks and connectors around the central-west belt.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central-west access with mature amenities.' },
  },

  'WOODGROVE': {
    noiseDensity: { rating: 'mixed', note: 'Mature north area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Woodlands amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Woodlands Waterfront Park and north-side greenery for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-side living and are OK with distance from CBD.' },
  },

  'WOODLEIGH': {
    noiseDensity: { rating: 'mixed', note: 'Mature central area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Toa Payoh amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Bishan-Ang Mo Kio Park and central-side park connectors.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central heartland living with mature amenities.' },
  },

  'XILIN': {
    noiseDensity: { rating: 'mixed', note: 'Mature east town; generally calm in residential blocks, busier near town centre and MRT.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-town convenience: markets, food courts, and excellent MRT connectivity.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Tampines Eco Green and east-side park connectors for walks and outdoor time.' },
    crowdVibe: { rating: 'good', note: 'Family-oriented heartland rhythm; stable daily life with good community feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like east heartland living with strong amenities and connectivity.' },
  },

  'YEW TEE': {
    noiseDensity: { rating: 'mixed', note: 'Mature north-west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Choa Chu Kang amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to north-west parks and connectors for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like north-west heartland living.' },
  },

  'YIO CHU KANG': {
    noiseDensity: { rating: 'mixed', note: 'Mature central area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Ang Mo Kio amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Bishan-Ang Mo Kio Park and central-side park connectors.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central heartland living with mature amenities.' },
  },

  'YIO CHU KANG EAST': {
    noiseDensity: { rating: 'mixed', note: 'Mature central area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Ang Mo Kio amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Bishan-Ang Mo Kio Park and central-side park connectors.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central heartland living with mature amenities.' },
  },

  'YIO CHU KANG NORTH': {
    noiseDensity: { rating: 'mixed', note: 'Mature central area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Ang Mo Kio amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Bishan-Ang Mo Kio Park and central-side park connectors.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central heartland living with mature amenities.' },
  },

  'YIO CHU KANG WEST': {
    noiseDensity: { rating: 'mixed', note: 'Mature central area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Ang Mo Kio amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Bishan-Ang Mo Kio Park and central-side park connectors.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like central heartland living with mature amenities.' },
  },

  'YUHUA EAST': {
    noiseDensity: { rating: 'mixed', note: 'Mature west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Jurong East amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Jurong Lake Gardens and west-side parks for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like west heartland living with mature amenities.' },
  },

  'YUHUA WEST': {
    noiseDensity: { rating: 'mixed', note: 'Mature west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Jurong East amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to Jurong Lake Gardens and west-side parks for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like west heartland living with mature amenities.' },
  },

  'YUNNAN': {
    noiseDensity: { rating: 'mixed', note: 'Mature west area; generally calm in residential blocks, busier near main roads.' },
    dailyConvenience: { rating: 'good', note: 'Strong mature-estate convenience; good access to Jurong West amenities.' },
    greenOutdoor: { rating: 'good', note: 'Good access to west-side parks and connectors for walks.' },
    crowdVibe: { rating: 'good', note: 'Stable family-oriented rhythm; mature estate feel.' },
    longTermComfort: { rating: 'good', note: 'Comfortable long-term if you like west heartland living with mature amenities.' },
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


