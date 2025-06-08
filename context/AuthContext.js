"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // เปลี่ยนจาก 'next/router'
import toast from 'react-hot-toast'; // ถ้าใช้ react-hot-toast

// กำหนด Context
const AuthContext = createContext(undefined); 

// Hook สำหรับใช้งาน Auth Context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        // นี่คือส่วนสำคัญ! ถ้า useAuth ถูกเรียกใช้นอก AuthProvider จะเกิด Error นี้
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user data:", error)
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  // API call helper with auth header
  const fetchWithAuth = async (url, options = {}) => {
    if (!user || !user.token) {
      throw new Error("No authentication token available")
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
      ...options.headers,
    }

    try {
      const response = await fetch(`http://0.0.0.0:3000${url}`, {
        ...options,
        headers,
      })

      // Handle token expiration
      if (response.status === 401) {
        logout()
        toast.error("Your session has expired. Please login again.")
        router.push("/login")
        throw new Error("Authentication token expired")
      }

      return response
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Login function
  const login = async (credentials, role) => {
    setLoading(true)
    try {
      const endpoint = role === "admin" ? "/login/admin" : "/login/user"
      const response = await fetch(`http://0.0.0.0:3000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }

      const data = await response.json()

      // Store user data with token and role
      const userData = {
        ...data.user,
        token: data.token,
        role: role,
      }

      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))

      toast.success("Login successful!")

      // Redirect based on role
      if (role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/user/dashboard")
      }

      return userData
    } catch (error) {
      toast.error(error.message || "Login failed")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Register function
  const register = async (userData, role) => {
    setLoading(true)
    try {
      const endpoint = role === "admin" ? "/admin" : "/register"
      const response = await fetch(`http://0.0.0.0:3000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Registration failed")
      }

      const data = await response.json()
      toast.success("Registration successful! Please login.")
      router.push("/login")
      return data
    } catch (error) {
      toast.error(error.message || "Registration failed")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    toast.success("Logged out successfully")
    router.push("/")
  }

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!user.token
  }

  // Check if user is admin
  const isAdmin = () => {
    return isAuthenticated() && user.role === "admin"
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    fetchWithAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
