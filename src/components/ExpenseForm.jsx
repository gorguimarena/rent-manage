"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

function ExpenseForm({ houses, onSubmit }) {
  const [formData, setFormData] = useState({
    house_id: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "date" && { month: value.slice(0, 7) }), // Extract YYYY-MM from date
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.house_id.trim()) {
      newErrors.house_id = "La référence de la maison est obligatoire"
    } else {
      // Vérifier que la référence existe dans la liste des maisons
      const selectedHouse = houses.find(house => house.reference === formData.house_id.trim())
      if (!selectedHouse) {
        newErrors.house_id = "Cette référence de maison n'existe pas"
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = "La description est obligatoire"
    }

    if (!formData.amount.trim()) {
      newErrors.amount = "Le montant est obligatoire"
    } else {
      const amountNum = Number(formData.amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.amount = "Le montant doit être un nombre positif"
      }
    }

    if (!formData.date) {
      newErrors.date = "La date est obligatoire"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      setIsSubmitting(true)
      try {
        const selectedHouse = houses.find(house => house.reference === formData.house_id.trim())
        const expenseData = {
          house_id: selectedHouse.id,
          description: formData.description,
          amount: Number(formData.amount),
          date: formData.date,
          month: formData.date.slice(0, 7), // YYYY-MM
        }
        await onSubmit(expenseData)
        // Reset form
        setFormData({
          house_id: "",
          description: "",
          amount: "",
          date: new Date().toISOString().split('T')[0],
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="house_id" className="block text-sm font-medium text-gray-700">
            Référence Maison *
          </label>
          <input
            type="text"
            id="house_id"
            name="house_id"
            value={formData.house_id}
            onChange={handleChange}
            placeholder="Ex: Villa 1, Immeuble Centre"
            list="houses-list"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.house_id ? "border-red-300" : "border-gray-300"
            }`}
          />
          <datalist id="houses-list">
            {houses.map((house) => (
              <option key={house.id} value={house.reference} />
            ))}
          </datalist>
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
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Montant (FCFA) *
          </label>
          <input
            type="text"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Ex: 50000"
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
          disabled={isSubmitting}
          className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer la dépense"
          )}
        </button>
      </form>
    </div>
  )
}

export default ExpenseForm