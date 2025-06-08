import Image from "next/image"
import Link from "next/link"

const RoomCard = ({ room }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      <div className="relative h-48">
        <Image
          src={room.image_url || "/placeholder.png?height=300&width=500"}
          alt={room.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
        <p className="text-gray-600 mb-2 line-clamp-2">{room.description}</p>
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-700">
            <span className="font-medium">Capacity:</span> {room.capacity} people
          </span>
          <span className="text-blue-600 font-bold">${room.price_per_hour}/hr</span>
        </div>
        <Link
          href={`/rooms/${room.id}`}
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}

export default RoomCard
