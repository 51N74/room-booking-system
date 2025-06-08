// components/Navbar.js (หรือ .tsx)
'use client'; // <-- ต้องมีบรรทัดนี้

import { useState } from 'react';
import Link from 'next/link'; // ใช้ Link จาก next/link
import { useRouter } from 'next/navigation'; // เปลี่ยนจาก 'next/router'
import { useAuth } from '../context/AuthContext'; // ตรวจสอบ path ให้ถูกต้อง

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth(); // Destructure ค่าจาก useAuth
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Room Booking
        </Link>

        <div className="hidden md:flex space-x-4 items-center">
          <Link href="/rooms" className="hover:text-gray-300">
            Rooms
          </Link>
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="hover:text-gray-300">
                  Admin Dashboard
                </Link>
              )}
              <Link href="/bookings/user" className="hover:text-gray-300">
                My Bookings
              </Link>
              <span className="text-gray-400">Hello, {user?.email || 'User'}</span>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-300">
                Login
              </Link>
              <Link href="/register" className="hover:text-gray-300">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-700 mt-2 p-4 space-y-2">
          <Link href="/rooms" className="block hover:text-gray-300">
            Rooms
          </Link>
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="block hover:text-gray-300">
                  Admin Dashboard
                </Link>
              )}
              <Link href="/bookings/user" className="block hover:text-gray-300">
                My Bookings
              </Link>
              <span className="block text-gray-400">Hello, {user?.email || 'User'}</span>
              <button onClick={handleLogout} className="block w-full text-left bg-red-500 hover:bg-red-600 px-3 py-1 rounded">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block hover:text-gray-300">
                Login
              </Link>
              <Link href="/register" className="block hover:text-gray-300">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;