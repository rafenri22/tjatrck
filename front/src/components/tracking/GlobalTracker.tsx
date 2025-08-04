"use client"

import { useEffect, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { updateTrip, updateBusStatus, updateBusLocation, deleteBusLocation } from "@/lib/database"
import { realtimeStore } from "@/lib/realtime"
import type { Trip, Bus } from "@/types"
import { useToast } from "@/hooks/use-toast"

// Global tracking intervals
const trackingIntervals = new Map<string, NodeJS.Timeout>()
const tripStartTimes = new Map<string, number>()

// Perhitungan kecepatan realistis berdasarkan jenis rute
const getRealisticSpeed = (distance: number): number => {
  let baseSpeed
  
  // Tentukan kecepatan berdasarkan jarak (jenis rute)
  if (distance < 50) {
    // Rute kota: 25-40 km/jam (macet, lampu merah)
    baseSpeed = Math.floor(Math.random() * (40 - 25 + 1)) + 25
  } else if (distance < 150) {
    // Rute antar kota: 45-65 km/jam (jalan campuran)
    baseSpeed = Math.floor(Math.random() * (65 - 45 + 1)) + 45
  } else {
    // Rute jarak jauh: 60-80 km/jam (tol dengan berhenti)
    baseSpeed = Math.floor(Math.random() * (80 - 60 + 1)) + 60
  }
  
  // Tambah variasi acak untuk kondisi lalu lintas (-10 sampai +5 km/jam)
  const variation = Math.floor(Math.random() * 16) - 10
  return Math.max(20, Math.min(85, baseSpeed + variation)) // Tetap dalam batas wajar
}

// Hitung jarak antara dua koordinat
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371 // Radius bumi dalam kilometer
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const toRadians = (degrees: number): number => degrees * (Math.PI / 180)

export function GlobalTracker() {
  const { toast } = useToast()
  const isInitialized = useRef(false)

  // Mulai tracking untuk trip tertentu dengan timing realistis
  const startTracking = useCallback(
    (trip: Trip) => {
      const buses = realtimeStore.getBuses()
      const bus = buses.find((b) => b.id === trip.bus_id)
      const tripName = bus?.nickname || trip.id.slice(0, 8)
      console.log("🚀 Memulai GLOBAL tracking untuk:", tripName)

      // Hentikan interval yang ada
      const existingInterval = trackingIntervals.get(trip.id)
      if (existingInterval) {
        clearInterval(existingInterval)
      }

      // Simpan waktu mulai trip yang sebenarnya untuk perhitungan elapsed time yang akurat
      const actualStartTime = trip.start_time ? new Date(trip.start_time).getTime() : Date.now()
      tripStartTimes.set(trip.id, actualStartTime)

      // Hitung jarak total untuk kecepatan realistis
      let totalDistance = 0
      if (trip.route && trip.route.length > 1) {
        for (let i = 0; i < trip.route.length - 1; i++) {
          const point1 = trip.route[i]
          const point2 = trip.route[i + 1]
          totalDistance += calculateDistance(point1.lat, point1.lng, point2.lat, point2.lng)
        }
      } else {
        // Fallback: hitung jarak langsung
        totalDistance = calculateDistance(
          trip.departure.lat,
          trip.departure.lng,
          trip.destination.lat,
          trip.destination.lng,
        )
      }

      // Dapatkan kecepatan realistis berdasarkan jarak dan jenis rute
      const realisticSpeed = getRealisticSpeed(totalDistance)
      
      // Hitung waktu penyelesaian trip realistis dalam menit
      const estimatedTripTimeMinutes = (totalDistance / realisticSpeed) * 60
      
      // Hitung progress per update (setiap 5 detik untuk gerakan real-time yang sangat smooth)
      const updateIntervalSeconds = 5
      const totalUpdates = Math.ceil(estimatedTripTimeMinutes * 60 / updateIntervalSeconds)
      const progressPerUpdate = 100 / totalUpdates

      console.log(
        `📊 ${tripName}: Jarak: ${totalDistance.toFixed(1)}km, Kecepatan: ${realisticSpeed}km/jam, Est. waktu: ${estimatedTripTimeMinutes.toFixed(0)}menit`
      )

      let currentSpeed = realisticSpeed

      const interval = setInterval(async () => {
        try {
          // Dapatkan data trip saat ini
          const { data: currentTrip, error } = await supabase.from("trips").select("*").eq("id", trip.id).single()
          if (error || !currentTrip || currentTrip.status !== "IN_PROGRESS") {
            console.log("❌ Trip tidak aktif, menghentikan tracking:", tripName)
            stopTracking(trip.id)
            return
          }

          // Hitung AKURAT elapsed time dari stored start time
          const startTime = tripStartTimes.get(trip.id) || actualStartTime
          const elapsedTimeMs = Date.now() - startTime
          const elapsedTimeMinutes = elapsedTimeMs / (1000 * 60)

          // Variasi kecepatan sedikit untuk realisme (+/- 5 km/jam)
          const speedVariation = (Math.random() - 0.5) * 10
          currentSpeed = Math.max(15, Math.min(90, realisticSpeed + speedVariation))

          // Hitung progress baru berdasarkan timing realistis
          const newProgress = Math.min(100, currentTrip.progress + progressPerUpdate)

          // Hitung posisi saat ini berdasarkan rute
          let currentLat = currentTrip.current_lat
          let currentLng = currentTrip.current_lng
          if (currentTrip.route && Array.isArray(currentTrip.route) && currentTrip.route.length > 0) {
            const routeIndex = Math.floor((newProgress / 100) * (currentTrip.route.length - 1))
            const currentPosition = currentTrip.route[routeIndex] || currentTrip.route[0]
            currentLat = currentPosition.lat
            currentLng = currentPosition.lng
          }

          // Update progress trip dengan kecepatan realistis
          const updates: Partial<Trip> = {
            progress: newProgress,
            current_lat: currentLat,
            current_lng: currentLng,
            speed: Math.round(currentSpeed),
          }

          // Jika selesai, tandai sebagai selesai tapi tetap bus di tujuan
          if (newProgress >= 100) {
            updates.status = "COMPLETED"
            updates.end_time = new Date().toISOString()
            
            // Update bus menjadi tidak aktif tapi tetap lokasi di tujuan
            await updateBusStatus(trip.bus_id, false)
            
            toast({
              title: "✅ Trip Selesai",
              description: `${tripName} telah sampai tujuan dan parkir di sana`,
              variant: "success",
            })
            
            // Tetap lokasi bus di tujuan (jangan hapus)
            if (currentLat && currentLng) {
              await updateBusLocation({
                bus_id: trip.bus_id,
                trip_id: trip.id,
                lat: currentLat,
                lng: currentLng,
                progress: 100,
                elapsed_time_minutes: elapsedTimeMinutes,
                timestamp: Date.now(),
              })
            }
            
            stopTracking(trip.id)
          } else {
            // Update di database untuk trip yang sedang berjalan
            await updateTrip(trip.id, updates)

            // Update lokasi bus untuk tracking real-time dengan AKURAT elapsed time
            if (currentLat && currentLng) {
              await updateBusLocation({
                bus_id: trip.bus_id,
                trip_id: trip.id,
                lat: currentLat,
                lng: currentLng,
                progress: newProgress,
                elapsed_time_minutes: elapsedTimeMinutes,
                timestamp: Date.now(),
              })
            }
          }

          const formattedTime = `${Math.floor(elapsedTimeMinutes / 60)}j ${Math.floor(elapsedTimeMinutes % 60)}m`
          console.log(`📊 ${tripName}: ${newProgress.toFixed(1)}% (${formattedTime}) - ${currentSpeed.toFixed(0)}km/jam`)
        } catch (trackingError) {
          console.error("❌ Error dalam global tracking:", trackingError)
        }
      }, updateIntervalSeconds * 1000) // Update setiap 5 detik untuk gerakan real-time yang sangat smooth

      trackingIntervals.set(trip.id, interval)
      console.log(`✅ Global tracking dimulai untuk: ${tripName} dengan kecepatan realistis`)
    },
    [toast],
  )

  // Hentikan tracking untuk trip tertentu
  const stopTracking = useCallback((tripId: string) => {
    const interval = trackingIntervals.get(tripId)
    if (interval) {
      clearInterval(interval)
      trackingIntervals.delete(tripId)
      tripStartTimes.delete(tripId) // Bersihkan penyimpanan start time
      console.log("🛑 Global tracking dihentikan untuk:", tripId.slice(0, 8))
    }
  }, [])

  // Inisialisasi tracking saat mount dengan enhanced real-time subscriptions
  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true
    console.log("🔄 Menginisialisasi Global Tracker dengan enhanced real-time...")

    // Mulai tracking untuk trip yang sedang berjalan
    const checkAndStartTracking = async () => {
      // Tunggu store terisi
      setTimeout(() => {
        const trips = realtimeStore.getTrips()
        const inProgressTrips = trips.filter((trip) => trip.status === "IN_PROGRESS")
        console.log(`Ditemukan ${inProgressTrips.length} trip yang sedang berjalan`)
        
        inProgressTrips.forEach((trip) => {
          if (!trackingIntervals.has(trip.id)) {
            startTracking(trip)
          }
        })
        
        if (inProgressTrips.length > 0) {
          toast({
            title: "🚌 Real-time Tracking Aktif",
            description: `Memantau ${inProgressTrips.length} trip dengan update langsung setiap 5 detik`,
            variant: "default",
          })
        }
      }, 1000)
    }

    // Pengecekan awal
    checkAndStartTracking()

    // Enhanced real-time subscription ke perubahan trip
    const unsubscribe = realtimeStore.subscribe(() => {
      const trips = realtimeStore.getTrips()
      const inProgressTrips = trips.filter((trip) => trip.status === "IN_PROGRESS")
      const currentlyTracked = Array.from(trackingIntervals.keys())

      // Mulai tracking untuk trip baru yang sedang berjalan
      inProgressTrips.forEach((trip) => {
        if (!currentlyTracked.includes(trip.id)) {
          console.log("🆕 Trip baru terdeteksi untuk real-time tracking:", trip.id.slice(0, 8))
          startTracking(trip)
        }
      })

      // Hentikan tracking untuk trip yang tidak lagi berjalan
      currentlyTracked.forEach((tripId) => {
        const trip = trips.find((t) => t.id === tripId)
        if (!trip || trip.status !== "IN_PROGRESS") {
          console.log("🛑 Menghentikan tracking untuk trip selesai/dibatalkan:", tripId.slice(0, 8))
          stopTracking(tripId)
        }
      })
    })

    // Set up monitoring tambahan real-time untuk lokasi bus (force UI update setiap detik)
    const locationUpdateInterval = setInterval(() => {
      // Force notifikasi kecil untuk memastikan UI terupdate
      const currentLocations = realtimeStore.getBusLocations()
      realtimeStore.setBusLocations([...currentLocations])
    }, 1000) // Setiap 1 detik pastikan UI terupdate

    // Cleanup saat unmount
    return () => {
      console.log("🧹 Membersihkan Global Tracker")
      trackingIntervals.forEach((interval) => clearInterval(interval))
      trackingIntervals.clear()
      tripStartTimes.clear()
      clearInterval(locationUpdateInterval)
      isInitialized.current = false
      unsubscribe()
    }
  }, [startTracking, stopTracking, toast])

  // Handle penempatan bus untuk trip baru
  useEffect(() => {
    const handleNewTrips = () => {
      const trips = realtimeStore.getTrips()
      const buses = realtimeStore.getBuses()
  
      trips
        .filter(trip => trip.status === "PENDING")
        .forEach(async (trip) => {
          const bus = buses.find(b => b.id === trip.bus_id)
          if (bus && !bus.is_active) {
            try {
              await updateBusLocation({
                bus_id: trip.bus_id,
                trip_id: trip.id,
                lat: trip.departure.lat,
                lng: trip.departure.lng,
                progress: 0,
                elapsed_time_minutes: 0,
                timestamp: Date.now(),
              })
              console.log(`📍 Bus diposisikan di keberangkatan: ${trip.departure.name}`)
            } catch (error) {
              console.error("Error memposisikan bus:", error)
            }
          }
        })
    }
  
    const unsubscribe = realtimeStore.subscribe(handleNewTrips)
  
    return () => {
      unsubscribe() // jalankan saja, jangan return
    }
  }, [])  

  return null // Komponen hanya untuk logic
}

