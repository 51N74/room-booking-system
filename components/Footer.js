import Link from "next/link"

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold mb-2">Room Booking System</h3>
            <p className="text-gray-300">Find and book the perfect room for your needs</p>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <p className="mb-2">
              Contact:{" "}
              <a href="mailto:jptns@proton.me" className="hover:text-blue-300">
                jptns@proton.me
              </a>
            </p>
            <p className="text-sm text-gray-400">
              <Link href="https://opensource.org/licenses/MIT" className="hover:text-blue-300">
                MIT License
              </Link>{" "}
              &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
