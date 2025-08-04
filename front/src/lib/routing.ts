import type { Location } from "@/types"

// OSRM API for real routing
const OSRM_BASE_URL = "https://router.project-osrm.org"

// Complete toll road entrance/exit points in Java Island
const TOLL_GATES = [
  // Jakarta & Surrounding (DKI Jakarta, Banten, West Java)
  { name: "Tol Jakarta-Cikampek KM 0", lat: -6.1751, lng: 106.8650, type: "entrance", region: "Jakarta" },
  { name: "Tol Jakarta-Cikampek KM 72", lat: -6.2088, lng: 107.4456, type: "exit", region: "Karawang" },
  { name: "Tol Jagorawi Cibubur", lat: -6.3751, lng: 106.8913, type: "entrance", region: "Jakarta" },
  { name: "Tol Jagorawi Bogor", lat: -6.5622, lng: 106.7999, type: "exit", region: "Bogor" },
  { name: "Tol Jakarta Outer Ring Road", lat: -6.2088, lng: 106.8456, type: "entrance", region: "Jakarta" },
  
  // Tangerang Area
  { name: "Tol Jakarta-Tangerang Karang Tengah", lat: -6.1781, lng: 106.6297, type: "entrance", region: "Tangerang" },
  { name: "Tol Serpong-Pamulang", lat: -6.3373, lng: 106.7042, type: "entrance", region: "Tangerang Selatan" },
  { name: "Tol BSD-Serpong", lat: -6.2751, lng: 106.6500, type: "entrance", region: "Tangerang Selatan" },
  
  // West Java Major Tolls
  { name: "Tol Cipali Cikampek", lat: -6.2088, lng: 107.4456, type: "entrance", region: "Karawang" },
  { name: "Tol Cipali Palimanan", lat: -6.7063, lng: 108.4271, type: "exit", region: "Cirebon" },
  { name: "Tol Cirebon-Kanci", lat: -6.7063, lng: 108.5571, type: "entrance", region: "Cirebon" },
  { name: "Tol Kanci-Pejagan", lat: -6.7560, lng: 109.0234, type: "entrance", region: "Brebes" },
  
  // Bandung Area
  { name: "Tol Padaleunyi Pasteur", lat: -6.8915, lng: 107.5707, type: "entrance", region: "Bandung" },
  { name: "Tol Padaleunyi Cileunyi", lat: -6.9175, lng: 107.7591, type: "exit", region: "Bandung" },
  { name: "Tol Purbaleunyi Padalarang", lat: -6.8373, lng: 107.4771, type: "entrance", region: "Bandung Barat" },
  { name: "Tol Purbaleunyi Cileunyi", lat: -6.9175, lng: 107.7591, type: "exit", region: "Bandung" },
  
  // Central Java
  { name: "Tol Pejagan-Pemalang", lat: -6.7560, lng: 109.0234, type: "entrance", region: "Brebes" },
  { name: "Tol Pemalang-Batang", lat: -6.9147, lng: 109.7425, type: "entrance", region: "Pemalang" },
  { name: "Tol Batang-Semarang", lat: -6.9147, lng: 109.7425, type: "entrance", region: "Batang" },
  { name: "Tol Semarang Barat", lat: -7.0051, lng: 110.3681, type: "exit", region: "Semarang" },
  { name: "Tol Semarang-Solo Bawen", lat: -7.2181, lng: 110.4031, type: "entrance", region: "Semarang" },
  { name: "Tol Semarang-Solo Kartasura", lat: -7.5563, lng: 110.7446, type: "exit", region: "Sukoharjo" },
  
  // Solo & Yogyakarta Area
  { name: "Tol Solo-Ngawi Sragen", lat: -7.4238, lng: 111.0042, type: "entrance", region: "Sragen" },
  { name: "Tol Solo-Ngawi Ngawi", lat: -7.4077, lng: 111.4463, type: "exit", region: "Ngawi" },
  { name: "Tol Yogya-Solo Prambanan", lat: -7.7520, lng: 110.4947, type: "entrance", region: "Sleman" },
  { name: "Tol Yogya-Solo Kartasura", lat: -7.5563, lng: 110.7446, type: "exit", region: "Sukoharjo" },
  
  // East Java
  { name: "Tol Ngawi-Kertosono", lat: -7.4077, lng: 111.4463, type: "entrance", region: "Ngawi" },
  { name: "Tol Kertosono-Mojokerto", lat: -7.4661, lng: 112.0362, type: "entrance", region: "Nganjuk" },
  { name: "Tol Mojokerto-Surabaya", lat: -7.4661, lng: 112.4362, type: "entrance", region: "Mojokerto" },
  { name: "Tol Surabaya Waru", lat: -7.3431, lng: 112.7297, type: "exit", region: "Surabaya" },
  
  // Surabaya Area
  { name: "Tol Surabaya-Gempol Waru", lat: -7.3431, lng: 112.7297, type: "entrance", region: "Surabaya" },
  { name: "Tol Surabaya-Gempol Gempol", lat: -7.5454, lng: 112.6275, type: "exit", region: "Pasuruan" },
  { name: "Tol Gempol-Malang", lat: -7.5454, lng: 112.6275, type: "entrance", region: "Pasuruan" },
  { name: "Tol Malang Singosari", lat: -7.9797, lng: 112.6304, type: "exit", region: "Malang" },
  
  // Gerbang Tol Lainnya - Akses ke Pelabuhan & Bandara
  { name: "Tol Soekarno Hatta Airport", lat: -6.1256, lng: 106.6558, type: "entrance", region: "Tangerang" },
  { name: "Tol Pelabuhan Tanjung Priok", lat: -6.1067, lng: 106.8808, type: "entrance", region: "Jakarta Utara" },
  { name: "Tol Pelabuhan Merak", lat: -5.9343, lng: 106.0176, type: "exit", region: "Banten" },
  
  // Regional Tolls
  { name: "Tol Bali Mandara Benoa", lat: -8.7675, lng: 115.1775, type: "entrance", region: "Denpasar" },
  { name: "Tol Bali Mandara Ngurah Rai", lat: -8.7467, lng: 115.1671, type: "exit", region: "Badung" },
]

