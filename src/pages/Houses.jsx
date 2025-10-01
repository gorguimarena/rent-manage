"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import HouseForm from "../components/HouseForm"
import HouseList from "../components/HouseList"
import { baseUrl, housesUrl } from "../config/url"

function Houses() {
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingHouse, setEditingHouse] = useState(null)
  const [error, setError] = useState("")
  const houseBase = `${baseUrl}${housesUrl}`

  useEffect(() => {
    fetchHouses()
  }, [])

  const fetchHouses = async () => {
    try {
      const response = await axios.get(`${baseUrl}${housesUrl}`)
      setHouses(response.data)
    } catch (error) {
      setError("Erreur lors du chargement des maisons")
      console.error("Error fetching houses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddHouse = () => {
    setEditingHouse(null)
    setShowForm(true)
  }

  const handleEditHouse = (house) => {
    setEditingHouse(house)
    setShowForm(true)
  }

  const handleDeleteHouse = async (houseId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette maison ?")) {
      try {
        await axios.delete(`${houseBase}/${houseId}`)
        setHouses(houses.filter((house) => house.id !== houseId))
      } catch (error) {
        setError("Erreur lors de la suppression de la maison")
        console.error("Error deleting house:", error)
      }
    }
  }

  const handleFormSubmit = async (houseData) => {
    try {
      if (editingHouse) {
        const response = await axios.put(`${houseBase}/${editingHouse.id}`, {
          ...houseData,
          id: editingHouse.id,
          occupied_units: editingHouse.occupied_units,
        })
        setHouses(houses.map((house) => (house.id === editingHouse.id ? response.data : house)))
      } else {
        // Add new house
        const response = await axios.post(`${houseBase}`, {
          ...houseData,
          occupied_units: 0,
        })
        setHouses([...houses, response.data])
      }
      setShowForm(false)
      setEditingHouse(null)
      setError("")
    } catch (error) {
      setError("Erreur lors de la sauvegarde de la maison")
      console.error("Error saving house:", error)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingHouse(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Maisons</h1>
        <button
          onClick={handleAddHouse}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Ajouter une maison
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="mb-6">
          <HouseForm house={editingHouse} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
        </div>
      )}

      <HouseList houses={houses} onEdit={handleEditHouse} onDelete={handleDeleteHouse} />
    </div>
  )
}

export default Houses
