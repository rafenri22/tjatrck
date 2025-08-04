import type { Location } from "@/types"

// OSRM API for real routing
const OSRM_BASE_URL = "https://router.project-osrm.org"

// Toll road entrance/exit points in Java (major highways)
const TOLL_GATES = [
  // Jakarta area
  { name: "Tol Cikampek", lat: -6.2088, lng: 106.8456, type: "entrance" },
  { name: "Tol Jagorawi", lat: -6.5622, lng: 106.7999, type: "entrance" },
  { name: "Tol Tangerang", lat: -6.1781, lng: 106.6297, type: "entrance" },
  
  // West Java
  { name: "Tol Cipali", lat: -6.7368, lng: 108.2127, type: "entrance" },
  { name: "Tol Cirebon", lat: -6.7368, lng: 108.5571, type: "entrance" },
  { name: "Tol Padaleunyi", lat: -6.9175, lng: 107.6191, type: "entrance" },
  
  // Central Java
  { name: "Tol Batang-Semarang", lat: -6.9147, lng: 109.7425, type: "entrance" },
  { name: "Tol Semarang-Solo", lat: -7.0051, lng: 110.4381, type: "entrance" },
  { name: "Tol Madiun-Ngawi", lat: -7.6298, lng: 111.5239, type: "entrance" },
  
  // East Java
  { name: "Tol Surabaya-Mojokerto", lat: -7.4661, lng: 112.4362, type: "entrance" },
  { name: "Tol Surabaya-Gempol", lat: -7.3554, lng: 112.6275, type: "entrance" },
  { name: "Tol Malang", lat: -7.9797, lng: 112.6304, type: "entrance" },
]

export interface RouteResponse {
  coordinates: { lat: number; lng: number }[]
  distance: number // in kilometers
  duration: number // in minutes
  tollGates?: { name: string; lat: number; lng: number }[] // toll gates used
}

// Find nearest toll gate to a location
const findNearestTollGate = (location: Location): { name: string; lat: number; lng: number } => {
  let nearest = TOLL_GATES[0]
  let shortestDistance = calculateDistance(location.lat, location.lng, nearest.lat, nearest.lng)
  
  TOLL_GATES.forEach(gate => {
    const distance = calculateDistance(location.lat, location.lng, gate.lat, gate.lng)
    if (distance < shortestDistance) {
      shortestDistance = distance
      nearest = gate
    }
  })
  
  return nearest
}

