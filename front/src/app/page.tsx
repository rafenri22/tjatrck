"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { initializeRealtime, realtimeStore } from "@/lib/realtime"
import type { Bus, Trip, BusLocation } from "@/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"
import { Map, Clock, MapPin, Users, Wifi, WifiOff, RefreshCw, Home, Maximize2 } from "lucide-react"
import { GlobalTracker } from "@/components/tracking/GlobalTracker"

const BusMap = dynamic(() => import("@/components/map/BusMap"), {
  ssr: false,
  loading: () => <Loading text="Loading real-time map..." />,
})

export default function HomePage() {
  const [buses, setBuses] = useState<Bus[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [busLocations, setBusLocations] = useState<BusLocation[]>([])
  const [selectedBus, setSelectedBus] = useState<{ bus: Bus; trip?: Trip } | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { toast } = useToast()

  // Real-time data synchronization
  const syncRealTimeData = useCallback(() => {
    const currentBuses = realtimeStore.getBuses()
    const currentTrips = realtimeStore.getTrips()
    const currentLocations = realtimeStore.getBusLocations()
    
    // Only update if data actually changed to prevent unnecessary re-renders
    setBuses(prev => {
      const hasChanged = JSON.stringify(prev) !== JSON.stringify(currentBuses)
      return hasChanged ? [...currentBuses] : prev
    })
    
    setTrips(prev => {
      const hasChanged = JSON.stringify(prev) !== JSON.stringify(currentTrips)
      return hasChanged ? [...currentTrips] : prev
    })
    
    setBusLocations(prev => {
      const hasChanged = JSON.stringify(prev) !== JSON.stringify(currentLocations)
      return hasChanged ? [...currentLocations] : prev
    })
    
    setLastUpdate(new Date().toLocaleTimeString())
    setIsOnline(true)
  }, [])

  // Initialize real-time system with enhanced performance
  useEffect(() => {
    let cleanup: (() => void) | undefined

    const initialize = async () => {
      try {
        setError(null)
        console.log("🚀 Initializing enhanced real-time system...")

        // Initialize real-time subscriptions
        cleanup = await initializeRealtime()

        // Subscribe to store changes with optimized updates
        let updateTimeout: NodeJS.Timeout
        const unsubscribe = realtimeStore.subscribe(() => {
          clearTimeout(updateTimeout)
          updateTimeout = setTimeout(() => {
            console.log("📡 Real-time data updated, syncing UI...")
            syncRealTimeData()
          }, 50) // Very fast debounce for real-time feel
        })

        // Set initial data
        syncRealTimeData()
        setIsOnline(true)
        setLoading(false)

        toast({
          title: "🚌 Real-time System Active",
          description: "Live bus tracking enabled with automatic updates",
          variant: "success",
        })

        // Return enhanced cleanup function
        return () => {
          unsubscribe()
          if (cleanup) cleanup()
          clearTimeout(updateTimeout)
        }
      } catch (error) {
        console.error("❌ Error initializing real-time system:", error)
        setError(error instanceof Error ? error.message : "Failed to initialize real-time system")
        setIsOnline(false)
        setLoading(false)

        toast({
          title: "❌ Real-time Connection Error",
          description: "Some features may not work properly",
          variant: "destructive",
        })
      }
    }

    initialize()

    return () => {
      if (cleanup) cleanup()
    }
  }, [toast, syncRealTimeData])

  // Enhanced real-time updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      syncRealTimeData()
    }, 3000) // Sync every 3 seconds for smooth real-time experience
    
    return () => clearInterval(interval)
  }, [syncRealTimeData])

  // Update timestamp every second for live feel
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Handle bus click with enhanced information
  const handleBusClick = useCallback((bus: Bus, trip?: Trip) => {
    setSelectedBus({ bus, trip })
  }, [])

  const handleRefresh = useCallback(async () => {
    setLoading(true)
    try {
      await initializeRealtime()
      syncRealTimeData()
      toast({
        title: "🔄 Data Refreshed",
        description: "Real-time data synchronized successfully",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "❌ Refresh Failed",
        description: "Could not update real-time data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [syncRealTimeData, toast])

  const handleBackToHome = useCallback(() => {
    window.location.href = "https://trijayaagunglestari.web.id"
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch(console.error)
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      }).catch(console.error)
    }
  }, [])

  // Enhanced statistics
  const activeTrips = trips.filter((trip) => trip.status === "IN_PROGRESS")
  const activeBuses = buses.filter((bus) => bus.is_active)
  const busesAtDestination = buses.filter(bus => {
    const hasLocation = busLocations.some(loc => loc.bus_id === bus.id && loc.progress >= 100)
    return !bus.is_active && hasLocation
  })
  const busesInGarage = buses.filter(bus => {
    const hasLocation = busLocations.some(loc => loc.bus_id === bus.id)
    return !bus.is_active && !hasLocation
  })

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-fadeIn">
          <Loading text="Loading real-time bus tracking system..." size="lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md mx-auto p-6 animate-fadeIn">
          <div className="text-red-500 mb-4">
            <WifiOff className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Real-time Connection Error</h2>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <div className="space-y-2">
            <Button onClick={handleRefresh} className="w-full btn-touch">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
            <p className="text-sm text-gray-500">Check your internet connection and try again</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 safe-area-inset-top safe-area-inset-bottom">
      {/* Enhanced Global Tracker Component */}
      <GlobalTracker />

      {/* Enhanced Header with Real-time Status */}
      <header className="bg-white shadow-sm border-b p-responsive z-10 no-select">
        <div className="flex items-center justify-between gap-responsive">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Map className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base md:text-xl font-bold text-gray-900 truncate">TJA Real-time Tracking</h1>
              <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1 md:gap-2">
                <span className="truncate">Live monitoring system</span>
                {isOnline ? (
                  <span className="flex items-center gap-1 text-green-600 flex-shrink-0">
                    <Wifi className="h-3 w-3" />
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="hidden sm:inline">Live</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 flex-shrink-0">
                    <WifiOff className="h-3 w-3" />
                    <span className="hidden sm:inline">Offline</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            {/* Enhanced Status Cards */}
            <div className="hidden sm:flex gap-2">
              <Card className="p-2 md:p-3 bg-white border border-gray-200">
                <div className="text-xs md:text-sm">
                  <span className="font-medium text-blue-600">{activeBuses.length}</span>
                  <span className="text-gray-600 ml-1 hidden md:inline">Active</span>
                </div>
              </Card>
              <Card className="p-2 md:p-3 bg-white border border-gray-200">
                <div className="text-xs md:text-sm">
                  <span className="font-medium text-green-600">{busesAtDestination.length}</span>
                  <span className="text-gray-600 ml-1 hidden md:inline">Dest</span>
                </div>
              </Card>
              <Card className="p-2 md:p-3 bg-white border border-gray-200">
                <div className="text-xs md:text-sm">
                  <span className="font-medium text-gray-600">{busesInGarage.length}</span>
                  <span className="text-gray-600 ml-1 hidden md:inline">Garage</span>
                </div>
              </Card>
            </div>

            {/* Mobile Compact Status */}
            <div className="sm:hidden">
              <Card className="p-2 bg-white border border-gray-200">
                <div className="text-xs whitespace-nowrap">
                  <span className="font-medium text-blue-600">{activeBuses.length}</span>
                  <span className="text-gray-600 mx-1">/</span>
                  <span className="font-medium text-green-600">{busesAtDestination.length}</span>
                  <span className="text-gray-600 mx-1">/</span>
                  <span className="font-medium text-gray-600">{busesInGarage.length}</span>
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <Button size="sm" variant="outline" onClick={handleRefresh} className="btn-touch">
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={toggleFullscreen}
              className="btn-touch hidden md:flex"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleBackToHome}
              className="btn-touch hidden md:flex items-center gap-2 bg-transparent"
            >
              <Home className="h-4 w-4" />
              <span className="hidden lg:inline">Beranda</span>
            </Button>

            <Button size="sm" variant="outline" onClick={handleBackToHome} className="btn-touch md:hidden bg-transparent">
              <Home className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Status Bar */}
        <div className="sm:hidden mt-2 flex justify-between text-xs text-gray-600">
          <span>Active: {activeBuses.length}</span>
          <span>At Dest: {busesAtDestination.length}</span>
          <span>In Garage: {busesInGarage.length}</span>
        </div>
      </header>

      {/* Main Content - Enhanced Real-time Map */}
      <main className="flex-1 relative overflow-hidden">
        <BusMap
          buses={buses}
          trips={activeTrips}
          busLocations={busLocations}
          onBusClick={handleBusClick}
          showControls={true}
          autoFit={false}
        />

        {/* Enhanced Last Update Info */}
        {lastUpdate && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg text-xs text-gray-600 border animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
            <span className="hidden sm:inline">Last sync:</span>
            <span className="sm:hidden">Sync:</span>
            <span className="font-mono">{lastUpdate}</span>
          </div>
        </div>
        )}

        {/* Enhanced Real-time Status */}
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-xs text-gray-600 border animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="hidden sm:inline">Real-time •</span>
            <span className="sm:hidden">Live •</span>
            <span className="font-medium">{activeTrips.length} active</span>
          </div>
        </div>

        {/* Enhanced No Data Message */}
        {buses.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm p-4">
            <div className="text-center max-w-md mx-auto p-6 animate-fadeIn">
              <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Buses Available</h3>
              <p className="text-gray-500 mb-4 text-sm">The bus fleet is not currently active</p>
              <p className="text-xs text-gray-400">Contact admin to add buses to the system</p>
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Bus Detail Dialog */}
      <Dialog open={!!selectedBus} onOpenChange={() => setSelectedBus(null)}>
        <DialogContent className="max-w-sm md:max-w-md mx-4 max-h-[90vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Map className="h-5 w-5" />
              Bus Details
            </DialogTitle>
          </DialogHeader>

          {selectedBus && (
            <div className="space-y-4">
              {/* Enhanced Bus Photo */}
              <div className="relative h-32 md:h-48 w-full rounded-lg overflow-hidden bg-gray-100">
                {selectedBus.bus.photo_url ? (
                  <img
                    src={selectedBus.bus.photo_url}
                    alt={selectedBus.bus.nickname}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "1"
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `
                          <div class="h-full w-full flex items-center justify-center bg-gray-200">
                            <div class="text-center">
                              <div class="text-gray-400 text-2xl mb-2">📷</div>
                              <span class="text-gray-400 text-sm">Photo not available</span>
                            </div>
                          </div>
                        `
                      }
                    }}
                    style={{ opacity: 0 }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-200">
                    <div className="text-center">
                      <div className="text-gray-400 text-2xl mb-2">📷</div>
                      <span className="text-gray-400 text-sm">No Photo Available</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Bus Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold truncate">{selectedBus.bus.nickname}</h3>
                  <p className="text-sm text-gray-500">Code: {selectedBus.bus.code}</p>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">Driver: {selectedBus.bus.crew}</span>
                  </div>

                  {/* Enhanced status display */}
                  {selectedBus.trip ? (
                    <>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="truncate">From: {selectedBus.trip.departure.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <span className="truncate">To: {selectedBus.trip.destination.name}</span>
                      </div>

                      {selectedBus.trip.stops.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="block">Stops:</span>
                            <span className="text-gray-600 text-xs break-words">
                              {selectedBus.trip.stops.map((stop) => stop.name).join(", ")}
                            </span>
                          </div>
                        </div>
                      )}

                      {selectedBus.trip.status === "IN_PROGRESS" ? (
                        <>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-blue-800">Trip Progress</span>
                              <span className="text-sm font-bold text-blue-800">{selectedBus.trip.progress.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${selectedBus.trip.progress}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center mt-2 text-xs text-blue-700">
                              <span>Speed: {selectedBus.trip.speed} km/h</span>
                              <span>🛣️ Highway Route</span>
                            </div>
                          </div>
                        </>
                      ) : selectedBus.trip.status === "COMPLETED" ? (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-green-800">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium">Trip Completed</span>
                          </div>
                          <p className="text-xs text-green-700 mt-1">Bus is parked at destination</p>
                        </div>
                      ) : null}

                      {selectedBus.trip.distance && (
                        <div className="text-sm text-gray-600">
                          Distance: {selectedBus.trip.distance.toFixed(1)} km
                        </div>
                      )}

                      {selectedBus.trip.estimated_duration && (
                        <div className="text-sm text-gray-600">
                          Duration: {Math.floor(selectedBus.trip.estimated_duration / 60)}h{" "}
                          {selectedBus.trip.estimated_duration % 60}m
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span>Status: Available at Garasi (Purbalingga)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}