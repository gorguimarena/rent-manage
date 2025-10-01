"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { baseUrl, usersUrl } from "../config/url"

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await axios.get(`${baseUrl}${usersUrl}`)
      
      const users = response.data
      console.log(users);

      const user = users.find((u) => u.email === email && u.password === password)

      if (user) {
        setUser(user)
        localStorage.setItem("user", JSON.stringify(user))
        return { success: true }
      } else {
        return { success: false, error: "Email ou mot de passe incorrect" }
      }
    } catch (error) {
      return { success: false, error: "Erreur de connexion au serveur" }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const value = {
    user,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
