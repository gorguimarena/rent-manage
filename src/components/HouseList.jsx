"use client"

import Pagination from "./Pagination"

function HouseList({ houses, onEdit, onDelete, canManageHouses = true, currentPage = 1, itemsPerPage = 10, onPageChange }) {
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

  // Pagination logic
  const totalItems = houses.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentHouses = houses.slice(startIndex, endIndex)

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
      {/* Header - Hidden on mobile, shown on larger screens */}
      <div className="hidden md:grid md:grid-cols-5 md:gap-4 md:px-6 md:py-3 md:bg-gray-50 md:border-b md:border-gray-200">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Loyer</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Occupation</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</div>
      </div>

      {/* Data rows */}
      <div className="divide-y divide-gray-200">
        {currentHouses.map((house, index) => (
          <div key={house.id} className={`p-4 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
            {/* Mobile layout - stacked */}
            <div className="md:hidden space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-lg font-semibold text-gray-900">{house.reference}</div>
                  <div className="text-sm text-gray-600 mt-1">{house.address}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{formatCurrency(house.rent)}</div>
                  <div className="text-xs text-gray-500">par mois</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOccupancyColor(house.occupied_units, house.total_units)}`}>
                  {house.occupied_units}/{house.total_units} occupé(s)
                </span>
                {canManageHouses && (
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
                )}
              </div>
            </div>

            {/* Desktop layout - grid */}
            <div className="hidden md:grid md:grid-cols-5 md:gap-4 md:items-center">
              <div className="text-sm font-medium text-gray-900">{house.reference}</div>
              <div className="text-sm text-gray-900">{house.address}</div>
              <div className="text-sm font-medium text-gray-900">{formatCurrency(house.rent)}</div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOccupancyColor(house.occupied_units, house.total_units)}`}>
                  {house.occupied_units}/{house.total_units}
                </span>
              </div>
              <div className="text-sm font-medium">
                {canManageHouses && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(house)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => onDelete(house.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
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

export default HouseList
