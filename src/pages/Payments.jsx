"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import PaymentForm from "../components/PaymentForm"
import PaymentList from "../components/PaymentList"
import Loader from "../components/Loader"
import { baseUrl, housesUrl, paymentsUrl, tenantsUrl } from "../config/url"

function Payments() {
  const [payments, setPayments] = useState([])
  const [tenants, setTenants] = useState([])
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7))

  const paymentBase = `${baseUrl}${paymentsUrl}`
  useEffect(() => {
    fetchData()
  }, [currentMonth])

  const fetchData = async () => {
    try {
      const [paymentsRes, tenantsRes, housesRes] = await Promise.all([
        axios.get(`${baseUrl}${paymentsUrl}?month=${currentMonth}`),
        axios.get(`${baseUrl}${tenantsUrl}`),
        axios.get(`${baseUrl}${housesUrl}`),
      ])
      setPayments(paymentsRes.data)
      setTenants(tenantsRes.data)
      setHouses(housesRes.data)
    } catch (error) {
      setError("Erreur lors du chargement des données")
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async (paymentData) => {
    try {
      // Check if payment already exists for this tenant and month
      const existingPayment = payments.find(
        (p) => p.tenant_id === paymentData.tenant_id && p.month === paymentData.month,
      )

      if (existingPayment) {
        // Update existing payment
        const response = await axios.put(`${paymentBase}/${existingPayment.id}`, {
          ...paymentData,
          id: existingPayment.id,
        })
        setPayments(payments.map((p) => (p.id === existingPayment.id ? response.data : p)))
      } else {
        // Create new payment
        const response = await axios.post(`${paymentBase}`, paymentData)
        setPayments([...payments, response.data])
      }

      setError("")
    } catch (error) {
      setError("Erreur lors de l'enregistrement du paiement")
      console.error("Error saving payment:", error)
    }
  }

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce paiement ?")) {
      try {
        await axios.delete(`${paymentBase}/${paymentId}`)
        setPayments(payments.filter((p) => p.id !== paymentId))
        setError("")
      } catch (error) {
        setError("Erreur lors de la suppression du paiement")
        console.error("Error deleting payment:", error)
      }
    }
  }

  if (loading) {
    return <Loader text="Chargement des paiements..." />
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Gestion des Paiements</h1>

        <div className="flex items-center space-x-4 mb-4">
          <label htmlFor="month-filter" className="text-sm font-medium text-gray-700">
            Mois:
          </label>
          <input
            type="month"
            id="month-filter"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Enregistrer un paiement</h2>
          <PaymentForm
            tenants={tenants}
            houses={houses}
            payments={payments}
            currentMonth={currentMonth}
            onSubmit={handlePaymentSubmit}
          />
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Paiements pour{" "}
            {new Date(currentMonth + "-01").toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </h2>
          <PaymentList payments={payments} tenants={tenants} houses={houses} onDelete={handleDeletePayment} />
        </div>
      </div>
    </div>
  )
}

export default Payments
