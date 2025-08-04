const express = require("express")
const cors = require("cors")
const { createClient } = require("@supabase/supabase-js")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL is required in .env file")
  process.exit(1)
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is required in .env file")
  process.exit(1)
}

// Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Global tracking state
const activeTrips = new Map()
const trackingIntervals = new Map()

// Utility functions
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const toRadians = (degrees) => degrees * (Math.PI / 180)

// Realistic speed calculation based on route type and conditions
const getRealisticSpeed = (distance) => {
  let baseSpeed
  
  // Determine speed based on distance (route type)
  if (distance < 50) {
    // City routes: 25-40 km/h (traffic, stops)
    baseSpeed = Math.floor(Math.random() * (40 - 25 + 1)) + 25
  } else if (distance < 150) {
    // Inter-city routes: 45-65 km/h (mixed roads)
    baseSpeed = Math.floor(Math.random() * (65 - 45 + 1)) + 45
  } else {
    // Long distance routes: 60-80 km/h (highways with stops)
    baseSpeed = Math.floor(Math.random() * (80 - 60 + 1)) + 60
  }
  
  // Add random variation for traffic conditions (-10 to +5 km/h)
  const variation = Math.floor(Math.random() * 16) - 10
  return Math.max(20, Math.min(85, baseSpeed + variation)) // Keep within reasonable bounds
}

const formatElapsedTime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)

  if (hours > 0) {
    return `${hours}h${mins}m`
  }
  return `${mins}m`
}

// Start tracking a trip with realistic timing
const startTripTracking = async (trip) => {
  console.log(`🚀 Starting backend tracking for trip: ${trip.id}`)

  // Stop existing tracking if any
  if (trackingIntervals.has(trip.id)) {
    clearInterval(trackingIntervals.get(trip.id))
  }

  // Get bus info
  const { data: bus } = await supabase.from("buses").select("*").eq("id", trip.bus_id).single()

  const tripName = bus?.nickname || trip.id.slice(0, 8)

  // Calculate total distance
  let totalDistance = 0
  if (trip.route && trip.route.length > 1) {
    for (let i = 0; i < trip.route.length - 1; i++) {
      const point1 = trip.route[i]
      const point2 = trip.route[i + 1]
      totalDistance += calculateDistance(point1.lat, point1.lng, point2.lat, point2.lng)
    }
  } else {
    // Fallback: calculate direct distance
    totalDistance = calculateDistance(
      trip.departure.lat,
      trip.departure.lng,
      trip.destination.lat,
      trip.destination.lng,
    )
  }

  // Get realistic speed based on distance
  const realisticSpeed = getRealisticSpeed(totalDistance)
  
  // Calculate realistic completion time in minutes
  const estimatedTripTimeMinutes = (totalDistance / realisticSpeed) * 60
  
  // Calculate progress per update (every 30 seconds for smoother movement)
  const updateIntervalSeconds = 30
  const totalUpdates = Math.ceil(estimatedTripTimeMinutes * 60 / updateIntervalSeconds)
  const progressPerUpdate = 100 / totalUpdates

  console.log(
    `📊 ${tripName}: Distance: ${totalDistance.toFixed(1)}km, Speed: ${realisticSpeed}km/h, Estimated time: ${estimatedTripTimeMinutes.toFixed(0)} minutes`
  )

  const startTime = Date.now()
  let currentSpeed = realisticSpeed

  const interval = setInterval(async () => {
    try {
      // Get current trip data
      const { data: currentTrip, error } = await supabase.from("trips").select("*").eq("id", trip.id).single()

      if (error || !currentTrip || currentTrip.status !== "IN_PROGRESS") {
        console.log(`❌ ${tripName}: Trip not active, stopping tracking`)
        stopTripTracking(trip.id)
        return
      }

      // Calculate elapsed time in minutes
      const elapsedTimeMs = Date.now() - startTime
      const elapsedTimeMinutes = elapsedTimeMs / (1000 * 60)

      // Vary speed slightly for realism (+/- 5 km/h)
      const speedVariation = (Math.random() - 0.5) * 10
      currentSpeed = Math.max(15, Math.min(90, realisticSpeed + speedVariation))

      // Calculate new progress
      const newProgress = Math.min(100, currentTrip.progress + progressPerUpdate)

      // Calculate current position based on route
      let currentLat = currentTrip.current_lat
      let currentLng = currentTrip.current_lng

      if (currentTrip.route && Array.isArray(currentTrip.route) && currentTrip.route.length > 0) {
        const routeIndex = Math.floor((newProgress / 100) * (currentTrip.route.length - 1))
        const currentPosition = currentTrip.route[routeIndex] || currentTrip.route[0]
        currentLat = currentPosition.lat
        currentLng = currentPosition.lng
      }

      // Update trip progress
      const updates = {
        progress: newProgress,
        current_lat: currentLat,
        current_lng: currentLng,
        speed: Math.round(currentSpeed),
      }

      // If completed, mark as completed
      if (newProgress >= 100) {
        updates.status = "COMPLETED"
        updates.end_time = new Date().toISOString()
        console.log(`✅ ${tripName}: Trip completed in ${formatElapsedTime(elapsedTimeMinutes)} (realistic timing)`)
      }

      // Update trip in database
      await supabase.from("trips").update(updates).eq("id", trip.id)

      // Update bus location for real-time tracking
      if (currentLat && currentLng) {
        // Delete old location first
        await supabase.from("bus_locations").delete().eq("bus_id", trip.bus_id)

        // Insert new location with elapsed time
        await supabase.from("bus_locations").insert({
          bus_id: trip.bus_id,
          trip_id: trip.id,
          lat: currentLat,
          lng: currentLng,
          progress: newProgress,
          elapsed_time_minutes: elapsedTimeMinutes,
          timestamp: Date.now(),
        })
      }

      // If completed, clean up
      if (newProgress >= 100) {
        // Update bus status to inactive
        await supabase.from("buses").update({ is_active: false }).eq("id", trip.bus_id)

        // Remove bus location after 10 seconds
        setTimeout(async () => {
          await supabase.from("bus_locations").delete().eq("bus_id", trip.bus_id)
        }, 10000)

        stopTripTracking(trip.id)
      }

      console.log(
        `📊 ${tripName}: ${newProgress.toFixed(1)}% (${formatElapsedTime(elapsedTimeMinutes)}) - ${currentSpeed.toFixed(0)}km/h`
      )
    } catch (error) {
      console.error(`❌ Error tracking ${tripName}:`, error)
    }
  }, updateIntervalSeconds * 1000) // Update every 30 seconds for realistic movement

  trackingIntervals.set(trip.id, interval)
  activeTrips.set(trip.id, { ...trip, speed: realisticSpeed, startTime, totalDistance, estimatedTime: estimatedTripTimeMinutes })
}

