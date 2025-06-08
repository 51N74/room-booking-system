"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import RoomCard from "../components/RoomCard"
import LoadingSpinner from "../components/LoadingSpinner"
import Link from "next/link"
import toast from "react-hot-toast"

export default function Home() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActiveRooms = async () => {
      try {
        const response = await fetch("http://0.0.0.0:3000/rooms/active")

        if (!response.ok) {
          throw new Error("Failed to fetch active rooms")
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

    fetchActiveRooms()
  }, [])

  return (
    <Layout title="Room Booking System - Home">
      <section className="mb-10">
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-16 px-4 rounded-lg shadow-lg">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Room</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Browse and book from our selection of premium rooms for meetings, events, and more.
            </p>
            <Link
              href="/rooms"
              className="bg-white text-blue-700 hover:bg-gray-100 px-6 py-3 rounded-md font-medium text-lg transition-colors"
            >
              Explore All Rooms
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Available Rooms</h2>
          <Link href="/rooms" className="text-blue-600 hover:text-blue-800">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.slice(0, 6).map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No rooms available at the moment.</p>
          </div>
        )}
      </section>

      <section className="mt-16 bg-gray-100 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Browse Rooms</h3>
            <p className="text-gray-600">Explore our selection of available rooms with detailed information.</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Select Time Slot</h3>
            <p className="text-gray-600">Choose your preferred date and time for your booking.</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Confirm Booking</h3>
            <p className="text-gray-600">Complete your reservation with just a few clicks.</p>
          </div>
        </div>
      </section>
    </Layout>
  )
}
