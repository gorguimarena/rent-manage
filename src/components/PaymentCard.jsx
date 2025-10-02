import { Calendar, Building, User, DollarSign, FileText, Trash2 } from "lucide-react"

function PaymentCard({ payment, tenant, house, onDelete }) {
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
          <div className="flex items-center mb-2">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              {tenant ? tenant.full_name : "Locataire inconnu"}
            </h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Building className="w-4 h-4 mr-2 text-gray-400" />
              <span>{house ? `${house.reference} - ${house.address}` : "Maison inconnue"}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>{new Date(payment.month + "-01").toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:items-end">
          <div className="flex items-center mb-3">
            <DollarSign className="w-5 h-5 text-green-600 mr-1" />
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(payment.amount)}
            </span>
          </div>

          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            payment.paid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {payment.paid ? "Payé" : "Non payé"}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
        {payment.paid && (
          <button
            onClick={() => {
              // PDF generation logic would go here
              console.log('Generate PDF for payment', payment.id)
            }}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Générer PDF
          </button>
        )}
        <button
          onClick={() => onDelete(payment.id)}
          className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Supprimer
        </button>
      </div>
    </div>
  )
}

export default PaymentCard