// Stop tracking a trip
const stopTripTracking = (tripId) => {
  const interval = trackingIntervals.get(tripId)
  if (interval) {
    clearInterval(interval)
    trackingIntervals.delete(tripId)
    activeTrips.delete(tripId)
    console.log(`🛑 Stopped tracking trip: ${tripId.slice(0, 8)}`)
  }
}

// Initialize tracking for existing in-progress trips
const initializeTracking = async () => {
  console.log("🔄 Initializing backend tracking system...")

  try {
    // Test Supabase connection first
    const { data: testData, error: testError } = await supabase.from("buses").select("count").limit(1)

    if (testError) {
      console.error("❌ Supabase connection failed:", testError.message)
      return
    }

    console.log("✅ Supabase connection successful")

    const { data: inProgressTrips, error } = await supabase.from("trips").select("*").eq("status", "IN_PROGRESS")

    if (error) {
      console.error("❌ Error loading in-progress trips:", error)
      return
    }

    if (inProgressTrips && inProgressTrips.length > 0) {
      console.log(`🚀 Found ${inProgressTrips.length} in-progress trips, starting realistic tracking...`)

      for (const trip of inProgressTrips) {
        await startTripTracking(trip)
      }
    } else {
      console.log("✅ No in-progress trips found")
    }
  } catch (error) {
    console.error("❌ Error initializing tracking:", error)
  }
}

// API Routes
app.get("/api/health", (req, res) => {
  const activeTripsArray = Array.from(activeTrips.values()).map((trip) => ({
    id: trip.id,
    speed: trip.speed,
    distance: trip.totalDistance,
    estimatedTime: trip.estimatedTime,
    elapsedMinutes: (Date.now() - trip.startTime) / (1000 * 60),
  }))

  res.json({
    status: "OK",
    activeTrips: activeTrips.size,
    timestamp: new Date().toISOString(),
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Configured" : "❌ Missing",
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Configured" : "❌ Missing",
    trackingMode: "Realistic Speed (25-85 km/h)",
    updateInterval: "30 seconds",
    trips: activeTripsArray,
  })
})

