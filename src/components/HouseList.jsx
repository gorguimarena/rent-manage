"use client"

function HouseList({ houses, onEdit, onDelete }) {
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

  if (houses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Aucune maison enregistrée</div>
        <p className="text-gray-400 mt-2">Commencez par ajouter votre première propriété</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {houses.map((house) => (
          <li key={house.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{house.reference}</h3>
                      <p className="text-sm text-gray-500">{house.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(house.rent)}</p>
                      <p className="text-sm text-gray-500">par mois</p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOccupancyColor(house.occupied_units, house.total_units)}`}
                      >
                        {house.occupied_units}/{house.total_units} occupé(s)
                      </span>
                      <span className="text-sm text-gray-500">
                        {house.total_units === 1 ? "1 unité" : `${house.total_units} unités`}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(house)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => onDelete(house.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HouseList
