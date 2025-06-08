"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "../../../components/Layout"
import ProtectedRoute from "../../../components/ProtectedRoute"
import LoadingSpinner from "../../../components/LoadingSpinner"
import { useAuth } from "../../../context/AuthContext"
import toast from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"

export default function BookRoom() {
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [bookingDate, setBookingDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [duration, setDuration] = useState(1)
  const router = useRouter()
  const { room_id } = router.query
  const { fetchWithAuth } = useAuth()

  // Calculate total price
  const totalPrice = room ? room.price_per_hour * duration : 0

  // Calculate end time based on start time and duration
  const calculateEndTime = () => {
    if (!startTime) return ""

    const [hours, minutes] = startTime.split(":").map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0)

    const endDate = new Date(startDate)
    endDate.setHours(endDate.getHours() + duration)

    return `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`
  }

  // Format date for API
  const formatDateForAPI = (date, time) => {
    if (!date || !time) return ""
    const [year, month, day] = date.split("-")
    const [hours, minutes] = time.split(":")
    return `${year}-${month}-${day}T${hours}:${minutes}:00`
  }

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!room_id) return

      try {
        setLoading(true)
        const response = await fetch(`http://0.0.0.0:3000/rooms/${room_id}`)

        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Room not found")
            router.push("/rooms")
            return
          }
          throw new Error("Failed to fetch room details")
        }

        const data = await response.json()
        setRoom(data)

        // Set default date to today
        const today = new Date().toISOString().split("T")[0]
        setBookingDate(today)
      } catch (error) {
        console.error("Error fetching room details:", error)
        toast.error("Failed to load room details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchRoomDetails()
  }, [room_id, router])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!bookingDate || !startTime || duration < 1) {
      toast.error("Please fill in all booking details")
      return
    }

    try {
      setSubmitting(true)

      const startDateTime = formatDateForAPI(bookingDate, startTime)
      const endDateTime = formatDateForAPI(bookingDate, calculateEndTime())

      const response = await fetchWithAuth("/bookings", {
        method: "POST",
        body: JSON.stringify({
          room_id: Number.parseInt(room_id),
          start_time: startDateTime,
          end_time: endDateTime,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create booking")
      }

      toast.success("Room booked successfully!")
      router.push("/user/dashboard")
    } catch (error) {
      console.error("Error booking room:", error)
      toast.error(error.message || "Failed to book room. Please try again later.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title="Loading Room Details">
          <div className="flex justify-center items-center min-h-[60vh]">
            <LoadingSpinner size="large" />
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  if (!room) {
    return null // This will prevent rendering before redirect happens
  }

  return (
    <ProtectedRoute>
      <Layout title={`Book ${room.name} - Room Booking System`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Book a Room</h1>

          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="md:flex">
              <div className="md:w-1/3 relative h-48 md:h-auto">
                <Image
                  src={room.image_url || "/placeholder.png?height=300&width=300"}
                  alt={room.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 md:w-2/3">
                <h2 className="text-2xl font-bold mb-2">{room.name}</h2>
                <p className="text-gray-600 mb-4">{room.description}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Capacity:</span>
                  <span className="font-medium">{room.capacity} people</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Price per hour:</span>
                  <span className="font-medium text-blue-600">${room.price_per_hour}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Booking Details</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="bookingDate">
                    Date
                  </label>
                  <input
                    type="date"
                    id="bookingDate"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="startTime">
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="duration">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    min="1"
                    max="24"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="endTime">
                    End Time
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    value={calculateEndTime()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                    disabled
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Price per hour:</span>
                  <span>${room.price_per_hour}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Duration:</span>
                  <span>
                    {duration} hour{duration !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total Price:</span>
                  <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium transition-colors disabled:opacity-50 flex-1"
                >
                  {submitting ? <LoadingSpinner size="small" /> : "Confirm Booking"}
                </button>
                <Link
                  href={`/rooms/${room_id}`}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-md text-center font-medium transition-colors flex-1"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