app.post("/api/trips/:tripId/start", async (req, res) => {
  try {
    const { tripId } = req.params

    // Get trip data
    const { data: trip, error } = await supabase.from("trips").select("*").eq("id", tripId).single()

    if (error || !trip) {
      return res.status(404).json({ error: "Trip not found" })
    }

    // Update trip status
    await supabase
      .from("trips")
      .update({
        status: "IN_PROGRESS",
        start_time: new Date().toISOString(),
      })
      .eq("id", tripId)

    // Update bus status
    await supabase.from("buses").update({ is_active: true }).eq("id", trip.bus_id)

    // Start realistic tracking
    await startTripTracking({ ...trip, status: "IN_PROGRESS" })

    res.json({ 
      success: true, 
      message: "Trip started with realistic speed tracking",
      trackingMode: "Realistic timing based on distance and route type"
    })
  } catch (error) {
    console.error("Error starting trip:", error)
    res.status(500).json({ error: "Failed to start trip" })
  }
})

app.post("/api/trips/:tripId/cancel", async (req, res) => {
  try {
    const { tripId } = req.params

    // Get trip data
    const { data: trip, error } = await supabase.from("trips").select("*").eq("id", tripId).single()

    if (error || !trip) {
      return res.status(404).json({ error: "Trip not found" })
    }

    // Stop tracking
    stopTripTracking(tripId)

    // Update trip status
    await supabase
      .from("trips")
      .update({
        status: "CANCELLED",
        end_time: new Date().toISOString(),
      })
      .eq("id", tripId)

    // Update bus status
    await supabase.from("buses").update({ is_active: false }).eq("id", trip.bus_id)

    // Remove bus location
    await supabase.from("bus_locations").delete().eq("bus_id", trip.bus_id)

    res.json({ success: true, message: "Trip cancelled and tracking stopped" })
  } catch (error) {
    console.error("Error cancelling trip:", error)
    res.status(500).json({ error: "Failed to cancel trip" })
  }
})

app.get("/api/trips/active", (req, res) => {
  const activeTripsArray = Array.from(activeTrips.values()).map((trip) => ({
    id: trip.id,
    bus_id: trip.bus_id,
    speed: trip.speed,
    totalDistance: trip.totalDistance,
    estimatedTime: trip.estimatedTime,
    startTime: trip.startTime,
    elapsedMinutes: (Date.now() - trip.startTime) / (1000 * 60),
  }))

  res.json(activeTripsArray)
})

// Set up real-time subscriptions to database changes
const setupRealtimeSubscriptions = () => {
  console.log("📡 Setting up real-time subscriptions...")

  // Listen for trip changes
  supabase
    .channel("backend_trips")
    .on("postgres_changes", { event: "*", schema: "public", table: "trips" }, async (payload) => {
      console.log("🗺️ Backend trip change:", payload.eventType, payload.new?.id || payload.old?.id)

      if (payload.eventType === "UPDATE") {
        const trip = payload.new

        if (trip.status === "IN_PROGRESS" && !activeTrips.has(trip.id)) {
          console.log("🆕 New trip to track:", trip.id.slice(0, 8))
          await startTripTracking(trip)
        } else if (trip.status !== "IN_PROGRESS" && activeTrips.has(trip.id)) {
          console.log("🛑 Trip no longer in progress:", trip.id.slice(0, 8))
          stopTripTracking(trip.id)
        }
      }
    })
    .subscribe((status) => {
      console.log("📡 Backend trips subscription:", status)
    })
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Bus Tracking Backend Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔧 Environment:`)
  console.log(`   - Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Configured" : "❌ Missing"}`)
  console.log(`   - Supabase Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Configured" : "❌ Missing"}`)
  console.log(`🚌 Tracking Mode: Realistic Speed (25-85 km/h based on route type)`)
  console.log(`⏱️ Update Interval: 30 seconds for smooth movement`)

  // Initialize tracking and subscriptions
  await initializeTracking()
  setupRealtimeSubscriptions()

  console.log("✅ Backend tracking system ready with realistic timing!")
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("🛑 Shutting down backend server...")

  // Clear all intervals
  trackingIntervals.forEach((interval) => clearInterval(interval))
  trackingIntervals.clear()
  activeTrips.clear()

  console.log("✅ Backend server stopped")
  process.exit(0)
})