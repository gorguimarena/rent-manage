"use client"

import Pagination from "./Pagination"

function ExpenseList({ expenses, houses, onDelete, currentPage = 1, itemsPerPage = 10, onPageChange }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount)
  }

  const getHouseInfo = (houseId) => {
    const house = houses.find((h) => h.id === houseId)
    return house ? `${house.reference} - ${house.address}` : "Maison inconnue"
  }

  // Pagination logic
  const totalItems = expenses.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentExpenses = expenses.slice(startIndex, endIndex)

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Aucune dépense enregistrée</div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      {/* Header - Hidden on mobile, shown on larger screens */}
      <div className="hidden md:grid md:grid-cols-6 md:gap-4 md:px-6 md:py-3 md:bg-gray-50 md:border-b md:border-gray-200">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Maison</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</div>
      </div>

      {/* Data rows */}
      <div className="divide-y divide-gray-200">
        {currentExpenses.map((expense, index) => (
          <div key={expense.id} className={`p-4 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
            {/* Mobile layout - stacked */}
            <div className="md:hidden space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                  <div className="text-xs text-gray-500 mt-1">{getHouseInfo(expense.house_id)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(expense.amount)}</div>
                  <div className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString("fr-FR")}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {expense.category}
                </span>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Supprimer
                </button>
              </div>
            </div>

            {/* Desktop layout - grid */}
            <div className="hidden md:grid md:grid-cols-6 md:gap-4 md:items-center">
              <div className="text-sm font-medium text-gray-900">{expense.description}</div>
              <div className="text-sm text-gray-900">{getHouseInfo(expense.house_id)}</div>
              <div className="text-sm text-gray-900">{expense.category}</div>
              <div className="text-sm font-medium text-gray-900">{formatCurrency(expense.amount)}</div>
              <div className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString("fr-FR")}</div>
              <div className="text-sm font-medium">
                <button
                  onClick={() => onDelete(expense.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  )
}

export default ExpenseList