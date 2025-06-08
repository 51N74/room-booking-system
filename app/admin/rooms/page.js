"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Layout from "../../../components/Layout"
import ProtectedRoute from "../../../components/ProtectedRoute"
import LoadingSpinner from "../../../components/LoadingSpinner"
import { useAuth } from "../../../context/AuthContext"
import toast from "react-hot-toast"
import { PlusCircle, Edit, Trash2, Search } from "lucide-react"

export default function AdminRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all") // 'all', 'active', 'inactive'
  const { fetchWithAuth } = useAuth()

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetchWithAuth("/admin/rooms")

        if (!response.ok) {
          throw new Error("Failed to fetch rooms")
        }

        const data = await response.json()
        setRooms(data)
      } catch (error) {
        console.error("Error fetching rooms:", error)
        toast.error("Failed to load rooms. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [fetchWithAuth])

  const handleDeleteRoom = async (roomId) => {
    if (!confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      return
    }

    try {
      setLoading(true)
      const response = await fetchWithAuth(`/admin/rooms/${roomId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete room")
      }

      // Remove the deleted room from state
      setRooms(rooms.filter((room) => room.id !== roomId))
      toast.success("Room deleted successfully")
    } catch (error) {
      console.error("Error deleting room:", error)
      toast.error("Failed to delete room. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRoomStatus = async (room) => {
    try {
      setLoading(true)
      const response = await fetchWithAuth(`/admin/rooms/${room.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          is_active: !room.is_active,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update room status")
      }

      // Update the room in state
      setRooms(rooms.map((r) => (r.id === room.id ? { ...r, is_active: !r.is_active } : r)))

      toast.success(`Room ${!room.is_active ? "activated" : "deactivated"} successfully`)
    } catch (error) {
      console.error("Error updating room status:", error)
      toast.error("Failed to update room status. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Filter and search rooms
  const filteredRooms = rooms.filter((room) => {
    // Search filter
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    const matchesFilter =
      filter === "all" || (filter === "active" && room.is_active) || (filter === "inactive" && !room.is_active)

    return matchesSearch && matchesFilter
  })

  return (
    <ProtectedRoute adminOnly>
      <Layout title="Manage Rooms - Admin Dashboard">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h1 className="text-3xl font-bold mb-2 md:mb-0">Manage Rooms</h1>
            <Link
              href="/admin/rooms/add"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors inline-flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              <span>Add New Room</span>
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Filter */}
              <div className="md:w-48">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Rooms</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rooms Table */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : filteredRooms.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Capacity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price/Hour
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
                    {filteredRooms.map((room) => (
                      <tr key={room.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{room.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{room.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{room.capacity} people</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${room.price_per_hour}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              room.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {room.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleToggleRoomStatus(room)}
                              className={`${
                                room.is_active
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              } py-1 px-3 rounded-md transition-colors`}
                            >
                              {room.is_active ? "Deactivate" : "Activate"}
                            </button>
                            <Link
                              href={`/admin/rooms/${room.id}/edit`}
                              className="bg-blue-100 text-blue-700 hover:bg-blue-200 py-1 px-3 rounded-md transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              className="bg-red-100 text-red-700 hover:bg-red-200 py-1 px-3 rounded-md transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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
              <p className="text-gray-500 mb-4">No rooms found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setFilter("all")
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
