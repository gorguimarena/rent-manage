"use client"

import jsPDF from "jspdf"

function PaymentList({ payments, tenants, houses, onDelete }) {
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
      return house ? `${house.reference} (${house.type})` : "Maison inconnue"
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

  if (payments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Aucun paiement enregistré pour ce mois</div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {payments.map((payment) => {
          const tenant = getTenantInfo(payment.tenant_id)
          const houseInfo = getHouseInfo(payment.tenant_id)

          return (
            <li key={payment.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {tenant ? tenant.full_name : "Locataire inconnu"}
                        </h3>
                        <p className="text-sm text-gray-500">{houseInfo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.paid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {payment.paid ? "Payé" : "Non payé"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          {new Date(payment.month + "-01").toLocaleDateString("fr-FR", {
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        {payment.paid && (
                          <button
                            onClick={() => generatePDF(payment)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            Générer PDF
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
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default PaymentList
