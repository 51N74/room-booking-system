"use client"

import { useState, useEffect } from "react"
import Layout from "../../components/Layout"
import ProtectedRoute from "../../components/ProtectedRoute"
import LoadingSpinner from "../../components/LoadingSpinner"
import { useAuth } from "../../context/AuthContext"
import toast from "react-hot-toast"
import Link from "next/link"
import { Search, Trash2 } from "lucide-react"

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all") // 'all', 'upcoming', 'past'
  const [roomFilter, setRoomFilter] = useState("")
  const [rooms, setRooms] = useState([])
  const { fetchWithAuth } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch all bookings
        const bookingsResponse = await fetchWithAuth("/admin/bookings")
        if (!bookingsResponse.ok) {
          throw new Error("Failed to fetch bookings")
        }
        const bookingsData = await bookingsResponse.json()
        setBookings(bookingsData)

        // Fetch all rooms for filtering
        const roomsResponse = await fetchWithAuth("/admin/rooms")
        if (!roomsResponse.ok) {
          throw new Error("Failed to fetch rooms")
        }
        const roomsData = await roomsResponse.json()
        setRooms(roomsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load bookings. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fetchWithAuth])

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
      return
    }

    try {
      setLoading(true)
      const response = await fetchWithAuth(`/admin/bookings/${bookingId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete booking")
      }

      // Remove the deleted booking from state
      setBookings(bookings.filter((booking) => booking.id !== bookingId))
      toast.success("Booking deleted successfully")
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast.error("Failed to delete booking. Please try again later.")
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

  // Filter bookings based on selected filters and search term
  const filteredBookings = bookings.filter((booking) => {
    const now = new Date()
    const bookingEnd = new Date(booking.end_time)

    // Time filter
    const matchesTimeFilter =
      filter === "all" || (filter === "upcoming" && bookingEnd >= now) || (filter === "past" && bookingEnd < now)

    // Room filter
    const matchesRoomFilter = !roomFilter || booking.room_id.toString() === roomFilter

    // Search filter (search by user or room name if available)
    const matchesSearch =
      !searchTerm ||
      (booking.user?.username && booking.user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.room?.name && booking.room.name.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesTimeFilter && matchesRoomFilter && matchesSearch
  })

  return (
    <ProtectedRoute adminOnly>
      <Layout title="Manage Bookings - Admin Dashboard">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by user or room..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Time Filter */}
              <div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Bookings</option>
                  <option value="upcoming">Upcoming Bookings</option>
                  <option value="past">Past Bookings</option>
                </select>
              </div>

              {/* Room Filter */}
              <div>
                <select
                  value={roomFilter}
                  onChange={(e) => setRoomFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Rooms</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => {
                      const isPast = new Date(booking.end_time) < new Date()

                      return (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.user?.username || `User ${booking.user_id}`}
                            </div>
                            <div className="text-xs text-gray-500">ID: {booking.user_id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.room?.name || `Room ${booking.room_id}`}
                            </div>
                            <div className="text-xs text-gray-500">ID: {booking.room_id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(booking.start_time)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(booking.end_time)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                isPast ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"
                              }`}
                            >
                              {isPast ? "Completed" : "Upcoming"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Link
                                href={`/rooms/${booking.room_id}`}
                                className="bg-blue-100 text-blue-700 hover:bg-blue-200 py-1 px-3 rounded-md transition-colors"
                              >
                                View Room
                              </Link>
                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
                                className="bg-red-100 text-red-700 hover:bg-red-200 py-1 px-3 rounded-md transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500 mb-4">No bookings found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setFilter("all")
                  setRoomFilter("")
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
