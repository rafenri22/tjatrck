"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Bus, Trip, BusLocation } from "@/types"
import { GARAGE_LOCATION } from "@/lib/tracking"

// Fix for default markers
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface BusMapProps {
  buses: Bus[]
  trips: Trip[]
  busLocations: BusLocation[]
  onBusClick?: (bus: Bus, trip?: Trip) => void
  showControls?: boolean
  autoFit?: boolean
}

// Format elapsed time for display - FIXED to use actual elapsed time
const formatElapsedTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

// Generate parking positions around garage
const generateParkingPositions = (centerLat: number, centerLng: number, count: number) => {
  const positions = []
  const radius = 0.002 // Radius in degrees (approximately 200 meters)
  const angleStep = (2 * Math.PI) / Math.max(count, 1)
  for (let i = 0; i < count; i++) {
    const angle = i * angleStep
    const lat = centerLat + radius * Math.cos(angle)
    const lng = centerLng + radius * Math.sin(angle)
    positions.push({ lat, lng })
  }
  return positions
}

export default function BusMap({
  buses,
  trips,
  busLocations,
  onBusClick,
  showControls = false,
  autoFit = false,
}: BusMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map centered on Java Island instead of garage
    const javaCenter = [-7.5, 110.0] // Center of Java Island
    const map = L.map(mapRef.current, {
      center: javaCenter as [number, number],
      zoom: window.innerWidth < 768 ? 7 : 8, // Zoom to show Java Island
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true,
      touchZoom: true,
      boxZoom: true,
      keyboard: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map)

    // Add garage marker with responsive width
    const garageIcon = L.divIcon({
      html: `
        <div class="relative">
          <div class="bg-gray-600 text-white rounded-lg px-2 py-1 text-xs font-bold shadow-lg border-2 border-white whitespace-nowrap max-w-[140px] truncate">
            🏢 ${GARAGE_LOCATION.name}
          </div>
        </div>
      `,
      className: "garage-marker",
      iconSize: [140, 24],
      iconAnchor: [70, 12],
    })

    const activeBuses = buses.filter((b) => b.is_active).length
    const inGarage = buses.length - activeBuses
    L.marker([GARAGE_LOCATION.lat, GARAGE_LOCATION.lng], { icon: garageIcon })
      .bindPopup(`
        <div class="p-3 min-w-[200px]">
          <h3 class="font-bold text-lg mb-2">🏢 ${GARAGE_LOCATION.name}</h3>
          <div class="space-y-1 text-sm">
            <p><strong>Total Buses:</strong> ${buses.length}</p>
            <p><strong>In Garage:</strong> ${inGarage}</p>
            <p><strong>On Trip:</strong> ${activeBuses}</p>
          </div>
        </div>
      `)
      .addTo(map)

    mapInstanceRef.current = map
    initializedRef.current = true

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        initializedRef.current = false
      }
    }
  }, [buses.length])

  useEffect(() => {
    if (!mapInstanceRef.current || !initializedRef.current) return

    const map = mapInstanceRef.current
    const markers = markersRef.current

    // Clear existing bus markers
    markers.forEach((marker) => map.removeLayer(marker))
    markers.clear()

    // Add markers for active buses (on trip) - FIXED with proper elapsed time sync
    busLocations.forEach((location) => {
      const trip = trips.find((t) => t.id === location.trip_id)
      const bus = buses.find((b) => b.id === location.bus_id)
      if (!trip || !bus) return

      // Calculate actual elapsed time from trip start time and backend sync
      let elapsedMinutes = 0
      if (trip.start_time) {
        const startTime = new Date(trip.start_time).getTime()
        const currentTime = Date.now()
        elapsedMinutes = Math.floor((currentTime - startTime) / (1000 * 60))
      }
      
      // Use backend elapsed time if available (more accurate)
      if (location.elapsed_time_minutes !== undefined && location.elapsed_time_minutes > 0) {
        elapsedMinutes = location.elapsed_time_minutes
      }

      const elapsedTime = formatElapsedTime(elapsedMinutes)

      // Bus icon for active buses with zoom-responsive size
      const busIcon = L.divIcon({
        html: `
          <div class="relative bus-marker-container" style="transform-origin: center; will-change: transform;">
            <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 rounded px-2 py-1 text-xs font-bold shadow-md whitespace-nowrap border max-w-24 truncate">
              ${bus.nickname}
            </div>
            <div class="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white cursor-pointer hover:bg-blue-700 transition-colors">
              <div class="text-lg">🚌</div>
            </div>
            <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white rounded-full px-2 py-1 text-xs font-bold whitespace-nowrap">
              ${elapsedTime}
            </div>
          </div>
        `,
        className: "custom-bus-marker zoom-responsive",
        iconSize: [56, 56],
        iconAnchor: [28, 28],
      })

      // Update popup content for active buses - FIXED photo display
      const marker = L.marker([location.lat, location.lng], { icon: busIcon })
        .bindPopup(`
          <div class="p-3 min-w-[250px]">
            <div class="flex items-center gap-3 mb-3">
              ${
                bus.photo_url
                  ? `
                <div class="w-16 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src="${bus.photo_url}" alt="${bus.nickname}" class="w-full h-full object-cover"
                        onload="this.style.display='block'"
                        onerror="this.parentElement.innerHTML='<div class=\\'w-16 h-12 rounded bg-gray-200 flex items-center justify-center\\'>No Photo</div>'"
                       style="display:none">
                </div>
              `
                  : `
                <div class="w-16 h-12 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <span class="text-gray-400 text-xs">No Photo</span>
                </div>
              `
              }
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-lg truncate">${bus.nickname}</h3>
                <p class="text-sm text-gray-500">${bus.code}</p>
              </div>
            </div>
            <div class="space-y-1 text-sm">
              <p><strong>Driver:</strong> ${bus.crew}</p>
              <p><strong>Speed:</strong> ${trip.speed} km/h</p>
              <p><strong>Progress:</strong> ${location.progress.toFixed(1)}%</p>
              <p><strong>Travel Time:</strong> ${elapsedTime}</p>
              <p><strong>From:</strong> ${trip.departure.name}</p>
              <p><strong>To:</strong> ${trip.destination.name}</p>
            </div>
            ${
              showControls
                ? `
              <div class="mt-3 pt-2 border-t">
                <button onclick="window.showBusDetails('${bus.id}', '${trip.id}')" class="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                  View Details
                </button>
              </div>
            `
                : ""
            }
          </div>
        `)
        .addTo(map)

      // Add click handler for active buses
      if (onBusClick) {
        marker.on("click", () => {
          onBusClick(bus, trip)
        })
      }

      markers.set(location.bus_id, marker)
    })

    // Add parked buses at garage - FIXED click handler
    const parkedBuses = buses.filter((bus) => !bus.is_active)
    if (parkedBuses.length > 0) {
      const parkingPositions = generateParkingPositions(GARAGE_LOCATION.lat, GARAGE_LOCATION.lng, parkedBuses.length)
      parkedBuses.forEach((bus, index) => {
        const position = parkingPositions[index] || { lat: GARAGE_LOCATION.lat, lng: GARAGE_LOCATION.lng }

        // Parked bus icon with zoom-responsive size
        const parkedBusIcon = L.divIcon({
          html: `
            <div class="relative bus-marker-container" style="transform-origin: center; will-change: transform;">
              <div class="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 rounded px-1 py-0.5 text-xs font-bold shadow-md whitespace-nowrap border max-w-20 truncate">
                ${bus.nickname}
              </div>
              <div class="bg-gray-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white cursor-pointer hover:bg-gray-600 transition-colors">
                <div class="text-sm">🚌</div>
              </div>
            </div>
          `,
          className: "parked-bus-marker zoom-responsive",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        })

        const parkedMarker = L.marker([position.lat, position.lng], { icon: parkedBusIcon })
          .bindPopup(`
            <div class="p-3 min-w-[200px]">
              <div class="flex items-center gap-3 mb-3">
                ${
                  bus.photo_url
                    ? `
                  <div class="w-16 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src="${bus.photo_url}" alt="${bus.nickname}" class="w-full h-full object-cover"
                         onload="this.style.display='block'"
                         onerror="this.parentElement.innerHTML='<div class=\\'w-16 h-12 rounded bg-gray-200 flex items-center justify-center\\'>No Photo</div>'"
                         style="display:none">
                  </div>
                `
                    : `
                  <div class="w-16 h-12 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span class="text-gray-400 text-xs">No Photo</span>
                  </div>
                `
                }
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-lg truncate">${bus.nickname}</h3>
                  <p class="text-sm text-gray-500">${bus.code}</p>
                </div>
              </div>
              <div class="space-y-1 text-sm">
                <p><strong>Driver:</strong> ${bus.crew}</p>
                <p><strong>Status:</strong> <span class="text-gray-600">Parked at ${GARAGE_LOCATION.name}</span></p>
                <p><strong>Location:</strong> <span class="text-green-600">Ready for Trip</span></p>
              </div>
              ${
                showControls
                  ? `
                <div class="mt-3 pt-2 border-t">
                  <button onclick="window.showParkedBusDetails('${bus.id}')" class="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700">
                    View Details
                  </button>
                </div>
              `
                  : ""
              }
            </div>
          `)
          .addTo(map)

        // FIXED: Proper click handler for parked buses
        if (onBusClick) {
          parkedMarker.on("click", (e) => {
            // Prevent event bubbling
            L.DomEvent.stopPropagation(e)
            onBusClick(bus) // No trip for parked buses
          })
        }

        markers.set(`parked_${bus.id}`, parkedMarker)
      })
    }

    // Only auto-fit if explicitly requested and there are active buses
    if (autoFit && busLocations.length > 0) {
      const activeMarkers = Array.from(markers.values()).filter((marker, index) => 
        index < busLocations.length // Only active bus markers
      )
      if (activeMarkers.length > 0) {
        const group = new L.FeatureGroup(activeMarkers)
        map.fitBounds(group.getBounds().pad(0.1))
      }
    }

    // Global functions for popup buttons
    if (showControls) {
      // For active buses
      ;(window as unknown as { showBusDetails: (busId: string, tripId: string) => void }).showBusDetails = (
        busId: string,
        tripId: string,
      ) => {
        const bus = buses.find((b) => b.id === busId)
        const trip = trips.find((t) => t.id === tripId)
        if (bus && trip && onBusClick) {
          onBusClick(bus, trip)
        }
      }
      // For parked buses
      ;(window as unknown as { showParkedBusDetails: (busId: string) => void }).showParkedBusDetails = (
        busId: string,
      ) => {
        const bus = buses.find((b) => b.id === busId)
        if (bus && onBusClick) {
          onBusClick(bus) // No trip for parked buses
        }
      }
    }

    // Add zoom event listener to control icon scaling
    map.on("zoomend", () => {
      const zoom = map.getZoom()
      const scale = Math.max(0.5, Math.min(1.5, zoom / 12)) // Scale between 0.5x and 1.5x based on zoom level
      // Apply scaling to all bus markerss
      const busMarkers = document.querySelectorAll(".bus-marker-container")
      busMarkers.forEach((marker) => {
        ;(marker as HTMLElement).style.transform = `scale(${scale})`
      })
    })
  }, [busLocations, trips, buses, onBusClick, showControls, autoFit])

  return <div ref={mapRef} className="w-full h-full" style={{ minHeight: "400px" }} />
}