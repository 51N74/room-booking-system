"use client"

import { useState, useEffect } from "react"
import Layout from "../../components/Layout"
import RoomCard from "../../components/RoomCard"
import LoadingSpinner from "../../components/LoadingSpinner"
import toast from "react-hot-toast"
import { Search } from "lucide-react"

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [capacityFilter, setCapacityFilter] = useState("")
  const [priceSort, setPriceSort] = useState("")

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("http://0.0.0.0:3000/rooms")

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
  }, [])

  // Filter and sort rooms
  const filteredRooms = rooms
    .filter((room) => {
      // Search filter
      const matchesSearch =
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description.toLowerCase().includes(searchTerm.toLowerCase())

      // Capacity filter
      const matchesCapacity =
        !capacityFilter ||
        (capacityFilter === "1-5" && room.capacity <= 5) ||
        (capacityFilter === "6-10" && room.capacity > 5 && room.capacity <= 10) ||
        (capacityFilter === "10+" && room.capacity > 10)

      return matchesSearch && matchesCapacity
    })
    .sort((a, b) => {
      // Price sorting
      if (priceSort === "low-to-high") {
        return a.price_per_hour - b.price_per_hour
      } else if (priceSort === "high-to-low") {
        return b.price_per_hour - a.price_per_hour
      }
      return 0
    })

  return (
    <Layout title="All Rooms - Room Booking System">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Browse All Rooms</h1>

        {/* Search and Filter Section */}
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

            {/* Capacity Filter */}
            <div className="md:w-48">
              <select
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Capacities</option>
                <option value="1-5">1-5 People</option>
                <option value="6-10">6-10 People</option>
                <option value="10+">10+ People</option>
              </select>
            </div>

            {/* Price Sort */}
            <div className="md:w-48">
              <select
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sort by Price</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">No rooms found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm("")
                setCapacityFilter("")
                setPriceSort("")
              }}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}
