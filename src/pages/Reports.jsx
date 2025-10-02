"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import MonthlyReport from "../components/MonthlyReport"
import Loader from "../components/Loader"
import { baseUrl, housesUrl, paymentsUrl, tenantsUrl, expensesUrl } from "../config/url"

function Reports() {
  const { month } = useParams()
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState(month || new Date().toISOString().slice(0, 7))
  const [reportData, setReportData] = useState({
    payments: [],
    tenants: [],
    houses: [],
    expenses: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("all") // all, paid, unpaid

  useEffect(() => {
    if (selectedMonth) {
      navigate(`/reports/${selectedMonth}`, { replace: true })
      fetchReportData()
    }
  }, [selectedMonth, navigate])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const [paymentsRes, tenantsRes, housesRes, expensesRes] = await Promise.all([
        axios.get(`${baseUrl}${paymentsUrl}?month=${selectedMonth}`),
        axios.get(`${baseUrl}${tenantsUrl}`),
        axios.get(`${baseUrl}${housesUrl}`),
        axios.get(`${baseUrl}${expensesUrl}?month=${selectedMonth}`),
      ])

      setReportData({
        payments: paymentsRes.data,
        tenants: tenantsRes.data,
        houses: housesRes.data,
        expenses: expensesRes.data,
      })
      setError("")
    } catch (error) {
      setError("Erreur lors du chargement du rapport")
      console.error("Error fetching report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value)
  }

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  if (loading) {
    return <Loader text="Chargement du rapport..." />
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Rapports Mensuels</h1>

        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-2">
            <label htmlFor="month-select" className="text-sm font-medium text-gray-700">
              Mois:
            </label>
            <input
              type="month"
              id="month-select"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="filter-select" className="text-sm font-medium text-gray-700">
              Filtrer:
            </label>
            <select
              id="filter-select"
              value={filter}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">Tous les paiements</option>
              <option value="paid">Payés seulement</option>
              <option value="unpaid">Non payés seulement</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <MonthlyReport
        month={selectedMonth}
        payments={reportData.payments}
        tenants={reportData.tenants}
        houses={reportData.houses}
        expenses={reportData.expenses}
        filter={filter}
      />
    </div>
  )
}

export default Reports
