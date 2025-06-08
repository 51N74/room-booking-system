"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "../../../../components/Layout"
import ProtectedRoute from "../../../../components/ProtectedRoute"
import LoadingSpinner from "../../../../components/LoadingSpinner"
import { useAuth } from "../../../../context/AuthContext"
import toast from "react-hot-toast"
import Link from "next/link"

export default function EditRoom() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: 1,
    price_per_hour: 0,
    is_active: true,
    image_url: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const { room_id } = router.query
  const { fetchWithAuth } = useAuth()

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!room_id) return

      try {
        setLoading(true)
        const response = await fetchWithAuth(`/admin/rooms/${room_id}`)

        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Room not found")
            router.push("/admin/rooms")
            return
          }
          throw new Error("Failed to fetch room details")
        }

        const data = await response.json()
        setFormData(data)
      } catch (error) {
        console.error("Error fetching room details:", error)
        toast.error("Failed to load room details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchRoomDetails()
  }, [room_id, router, fetchWithAuth])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Room name is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (formData.capacity < 1) {
      newErrors.capacity = "Capacity must be at least 1"
    }

    if (formData.price_per_hour <= 0) {
      newErrors.price_per_hour = "Price must be greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      setSubmitting(true)

      // Convert numeric fields to numbers
      const roomData = {
        ...formData,
        capacity: Number.parseInt(formData.capacity),
        price_per_hour: Number.parseFloat(formData.price_per_hour),
      }

      const response = await fetchWithAuth(`/admin/rooms/${room_id}`, {
        method: "PATCH",
        body: JSON.stringify(roomData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update room")
      }

      toast.success("Room updated successfully!")
      router.push("/admin/rooms")
    } catch (error) {
      console.error("Error updating room:", error)
      toast.error(error.message || "Failed to update room. Please try again later.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute adminOnly>
        <Layout title="Loading Room Details">
          <div className="flex justify-center items-center min-h-[60vh]">
            <LoadingSpinner size="large" />
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute adminOnly>
      <Layout title={`Edit ${formData.name} - Admin Dashboard`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Edit Room</h1>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="name">
                  Room Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter room name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-gray-700 mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter room description"
                ></textarea>
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="capacity">
                    Capacity (people)
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.capacity ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="price_per_hour">
                    Price per Hour ($)
                  </label>
                  <input
                    type="number"
                    id="price_per_hour"
                    name="price_per_hour"
                    value={formData.price_per_hour}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.price_per_hour ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.price_per_hour && <p className="text-red-500 text-sm mt-1">{errors.price_per_hour}</p>}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2" htmlFor="image_url">
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter image URL"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-gray-700">
                  Room is active and available for booking
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-medium transition-colors disabled:opacity-50 flex-1 flex justify-center items-center"
                >
                  {submitting ? <LoadingSpinner size="small" /> : "Update Room"}
                </button>
                <Link
                  href="/admin/rooms"
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-6 rounded-md text-center font-medium transition-colors flex-1"
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
