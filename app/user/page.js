"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Layout from "../../components/Layout"
import ProtectedRoute from "../../components/ProtectedRoute"
import LoadingSpinner from "../../components/LoadingSpinner"
import { useAuth } from "../../context/AuthContext"
import toast from "react-hot-toast"
import { Calendar, Clock, MapPin } from "lucide-react"

export default function UserDashboard() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, fetchWithAuth } = useAuth()

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

  return (
    <ProtectedRoute>
      <Layout title="User Dashboard - Room Booking System">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h1 className="text-3xl font-bold mb-2 md:mb-0">Your Dashboard</h1>
            <Link
              href="/rooms"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors inline-flex items-center"
            >
              <span>Book a Room</span>
            </Link>
          </div>

          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.username || "User"}!</h2>
            <p>Manage your room bookings and make new reservations from your personal dashboard.</p>
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Your Upcoming Bookings</h2>

            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="medium" />
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
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
                      </div>

                      <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
                        <Link
                          href={`/rooms/${booking.room_id}`}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm text-center transition-colors"
                        >
                          View Room
                        </Link>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-md text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">You don't have any upcoming bookings.</p>
                <Link
                  href="/rooms"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Book a Room Now
                </Link>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Link
                href="/rooms"
                className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg flex flex-col items-center text-center transition-colors"
              >
                <MapPin className="h-8 w-8 text-blue-600 mb-2" />
                <span className="font-medium">Browse Rooms</span>
                <span className="text-sm text-gray-600">Find available rooms</span>
              </Link>
              <Link
                href="/user/bookings"
                className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg flex flex-col items-center text-center transition-colors"
              >
                <Calendar className="h-8 w-8 text-blue-600 mb-2" />
                <span className="font-medium">Booking History</span>
                <span className="text-sm text-gray-600">View all your bookings</span>
              </Link>
              <div
                className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg flex flex-col items-center text-center transition-colors cursor-pointer"
                onClick={() => toast.success("Profile settings coming soon!")}
              >
                <Clock className="h-8 w-8 text-blue-600 mb-2" />
                <span className="font-medium">Account Settings</span>
                <span className="text-sm text-gray-600">Manage your profile</span>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
