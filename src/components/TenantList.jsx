"use client"

function TenantList({ tenants, houses, onEdit, onDelete }) {
  const getHouseInfo = (houseId) => {
    const house = houses.find((h) => h.id === houseId)
    return house ? `${house.reference} (${house.type})` : "Maison inconnue"
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount)
  }

  const getHouseRent = (houseId) => {
    const house = houses.find((h) => h.id === houseId)
    return house ? house.rent : 0
  }

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
      <ul className="divide-y divide-gray-200">
        {tenants.map((tenant) => (
          <li key={tenant.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{tenant.full_name}</h3>
                      <p className="text-sm text-gray-500">{tenant.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(getHouseRent(tenant.house_id))}
                      </p>
                      <p className="text-sm text-gray-500">loyer mensuel</p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getHouseInfo(tenant.house_id)}
                      </span>
                    </div>

                    <div className="flex space-x-2">
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
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TenantList
