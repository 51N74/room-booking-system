"use client"

import { useState, useEffect } from "react"
import Layout from "../../../components/Layout"
import ProtectedRoute from "../../../components/ProtectedRoute"
import LoadingSpinner from "../../../components/LoadingSpinner"
import { useAuth } from "../../../context/AuthContext"
import toast from "react-hot-toast"
import Link from "next/link"
import { Search, Trash2, User } from "lucide-react"

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { user: currentUser, fetchWithAuth } = useAuth()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetchWithAuth("/admin/users")

        if (!response.ok) {
          throw new Error("Failed to fetch users")
        }

        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast.error("Failed to load users. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [fetchWithAuth])

  const handleDeleteUser = async (userId) => {
    // Prevent deleting the current user
    if (userId === currentUser.id) {
      toast.error("You cannot delete your own account")
      return
    }

    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      setLoading(true)
      const response = await fetchWithAuth(`/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      // Remove the deleted user from state
      setUsers(users.filter((user) => user.id !== userId))
      toast.success("User deleted successfully")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    return (
      !searchTerm ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  return (
    <ProtectedRoute adminOnly>
      <Layout title="Manage Users - Admin Dashboard">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Manage Users</h1>

          {/* Search */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className={user.id === currentUser.id ? "bg-blue-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.username}
                                {user.id === currentUser.id && (
                                  <span className="ml-2 text-xs text-blue-600">(You)</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.is_admin ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.is_admin ? "Admin" : "User"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="bg-blue-100 text-blue-700 hover:bg-blue-200 py-1 px-3 rounded-md transition-colors"
                            >
                              View
                            </Link>
                            {user.id !== currentUser.id && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-100 text-red-700 hover:bg-red-200 py-1 px-3 rounded-md transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500 mb-4">No users found matching your search.</p>
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="text-blue-600 hover:text-blue-800">
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
