"use client"

function ExpenseList({ expenses, houses, onDelete }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "Fr",
    }).format(amount)
  }

  const getHouseInfo = (houseId) => {
    const house = houses.find((h) => h.id === houseId)
    return house ? `${house.reference} - ${house.address}` : "Maison inconnue"
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Aucune dépense enregistrée</div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {expenses.map((expense) => {
          const houseInfo = getHouseInfo(expense.house_id)

          return (
            <li key={expense.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {expense.description}
                        </h3>
                        <p className="text-sm text-gray-500">{houseInfo}</p>
                        <p className="text-sm text-gray-500">
                          Catégorie: {expense.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(expense.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-end">
                      <button
                        onClick={() => onDelete(expense.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ExpenseList