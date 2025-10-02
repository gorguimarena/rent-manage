"use client"

import jsPDF from "jspdf"
import Pagination from "./Pagination"

function PaymentList({ payments, tenants, houses, onDelete, currentPage = 1, itemsPerPage = 10, onPageChange }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount)
  }

  const getTenantInfo = (tenantId) => {
    return tenants.find((t) => t.id === tenantId)
  }

  const getHouseInfo = (tenantId) => {
    const tenant = tenants.find((t) => t.id === tenantId)
    if (tenant) {
      const house = houses.find((h) => h.id === tenant.house_id)
      return house ? `${house.reference} - ${house.address}` : "Maison inconnue"
    }
    return "Maison inconnue"
  }

  const generatePDF = (payment) => {
    const tenant = getTenantInfo(payment.tenant_id)
    const houseInfo = getHouseInfo(payment.tenant_id)

    if (!tenant) return

    const doc = new jsPDF()

    // Title
    doc.setFontSize(20)
    doc.text("REÇU DE PAIEMENT", 105, 30, { align: "center" })

    // Date
    doc.setFontSize(12)
    doc.text(`Date: ${new Date().toLocaleDateString("fr-FR")}`, 20, 50)

    // Tenant info
    doc.setFontSize(14)
    doc.text("INFORMATIONS LOCATAIRE", 20, 70)
    doc.setFontSize(12)
    doc.text(`Nom: ${tenant.full_name}`, 20, 85)
    doc.text(`Téléphone: ${tenant.phone}`, 20, 95)
    doc.text(`Logement: ${houseInfo}`, 20, 105)

    // Payment info
    doc.setFontSize(14)
    doc.text("DÉTAILS DU PAIEMENT", 20, 125)
    doc.setFontSize(12)
    doc.text(
      `Mois: ${new Date(payment.month + "-01").toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`,
      20,
      140,
    )
    doc.text(`Montant: ${formatCurrency(payment.amount)}`, 20, 150)
    doc.text(`Statut: ${payment.paid ? "Payé" : "Non payé"}`, 20, 160)

    // Footer
    doc.setFontSize(10)
    doc.text("Merci pour votre paiement", 105, 200, { align: "center" })
    doc.text("Gestion Locative", 105, 210, { align: "center" })

    // Save PDF
    const fileName = `recu_${tenant.full_name.replace(/\s+/g, "_")}_${payment.month}.pdf`
    doc.save(fileName)
  }

  // Pagination logic
  const totalItems = payments.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPayments = payments.slice(startIndex, endIndex)

  if (payments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Aucun paiement enregistré pour ce mois</div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      {/* Header - Hidden on mobile, shown on larger screens */}
      <div className="hidden md:grid md:grid-cols-6 md:gap-4 md:px-6 md:py-3 md:bg-gray-50 md:border-b md:border-gray-200">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Locataire</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Maison</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mois</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</div>
      </div>

      {/* Data rows */}
      <div className="divide-y divide-gray-200">
        {currentPayments.map((payment, index) => {
          const tenant = getTenantInfo(payment.tenant_id)
          const houseInfo = getHouseInfo(payment.tenant_id)

          return (
            <div key={payment.id} className={`p-4 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
              {/* Mobile layout - stacked */}
              <div className="md:hidden space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {tenant ? tenant.full_name : "Locataire inconnu"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{tenant?.phone}</div>
                    <div className="text-xs text-gray-500">{houseInfo}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(payment.month + "-01").toLocaleDateString("fr-FR", {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.paid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {payment.paid ? "Payé" : "Non payé"}
                  </span>
                  <div className="flex space-x-2">
                    {payment.paid && (
                      <button
                        onClick={() => generatePDF(payment)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        PDF
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(payment.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop layout - grid */}
              <div className="hidden md:grid md:grid-cols-6 md:gap-4 md:items-center">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {tenant ? tenant.full_name : "Locataire inconnu"}
                  </div>
                  <div className="text-sm text-gray-500">{tenant?.phone}</div>
                </div>
                <div className="text-sm text-gray-900">{houseInfo}</div>
                <div className="text-sm text-gray-500">
                  {new Date(payment.month + "-01").toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                <div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.paid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {payment.paid ? "Payé" : "Non payé"}
                  </span>
                </div>
                <div className="text-sm font-medium">
                  <div className="flex space-x-2">
                    {payment.paid && (
                      <button
                        onClick={() => generatePDF(payment)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        PDF
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(payment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
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

export default PaymentList
