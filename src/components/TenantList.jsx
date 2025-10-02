"use client"

import Pagination from "./Pagination"

function TenantList({ tenants, houses, onEdit, onDelete, currentPage = 1, itemsPerPage = 10, onPageChange }) {
  const getHouseInfo = (houseId) => {
    const house = houses.find((h) => h.id === houseId)
    return house ? `${house.reference} - ${house.address}` : "Maison inconnue"
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount)
  }

  // Pagination logic
  const totalItems = tenants.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTenants = tenants.slice(startIndex, endIndex)

  if (tenants.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Aucun locataire enregistré</div>
        <p className="text-gray-400 mt-2">Commencez par ajouter votre premier locataire</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      {/* Header - Hidden on mobile, shown on larger screens */}
      <div className="hidden md:grid md:grid-cols-5 md:gap-4 md:px-6 md:py-3 md:bg-gray-50 md:border-b md:border-gray-200">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nom complet</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Maison</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Loyer mensuel</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</div>
      </div>

      {/* Data rows */}
      <div className="divide-y divide-gray-200">
        {currentTenants.map((tenant, index) => (
          <div key={tenant.id} className={`p-4 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
            {/* Mobile layout - stacked */}
            <div className="md:hidden space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-lg font-semibold text-gray-900">{tenant.full_name}</div>
                  <div className="text-sm text-gray-600 mt-1">{tenant.phone}</div>
                  <div className="text-xs text-gray-500 mt-1">{getHouseInfo(tenant.house_id)}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{formatCurrency(tenant.rent)}</div>
                  <div className="text-xs text-gray-500">par mois</div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => onEdit(tenant)}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(tenant.id)}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Supprimer
                </button>
              </div>
            </div>

            {/* Desktop layout - grid */}
            <div className="hidden md:grid md:grid-cols-5 md:gap-4 md:items-center">
              <div className="text-sm font-medium text-gray-900">{tenant.full_name}</div>
              <div className="text-sm text-gray-900">{tenant.phone}</div>
              <div className="text-sm text-gray-900">{getHouseInfo(tenant.house_id)}</div>
              <div className="text-sm font-medium text-gray-900">{formatCurrency(tenant.rent)}</div>
              <div className="text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(tenant)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => onDelete(tenant.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </div>
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

export default TenantList
