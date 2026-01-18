'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface Neighbourhood {
  id: string
  name: string
  bbox?: number[] | null
  center?: { lat: number; lng: number } | null
  summary?: {
    median_price_12m: number | null
    avg_floor_area_12m?: number | null
    median_lease_years_12m: number | null
  } | null
  planning_area?: {
    name: string
  } | null
  display_flat_type?: string
}

interface NeighbourhoodMapProps {
  neighbourhoods: Neighbourhood[]
  selectedFlatType?: string
}

// Component to fit map bounds based on neighbourhoods
function MapBounds({ neighbourhoods }: { neighbourhoods: Neighbourhood[] }) {
  const map = useMap()

  useEffect(() => {
    const validPoints: [number, number][] = []
    
    neighbourhoods.forEach(n => {
      if (!n.bbox) return
      
      let minLng: number, minLat: number, maxLng: number, maxLat: number
      
      if (Array.isArray(n.bbox) && n.bbox.length >= 4) {
        [minLng, minLat, maxLng, maxLat] = n.bbox
      } else if (n.bbox && typeof n.bbox === 'object' && !Array.isArray(n.bbox) &&
                 'minLng' in n.bbox && 'minLat' in n.bbox &&
                 'maxLng' in n.bbox && 'maxLat' in n.bbox) {
        minLng = (n.bbox as any).minLng
        minLat = (n.bbox as any).minLat
        maxLng = (n.bbox as any).maxLng
        maxLat = (n.bbox as any).maxLat
      } else {
        return
      }
      
      // Validate coordinates and add corner points
      if (typeof minLng === 'number' && typeof minLat === 'number' && 
          typeof maxLng === 'number' && typeof maxLat === 'number') {
        validPoints.push([minLat, minLng], [maxLat, maxLng])
      }
    })

    if (validPoints.length > 0) {
      const bounds = L.latLngBounds(validPoints)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 })
    } else {
      // Default to Singapore center if no bounds
      map.setView([1.3521, 103.8198], 11)
    }
  }, [neighbourhoods, map])

  return null
}

export default function NeighbourhoodMap({ neighbourhoods, selectedFlatType }: NeighbourhoodMapProps) {
  // Calculate center points from bbox for markers
  // bbox can be array [minLng, minLat, maxLng, maxLat] or object {minLng, minLat, maxLng, maxLat}
  const getCenter = (bbox: any): [number, number] | null => {
    if (!bbox) return null
    
    let minLng: number, minLat: number, maxLng: number, maxLat: number
    
    if (Array.isArray(bbox) && bbox.length >= 4) {
      [minLng, minLat, maxLng, maxLat] = bbox as [number, number, number, number]
    } else if (typeof bbox === 'object') {
      // Try object format
      if (bbox.minLng !== undefined && bbox.minLat !== undefined && 
          bbox.maxLng !== undefined && bbox.maxLat !== undefined) {
        minLng = bbox.minLng
        minLat = bbox.minLat
        maxLng = bbox.maxLng
        maxLat = bbox.maxLat
      } else {
        return null
      }
    } else {
      return null
    }
    
    // Validate coordinates
    if (typeof minLng !== 'number' || typeof minLat !== 'number' || 
        typeof maxLng !== 'number' || typeof maxLat !== 'number') {
      return null
    }
    
    const centerLat = (minLat + maxLat) / 2
    const centerLng = (minLng + maxLng) / 2
    
    // Validate center coordinates (Singapore bounds approximately)
    if (centerLat < 1.1 || centerLat > 1.5 || centerLng < 103.5 || centerLng > 104.1) {
      console.warn('Invalid bbox coordinates:', bbox, 'for center:', [centerLat, centerLng])
      return null
    }
    
    return [centerLat, centerLng]
  }

  const formatCurrency = (amount: number | null): string => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Debug: log neighbourhood data
  useEffect(() => {
    console.log('Map: neighbourhoods data:', {
      count: neighbourhoods.length,
      sample: neighbourhoods.slice(0, 3).map(n => ({
        name: n.name,
        hasBbox: !!n.bbox,
        hasCenter: !!n.center,
        center: n.center,
        bbox: n.bbox,
        bboxType: typeof n.bbox,
        isArray: Array.isArray(n.bbox)
      }))
    })
    
    const validCenters = neighbourhoods
      .map(n => {
        // Try center first
        let center: [number, number] | null = null
        if (n.center && n.center.lat && n.center.lng) {
          center = [n.center.lat, n.center.lng]
        } else {
          center = getCenter(n.bbox)
        }
        return { name: n.name, center, bbox: n.bbox, hasCenter: !!n.center }
      })
      .filter(n => n.center !== null)
    console.log('Map: valid centers:', validCenters.length, 'out of', neighbourhoods.length)
    if (validCenters.length === 0 && neighbourhoods.length > 0) {
      console.warn('Map: No valid centers found. Sample data:', neighbourhoods.slice(0, 2))
    }
  }, [neighbourhoods])

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={[1.3521, 103.8198]} // Singapore center
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds neighbourhoods={neighbourhoods} />
        
        {neighbourhoods.map((neighbourhood) => {
          // Try center first, then calculate from bbox
          let center: [number, number] | null = null
          if (neighbourhood.center && neighbourhood.center.lat && neighbourhood.center.lng) {
            center = [neighbourhood.center.lat, neighbourhood.center.lng]
          } else if (neighbourhood.bbox) {
            center = getCenter(neighbourhood.bbox)
          }
          
          if (!center) {
            console.warn('Map: No center for neighbourhood:', neighbourhood.name, {
              hasCenter: !!neighbourhood.center,
              center: neighbourhood.center,
              hasBbox: !!neighbourhood.bbox,
              bbox: neighbourhood.bbox
            })
            return null
          }

          const displayFlatType = neighbourhood.display_flat_type || selectedFlatType
          const price = neighbourhood.summary?.median_price_12m
          const area = neighbourhood.summary?.avg_floor_area_12m
          const lease = neighbourhood.summary?.median_lease_years_12m

          return (
            <Marker key={neighbourhood.id} position={center}>
              <Tooltip permanent={true} direction="top" offset={[0, -10]} opacity={0.9}>
                <span className="font-semibold text-gray-900 text-sm">{neighbourhood.name}</span>
              </Tooltip>
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-semibold text-gray-900 mb-2">{neighbourhood.name}</h3>
                  {neighbourhood.planning_area && (
                    <p className="text-xs text-gray-500 mb-2">{neighbourhood.planning_area.name}</p>
                  )}
                  {displayFlatType && displayFlatType !== 'All' && (
                    <span className="inline-block text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2">
                      {displayFlatType}
                    </span>
                  )}
                  {price && (
                    <div className="text-sm text-gray-700 mt-2">
                      <strong>Price:</strong> {formatCurrency(price)}
                    </div>
                  )}
                  {area && (
                    <div className="text-sm text-gray-700">
                      <strong>Area:</strong> {area.toFixed(1)} m²
                    </div>
                  )}
                  {lease && (
                    <div className="text-sm text-gray-700">
                      <strong>Lease:</strong> {lease.toFixed(1)} years
                    </div>
                  )}
                  <Link
                    href={`/neighbourhood/${neighbourhood.id}${displayFlatType && displayFlatType !== 'All' ? `?flat_type=${displayFlatType}` : ''}`}
                    className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View details →
                  </Link>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

