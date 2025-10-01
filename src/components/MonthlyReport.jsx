"use client"

import { useMemo } from "react"
import jsPDF from "jspdf"

function MonthlyReport({ month, payments, tenants, houses, expenses, filter }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount)
  }

  const reportData = useMemo(() => {
    // Create a comprehensive report including all tenants
    const tenantReports = tenants.map((tenant) => {
      const house = houses.find((h) => h.id === tenant.house_id)
      const payment = payments.find((p) => p.tenant_id === tenant.id)

      return {
        tenant,
        house,
        payment: payment || {
          id: null,
          tenant_id: tenant.id,
          month,
          amount: tenant.rent || 0,
          paid: false,
        },
      }
    })

    // Apply filter
    let filteredReports = tenantReports
    if (filter === "paid") {
      filteredReports = tenantReports.filter((report) => report.payment.paid)
    } else if (filter === "unpaid") {
      filteredReports = tenantReports.filter((report) => !report.payment.paid)
    }

    // Calculate totals
    const totalExpected = tenantReports.reduce((sum, report) => sum + report.payment.amount, 0)
    const totalPaid = tenantReports
      .filter((report) => report.payment.paid)
      .reduce((sum, report) => sum + report.payment.amount, 0)
    const totalUnpaid = totalExpected - totalPaid
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const netIncome = totalPaid - totalExpenses
    const paidCount = tenantReports.filter((report) => report.payment.paid).length
    const unpaidCount = tenantReports.length - paidCount

    return {
      reports: filteredReports,
      totals: {
        totalExpected,
        totalPaid,
        totalUnpaid,
        totalExpenses,
        netIncome,
        paidCount,
        unpaidCount,
        totalTenants: tenantReports.length,
      },
    }
  }, [tenants, houses, payments, expenses, month, filter])

  const generatePDFReport = () => {
    const doc = new jsPDF()
    const monthName = new Date(month + "-01").toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

    // Title
    doc.setFontSize(18)
    doc.text(`RAPPORT MENSUEL - ${monthName.toUpperCase()}`, 105, 20, { align: "center" })

    // Summary
    doc.setFontSize(12)
    let yPos = 40
    doc.text("RÉSUMÉ", 20, yPos)
    yPos += 10
    doc.text(`Total attendu: ${formatCurrency(reportData.totals.totalExpected)}`, 20, yPos)
    yPos += 7
    doc.text(`Total payé: ${formatCurrency(reportData.totals.totalPaid)}`, 20, yPos)
    yPos += 7
    doc.text(`Total impayé: ${formatCurrency(reportData.totals.totalUnpaid)}`, 20, yPos)
    yPos += 7
    doc.text(`Dépenses: ${formatCurrency(reportData.totals.totalExpenses)}`, 20, yPos)
    yPos += 7
    doc.text(`Revenus nets: ${formatCurrency(reportData.totals.netIncome)}`, 20, yPos)
    yPos += 7
    doc.text(`Locataires ayant payé: ${reportData.totals.paidCount}/${reportData.totals.totalTenants}`, 20, yPos)

    // Table header
    yPos += 20
    doc.setFontSize(10)
    doc.text("LOCATAIRE", 20, yPos)
    doc.text("MAISON", 70, yPos)
    doc.text("TYPE UNITÉ", 110, yPos)
    doc.text("MONTANT", 140, yPos)
    doc.text("STATUT", 170, yPos)

    // Table content
    yPos += 5
    doc.line(20, yPos, 190, yPos) // Header line
    yPos += 5

    reportData.reports.forEach((report) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }

      doc.text(report.tenant.full_name.substring(0, 20), 20, yPos)
      doc.text(report.house ? report.house.reference.substring(0, 15) : "N/A", 70, yPos)
      doc.text(report.tenant.unit_type ? report.tenant.unit_type.substring(0, 12) : "N/A", 110, yPos)
      doc.text(formatCurrency(report.payment.amount), 140, yPos)
      doc.text(report.payment.paid ? "Payé" : "Non payé", 170, yPos)
      yPos += 7
    })

    // Expenses section
    if (expenses.length > 0) {
      yPos += 20
      doc.setFontSize(14)
      doc.text("DÉPENSES", 20, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.text("DESCRIPTION", 20, yPos)
      doc.text("MAISON", 90, yPos)
      doc.text("MONTANT", 150, yPos)
      yPos += 5
      doc.line(20, yPos, 190, yPos)
      yPos += 5

      expenses.forEach((expense) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }

        const house = houses.find((h) => h.id === expense.house_id)
        doc.text(expense.description.substring(0, 20), 20, yPos)
        doc.text(house ? house.reference.substring(0, 15) : "N/A", 90, yPos)
        doc.text(formatCurrency(expense.amount), 150, yPos)
        yPos += 7
      })
    }

    // Footer
    doc.setFontSize(8)
    doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 105, 290, { align: "center" })

    // Save PDF
    doc.save(`rapport_mensuel_${month}.pdf`)
  }

  const getFilterTitle = () => {
    switch (filter) {
      case "paid":
        return "Paiements effectués"
      case "unpaid":
        return "Paiements en attente"
      default:
        return "Tous les paiements"
    }
  }

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">€</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total attendu</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(reportData.totals.totalExpected)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">✓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total payé</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(reportData.totals.totalPaid)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">✗</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total impayé</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(reportData.totals.totalUnpaid)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">#</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Taux de paiement</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {reportData.totals.totalTenants > 0
                      ? Math.round((reportData.totals.paidCount / reportData.totals.totalTenants) * 100)
                      : 0}
                    %
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">€</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Dépenses</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(reportData.totals.totalExpenses)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">€</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Revenus nets</dt>
                  <dd className={`text-lg font-medium ${reportData.totals.netIncome >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {formatCurrency(reportData.totals.netIncome)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {getFilterTitle()} -{" "}
              {new Date(month + "-01").toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{reportData.reports.length} résultat(s) affiché(s)</p>
          </div>
          <button
            onClick={generatePDFReport}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Exporter PDF
          </button>
        </div>

        {reportData.reports.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Aucun résultat pour les critères sélectionnés</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Locataire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maison
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type d'unité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.reports.map((report, index) => (
                  <tr key={`${report.tenant.id}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.tenant.full_name}</div>
                        <div className="text-sm text-gray-500">{report.tenant.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.house ? report.house.reference : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.tenant.unit_type || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(report.payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          report.payment.paid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {report.payment.paid ? "Payé" : "Non payé"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default MonthlyReport
