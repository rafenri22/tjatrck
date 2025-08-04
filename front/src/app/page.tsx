"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { initializeRealtime, realtimeStore } from "@/lib/realtime"
import type { Bus, Trip, BusLocation } from "@/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"
import { Map, Clock, MapPin, Users, Wifi, WifiOff, RefreshCw, Home } from "lucide-react"
import { GlobalTracker } from "@/components/tracking/GlobalTracker"

const BusMap = dynamic(() => import("@/components/map/BusMap"), {
  ssr: false,
  loading: () => <Loading text="Loading map..." />,
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
  const { toast } = useToast()

  // Initialize real-time system
  useEffect(() => {
    let cleanup: (() => void) | undefined

    const initialize = async () => {
      try {
        setError(null)
        console.log("🚀 Initializing real-time system...")

        // Initialize real-time subscriptions
        cleanup = await initializeRealtime()

        // Subscribe to store changes
        const unsubscribe = realtimeStore.subscribe(() => {
          console.log("📡 Store updated, refreshing UI...")
          setBuses([...realtimeStore.getBuses()])
          setTrips([...realtimeStore.getTrips()])
          setBusLocations([...realtimeStore.getBusLocations()])
        })

        // Set initial data
        setBuses([...realtimeStore.getBuses()])
        setTrips([...realtimeStore.getTrips()])
        setBusLocations([...realtimeStore.getBusLocations()])

        setIsOnline(true)
        setLoading(false)

        toast({
          title: "🚌 System Connected",
          description: `Real-time tracking active`,
          variant: "success",
        })

        // Cleanup function
        return () => {
          unsubscribe()
          if (cleanup) cleanup()
        }
      } catch (error) {
        console.error("❌ Error initializing real-time system:", error)
        setError(error instanceof Error ? error.message : "Failed to initialize system")
        setIsOnline(false)
        setLoading(false)

        toast({
          title: "❌ Connection Error",
          description: "Failed to initialize real-time system",
          variant: "destructive",
        })
      }
    }

    initialize()

    return () => {
      if (cleanup) cleanup()
    }
  }, [toast])

  // Update timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Auto-refresh data every 30 seconds as backup
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log("🔄 Auto-refresh backup...")
      try {
        await initializeRealtime()
      } catch (error) {
        console.error("❌ Auto-refresh failed:", error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // FIXED: Handle bus click with optional trip parameter
  const handleBusClick = (bus: Bus, trip?: Trip) => {
    setSelectedBus({ bus, trip })
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      await initializeRealtime()
      toast({
        title: "🔄 Refreshed",
        description: "Data updated successfully",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "❌ Refresh Failed",
        description: "Could not update data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBackToHome = () => {
    // Redirect to company profile or homepage
    window.location.href = "https://trijayaagunglestari.web.id"
  }

  const activeTrips = trips.filter((trip) => trip.status === "IN_PROGRESS")
  const activeBuses = buses.filter((bus) => bus.is_active)

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loading text="Loading bus tracking system..." size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <WifiOff className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <div className="space-y-2">
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
            <p className="text-sm text-gray-500">Make sure your Supabase credentials are correct</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Global Tracker Component */}
      <GlobalTracker />

      {/* Header - Responsive */}
      <header className="bg-white shadow-sm border-b p-3 md:p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
              <Map className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">TJA Tracking System</h1>
              <p className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                Trijaya Agung Real-time bus monitoring
                {isOnline ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <Wifi className="h-3 w-3" />
                    <span className="hidden sm:inline">Connected</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600">
                    <WifiOff className="h-3 w-3" />
                    <span className="hidden sm:inline">Disconnected</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Status Cards - Responsive */}
            <div className="hidden sm:flex gap-2">
              <Card className="p-2 md:p-3 bg-white border border-gray-200">
                <div className="text-xs md:text-sm">
                  <span className="font-medium text-blue-600">{activeBuses.length}</span>
                  <span className="text-gray-600 ml-1 hidden md:inline">Active</span>
                </div>
              </Card>
              <Card className="p-2 md:p-3 bg-white border border-gray-200">
                <div className="text-xs md:text-sm">
                  <span className="font-medium text-gray-600">{buses.length - activeBuses.length}</span>
                  <span className="text-gray-600 ml-1 hidden md:inline">Garage</span>
                </div>
              </Card>
            </div>

            {/* Mobile Status */}
            <div className="sm:hidden">
              <Card className="p-2 bg-white border border-gray-200">
                <div className="text-xs">
                  <span className="font-medium text-blue-600">{activeBuses.length}</span>
                  <span className="text-gray-600 mx-1">/</span>
                  <span className="font-medium text-gray-600">{buses.length}</span>
                </div>
              </Card>
            </div>

            <Button size="sm" variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleBackToHome}
              className="hidden md:flex items-center gap-2 bg-transparent"
            >
              <Home className="h-4 w-4" />
              <span className="hidden lg:inline">Beranda</span>
            </Button>

            {/* Mobile Home Button */}
            <Button size="sm" variant="outline" onClick={handleBackToHome} className="md:hidden bg-transparent">
              <Home className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Status Bar */}
        <div className="sm:hidden mt-2 flex justify-between text-xs text-gray-600">
          <span>Active: {activeBuses.length} buses</span>
          <span>Garage: {buses.length - activeBuses.length} buses</span>
        </div>
      </header>

      {/* Main Content - Map */}
      <main className="flex-1 relative">
        <BusMap
          buses={buses}
          trips={activeTrips}
          busLocations={busLocations}
          onBusClick={handleBusClick}
          showControls={true}
          autoFit={false}
        />

        {/* Last Update Info - Responsive */}
        {lastUpdate && (
          <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 z-[1000] bg-white px-2 md:px-3 py-1 md:py-2 rounded-full shadow-lg text-xs text-gray-600 border">
            <div className="flex items-center gap-1 md:gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
              <span className="hidden sm:inline">Last update:</span>
              <span className="sm:hidden">Update:</span>
              {lastUpdate}
            </div>
          </div>
        )}

        {/* Real-time Status - Responsive */}
        <div className="absolute top-2 md:top-4 right-2 md:right-4 z-[1000] bg-white px-2 md:px-3 py-1 md:py-2 rounded-lg shadow-lg text-xs text-gray-600 border">
          <div className="flex items-center gap-1 md:gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="hidden sm:inline">Real-time tracking •</span>
            <span className="sm:hidden">Live •</span>
            <span>{activeTrips.length} trips</span>
          </div>
        </div>

        {/* No Data Message - Responsive */}
        {activeBuses.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 p-4">
            <div className="text-center max-w-md mx-auto p-6">
              <Map className="h-12 md:h-16 w-12 md:w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Active Buses</h3>
              <p className="text-gray-500 mb-4 text-sm">All buses are currently parked at Garasi (Purbalingga)</p>
              <p className="text-xs text-gray-400">Admin can start trips from the management panel</p>
            </div>
          </div>
        )}
      </main>

      {/* Bus Detail Dialog - Responsive - FIXED */}
      <Dialog open={!!selectedBus} onOpenChange={() => setSelectedBus(null)}>
        <DialogContent className="max-w-sm md:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Map className="h-5 w-5" />
              Bus Details
            </DialogTitle>
          </DialogHeader>

          {selectedBus && (
            <div className="space-y-4">
              {/* Bus Photo - FIXED to always show with better error handling */}
              <div className="relative h-32 md:h-48 w-full rounded-lg overflow-hidden bg-gray-100">
                {selectedBus.bus.photo_url ? (
                  <img
                    src={selectedBus.bus.photo_url || "/placeholder.svg"}
                    alt={selectedBus.bus.nickname}
                    className="w-full h-full object-cover"
                    onLoad={(e) => {
                      ;(e.target as HTMLImageElement).style.opacity = "1"
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
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
                    style={{ opacity: 0, transition: "opacity 0.3s" }}
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

              {/* Bus Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">{selectedBus.bus.nickname}</h3>
                  <p className="text-sm text-gray-500">Code: {selectedBus.bus.code}</p>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>Driver: {selectedBus.bus.crew}</span>
                  </div>

                  {/* Show trip details only if bus is on trip */}
                  {selectedBus.trip ? (
                    <>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>From: {selectedBus.trip.departure.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>To: {selectedBus.trip.destination.name}</span>
                      </div>

                      {selectedBus.trip.stops.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <span className="block">Stops:</span>
                            <span className="text-gray-600 text-xs">
                              {selectedBus.trip.stops.map((stop) => stop.name).join(", ")}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm font-bold">{selectedBus.trip.progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${selectedBus.trip.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                          <span>Speed: {selectedBus.trip.speed} km/h</span>
                          <span>Real-time tracking</span>
                        </div>
                      </div>

                      {selectedBus.trip.distance && (
                        <div className="text-sm text-gray-600">Distance: {selectedBus.trip.distance.toFixed(1)} km</div>
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
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>Status: Parked at Garasi (Purbalingga)</span>
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
