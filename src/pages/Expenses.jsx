"use client"

import { useState } from "react"
import ExpenseForm from "../components/ExpenseForm"
import ExpenseList from "../components/ExpenseList"
import Loader from "../components/Loader"
import ErrorMessage from "../components/ErrorMessage"
import { useExpenses, useHouses } from "../hooks/useDataQueries"

function Expenses() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  const {
    expenses,
    loading: expensesLoading,
    error: expensesError,
    addExpense,
    deleteExpense
  } = useExpenses()

  const {
    houses,
    loading: housesLoading,
    error: housesError
  } = useHouses()

  const loading = expensesLoading || housesLoading
  const error = expensesError || housesError

  // Gestion des erreurs de chargement
  const handleRetry = () => {
    window.location.reload()
  }

  const handleExpenseSubmit = async (expenseData) => {
    try {
      await addExpense(expenseData)
    } catch (error) {
      console.error("Error saving expense:", error)
      // Error is handled by the hook
    }
  }

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
      try {
        await deleteExpense(expenseId)
        // Reset to first page if current page becomes empty
        const totalPages = Math.ceil((expenses.length - 1) / itemsPerPage)
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages)
        }
      } catch (error) {
        console.error("Error deleting expense:", error)
        // Error is handled by the hook
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

      <ErrorMessage
        error={error}
        onRetry={handleRetry}
        title="Erreur de chargement des données"
      />

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