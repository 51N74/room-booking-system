"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Layout from "../../components/Layout"
import ProtectedRoute from "../../components/ProtectedRoute"
import LoadingSpinner from "../../components/LoadingSpinner"
import { useAuth } from "../../context/AuthContext"
import toast from "react-hot-toast"
import { Users, Calendar, Home, PlusCircle, List } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeRooms: 0,
    totalBookings: 0,
    totalUsers: 0,
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, fetchWithAuth } = useAuth()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch rooms
        const roomsResponse = await fetchWithAuth("/admin/rooms")
        if (!roomsResponse.ok) throw new Error("Failed to fetch rooms")
        const roomsData = await roomsResponse.json()

        // Fetch bookings
        const bookingsResponse = await fetchWithAuth("/admin/bookings")
        if (!bookingsResponse.ok) throw new Error("Failed to fetch bookings")
        const bookingsData = await bookingsResponse.json()

        // Fetch users
        const usersResponse = await fetchWithAuth("/admin/users")
        if (!usersResponse.ok) throw new Error("Failed to fetch users")
        const usersData = await usersResponse.json()

        // Update stats
        setStats({
          totalRooms: roomsData.length,
          activeRooms: roomsData.filter((room) => room.is_active).length,
          totalBookings: bookingsData.length,
          totalUsers: usersData.length,
        })

        // Get recent bookings (last 5)
        setRecentBookings(bookingsData.slice(0, 5))
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast.error("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [fetchWithAuth])

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
    <ProtectedRoute adminOnly>
      <Layout title="Admin Dashboard - Room Booking System">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h1 className="text-3xl font-bold mb-2 md:mb-0">Admin Dashboard</h1>
            <div className="flex gap-2">
              <Link
                href="/admin/rooms/add"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors inline-flex items-center"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                <span>Add Room</span>
              </Link>
            </div>
          </div>

          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.username || "Admin"}!</h2>
            <p>Manage rooms, bookings, and users from your admin dashboard.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Home className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Rooms</p>
                    <p className="text-2xl font-bold">{stats.totalRooms}</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Home className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Rooms</p>
                    <p className="text-2xl font-bold">{stats.activeRooms}</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Bookings</p>
                    <p className="text-2xl font-bold">{stats.totalBookings}</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                  <div className="bg-orange-100 p-3 rounded-full mr-4">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Recent Bookings</h2>
                  <Link href="/admin/bookings" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                    View All <List className="h-4 w-4 ml-1" />
                  </Link>
                </div>

                {recentBookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Room
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Start Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            End Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentBookings.map((booking) => (
                          <tr key={booking.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.room?.name || `Room ${booking.room_id}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {booking.user?.username || `User ${booking.user_id}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{formatDate(booking.start_time)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{formatDate(booking.end_time)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Link
                                href={`/rooms/${booking.room_id}`}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                View Room
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No recent bookings found.</p>
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                  href="/admin/rooms"
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full mr-3">
                      <Home className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Manage Rooms</h3>
                  </div>
                  <p className="text-gray-600">Add, edit, or remove rooms from the system.</p>
                </Link>
                <Link
                  href="/admin/bookings"
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-100 p-3 rounded-full mr-3">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Manage Bookings</h3>
                  </div>
                  <p className="text-gray-600">View and manage all room bookings.</p>
                </Link>
                <Link
                  href="/admin/users"
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-orange-100 p-3 rounded-full mr-3">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Manage Users</h3>
                  </div>
                  <p className="text-gray-600">View and manage user accounts.</p>
                </Link>
              </div>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
