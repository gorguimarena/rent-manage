"use client"

import { useState } from "react"
import HouseForm from "../components/HouseForm"
import HouseList from "../components/HouseList"
import Loader from "../components/Loader"
import { useAuth } from "../contexts/AuthContext"
import { usePermissions } from "../hooks/usePermissions"
import { useHouses } from "../hooks/useDataQueries"

function Houses() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const [showForm, setShowForm] = useState(false)
  const [editingHouse, setEditingHouse] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const {
    houses,
    loading,
    error,
    addHouse,
    updateHouse,
    deleteHouse
  } = useHouses()

  // Vérifier si l'utilisateur peut voir cette page
  if (!hasPermission(user, 'canViewHouses')) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-600 text-lg font-medium">Accès refusé</div>
        <p className="text-gray-600 mt-2">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      </div>
    )
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
        await deleteHouse(houseId)
      } catch (error) {
        console.error("Error deleting house:", error)
        // Error is handled by the hook
      }
    }
  }

  const handleFormSubmit = async (houseData) => {
    try {
      if (editingHouse) {
        await updateHouse(editingHouse.id, {
          ...houseData,
          occupied_units: editingHouse.occupied_units,
        })
      } else {
        // Add new house
        await addHouse({
          ...houseData,
          occupied_units: 0,
        })
      }
      setShowForm(false)
      setEditingHouse(null)
    } catch (error) {
      console.error("Error saving house:", error)
      // Error is handled by the hook
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingHouse(null)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  if (loading) {
    return <Loader text="Chargement des maisons..." />
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion des Maisons</h1>
        {hasPermission(user, 'canManageHouses') && (
          <button
            onClick={handleAddHouse}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
          >
            Ajouter une maison
          </button>
        )}
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

      <HouseList
        houses={houses}
        onEdit={handleEditHouse}
        onDelete={handleDeleteHouse}
        canManageHouses={hasPermission(user, 'canManageHouses')}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default Houses
