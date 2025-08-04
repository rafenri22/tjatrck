"use client"

import { useEffect, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { updateTrip, updateBusStatus, updateBusLocation, deleteBusLocation } from "@/lib/database"
import { realtimeStore } from "@/lib/realtime"
import type { Trip } from "@/types"
import { useToast } from "@/hooks/use-toast"

// Global tracking intervals
const trackingIntervals = new Map<string, NodeJS.Timeout>()

export function GlobalTracker() {
  const { toast } = useToast()
  const isInitialized = useRef(false)

  // Start tracking for a specific trip
  const startTracking = useCallback(
    (trip: Trip) => {
      const buses = realtimeStore.getBuses()
      const bus = buses.find((b) => b.id === trip.bus_id)
      const tripName = bus?.nickname || trip.id.slice(0, 8)
      console.log("🚀 Starting GLOBAL tracking for:", tripName)

      // Clear existing interval
      const existingInterval = trackingIntervals.get(trip.id)
      if (existingInterval) {
        clearInterval(existingInterval)
      }

      // Generate random speed between 100-120 km/h for this trip
      const randomSpeed = Math.floor(Math.random() * (120 - 100 + 1)) + 100

      const interval = setInterval(async () => {
        try {
          // Get current trip data
          const { data: currentTrip, error } = await supabase.from("trips").select("*").eq("id", trip.id).single()
          if (error || !currentTrip || currentTrip.status !== "IN_PROGRESS") {
            console.log("❌ Trip not active, stopping tracking:", tripName)
            stopTracking(trip.id)
            return
          }

          // Calculate new progress (0.5% per second = 200 seconds total)
          const newProgress = Math.min(100, currentTrip.progress + 0.5)

          // Calculate current position based on route
          let currentLat = currentTrip.current_lat
          let currentLng = currentTrip.current_lng
          if (currentTrip.route && Array.isArray(currentTrip.route) && currentTrip.route.length > 0) {
            const routeIndex = Math.floor((newProgress / 100) * (currentTrip.route.length - 1))
            const currentPosition = currentTrip.route[routeIndex] || currentTrip.route[0]
            currentLat = currentPosition.lat
            currentLng = currentPosition.lng
          }

          // Update trip progress with random speed
          const updates: Partial<Trip> = {
            progress: newProgress,
            current_lat: currentLat,
            current_lng: currentLng,
            speed: randomSpeed, // Use the random speed generated for this trip
          }

          // If completed, mark as completed
          if (newProgress >= 100) {
            updates.status = "COMPLETED"
            updates.end_time = new Date().toISOString()
            toast({
              title: "✅ Trip Completed",
              description: `${tripName} has reached destination`,
              variant: "success",
            })
          }

          // Update in database
          await updateTrip(trip.id, updates)

          // Update bus location for real-time tracking
          if (currentLat && currentLng) {
            await updateBusLocation({
              bus_id: trip.bus_id,
              trip_id: trip.id,
              lat: currentLat,
              lng: currentLng,
              progress: newProgress,
              elapsed_time_minutes: 0, // Add this field
              timestamp: Date.now(),
            })
          }

          // If completed, clean up
          if (newProgress >= 100) {
            await updateBusStatus(trip.bus_id, false)
            setTimeout(async () => {
              await deleteBusLocation(trip.bus_id)
            }, 5000)
            stopTracking(trip.id)
          }

          console.log(`📊 ${tripName}: ${newProgress.toFixed(1)}% - ${randomSpeed} km/h`)
        } catch (trackingError) {
          console.error("❌ Error in global tracking:", trackingError)
        }
      }, 1000) // Update every 1 second

      trackingIntervals.set(trip.id, interval)
      console.log(`✅ Global tracking started for: ${tripName} at ${randomSpeed} km/h`)
    },
    [toast],
  )

  // Stop tracking for a specific trip
  const stopTracking = useCallback((tripId: string) => {
    const interval = trackingIntervals.get(tripId)
    if (interval) {
      clearInterval(interval)
      trackingIntervals.delete(tripId)
      console.log("🛑 Global tracking stopped for:", tripId.slice(0, 8))
    }
  }, [])

  // Initialize tracking on mount
  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true
    console.log("🔄 Initializing Global Tracker...")

    // Start tracking for existing in-progress trips
    const checkAndStartTracking = () => {
      const trips = realtimeStore.getTrips()
      const inProgressTrips = trips.filter((trip) => trip.status === "IN_PROGRESS")
      console.log(`Found ${inProgressTrips.length} in-progress trips`)
      inProgressTrips.forEach((trip) => {
        if (!trackingIntervals.has(trip.id)) {
          startTracking(trip)
        }
      })
      if (inProgressTrips.length > 0) {
        toast({
          title: "🚌 Tracking Active",
          description: `Monitoring ${inProgressTrips.length} active trips`,
          variant: "default",
        })
      }
    }

    // Initial check
    checkAndStartTracking()

    // Subscribe to trip changes
    const unsubscribe = realtimeStore.subscribe(() => {
      const trips = realtimeStore.getTrips()
      const inProgressTrips = trips.filter((trip) => trip.status === "IN_PROGRESS")
      const currentlyTracked = Array.from(trackingIntervals.keys())

      // Start tracking for new in-progress trips
      inProgressTrips.forEach((trip) => {
        if (!currentlyTracked.includes(trip.id)) {
          console.log("🆕 New trip to track:", trip.id.slice(0, 8))
          startTracking(trip)
        }
      })

      // Stop tracking for trips that are no longer in progress
      currentlyTracked.forEach((tripId) => {
        const trip = trips.find((t) => t.id === tripId)
        if (!trip || trip.status !== "IN_PROGRESS") {
          console.log("🛑 Stopping tracking for completed/cancelled trip:", tripId.slice(0, 8))
          stopTracking(tripId)
        }
      })
    })

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up Global Tracker")
      trackingIntervals.forEach((interval) => clearInterval(interval))
      trackingIntervals.clear()
      unsubscribe()
    }
  }, [startTracking, stopTracking, toast])

  return null // This is a logic-only component
}

