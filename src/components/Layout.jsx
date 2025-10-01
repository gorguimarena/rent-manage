"use client"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: "Tableau de bord", href: "/dashboard" },
    { name: "Maisons", href: "/houses" },
    { name: "Locataires", href: "/tenants" },
    { name: "Paiements", href: "/payments" },
    { name: "Dépenses", href: "/expenses" },
    { name: "Rapports", href: `/reports/${new Date().toISOString().slice(0, 7)}` },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Gestion Locative</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      location.pathname === item.href
                        ? "border-indigo-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Bonjour, {user?.email}</span>
              <button
                onClick={logout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">{children}</div>
      </main>
    </div>
  )
}

export default Layout
