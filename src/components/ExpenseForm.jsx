"use client"

import { useState } from "react"

function ExpenseForm({ houses, onSubmit }) {
  const [formData, setFormData] = useState({
    house_id: "",
    description: "",
    amount: 0,
    category: "",
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
      ...(name === "date" && { month: value.slice(0, 7) }), // Extract YYYY-MM from date
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.house_id) {
      newErrors.house_id = "Veuillez sélectionner une maison"
    }

    if (!formData.description.trim()) {
      newErrors.description = "La description est obligatoire"
    }

    if (formData.amount <= 0) {
      newErrors.amount = "Le montant doit être supérieur à 0"
    }

    if (!formData.category.trim()) {
      newErrors.category = "La catégorie est obligatoire"
    }

    if (!formData.date) {
      newErrors.date = "La date est obligatoire"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      const expenseData = {
        ...formData,
        month: formData.date.slice(0, 7), // YYYY-MM
      }
      onSubmit(expenseData)
      // Reset form
      setFormData({
        house_id: "",
        description: "",
        amount: 0,
        category: "",
        date: new Date().toISOString().split('T')[0],
      })
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            {houses.map((house) => (
              <option key={house.id} value={house.id}>
                {house.reference} - {house.address}
              </option>
            ))}
          </select>
          {errors.house_id && <p className="mt-1 text-sm text-red-600">{errors.house_id}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Ex: Réparation plomberie"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.description ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Catégorie *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.category ? "border-red-300" : "border-gray-300"
            }`}
          >
            <option value="">Sélectionner une catégorie</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Utilities">Utilities</option>
            <option value="Insurance">Assurance</option>
            <option value="Taxes">Taxes</option>
            <option value="Other">Autre</option>
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Montant (FCFA) *
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            min="0"
            step="1000"
            value={formData.amount}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.amount ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.date ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Enregistrer la dépense
        </button>
      </form>
    </div>
  )
}

export default ExpenseForm