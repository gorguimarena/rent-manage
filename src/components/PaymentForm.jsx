"use client"

import { useState, useEffect } from "react"

function PaymentForm({ tenants, houses, payments, currentMonth, onSubmit }) {
  const [formData, setFormData] = useState({
    tenant_id: "",
    month: currentMonth,
    amount: 0,
    paid: false,
  })

  const [errors, setErrors] = useState({})
  const [selectedTenant, setSelectedTenant] = useState(null)

  useEffect(() => {
    setFormData((prev) => ({ ...prev, month: currentMonth }))
  }, [currentMonth])

  const handleTenantChange = (e) => {
    const tenantId = Number(e.target.value)
    const tenant = tenants.find((t) => t.id === tenantId)

    if (tenant) {
      setSelectedTenant(tenant)
      setFormData((prev) => ({
        ...prev,
        tenant_id: tenantId,
        amount: tenant.rent || 0,
      }))
    } else {
      setSelectedTenant(null)
      setFormData((prev) => ({
        ...prev,
        tenant_id: "",
        amount: 0,
      }))
    }

    // Clear error when user selects a tenant
    if (errors.tenant_id) {
      setErrors((prev) => ({ ...prev, tenant_id: "" }))
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "amount" ? Number(value) : value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.tenant_id) {
      newErrors.tenant_id = "Veuillez sélectionner un locataire"
    }

    if (!formData.month) {
      newErrors.month = "Le mois est obligatoire"
    }

    if (formData.amount <= 0) {
      newErrors.amount = "Le montant doit être supérieur à 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      // Reset form but keep tenant selected
      setFormData((prev) => ({
        ...prev,
        paid: false,
      }))
    }
  }

  const getHouseInfo = (tenantId) => {
    const tenant = tenants.find((t) => t.id === tenantId)
    if (tenant) {
      const house = houses.find((h) => h.id === tenant.house_id)
      return house ? `${house.reference} - ${house.address}` : "Maison inconnue"
    }
    return ""
  }

  const existingPayment = payments.find((p) => p.tenant_id === formData.tenant_id && p.month === formData.month)

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tenant_id" className="block text-sm font-medium text-gray-700">
            Locataire *
          </label>
          <select
            id="tenant_id"
            name="tenant_id"
            value={formData.tenant_id}
            onChange={handleTenantChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.tenant_id ? "border-red-300" : "border-gray-300"
            }`}
          >
            <option value="">Sélectionner un locataire</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.full_name}
              </option>
            ))}
          </select>
          {errors.tenant_id && <p className="mt-1 text-sm text-red-600">{errors.tenant_id}</p>}
        </div>

        {selectedTenant && (
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Maison:</strong> {getHouseInfo(selectedTenant.id)}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Téléphone:</strong> {selectedTenant.phone}
            </p>
          </div>
        )}

        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700">
            Mois *
          </label>
          <input
            type="month"
            id="month"
            name="month"
            value={formData.month}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.month ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.month && <p className="mt-1 text-sm text-red-600">{errors.month}</p>}
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

        <div className="flex items-center">
          <input
            id="paid"
            name="paid"
            type="checkbox"
            checked={formData.paid}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="paid" className="ml-2 block text-sm text-gray-900">
            Paiement effectué
          </label>
        </div>

        {existingPayment && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Un paiement existe déjà pour ce locataire ce mois-ci. L'enregistrement mettra à jour le paiement existant.
            </p>
          </div>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {existingPayment ? "Mettre à jour le paiement" : "Enregistrer le paiement"}
        </button>
      </form>
    </div>
  )
}

export default PaymentForm
