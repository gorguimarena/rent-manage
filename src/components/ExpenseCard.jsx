import { Calendar, Building, Tag, DollarSign } from "lucide-react"

function ExpenseCard({ expense, house, onDelete }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount)
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Maintenance': 'bg-blue-100 text-blue-800',
      'Utilities': 'bg-green-100 text-green-800',
      'Insurance': 'bg-purple-100 text-purple-800',
      'Taxes': 'bg-orange-100 text-orange-800',
      'Other': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 mb-3 sm:mb-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {expense.description}
          </h3>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Building className="w-4 h-4 mr-2 text-gray-400" />
              <span>{house ? `${house.reference} - ${house.address}` : "Maison inconnue"}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>{new Date(expense.date).toLocaleDateString("fr-FR")}</span>
            </div>

            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-2 text-gray-400" />
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                {expense.category}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:items-end sm:justify-between">
          <div className="flex items-center mb-3 sm:mb-0">
            <DollarSign className="w-5 h-5 text-green-600 mr-1" />
            <span className="text-xl font-bold text-green-600">
              {formatCurrency(expense.amount)}
            </span>
          </div>

          <button
            onClick={() => onDelete(expense.id)}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExpenseCard