import type { Location } from "@/types"

// OSRM API for real routing
const OSRM_BASE_URL = "https://router.project-osrm.org"

export interface RouteResponse {
  coordinates: { lat: number; lng: number }[]
  distance: number // in kilometers
  duration: number // in minutes
}

export const calculateRoute = async (
  departure: Location,
  stops: Location[],
  destination: Location,
): Promise<RouteResponse> => {
  try {
    // Build waypoints string for OSRM
    const allPoints = [departure, ...stops, destination]
    const waypoints = allPoints.map((point) => `${point.lng},${point.lat}`).join(";")

    const response = await fetch(`${OSRM_BASE_URL}/route/v1/driving/${waypoints}?overview=full&geometries=geojson`)

    if (!response.ok) {
      throw new Error("Failed to calculate route")
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
    }
  } catch (error) {
    console.error("Error calculating route:", error)

    // Fallback: simple straight line interpolation
    return calculateFallbackRoute(departure, stops, destination)
  }
}

// Fallback route calculation using simple interpolation
const calculateFallbackRoute = (departure: Location, stops: Location[], destination: Location): RouteResponse => {
  const allPoints = [departure, ...stops, destination]
  const coordinates: { lat: number; lng: number }[] = []
  let totalDistance = 0

  // Generate interpolated points between each waypoint
  for (let i = 0; i < allPoints.length - 1; i++) {
    const start = allPoints[i]
    const end = allPoints[i + 1]

    // Calculate distance between points
    const segmentDistance = calculateDistance(start.lat, start.lng, end.lat, end.lng)
    totalDistance += segmentDistance

    // Generate 20 interpolated points for smooth animation
    for (let j = 0; j <= 20; j++) {
      const ratio = j / 20
      coordinates.push({
        lat: start.lat + (end.lat - start.lat) * ratio,
        lng: start.lng + (end.lng - start.lng) * ratio,
      })
    }
  }

  // Estimate duration based on average speed of 50 km/h
  const estimatedDuration = Math.round((totalDistance / 50) * 60)

  return {
    coordinates,
    distance: totalDistance,
    duration: estimatedDuration,
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
