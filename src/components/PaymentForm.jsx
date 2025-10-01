"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

function PaymentForm({ tenants, houses, payments, currentMonth, onSubmit }) {
  const [formData, setFormData] = useState({
    tenant_name: "",
    month: currentMonth,
    amount: "",
    paid: false,
  })

  const [errors, setErrors] = useState({})
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setFormData((prev) => ({ ...prev, month: currentMonth }))
  }, [currentMonth])

  const handleTenantChange = (e) => {
    const tenantName = e.target.value
    const tenant = tenants.find((t) => t.full_name === tenantName)

    if (tenant) {
      setSelectedTenant(tenant)
      setFormData((prev) => ({
        ...prev,
        tenant_name: tenantName,
        amount: tenant.rent ? tenant.rent.toString() : "",
      }))
    } else {
      setSelectedTenant(null)
      setFormData((prev) => ({
        ...prev,
        tenant_name: tenantName,
        amount: "",
      }))
    }

    // Clear error when user selects a tenant
    if (errors.tenant_name) {
      setErrors((prev) => ({ ...prev, tenant_name: "" }))
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.tenant_name.trim()) {
      newErrors.tenant_name = "Le nom du locataire est obligatoire"
    } else {
      // Vérifier que le nom existe dans la liste des locataires
      const selectedTenant = tenants.find(tenant => tenant.full_name === formData.tenant_name.trim())
      if (!selectedTenant) {
        newErrors.tenant_name = "Ce nom de locataire n'existe pas"
      }
    }

    if (!formData.month) {
      newErrors.month = "Le mois est obligatoire"
    }

    if (!formData.amount.trim()) {
      newErrors.amount = "Le montant est obligatoire"
    } else {
      const amountNum = Number(formData.amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.amount = "Le montant doit être un nombre positif"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      setIsSubmitting(true)
      try {
        const selectedTenant = tenants.find(tenant => tenant.full_name === formData.tenant_name.trim())
        const paymentData = {
          tenant_id: selectedTenant.id,
          month: formData.month,
          amount: Number(formData.amount),
          paid: formData.paid,
        }
        await onSubmit(paymentData)
        // Reset form but keep tenant selected
        setFormData((prev) => ({
          ...prev,
          amount: "",
          paid: false,
        }))
      } finally {
        setIsSubmitting(false)
      }
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

  const currentTenant = tenants.find(tenant => tenant.full_name === formData.tenant_name.trim())
  const existingPayment = currentTenant ? payments.find((p) => p.tenant_id === currentTenant.id && p.month === formData.month) : null

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tenant_name" className="block text-sm font-medium text-gray-700">
            Nom du Locataire *
          </label>
          <input
            type="text"
            id="tenant_name"
            name="tenant_name"
            value={formData.tenant_name}
            onChange={handleTenantChange}
            placeholder="Ex: Mamadou Diallo"
            list="tenants-list"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.tenant_name ? "border-red-300" : "border-gray-300"
            }`}
          />
          <datalist id="tenants-list">
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.full_name} />
            ))}
          </datalist>
          {errors.tenant_name && <p className="mt-1 text-sm text-red-600">{errors.tenant_name}</p>}
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
            type="text"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Ex: 300000"
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
          disabled={isSubmitting}
          className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              {existingPayment ? "Mise à jour..." : "Enregistrement..."}
            </>
          ) : (
            existingPayment ? "Mettre à jour le paiement" : "Enregistrer le paiement"
          )}
        </button>
      </form>
    </div>
  )
}

export default PaymentForm
