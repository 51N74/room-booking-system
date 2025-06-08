"use client"

import { useEffect } from "react"
import { useRouter } from "next/router"
import { useAuth } from "../context/AuthContext"
import LoadingSpinner from "./LoadingSpinner"

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated()) {
        router.push("/login")
      } else if (adminOnly && !isAdmin()) {
        router.push("/user/dashboard")
      }
    }
  }, [isAuthenticated, isAdmin, loading, router, adminOnly])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated() || (adminOnly && !isAdmin())) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute
