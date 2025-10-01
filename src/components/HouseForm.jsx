"use client"

import { useState, useEffect } from "react"

function HouseForm({ house, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    reference: "",
    type: "",
    total_units: 1,
    rent: 0,
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (house) {
      setFormData({
        reference: house.reference,
        type: house.type,
        total_units: house.total_units,
        rent: house.rent,
      })
    }
  }, [house])

  const houseTypes = ["Villa", "Appartement", "Studio", "Duplex", "Maison", "Chambre"]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "total_units" || name === "rent" ? Number(value) : value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.reference.trim()) {
      newErrors.reference = "La référence est obligatoire"
    }

    if (!formData.type) {
      newErrors.type = "Le type est obligatoire"
    }

    if (formData.total_units < 1) {
      newErrors.total_units = "Le nombre d'unités doit être au moins 1"
    }

    if (formData.rent <= 0) {
      newErrors.rent = "Le loyer doit être supérieur à 0"
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

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {house ? "Modifier la maison" : "Ajouter une nouvelle maison"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
              Référence *
            </label>
            <input
              type="text"
              id="reference"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.reference ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Ex: Villa 1, Appartement A"
            />
            {errors.reference && <p className="mt-1 text-sm text-red-600">{errors.reference}</p>}
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.type ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="">Sélectionner un type</option>
              {houseTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
          </div>

          <div>
            <label htmlFor="total_units" className="block text-sm font-medium text-gray-700">
              Nombre d'unités *
            </label>
            <input
              type="number"
              id="total_units"
              name="total_units"
              min="1"
              value={formData.total_units}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.total_units ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.total_units && <p className="mt-1 text-sm text-red-600">{errors.total_units}</p>}
          </div>

          <div>
            <label htmlFor="rent" className="block text-sm font-medium text-gray-700">
              Loyer (FCFA) *
            </label>
            <input
              type="number"
              id="rent"
              name="rent"
              min="0"
              step="1000"
              value={formData.rent}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.rent ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Ex: 100000"
            />
            {errors.rent && <p className="mt-1 text-sm text-red-600">{errors.rent}</p>}
          </div>
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
            {house ? "Modifier" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default HouseForm