export interface RouteResponse {
  coordinates: { lat: number; lng: number }[]
  distance: number // in kilometers
  duration: number // in minutes
  tollGates?: { name: string; lat: number; lng: number; type: 'entrance' | 'exit' }[] // toll gates used
  tollInfo?: string // readable toll info
}

// Find optimal toll gates for a route segment
const findOptimalTollRoute = (start: Location, end: Location): { entry: any, exit: any } => {
  let bestEntry = null
  let bestExit = null
  let bestScore = Infinity
  
  // Find best entry point near start
  const entrances = TOLL_GATES.filter(gate => gate.type === 'entrance')
  const exits = TOLL_GATES.filter(gate => gate.type === 'exit')
  
  entrances.forEach(entry => {
    exits.forEach(exit => {
      // Calculate total distance via toll
      const entryDistance = calculateDistance(start.lat, start.lng, entry.lat, entry.lng)
      const exitDistance = calculateDistance(end.lat, end.lng, exit.lat, exit.lng)
      const tollDistance = calculateDistance(entry.lat, entry.lng, exit.lat, exit.lng)
      
      // Skip if toll gates are too close to each other (< 20km)
      if (tollDistance < 20) return
      
      // Calculate score (prefer shorter detour but longer toll segment)
      const detourDistance = entryDistance + exitDistance
      const directDistance = calculateDistance(start.lat, start.lng, end.lat, end.lng)
      const score = detourDistance - (tollDistance * 0.3) // Favor longer toll segments
      
      // Only consider if total distance is reasonable
      if (entryDistance < 30 && exitDistance < 30 && tollDistance > directDistance * 0.5) {
        if (score < bestScore) {
          bestScore = score
          bestEntry = entry
          bestExit = exit
        }
      }
    })
  })
  
  return { entry: bestEntry, exit: bestExit }
}

// Create highway-focused route with intelligent toll selection
export const calculateRoute = async (
  departure: Location,
  stops: Location[],
  destination: Location,
): Promise<RouteResponse> => {
  try {
    const routePoints = [departure, ...stops, destination]
    const optimizedPoints: Location[] = []
    const usedTollGates: { name: string; lat: number; lng: number; type: 'entrance' | 'exit' }[] = []
    const tollSegments: string[] = []
    
    for (let i = 0; i < routePoints.length; i++) {
      const currentPoint = routePoints[i]
      const nextPoint = routePoints[i + 1]
      
      optimizedPoints.push(currentPoint)
      
      if (nextPoint) {
        const segmentDistance = calculateDistance(currentPoint.lat, currentPoint.lng, nextPoint.lat, nextPoint.lng)
        
        // Use toll roads for segments > 40km
        if (segmentDistance > 40) {
          const { entry, exit } = findOptimalTollRoute(currentPoint, nextPoint)
          
          if (entry && exit) {
            // Add entry point
            const entryPoint = {
              name: `🎫 ${entry.name}`,
              lat: entry.lat,
              lng: entry.lng
            }
            optimizedPoints.push(entryPoint)
            usedTollGates.push({ ...entry, type: 'entrance' })
            
            // Add exit point
            const exitPoint = {
              name: `🚪 ${exit.name}`,
              lat: exit.lat,
              lng: exit.lng
            }
            optimizedPoints.push(exitPoint)
            usedTollGates.push({ ...exit, type: 'exit' })
            
            tollSegments.push(`${entry.region} → ${exit.region}`)
            
            console.log(`🛣️ Toll route: ${entry.name} → ${exit.name}`)
          }
        }
      }
    }
    
    // Build waypoints string for OSRM
    const waypoints = optimizedPoints.map((point) => `${point.lng},${point.lat}`).join(";")
    
    console.log("🛣️ Optimized route with", optimizedPoints.length, "waypoints")
    console.log("🎫 Toll segments:", tollSegments.join(", "))

    const response = await fetch(
      `${OSRM_BASE_URL}/route/v1/driving/${waypoints}?overview=full&geometries=geojson&annotations=true`
    )

    if (!response.ok) {
      throw new Error("Failed to calculate optimized toll route")
    }

    const data = await response.json()

    if (!data.routes || data.routes.length === 0) {
      throw new Error("No route found")
    }

    const route = data.routes[0]
    const routeCoordinates = route.geometry.coordinates.map((coord: [number, number]) => ({
      lat: coord[1],
      lng: coord[0],
    }))

    const tollInfo = tollSegments.length > 0 
      ? `Via toll: ${tollSegments.join(", ")} (${usedTollGates.length} gates)`
      : "Direct route (no toll roads)"

    return {
      coordinates: routeCoordinates,
      distance: route.distance / 1000, // Convert to kilometers
      duration: Math.round(route.duration / 60), // Convert to minutes
      tollGates: usedTollGates,
      tollInfo: tollInfo,
    }
  } catch (error) {
    console.error("Error calculating optimized route:", error)
    return calculateEnhancedFallbackRoute(departure, stops, destination)
  }
}

