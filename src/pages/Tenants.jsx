"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import TenantForm from "../components/TenantForm"
import TenantList from "../components/TenantList"
import { baseUrl, housesUrl, tenantsUrl } from "../config/url"

function Tenants() {
  const [tenants, setTenants] = useState([])
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTenant, setEditingTenant] = useState(null)
  const [error, setError] = useState("")
  const baseTenant = `${baseUrl}${tenantsUrl}`

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tenantsRes, housesRes] = await Promise.all([
        axios.get(`${baseTenant}`),
        axios.get(`${baseUrl}${housesUrl}`),
      ])
      setTenants(tenantsRes.data)
      setHouses(housesRes.data)
    } catch (error) {
      setError("Erreur lors du chargement des données")
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateHouseOccupancy = async (houseId, increment) => {
    try {
      const house = houses.find((h) => h.id === houseId)
      if (house) {
        const newOccupiedUnits = Math.max(0, house.occupied_units + increment)
        await axios.patch(`${baseUrl}${housesUrl}/${houseId}`, {
          occupied_units: newOccupiedUnits,
        })

        // Update local state
        setHouses((prevHouses) =>
          prevHouses.map((h) => (h.id === houseId ? { ...h, occupied_units: newOccupiedUnits } : h)),
        )
      }
    } catch (error) {
      console.error("Error updating house occupancy:", error)
    }
  }

  const handleAddTenant = () => {
    setEditingTenant(null)
    setShowForm(true)
  }

  const handleEditTenant = (tenant) => {
    setEditingTenant(tenant)
    setShowForm(true)
  }

  const handleDeleteTenant = async (tenantId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce locataire ?")) {
      try {
        const tenant = tenants.find((t) => t.id === tenantId)

        // Delete tenant
        await axios.delete(`${baseTenant}/${tenantId}`)

        // Update house occupancy (decrease by 1)
        if (tenant) {
          await updateHouseOccupancy(tenant.house_id, -1)
        }

        setTenants(tenants.filter((t) => t.id !== tenantId))
        setError("")
      } catch (error) {
        setError("Erreur lors de la suppression du locataire")
        console.error("Error deleting tenant:", error)
      }
    }
  }

  const handleFormSubmit = async (tenantData) => {
    try {
      if (editingTenant) {
        // Update existing tenant
        const response = await axios.put(`${baseTenant}/${editingTenant.id}`, {
          ...tenantData,
          id: editingTenant.id,
        })

        // If house changed, update occupancy for both houses
        if (editingTenant.house_id !== tenantData.house_id) {
          await updateHouseOccupancy(editingTenant.house_id, -1) // Decrease old house
          await updateHouseOccupancy(tenantData.house_id, 1) // Increase new house
        }

        setTenants(tenants.map((t) => (t.id === editingTenant.id ? response.data : t)))
      } else {
        // Add new tenant
        const response = await axios.post("${baseTenant}", tenantData)

        // Increase house occupancy
        await updateHouseOccupancy(tenantData.house_id, 1)

        setTenants([...tenants, response.data])
      }

      setShowForm(false)
      setEditingTenant(null)
      setError("")
    } catch (error) {
      setError("Erreur lors de la sauvegarde du locataire")
      console.error("Error saving tenant:", error)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTenant(null)
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
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Locataires</h1>
        <button
          onClick={handleAddTenant}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Ajouter un locataire
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="mb-6">
          <TenantForm tenant={editingTenant} houses={houses} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
        </div>
      )}

      <TenantList tenants={tenants} houses={houses} onEdit={handleEditTenant} onDelete={handleDeleteTenant} />
    </div>
  )
}

export default Tenants