// Export fungsi untuk kontrol manual dengan enhanced bus positioning
export const startTripTracking = (trip: Trip) => {
  const buses = realtimeStore.getBuses()
  const bus = buses.find((b) => b.id === trip.bus_id)
  const tripName = bus?.nickname || trip.id.slice(0, 8)
  console.log("🚀 Manual start tracking:", tripName)

  // Hentikan interval yang ada
  const existingInterval = trackingIntervals.get(trip.id)
  if (existingInterval) {
    clearInterval(existingInterval)
  }

  // Simpan start time untuk elapsed time yang akurat
  const startTime = trip.start_time ? new Date(trip.start_time).getTime() : Date.now()
  tripStartTimes.set(trip.id, startTime)

  // Hitung timing realistis berdasarkan jarak
  let totalDistance = 0
  if (trip.route && trip.route.length > 1) {
    for (let i = 0; i < trip.route.length - 1; i++) {
      const point1 = trip.route[i]
      const point2 = trip.route[i + 1]
      totalDistance += calculateDistance(point1.lat, point1.lng, point2.lat, point2.lng)
    }
  } else {
    totalDistance = calculateDistance(
      trip.departure.lat,
      trip.departure.lng,
      trip.destination.lat,
      trip.destination.lng,
    )
  }

  const realisticSpeed = getRealisticSpeed(totalDistance)
  const estimatedTripTimeMinutes = (totalDistance / realisticSpeed) * 60
  const updateIntervalSeconds = 5 // Update lebih cepat untuk smooth real-time
  const totalUpdates = Math.ceil(estimatedTripTimeMinutes * 60 / updateIntervalSeconds)
  const progressPerUpdate = 100 / totalUpdates

  const interval = setInterval(async () => {
    try {
      const { data: currentTrip, error } = await supabase.from("trips").select("*").eq("id", trip.id).single()
      if (error || !currentTrip || currentTrip.status !== "IN_PROGRESS") {
        console.log("❌ Trip tidak aktif, menghentikan manual tracking:", tripName)
        stopTripTracking(trip.id)
        return
      }

      // Hitung elapsed time yang akurat
      const tripStartTime = tripStartTimes.get(trip.id) || startTime
      const elapsedTimeMs = Date.now() - tripStartTime
      const elapsedTimeMinutes = elapsedTimeMs / (1000 * 60)

      const newProgress = Math.min(100, currentTrip.progress + progressPerUpdate)
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
        speed: Math.round(realisticSpeed),
      }

      if (newProgress >= 100) {
        updates.status = "COMPLETED"
        updates.end_time = new Date().toISOString()
        
        // Tetap bus di tujuan, jangan kembali ke garasi
        await updateBusStatus(trip.bus_id, false)
      }

      await updateTrip(trip.id, updates)

      if (currentLat && currentLng) {
        await updateBusLocation({
          bus_id: trip.bus_id,
          trip_id: trip.id,
          lat: currentLat,
          lng: currentLng,
          progress: newProgress,
          elapsed_time_minutes: elapsedTimeMinutes,
          timestamp: Date.now(),
        })
      }

      if (newProgress >= 100) {
        stopTripTracking(trip.id)
      }

      console.log(`📊 Manual ${tripName}: ${newProgress.toFixed(1)}% (${Math.floor(elapsedTimeMinutes)}m)`)
    } catch (manualError) {
      console.error("❌ Error dalam manual tracking:", manualError)
    }
  }, updateIntervalSeconds * 1000)

  trackingIntervals.set(trip.id, interval)
  console.log("✅ Manual tracking dimulai untuk:", tripName)
}

export const stopTripTracking = (tripId: string) => {
  const interval = trackingIntervals.get(tripId)
  if (interval) {
    clearInterval(interval)
    trackingIntervals.delete(tripId)
    tripStartTimes.delete(tripId)
    console.log("🛑 Manual tracking dihentikan untuk:", tripId.slice(0, 8))
  }
}