// Enhanced fallback route with better toll selection
const calculateEnhancedFallbackRoute = (departure: Location, stops: Location[], destination: Location): RouteResponse => {
  const allPoints = [departure, ...stops, destination]
  const coordinates: { lat: number; lng: number }[] = []
  let totalDistance = 0
  const usedTollGates: { name: string; lat: number; lng: number; type: 'entrance' | 'exit' }[] = []
  const tollSegments: string[] = []

  for (let i = 0; i < allPoints.length - 1; i++) {
    const start = allPoints[i]
    const end = allPoints[i + 1]
    const segmentDistance = calculateDistance(start.lat, start.lng, end.lat, end.lng)
    totalDistance += segmentDistance

    if (segmentDistance > 40) {
      const { entry, exit } = findOptimalTollRoute(start, end)
      
      if (entry && exit) {
        usedTollGates.push({ ...entry, type: 'entrance' }, { ...exit, type: 'exit' })
        tollSegments.push(`${entry.region} → ${exit.region}`)
        
        // Generate route: start → toll entry → toll exit → end
        const segments = [
          { from: start, to: { name: entry.name, lat: entry.lat, lng: entry.lng } },
          { from: { name: entry.name, lat: entry.lat, lng: entry.lng }, to: { name: exit.name, lat: exit.lat, lng: exit.lng } },
          { from: { name: exit.name, lat: exit.lat, lng: exit.lng }, to: end }
        ]
        
        segments.forEach((segment, segIndex) => {
          // More points for highway segments (smoother animation)
          const pointCount = segIndex === 1 ? 40 : 20 // Highway segment gets more points
          for (let j = 0; j <= pointCount; j++) {
            const ratio = j / pointCount
            coordinates.push({
              lat: segment.from.lat + (segment.to.lat - segment.from.lat) * ratio,
              lng: segment.from.lng + (segment.to.lng - segment.from.lng) * ratio,
            })
          }
        })
      } else {
        // Direct route for segments without suitable toll roads
        for (let j = 0; j <= 25; j++) {
          const ratio = j / 25
          coordinates.push({
            lat: start.lat + (end.lat - start.lat) * ratio,
            lng: start.lng + (end.lng - start.lng) * ratio,
          })
        }
      }
    } else {
      // Direct route for short distances
      for (let j = 0; j <= 20; j++) {
        const ratio = j / 20
        coordinates.push({
          lat: start.lat + (end.lat - start.lat) * ratio,
          lng: start.lng + (end.lng - start.lng) * ratio,
        })
      }
    }
  }

  // Realistic highway speed calculation
  const avgSpeed = usedTollGates.length > 0 ? 75 : 50 // Highway vs regular roads
  const estimatedDuration = Math.round((totalDistance / avgSpeed) * 60)
  
  const tollInfo = tollSegments.length > 0 
    ? `Via toll: ${tollSegments.join(", ")} (${usedTollGates.length} gates)`
    : "Direct route (no toll roads)"

  console.log("🛣️ Enhanced fallback route:", {
    distance: totalDistance.toFixed(1) + "km",
    duration: estimatedDuration + " minutes",
    tollInfo: tollInfo
  })

  return {
    coordinates,
    distance: totalDistance,
    duration: estimatedDuration,
    tollGates: usedTollGates,
    tollInfo: tollInfo,
  }
}

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180)
}