"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, MapPin, Search, Loader2 } from "lucide-react"
import type { Location } from "@/types"

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void
  onClose: () => void
  title?: string
}

interface SearchResult {
  display_name: string
  lat: string
  lon: string
  place_id: string
  type: string
  importance: number
  address?: {
    road?: string
    suburb?: string
    city?: string
    state?: string
    postcode?: string
  }
}

// Jakarta landmarks for quick selection
const JAKARTA_LANDMARKS: Location[] = [
  { name: "Terminal Kampung Rambutan", lat: -6.2615, lng: 106.8776 },
  { name: "Terminal Lebak Bulus", lat: -6.2891, lng: 106.7749 },
  { name: "Terminal Pulogadung", lat: -6.1951, lng: 106.8997 },
  { name: "Terminal Kalideres", lat: -6.1385, lng: 106.7297 },
  { name: "Terminal Blok M", lat: -6.2441, lng: 106.7991 },
  { name: "Terminal Senen", lat: -6.1744, lng: 106.8456 },
  { name: "Pasar Minggu", lat: -6.2476, lng: 106.8649 },
  { name: "Fatmawati", lat: -6.2383, lng: 106.8226 },
  { name: "Pondok Indah", lat: -6.2661, lng: 106.7834 },
  { name: "Cawang", lat: -6.2146, lng: 106.8649 },
  { name: "Semanggi", lat: -6.2088, lng: 106.8226 },
  { name: "Tomang", lat: -6.1744, lng: 106.7834 },
  { name: "Gambir", lat: -6.1754, lng: 106.8272 },
  { name: "Thamrin", lat: -6.1944, lng: 106.8229 },
  { name: "Sudirman", lat: -6.2088, lng: 106.8229 },
  { name: "Kuningan", lat: -6.2297, lng: 106.8308 },
  { name: "Menteng", lat: -6.1944, lng: 106.8272 },
  { name: "Kemayoran", lat: -6.1598, lng: 106.8456 },
  { name: "Kelapa Gading", lat: -6.1598, lng: 106.9056 },
  { name: "Pluit", lat: -6.1167, lng: 106.7834 },
]

