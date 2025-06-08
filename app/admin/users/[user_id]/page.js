"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "../../../components/Layout"
import ProtectedRoute from "../../../components/ProtectedRoute"
import LoadingSpinner from "../../../components/LoadingSpinner"
import { useAuth } from "../../../context/AuthContext"
import toast from "react-hot-toast"
import Link from "next/link"
import { User, ArrowLeft, Trash2 } from "lucide-react"

export default function UserDetails() {
  const [userData, setUserData] = useState(null)
  const [userBookings, setUserBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user_id } = router.query
  const { user: currentUser, fetchWithAuth } = useAuth()

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user_id) return

      try {
        setLoading(true)

        // Fetch user details
        const userResponse = await fetchWithAuth(`/admin/users/${user_id}`)

        if (!userResponse.ok) {
          if (userResponse.status === 404) {
            toast.error("User not found")
            router.push("/admin/users")
            return
          }
          throw new Error("Failed to fetch user details")
        }

        const userData = await userResponse.json()
        setUserData(userData)

        // Fetch user bookings
        const bookingsResponse = await fetchWithAuth(`/admin/bookings/user/${user_id}`)

        if (!bookingsResponse.ok) {
          throw new Error("Failed to fetch user bookings")
        }

        const bookingsData = await bookingsResponse.json()
        setUserBookings(bookingsData)
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Failed to load user data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user_id, router, fetchWithAuth])

  const handleDeleteUser = async () => {
    // Prevent deleting the current user
    if (userData.id === currentUser.id) {
      toast.error("You cannot delete your own account")
      return
    }

    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      setLoading(true)
      const response = await fetchWithAuth(`/admin/users/${user_id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      toast.success("User deleted successfully")
      router.push("/admin/users")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user. Please try again later.")
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

  if (loading) {
    return (
      <ProtectedRoute adminOnly>
        <Layout title="Loading User Details">
          <div className="flex justify-center items-center min-h-[60vh]">
            <LoadingSpinner size="large" />
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  if (!userData) {
    return null // This will prevent rendering before redirect happens
  }

  return (
    <ProtectedRoute adminOnly>
      <Layout title={`${userData.username} - User Details`}>
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Link href="/admin/users" className="mr-4 text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold">User Details</h1>
          </div>

          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-shrink-0 h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                <User className="h-12 w-12 text-gray-500" />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  {userData.username}
                  {userData.id === currentUser.id && <span className="ml-2 text-sm text-blue-600">(You)</span>}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{userData.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Role</p>
                    <p className="font-medium">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userData.is_admin ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {userData.is_admin ? "Admin" : "User"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">User ID</p>
                    <p className="font-medium">{userData.id}</p>
                  </div>
                </div>
              </div>

              {userData.id !== currentUser.id && (
                <div className="mt-4 md:mt-0 md:ml-6">
                  <button
                    onClick={handleDeleteUser}
                    className="bg-red-100 text-red-700 hover:bg-red-200 py-2 px-4 rounded-md transition-colors flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span>Delete User</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User Bookings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">User Bookings</h2>

            {userBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
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
                    {userBookings.map((booking) => {
                      const isPast = new Date(booking.end_time) < new Date()

                      return (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.room?.name || `Room ${booking.room_id}`}
                            </div>
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
                            <Link href={`/rooms/${booking.room_id}`} className="text-blue-600 hover:text-blue-900">
                              View Room
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">This user has no bookings.</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
