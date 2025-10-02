"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import ExpenseForm from "../components/ExpenseForm"
import ExpenseList from "../components/ExpenseList"
import Loader from "../components/Loader"
import { baseUrl, housesUrl, expensesUrl } from "../config/url"

function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  const expenseBase = `${baseUrl}${expensesUrl}`
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [expensesRes, housesRes] = await Promise.all([
        axios.get(`${baseUrl}${expensesUrl}`),
        axios.get(`${baseUrl}${housesUrl}`),
      ])
      setExpenses(expensesRes.data)
      setHouses(housesRes.data)
    } catch (error) {
      setError("Erreur lors du chargement des données")
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExpenseSubmit = async (expenseData) => {
    try {
      const response = await axios.post(`${expenseBase}`, expenseData)
      setExpenses([...expenses, response.data])
      setError("")
    } catch (error) {
      setError("Erreur lors de l'enregistrement de la dépense")
      console.error("Error saving expense:", error)
    }
  }

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
      try {
        await axios.delete(`${expenseBase}/${expenseId}`)
        setExpenses(expenses.filter((e) => e.id !== expenseId))
        // Reset to first page if current page becomes empty
        const totalPages = Math.ceil((expenses.length - 1) / itemsPerPage)
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages)
        }
        setError("")
      } catch (error) {
        setError("Erreur lors de la suppression de la dépense")
        console.error("Error deleting expense:", error)
      }
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  if (loading) {
    return <Loader text="Chargement des dépenses..." />
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Gestion des Dépenses</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Ajouter une dépense</h2>
          <ExpenseForm houses={houses} onSubmit={handleExpenseSubmit} />
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Liste des dépenses</h2>
          <ExpenseList
            expenses={expenses}
            houses={houses}
            onDelete={handleDeleteExpense}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  )
}

export default Expenses