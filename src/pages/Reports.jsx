"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import MonthlyReport from "../components/MonthlyReport"
import Loader from "../components/Loader"
import ErrorMessage from "../components/ErrorMessage"
import { useReportsData } from "../hooks/useDataQueries"

function Reports() {
  const { month } = useParams()
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState(month || new Date().toISOString().slice(0, 7))
  const [filter, setFilter] = useState("all") // all, paid, unpaid

  const { data: reportData, isLoading: loading, error, isStale, refetch } = useReportsData(selectedMonth)

  const handleRetry = () => {
    refetch()
  }

  useEffect(() => {
    if (selectedMonth) {
      navigate(`/reports/${selectedMonth}`, { replace: true })
    }
  }, [selectedMonth, navigate])

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

      <ErrorMessage
        error={error}
        onRetry={handleRetry}
        title="Erreur de chargement du rapport"
      />

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
