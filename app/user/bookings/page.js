"use client"

import { useState, useEffect } from "react"
import Layout from "../../components/Layout"
import ProtectedRoute from "../../components/ProtectedRoute"
import LoadingSpinner from "../../components/LoadingSpinner"
import { useAuth } from "../../context/AuthContext"
import toast from "react-hot-toast"
import Link from "next/link"
import { Calendar, Clock, MapPin } from "lucide-react"

export default function UserBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // 'all', 'upcoming', 'past'
  const { fetchWithAuth } = useAuth()

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const response = await fetchWithAuth("/bookings/user")

        if (!response.ok) {
          throw new Error("Failed to fetch bookings")
        }

        const data = await response.json()
        setBookings(data)
      } catch (error) {
        console.error("Error fetching bookings:", error)
        toast.error("Failed to load your bookings. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserBookings()
  }, [fetchWithAuth])

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return
    }

    try {
      setLoading(true)
      const response = await fetchWithAuth(`/bookings/${bookingId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to cancel booking")
      }

      // Remove the cancelled booking from state
      setBookings(bookings.filter((booking) => booking.id !== bookingId))
      toast.success("Booking cancelled successfully")
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast.error("Failed to cancel booking. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Filter bookings based on selected filter
  const filteredBookings = bookings.filter((booking) => {
    const now = new Date()
    const bookingEnd = new Date(booking.end_time)

    if (filter === "upcoming") {
      return bookingEnd >= now
    } else if (filter === "past") {
      return bookingEnd < now
    }

    return true // 'all' filter
  })

  return (
    <ProtectedRoute>
      <Layout title="Your Bookings - Room Booking System">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h1 className="text-3xl font-bold mb-2 md:mb-0">Your Bookings</h1>
            <Link
              href="/rooms"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors inline-flex items-center"
            >
              <span>Book a Room</span>
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 font-medium ${
                filter === "all" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setFilter("all")}
            >
              All Bookings
            </button>
            <button
              className={`py-2 px-4 font-medium ${
                filter === "upcoming" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setFilter("upcoming")}
            >
              Upcoming
            </button>
            <button
              className={`py-2 px-4 font-medium ${
                filter === "past" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setFilter("past")}
            >
              Past
            </button>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const isPast = new Date(booking.end_time) < new Date()

                return (
                  <div
                    key={booking.id}
                    className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      isPast ? "border-gray-200" : "border-blue-200"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{booking.room?.name || "Room"}</h3>
                        <div className="flex items-center text-gray-600 mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className="text-sm">{formatDate(booking.start_time)}</span>
                        </div>
                        <div className="flex items-center text-gray-600 mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            Duration:{" "}
                            {Math.round((new Date(booking.end_time) - new Date(booking.start_time)) / (1000 * 60 * 60))}{" "}
                            hours
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">Room ID: {booking.room_id}</span>
                        </div>
                      </div>

                      <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
                        <Link
                          href={`/rooms/${booking.room_id}`}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm text-center transition-colors"
                        >
                          View Room
                        </Link>
                        {!isPast && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-md text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No bookings found.</p>
              <Link
                href="/rooms"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Book a Room Now
              </Link>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
