"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import Link from "next/link"
import Layout from "../../components/Layout"
import LoadingSpinner from "../../components/LoadingSpinner"
import { useAuth } from "../../context/AuthContext"
import toast from "react-hot-toast"
import { Users, Clock, Calendar } from "lucide-react"

export default function RoomDetails() {
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { room_id } = router.query
  const { isAuthenticated } = useAuth()

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
      } catch (error) {
        console.error("Error fetching room details:", error)
        toast.error("Failed to load room details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchRoomDetails()
  }, [room_id, router])

  if (loading) {
    return (
      <Layout title="Loading Room Details">
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner size="large" />
        </div>
      </Layout>
    )
  }

  if (!room) {
    return null // This will prevent rendering before redirect happens
  }

  return (
    <Layout title={`${room.name} - Room Details`}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Room Image */}
        <div className="relative h-64 md:h-96">
          <Image
            src={room.image_url || "/placeholder.png?height=500&width=1000"}
            alt={room.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Room Details */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h1 className="text-3xl font-bold mb-2 md:mb-0">{room.name}</h1>
            <div className="text-2xl font-bold text-blue-600">${room.price_per_hour}/hour</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <span>Capacity: {room.capacity} people</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-600 mr-2" />
              <span>Available: {room.is_active ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <span>Bookable: {room.is_active ? "Yes" : "No"}</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{room.description}</p>
          </div>

          {/* Features List (Placeholder - you can replace with actual features) */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Features</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <li className="flex items-center">
                <span className="h-2 w-2 bg-blue-600 rounded-full mr-2"></span>
                <span>Wi-Fi</span>
              </li>
              <li className="flex items-center">
                <span className="h-2 w-2 bg-blue-600 rounded-full mr-2"></span>
                <span>Projector</span>
              </li>
              <li className="flex items-center">
                <span className="h-2 w-2 bg-blue-600 rounded-full mr-2"></span>
                <span>Whiteboard</span>
              </li>
              <li className="flex items-center">
                <span className="h-2 w-2 bg-blue-600 rounded-full mr-2"></span>
                <span>Air Conditioning</span>
              </li>
              <li className="flex items-center">
                <span className="h-2 w-2 bg-blue-600 rounded-full mr-2"></span>
                <span>Coffee Machine</span>
              </li>
              <li className="flex items-center">
                <span className="h-2 w-2 bg-blue-600 rounded-full mr-2"></span>
                <span>Water Dispenser</span>
              </li>
            </ul>
          </div>

          {/* Booking Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            {isAuthenticated() ? (
              <Link
                href={`/user/booking/${room.id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md text-center font-medium transition-colors"
              >
                Book This Room
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md text-center font-medium transition-colors"
              >
                Login to Book
              </Link>
            )}
            <Link
              href="/rooms"
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-md text-center font-medium transition-colors"
            >
              Back to Rooms
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
