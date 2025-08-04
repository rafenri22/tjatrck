"use client"

import type React from "react"
import dynamic from 'next/dynamic';
import { useState, useEffect } from "react"
import { supabase, uploadBusPhoto, deleteBusPhoto } from "@/lib/supabase"
import { getBuses, getTrips, createBus, updateBusPhoto, deleteBus as deleteBusFromDB, createTrip } from "@/lib/database"
import { calculateRoute } from "@/lib/routing"
import { backendApi } from "@/lib/backend-api"
import type { Bus, Trip, CreateBusRequest, CreateTripRequest, Stop } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, BusIcon, Navigation, Trash2, Play, Upload, MapPin, Clock, Square, AlertCircle, CheckCircle, XCircle, RefreshCw, Server, Wifi, WifiOff } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import LocationPicker from "@/components/map/LocationPicker"

export default function ManagePage() {
  const [buses, setBuses] = useState<Bus[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"buses" | "trips">("buses")
  const [backendStatus, setBackendStatus] = useState<"connected" | "disconnected" | "checking">("checking")
  const { toast } = useToast()

  // Bus form state
  const [busForm, setBusForm] = useState<CreateBusRequest>({
    code: "",
    nickname: "",
    crew: "",
  })
  const [busPhoto, setBusPhoto] = useState<File | null>(null)
  const [busPhotoPreview, setBusPhotoPreview] = useState<string | null>(null)
  const [busLoading, setBusLoading] = useState(false)

  // Trip form state
  const [tripForm, setTripForm] = useState<CreateTripRequest>({
    bus_id: "",
    departure: { name: "", lat: 0, lng: 0 },
    stops: [],
    destination: { name: "", lat: 0, lng: 0 },
  })
  const LocationPicker = dynamic(
    () => import('@/components/map/LocationPicker'),
    { 
      ssr: false,
      loading: () => <p>Loading map...</p>
    }
  );
  
  const [tripLoading, setTripLoading] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState<{
    type: "departure" | "destination" | "stop"
    index?: number
  } | null>(null)

  // Load initial data and check backend status
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Loading admin data...")
        const [busesData, tripsData] = await Promise.all([getBuses(), getTrips()])
        setBuses(busesData)
        setTrips(tripsData)
        // Check backend status
        const health = await backendApi.healthCheck()
        setBackendStatus(health ? "connected" : "disconnected")
        toast({
          title: "✅ Admin System Ready",
          description: `Loaded ${busesData.length} buses and ${tripsData.length} trips`,
          variant: "success",
        })
      } catch (loadError) {
        console.error("Error loading data:", loadError)
        setBackendStatus("disconnected")
        toast({
          title: "❌ Loading Error",
          description: "Failed to load data. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [toast])

  // Set up real-time subscriptions with auto-refresh
  useEffect(() => {
    console.log("Setting up real-time subscriptions...")
    const busesSubscription = supabase
      .channel("manage_buses")
      .on("postgres_changes", { event: "*", schema: "public", table: "buses" }, (payload) => {
        console.log("Bus change:", payload)
        if (payload.eventType === "INSERT") {
          setBuses((prev) => [payload.new as Bus, ...prev])
          toast({
            title: "🚌 New Bus Added",
            description: `${(payload.new as Bus).nickname} has been added to the fleet`,
            variant: "success",
          })
        } else if (payload.eventType === "UPDATE") {
          setBuses((prev) => prev.map((bus) => (bus.id === payload.new.id ? (payload.new as Bus) : bus)))
          const updatedBus = payload.new as Bus
          if (payload.old.is_active !== updatedBus.is_active) {
            toast({
              title: updatedBus.is_active ? "🚀 Bus Departed" : "🏠 Bus Returned",
              description: `${updatedBus.nickname} is now ${updatedBus.is_active ? "on trip" : "in garage"}`,
              variant: "default",
            })
          }
        } else if (payload.eventType === "DELETE") {
          setBuses((prev) => prev.filter((bus) => bus.id !== payload.old.id))
          toast({
            title: "🗑️ Bus Removed",
            description: "Bus has been deleted from the system",
            variant: "default",
          })
        }
      })
      .subscribe()

    const tripsSubscription = supabase
      .channel("manage_trips")
      .on("postgres_changes", { event: "*", schema: "public", table: "trips" }, (payload) => {
        console.log("Trip change:", payload)
        if (payload.eventType === "INSERT") {
          setTrips((prev) => [payload.new as Trip, ...prev])
          toast({
            title: "🗺️ New Trip Created",
            description: "Trip has been added and is ready to start",
            variant: "success",
          })
        } else if (payload.eventType === "UPDATE") {
          setTrips((prev) => prev.map((trip) => (trip.id === payload.new.id ? (payload.new as Trip) : trip)))
          const updatedTrip = payload.new as Trip
          const oldTrip = payload.old as Trip
          if (oldTrip.status !== updatedTrip.status) {
            const statusMessages = {
              IN_PROGRESS: "🚀 Trip Started",
              COMPLETED: "✅ Trip Completed",
              CANCELLED: "❌ Trip Cancelled",
            }
            if (statusMessages[updatedTrip.status as keyof typeof statusMessages]) {
              toast({
                title: statusMessages[updatedTrip.status as keyof typeof statusMessages],
                description: `Trip progress: ${updatedTrip.progress.toFixed(1)}%`,
                variant: updatedTrip.status === "COMPLETED" ? "success" : "default",
              })
            }
          }
        } else if (payload.eventType === "DELETE") {
          setTrips((prev) => prev.filter((trip) => trip.id !== payload.old.id))
          toast({
            title: "🗑️ Trip Deleted",
            description: "Trip has been removed from history",
            variant: "default",
          })
        }
      })
      .subscribe()

    // Auto-refresh data every 30 seconds
    const refreshInterval = setInterval(async () => {
      try {
        const [busesData, tripsData] = await Promise.all([getBuses(), getTrips()])
        setBuses(busesData)
        setTrips(tripsData)
        // Check backend status
        const health = await backendApi.healthCheck()
        setBackendStatus(health ? "connected" : "disconnected")
      } catch (refreshError) {
        console.error("Auto-refresh failed:", refreshError)
        setBackendStatus("disconnected")
      }
    }, 30000)

    return () => {
      console.log("Cleaning up admin subscriptions...")
      busesSubscription.unsubscribe()
      tripsSubscription.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [toast])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBusPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setBusPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusLoading(true)
    try {
      // Create bus first
      const newBus = await createBus(busForm)
      // Upload photo if provided
      if (busPhoto) {
        const photoUrl = await uploadBusPhoto(busPhoto, newBus.id)
        await updateBusPhoto(newBus.id, photoUrl)
      }
      // Reset form
      setBusForm({ code: "", nickname: "", crew: "" })
      setBusPhoto(null)
      setBusPhotoPreview(null)
      // Clear file input
      const fileInput = document.getElementById("photo") as HTMLInputElement
      if (fileInput) fileInput.value = ""
      toast({
        title: "✅ Bus Created Successfully",
        description: `${newBus.nickname} has been added to the fleet`,
        variant: "success",
      })
    } catch (busError) {
      console.error("Failed to create bus:", busError)
      toast({
        title: "❌ Failed to Create Bus",
        description: "Please check your input and try again",
        variant: "destructive",
      })
    } finally {
      setBusLoading(false)
    }
  }

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault()
    setTripLoading(true)
    try {
      // Calculate route using OSRM
      const routeData = await calculateRoute(tripForm.departure, tripForm.stops, tripForm.destination)
      // Create trip with route data
      const newTrip = await createTrip(tripForm)
      // Update trip with route data
      await supabase
        .from("trips")
        .update({
          route: routeData.coordinates,
          distance: routeData.distance,
          estimated_duration: routeData.duration,
        })
        .eq("id", newTrip.id)
      // Reset form
      setTripForm({
        bus_id: "",
        departure: { name: "", lat: 0, lng: 0 },
        stops: [],
        destination: { name: "", lat: 0, lng: 0 },
      })
      toast({
        title: "✅ Trip Created Successfully",
        description: `Route from ${tripForm.departure.name} to ${tripForm.destination.name}`,
        variant: "success",
      })
    } catch (tripError) {
      console.error("Failed to create trip:", tripError)
      toast({
        title: "❌ Failed to Create Trip",
        description: "Please check your route and try again",
        variant: "destructive",
      })
    } finally {
      setTripLoading(false)
    }
  }

  const handleStartTrip = async (trip: Trip) => {
    try {
      if (backendStatus !== "connected") {
        toast({
          title: "❌ Backend Disconnected",
          description: "Cannot start trip. Backend server is not running.",
          variant: "destructive",
        })
        return
      }
      // Use backend API to start trip
      await backendApi.startTrip(trip.id)
      toast({
        title: "🚀 Trip Started",
        description: "Bus is now being tracked by backend server at 80-120 km/h",
        variant: "success",
      })
    } catch (startError) {
      console.error("Failed to start trip:", startError)
      toast({
        title: "❌ Failed to Start Trip",
        description: "Please try again or check backend connection",
        variant: "destructive",
      })
    }
  }

  const handleCancelTrip = async (trip: Trip) => {
    if (!confirm("Are you sure you want to cancel this trip?")) return
    try {
      if (backendStatus !== "connected") {
        toast({
          title: "❌ Backend Disconnected",
          description: "Cannot cancel trip. Backend server is not running.",
          variant: "destructive",
        })
        return
      }
      // Use backend API to cancel trip
      await backendApi.cancelTrip(trip.id)
      toast({
        title: "❌ Trip Cancelled",
        description: "Bus has been returned to garage",
        variant: "default",
      })
    } catch (cancelError) {
      console.error("Failed to cancel trip:", cancelError)
      toast({
        title: "❌ Failed to Cancel Trip",
        description: "Please try again or check backend connection",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBus = async (bus: Bus) => {
    if (!confirm("Are you sure you want to delete this bus?")) return
    try {
      // Delete photo from storage
      await deleteBusPhoto(bus.id)
      // Delete bus from database
      await deleteBusFromDB(bus.id)
      toast({
        title: "🗑️ Bus Deleted",
        description: `${bus.nickname} has been removed from the fleet`,
        variant: "default",
      })
    } catch (deleteError) {
      console.error("Failed to delete bus:", deleteError)
      toast({
        title: "❌ Failed to Delete Bus",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTrip = async (trip: Trip) => {
    if (!confirm("Are you sure you want to delete this trip from history?")) return
    try {
      const { error: deleteError } = await supabase.from("trips").delete().eq("id", trip.id)
      if (deleteError) throw deleteError
      toast({
        title: "🗑️ Trip Deleted",
        description: "Trip has been removed from history",
        variant: "default",
      })
    } catch (tripDeleteError) {
      console.error("Failed to delete trip:", tripDeleteError)
      toast({
        title: "❌ Failed to Delete Trip",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    if (!showLocationPicker) return
    if (showLocationPicker.type === "departure") {
      setTripForm((prev) => ({ ...prev, departure: location }))
    } else if (showLocationPicker.type === "destination") {
      setTripForm((prev) => ({ ...prev, destination: location }))
    } else if (showLocationPicker.type === "stop") {
      const newStop: Stop = { ...location, duration: 30 }
      setTripForm((prev) => ({ ...prev, stops: [...prev.stops, newStop] }))
    }
    setShowLocationPicker(null)
  }

  const removeStop = (index: number) => {
    setTripForm((prev) => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index),
    }))
  }

  const updateStopDuration = (index: number, duration: number) => {
    setTripForm((prev) => ({
      ...prev,
      stops: prev.stops.map((stop, i) => (i === index ? { ...stop, duration } : stop)),
    }))
  }

  const handleRefresh = async () => {
    try {
      const [busesData, tripsData] = await Promise.all([getBuses(), getTrips()])
      setBuses(busesData)
      setTrips(tripsData)
      // Check backend status
      const health = await backendApi.healthCheck()
      setBackendStatus(health ? "connected" : "disconnected")
      toast({
        title: "🔄 Refreshed",
        description: "Admin data updated successfully",
        variant: "success",
      })
    } catch (refreshError) {
      console.error("Refresh failed:", refreshError)
      toast({
        title: "❌ Refresh Failed",
        description: "Could not update data",
        variant: "destructive",
      })
    }
  }

  const availableBuses = buses.filter((bus) => !bus.is_active)
  const activeTrips = trips.filter((trip) => trip.status === "IN_PROGRESS")
  const completedTrips = trips.filter((trip) => trip.status === "COMPLETED")
  const pendingTrips = trips.filter((trip) => trip.status === "PENDING")

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loading text="Loading admin panel..." size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Map
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Bus Management</h1>
            <div className="flex items-center gap-2 text-sm">
              {backendStatus === "connected" ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Server className="h-4 w-4" />
                  <Wifi className="h-3 w-3" />
                  Backend Connected
                </div>
              ) : backendStatus === "disconnected" ? (
                <div className="flex items-center gap-2 text-red-600">
                  <Server className="h-4 w-4" />
                  <WifiOff className="h-3 w-3" />
                  Backend Offline
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-600">
                  <Server className="h-4 w-4" />
                  <Loading size="sm" />
                  Checking...
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant={activeTab === "buses" ? "default" : "outline"} onClick={() => setActiveTab("buses")}>
              <BusIcon className="h-4 w-4 mr-2" />
              Buses ({buses.length})
            </Button>
            <Button variant={activeTab === "trips" ? "default" : "outline"} onClick={() => setActiveTab("trips")}>
              <Navigation className="h-4 w-4 mr-2" />
              Trips ({trips.length})
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Backend Status Alert */}
        {backendStatus === "disconnected" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <strong>Backend Server Offline</strong>
            </div>
            <p className="text-red-700 mt-1 text-sm">
              Real-time tracking is disabled. Please start the backend server with:{" "}
              <code className="bg-red-100 px-1 rounded">npm run dev</code> in the server directory.
            </p>
          </div>
        )}

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BusIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Active Buses</p>
                <p className="text-2xl font-bold text-blue-700">{buses.filter((b) => b.is_active).length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600">Completed Trips</p>
                <p className="text-2xl font-bold text-green-700">{completedTrips.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-600">Pending Trips</p>
                <p className="text-2xl font-bold text-yellow-700">{pendingTrips.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Navigation className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600">In Progress</p>
                <p className="text-2xl font-bold text-purple-700">{activeTrips.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {activeTab === "buses" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Bus Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Bus</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateBus} className="space-y-4">
                  <div>
                    <Label htmlFor="code">Bus Code</Label>
                    <Input
                      id="code"
                      value={busForm.code}
                      onChange={(e) => setBusForm((prev) => ({ ...prev, code: e.target.value }))}
                      placeholder="e.g., BUS001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nickname">Bus Nickname</Label>
                    <Input
                      id="nickname"
                      value={busForm.nickname}
                      onChange={(e) => setBusForm((prev) => ({ ...prev, nickname: e.target.value }))}
                      placeholder="e.g., Jakarta Express"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="crew">Crew/Driver</Label>
                    <Input
                      id="crew"
                      value={busForm.crew}
                      onChange={(e) => setBusForm((prev) => ({ ...prev, crew: e.target.value }))}
                      placeholder="e.g., Ahmad Supardi"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="photo">Bus Photo</Label>
                    <div className="mt-2">
                      <input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("photo")?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {busPhoto ? busPhoto.name : "Choose Photo"}
                      </Button>
                    </div>
                    {busPhotoPreview && (
                      <div className="mt-2">
                        <div className="relative w-[200px] h-[150px] rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={busPhotoPreview || "/placeholder.svg"}
                            alt="Bus preview"
                            fill
                            className="object-cover"
                            onError={(e) => {
                              console.error("Preview image error:", e)
                            }}
                            unoptimized={true}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={busLoading}>
                    {busLoading ? (
                      <>
                        <Loading size="sm" />
                        Creating Bus...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bus
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Bus List */}
            <Card>
              <CardHeader>
                <CardTitle>Bus Fleet ({buses.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {buses.map((bus) => (
                    <div key={bus.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      {bus.photo_url && (
                        <div className="relative w-[60px] h-[45px] rounded overflow-hidden bg-gray-100">
                          <Image
                            src={bus.photo_url || "/placeholder.svg"}
                            alt={bus.nickname}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              console.error("Image load error:", e)
                              const target = e.target as HTMLImageElement
                              if (target.parentElement) {
                                target.parentElement.style.display = "none"
                              }
                            }}
                            unoptimized={process.env.NODE_ENV === "development"}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{bus.nickname}</h3>
                        <p className="text-sm text-gray-500">
                          {bus.code} • {bus.crew}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            bus.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${bus.is_active ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
                          />
                          {bus.is_active ? "On Trip" : "In Garage"}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteBus(bus)} disabled={bus.is_active}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {buses.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <BusIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No buses added yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "trips" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Trip Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Trip</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTrip} className="space-y-4">
                  <div>
                    <Label htmlFor="busId">Select Bus</Label>
                    <select
                      id="busId"
                      value={tripForm.bus_id}
                      onChange={(e) => setTripForm((prev) => ({ ...prev, bus_id: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Choose a bus...</option>
                      {availableBuses.map((bus) => (
                        <option key={bus.id} value={bus.id}>
                          {bus.nickname} ({bus.code})
                        </option>
                      ))}
                    </select>
                    {availableBuses.length === 0 && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        No buses available. All buses are on trips.
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Departure Point</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={tripForm.departure.name}
                        placeholder="Select departure point"
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowLocationPicker({ type: "departure" })}
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Stop Points</Label>
                    <div className="space-y-2 mt-1">
                      {tripForm.stops.map((stop, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{stop.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <input
                                type="number"
                                value={stop.duration}
                                onChange={(e) => updateStopDuration(index, Number.parseInt(e.target.value) || 30)}
                                className="w-16 px-1 py-0.5 text-xs border rounded"
                                min="5"
                                max="120"
                              />
                              <span className="text-xs text-gray-500">minutes</span>
                            </div>
                          </div>
                          <Button type="button" variant="outline" size="sm" onClick={() => removeStop(index)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowLocationPicker({ type: "stop" })}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Stop
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Final Destination</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={tripForm.destination.name}
                        placeholder="Select destination"
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowLocationPicker({ type: "destination" })}
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      tripLoading ||
                      availableBuses.length === 0 ||
                      !tripForm.departure.name ||
                      !tripForm.destination.name
                    }
                  >
                    {tripLoading ? (
                      <>
                        <Loading size="sm" />
                        Creating Trip...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Trip
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Trip List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Trip History ({trips.length})</span>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                      Pending: {pendingTrips.length}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Active: {activeTrips.length}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                      Completed: {completedTrips.length}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {trips.map((trip) => {
                    const bus = buses.find((b) => b.id === trip.bus_id)
                    return (
                      <div key={trip.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{bus?.nickname || "Unknown Bus"}</h3>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                                trip.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : trip.status === "IN_PROGRESS"
                                    ? "bg-blue-100 text-blue-800"
                                    : trip.status === "COMPLETED"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                              }`}
                            >
                              {trip.status === "PENDING" && <Clock className="h-3 w-3" />}
                              {trip.status === "IN_PROGRESS" && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                              )}
                              {trip.status === "COMPLETED" && <CheckCircle className="h-3 w-3" />}
                              {trip.status === "CANCELLED" && <XCircle className="h-3 w-3" />}
                              {trip.status}
                            </span>
                            {trip.status === "PENDING" && (
                              <Button
                                size="sm"
                                onClick={() => handleStartTrip(trip)}
                                disabled={backendStatus !== "connected"}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {trip.status === "IN_PROGRESS" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancelTrip(trip)}
                                disabled={backendStatus !== "connected"}
                              >
                                <Square className="h-4 w-4" />
                              </Button>
                            )}
                            {(trip.status === "COMPLETED" || trip.status === "CANCELLED") && (
                              <Button size="sm" variant="outline" onClick={() => handleDeleteTrip(trip)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-green-600" />
                            From: {trip.departure.name}
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-red-600" />
                            To: {trip.destination.name}
                          </p>
                          {trip.stops.length > 0 && (
                            <p className="flex items-start gap-2">
                              <Clock className="h-3 w-3 text-gray-400 mt-0.5" />
                              Stops: {trip.stops.map((stop) => stop.name).join(", ")}
                            </p>
                          )}
                          {trip.status === "IN_PROGRESS" && (
                            <div className="mt-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium">Progress</span>
                                <span className="text-xs font-bold">{trip.progress.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${trip.progress}%` }}
                                />
                              </div>
                              <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                                <span>Speed: {trip.speed} km/h</span>
                                <span>Backend Tracking</span>
                              </div>
                            </div>
                          )}
                          {trip.distance && (
                            <p className="text-xs text-gray-500">Distance: {trip.distance.toFixed(1)} km</p>
                          )}
                          {trip.estimated_duration && (
                            <p className="text-xs text-gray-500">
                              Duration: {Math.floor(trip.estimated_duration / 60)}h {trip.estimated_duration % 60}m
                            </p>
                          )}
                          <p className="text-xs text-gray-400">Created: {new Date(trip.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    )
                  })}
                  {trips.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Navigation className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No trips created yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowLocationPicker(null)}
          title={
            showLocationPicker.type === "departure"
              ? "Select Departure Point"
              : showLocationPicker.type === "destination"
                ? "Select Destination"
                : "Add Stop Point"
          }
        />
      )}
    </div>
  )
}