// Export functions for manual control
export const startTripTracking = (trip: Trip) => {
  const buses = realtimeStore.getBuses()
  const bus = buses.find((b) => b.id === trip.bus_id)
  const tripName = bus?.nickname || trip.id.slice(0, 8)
  console.log("🚀 Manual start tracking:", tripName)

  // Clear existing interval
  const existingInterval = trackingIntervals.get(trip.id)
  if (existingInterval) {
    clearInterval(existingInterval)
  }

  const interval = setInterval(async () => {
    try {
      const { data: currentTrip, error } = await supabase.from("trips").select("*").eq("id", trip.id).single()
      if (error || !currentTrip || currentTrip.status !== "IN_PROGRESS") {
        console.log("❌ Trip not active, stopping manual tracking:", tripName)
        stopTripTracking(trip.id)
        return
      }

      const newProgress = Math.min(100, currentTrip.progress + 0.5)
      let currentLat = currentTrip.current_lat
      let currentLng = currentTrip.current_lng

      if (currentTrip.route && Array.isArray(currentTrip.route) && currentTrip.route.length > 0) {
        const routeIndex = Math.floor((newProgress / 100) * (currentTrip.route.length - 1))
        const currentPosition = currentTrip.route[routeIndex] || currentTrip.route[0]
        currentLat = currentPosition.lat
        currentLng = currentPosition.lng
      }

      const updates: Partial<Trip> = {
        progress: newProgress,
        current_lat: currentLat,
        current_lng: currentLng,
      }

      if (newProgress >= 100) {
        updates.status = "COMPLETED"
        updates.end_time = new Date().toISOString()
      }

      await updateTrip(trip.id, updates)

      if (currentLat && currentLng) {
        await updateBusLocation({
          bus_id: trip.bus_id,
          trip_id: trip.id,
          lat: currentLat,
          lng: currentLng,
          progress: newProgress,
          elapsed_time_minutes: 0, // Add this field
          timestamp: Date.now(),
        })
      }

      if (newProgress >= 100) {
        await updateBusStatus(trip.bus_id, false)
        setTimeout(async () => {
          await deleteBusLocation(trip.bus_id)
        }, 5000)
        stopTripTracking(trip.id)
      }

      console.log(`📊 Manual ${tripName}: ${newProgress.toFixed(1)}%`)
    } catch (manualError) {
      console.error("❌ Error in manual tracking:", manualError)
    }
  }, 1000)

  trackingIntervals.set(trip.id, interval)
  console.log("✅ Manual tracking started for:", tripName)
}

export const stopTripTracking = (tripId: string) => {
  const interval = trackingIntervals.get(tripId)
  if (interval) {
    clearInterval(interval)
    trackingIntervals.delete(tripId)
    console.log("🛑 Manual tracking stopped for:", tripId.slice(0, 8))
  }
}