// Create highway-focused route with toll preference
export const calculateRoute = async (
  departure: Location,
  stops: Location[],
  destination: Location,
): Promise<RouteResponse> => {
  try {
    // Find optimal toll routing strategy
    const routePoints = [departure, ...stops, destination]
    const tollOptimizedPoints: Location[] = []
    const usedTollGates: { name: string; lat: number; lng: number }[] = []
    
    for (let i = 0; i < routePoints.length; i++) {
      const currentPoint = routePoints[i]
      const nextPoint = routePoints[i + 1]
      
      tollOptimizedPoints.push(currentPoint)
      
      if (nextPoint) {
        const distance = calculateDistance(currentPoint.lat, currentPoint.lng, nextPoint.lat, nextPoint.lng)
        
        // If distance > 50km, use toll roads
        if (distance > 50) {
          // Find nearest toll entrance to current point
          const tollEntrance = findNearestTollGate(currentPoint)
          
          // Find nearest toll exit to next point
          const tollExit = findNearestTollGate(nextPoint)
          
          // Only add toll points if they're not too close to start/end points
          const entranceDistance = calculateDistance(currentPoint.lat, currentPoint.lng, tollEntrance.lat, tollEntrance.lng)
          const exitDistance = calculateDistance(nextPoint.lat, nextPoint.lng, tollExit.lat, tollExit.lng)
          
          if (entranceDistance > 5) { // 5km threshold
            tollOptimizedPoints.push({
              name: `Entry ${tollEntrance.name}`,
              lat: tollEntrance.lat,
              lng: tollEntrance.lng
            })
            usedTollGates.push(tollEntrance)
          }
          
          if (exitDistance > 5 && tollEntrance.name !== tollExit.name) {
            tollOptimizedPoints.push({
              name: `Exit ${tollExit.name}`,
              lat: tollExit.lat,
              lng: tollExit.lng
            })
            usedTollGates.push(tollExit)
          }
        }
      }
    }
    
    // Build waypoints string for OSRM with toll-optimized points
    const waypoints = tollOptimizedPoints.map((point) => `${point.lng},${point.lat}`).join(";")
    
    console.log("🛣️ Using toll-optimized route with", tollOptimizedPoints.length, "waypoints")
    console.log("🎫 Toll gates:", usedTollGates.map(g => g.name).join(", "))

    const response = await fetch(
      `${OSRM_BASE_URL}/route/v1/driving/${waypoints}?overview=full&geometries=geojson&annotations=true`
    )

    if (!response.ok) {
      throw new Error("Failed to calculate toll-optimized route")
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

    return {
      coordinates: routeCoordinates,
      distance: route.distance / 1000, // Convert to kilometers
      duration: Math.round(route.duration / 60), // Convert to minutes
      tollGates: usedTollGates,
    }
  } catch (error) {
    console.error("Error calculating toll route:", error)

    // Fallback: enhanced route with highway preference
    return calculateHighwayFallbackRoute(departure, stops, destination)
  }
}

// Enhanced fallback route calculation with highway preference
const calculateHighwayFallbackRoute = (departure: Location, stops: Location[], destination: Location): RouteResponse => {
  const allPoints = [departure, ...stops, destination]
  const coordinates: { lat: number; lng: number }[] = []
  let totalDistance = 0
  const usedTollGates: { name: string; lat: number; lng: number }[] = []

  // Generate enhanced interpolated points with highway routing simulation
  for (let i = 0; i < allPoints.length - 1; i++) {
    const start = allPoints[i]
    const end = allPoints[i + 1]

    // Calculate distance between points
    const segmentDistance = calculateDistance(start.lat, start.lng, end.lat, end.lng)
    totalDistance += segmentDistance

    // For long distances, simulate highway routing
    if (segmentDistance > 50) {
      const tollEntry = findNearestTollGate(start)
      const tollExit = findNearestTollGate(end)
      
      usedTollGates.push(tollEntry, tollExit)
      
      // Route via toll gates: start -> toll entry -> toll exit -> end
      const segments = [
        { from: start, to: { name: tollEntry.name, lat: tollEntry.lat, lng: tollEntry.lng } },
        { from: { name: tollEntry.name, lat: tollEntry.lat, lng: tollEntry.lng }, to: { name: tollExit.name, lat: tollExit.lat, lng: tollExit.lng } },
        { from: { name: tollExit.name, lat: tollExit.lat, lng: tollExit.lng }, to: end }
      ]
      
      segments.forEach(segment => {
        // Generate more points for highway segments (smoother animation)
        const points = segment.from.name?.includes("Tol") || segment.to.name?.includes("Tol") ? 30 : 15
        for (let j = 0; j <= points; j++) {
          const ratio = j / points
          coordinates.push({
            lat: segment.from.lat + (segment.to.lat - segment.from.lat) * ratio,
            lng: segment.from.lng + (segment.to.lng - segment.from.lng) * ratio,
          })
        }
      })
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

  // Highway speed estimate: 70-80 km/h average
  const highwaySpeed = 75
  const estimatedDuration = Math.round((totalDistance / highwaySpeed) * 60)

  console.log("🛣️ Fallback highway route:", {
    distance: totalDistance.toFixed(1) + "km",
    duration: estimatedDuration + " minutes",
    tollGates: usedTollGates.length
  })

  return {
    coordinates,
    distance: totalDistance,
    duration: estimatedDuration,
    tollGates: usedTollGates,
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