export default function LocationPicker({ onLocationSelect, onClose, title = "Select Location" }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [locationName, setLocationName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<"landmarks" | "search">("landmarks")

  const filteredLandmarks = JAKARTA_LANDMARKS.filter((landmark) =>
    landmark.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Real-time search as user types (like Google Maps)
  const performSearch = useCallback(
    async (query: string) => {
      if (query.length < 2) return
      setIsSearching(true)
      try {
        // Multiple search strategies for better results
        const searches = [
          // Primary search with Indonesia focus
          fetch(
            `https://nominatim.openstreetmap.org/search?` +
              new URLSearchParams({
                q: `${query}, Indonesia`,
                format: "json",
                addressdetails: "1",
                limit: "5",
                countrycodes: "id",
                bounded: "1",
                viewbox: "95,-11,141,6", // Indonesia bounding box
              }),
          ),
          // Secondary search for Jakarta area
          fetch(
            `https://nominatim.openstreetmap.org/search?` +
              new URLSearchParams({
                q: `${query}, Jakarta`,
                format: "json",
                addressdetails: "1",
                limit: "5",
                bounded: "1",
                viewbox: "106.5,-6.5,107.1,-5.9", // Jakarta bounding box
              }),
          ),
        ]

        const responses = await Promise.allSettled(searches)
        const allResults: SearchResult[] = []

        for (const response of responses) {
          if (response.status === "fulfilled" && response.value.ok) {
            const data = await response.value.json()
            allResults.push(...data)
          }
        }

        // Remove duplicates and sort by relevance
        const uniqueResults = allResults.filter(
          (result, index, self) => index === self.findIndex((r) => r.place_id === result.place_id),
        )

        // Enhanced sorting: prioritize exact matches and importance
        const sortedResults = uniqueResults
          .filter((result) => result.importance > 0.1)
          .sort((a, b) => {
            // Exact match bonus
            const aExact = a.display_name.toLowerCase().includes(query.toLowerCase()) ? 1 : 0
            const bExact = b.display_name.toLowerCase().includes(query.toLowerCase()) ? 1 : 0
            if (aExact !== bExact) return bExact - aExact
            // Then by importance
            return b.importance - a.importance
          })
          .slice(0, 10)

        setSearchResults(sortedResults)

        // Auto-switch to search tab if results found
        if (sortedResults.length > 0 && activeTab === "landmarks") {
          setActiveTab("search")
        }
      } catch (searchError) {
        console.error("Search error:", searchError)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [activeTab],
  )

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([])
      return
    }
    const timeoutId = setTimeout(async () => {
      await performSearch(searchTerm)
    }, 300) // Faster response time
    return () => clearTimeout(timeoutId)
  }, [searchTerm, performSearch])

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return

    // Initialize map
    const map = L.map(mapRef.current).setView([-6.2088, 106.8456], 11)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map)

    mapInstanceRef.current = map

    // Add click handler
    map.on("click", (e) => {
      const { lat, lng } = e.latlng
      const name = locationName || `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
      setSelectedLocation({ name, lat, lng })
      // Remove existing marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }
      // Add new marker
      const marker = L.marker([lat, lng]).addTo(map)
      markerRef.current = marker
    })

    // Add landmark markers
    JAKARTA_LANDMARKS.forEach((landmark) => {
      const landmarkIcon = L.divIcon({
        html: `
          <div class="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg border border-white">
            📍
          </div>
        `,
        className: "landmark-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      L.marker([landmark.lat, landmark.lng], { icon: landmarkIcon })
        .bindPopup(`<strong>${landmark.name}</strong>`)
        .addTo(map)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [locationName])

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    setLocationName(location.name)
    if (mapInstanceRef.current) {
      // Remove existing marker
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current)
      }
      // Add new marker
      const marker = L.marker([location.lat, location.lng]).addTo(mapInstanceRef.current)
      markerRef.current = marker
      // Center map on location
      mapInstanceRef.current.setView([location.lat, location.lng], 15)
    }
  }

  const handleSearchResultSelect = (result: SearchResult) => {
    // Create a cleaner name from the search result
    const nameParts = result.display_name.split(",")
    const cleanName = nameParts.slice(0, 2).join(", ").trim()
    const location: Location = {
      name: cleanName || result.display_name,
      lat: Number.parseFloat(result.lat),
      lng: Number.parseFloat(result.lon),
    }
    handleLocationSelect(location)
  }

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-96 border-r flex flex-col">
            {/* Search Input */}
            <div className="p-4 border-b space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search locations (e.g., Kemang, Cibubur)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-blue-600" />
                )}
              </div>
              <Input
                placeholder="Enter custom location name..."
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />
            </div>
            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("landmarks")}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  activeTab === "landmarks"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Quick Select ({filteredLandmarks.length})
              </button>
              <button
                onClick={() => setActiveTab("search")}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  activeTab === "search"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Search Results ({searchResults.length})
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "landmarks" && (
                <div className="space-y-2">
                  {filteredLandmarks.map((landmark) => (
                    <button
                      key={landmark.name}
                      onClick={() => handleLocationSelect(landmark)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-100 text-sm transition-colors border"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="truncate font-medium">{landmark.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {activeTab === "search" && (
                <div className="space-y-2">
                  {searchResults.map((result) => {
                    const nameParts = result.display_name.split(",")
                    const mainName = nameParts[0]
                    const subName = nameParts.slice(1, 3).join(",").trim()
                    return (
                      <button
                        key={result.place_id}
                        onClick={() => handleSearchResultSelect(result)}
                        className="w-full text-left p-3 rounded-lg hover:bg-gray-100 text-sm transition-colors border"
                      >
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{mainName}</p>
                            {subName && <p className="text-xs text-gray-500 truncate">{subName}</p>}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                  {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No results found for &quot;{searchTerm}&quot;</p>
                      <p className="text-xs mt-1">Try different keywords or use landmarks</p>
                    </div>
                  )}
                  {searchTerm.length < 2 && (
                    <div className="text-center py-8 text-gray-400">
                      <Search className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Type to search locations</p>
                      <p className="text-xs mt-1">Results appear as you type</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Selected Location */}
            {selectedLocation && (
              <div className="p-4 border-t bg-gray-50">
                <h4 className="font-medium mb-2">Selected Location</h4>
                <p className="text-sm text-gray-600 mb-3 break-words">{selectedLocation.name}</p>
                <div className="text-xs text-gray-500 mb-3">
                  Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleConfirm} className="flex-1">
                    Confirm Selection
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedLocation(null)}>
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
          {/* Map */}
          <div className="flex-1">
            <div ref={mapRef} className="w-full h-full" />
          </div>
        </div>
        {/* Instructions */}
        <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
          <p>
            <strong>How to use:</strong> Type to search locations in real-time, select from quick landmarks, or click
            directly on the map.
          </p>
        </div>
      </div>
    </div>
  )
}
