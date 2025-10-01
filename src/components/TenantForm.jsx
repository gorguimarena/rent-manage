"use client"

import { useState, useEffect } from "react"

function TenantForm({ tenant, houses, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    house_id: "",
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (tenant) {
      setFormData({
        full_name: tenant.full_name,
        phone: tenant.phone,
        house_id: tenant.house_id,
      })
    }
  }, [tenant])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "house_id" ? Number(value) : value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Le nom complet est obligatoire"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Le numéro de téléphone est obligatoire"
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = "Format de téléphone invalide"
    }

    if (!formData.house_id) {
      newErrors.house_id = "Veuillez sélectionner une maison"
    } else {
      // Check if house is not fully occupied (only for new tenants or if changing house)
      const selectedHouse = houses.find((h) => h.id === formData.house_id)
      if (selectedHouse && (!tenant || tenant.house_id !== formData.house_id)) {
        if (selectedHouse.occupied_units >= selectedHouse.total_units) {
          newErrors.house_id = "Cette maison est complètement occupée"
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const getAvailableHouses = () => {
    return houses.filter((house) => {
      // If editing and same house, allow it
      if (tenant && house.id === tenant.house_id) {
        return true
      }
      // Otherwise, only show houses with available units
      return house.occupied_units < house.total_units
    })
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {tenant ? "Modifier le locataire" : "Ajouter un nouveau locataire"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Nom complet *
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.full_name ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Ex: Mamadou Diallo"
            />
            {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Téléphone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.phone ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Ex: 770000000"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="house_id" className="block text-sm font-medium text-gray-700">
            Maison *
          </label>
          <select
            id="house_id"
            name="house_id"
            value={formData.house_id}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.house_id ? "border-red-300" : "border-gray-300"
            }`}
          >
            <option value="">Sélectionner une maison</option>
            {getAvailableHouses().map((house) => (
              <option key={house.id} value={house.id}>
                {house.reference} ({house.type}) - {house.occupied_units}/{house.total_units} occupé(s)
              </option>
            ))}
          </select>
          {errors.house_id && <p className="mt-1 text-sm text-red-600">{errors.house_id}</p>}

          {getAvailableHouses().length === 0 && !tenant && (
            <p className="mt-1 text-sm text-yellow-600">
              Aucune maison disponible. Toutes les maisons sont complètement occupées.
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {tenant ? "Modifier" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TenantForm
