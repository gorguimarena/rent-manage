"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import ExpenseForm from "../components/ExpenseForm"
import ExpenseList from "../components/ExpenseList"
import { baseUrl, housesUrl, expensesUrl } from "../config/url"

function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
        setError("")
      } catch (error) {
        setError("Erreur lors de la suppression de la dépense")
        console.error("Error deleting expense:", error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Gestion des Dépenses</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Ajouter une dépense</h2>
          <ExpenseForm houses={houses} onSubmit={handleExpenseSubmit} />
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Liste des dépenses</h2>
          <ExpenseList expenses={expenses} houses={houses} onDelete={handleDeleteExpense} />
        </div>
      </div>
    </div>
  )
}

export default Expenses