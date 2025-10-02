import { MapPin, Users, Edit, Trash2 } from "lucide-react"

function HouseCard({ house, onEdit, onDelete, canManageHouses = true }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount)
  }

  const getOccupancyColor = (occupied, total) => {
    const percentage = (occupied / total) * 100
    if (percentage === 100) return "text-red-600 bg-red-50"
    if (percentage >= 80) return "text-yellow-600 bg-yellow-50"
    return "text-green-600 bg-green-50"
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
        <div className="flex-1 mb-3 sm:mb-0">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {house.reference}
          </h3>
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span>{house.address}</span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(house.rent)}
          </p>
          <p className="text-sm text-gray-500">par mois</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 mb-4 sm:mb-0">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-gray-400" />
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOccupancyColor(house.occupied_units, house.total_units)}`}>
              {house.occupied_units}/{house.total_units} occupé(s)
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {house.total_units === 1 ? "1 unité" : `${house.total_units} unités`}
          </span>
        </div>

        {canManageHouses && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(house)}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Edit className="w-4 h-4 mr-1" />
              Modifier
            </button>
            <button
              onClick={() => onDelete(house.id)}
              className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HouseCard