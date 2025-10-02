import { Phone, Building, DollarSign, Edit, Trash2 } from "lucide-react"

function TenantCard({ tenant, house, onEdit, onDelete }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
        <div className="flex-1 mb-3 sm:mb-0">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {tenant.full_name}
          </h3>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              <span>{tenant.phone}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Building className="w-4 h-4 mr-2 text-gray-400" />
              <span>{house ? `${house.reference} - ${house.address}` : "Maison inconnue"}</span>
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="flex items-center mb-2">
            <DollarSign className="w-5 h-5 text-green-600 mr-1" />
            <span className="text-xl font-bold text-green-600">
              {formatCurrency(tenant.rent)}
            </span>
          </div>
          <p className="text-sm text-gray-500">loyer mensuel</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
        <button
          onClick={() => onEdit(tenant)}
          className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" />
          Modifier
        </button>
        <button
          onClick={() => onDelete(tenant.id)}
          className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Supprimer
        </button>
      </div>
    </div>
  )
}

export default TenantCard