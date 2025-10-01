"use client"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { usePermissions } from "../hooks/usePermissions"

function Layout({ children }) {
  const { user, logout } = useAuth()
  const { hasPermission } = usePermissions()
  const location = useLocation()

  const allNavigation = [
    { name: "Tableau de bord", href: "/dashboard", permission: null },
    { name: "Maisons", href: "/houses", permission: "canViewHouses" },
    { name: "Locataires", href: "/tenants", permission: null },
    { name: "Paiements", href: "/payments", permission: null },
    { name: "Dépenses", href: "/expenses", permission: null },
    { name: "Rapports", href: `/reports/${new Date().toISOString().slice(0, 7)}`, permission: null },
  ]

  // Filtrer la navigation selon les permissions
  const navigation = allNavigation.filter(item =>
    !item.permission || hasPermission(user, item.permission)
  )

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
              <div className="text-right mr-4">
                <div className="text-gray-700">Bonjour, {user?.email}</div>
                <div className="text-xs text-gray-500 capitalize">
                  {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : user?.role}
                </div>
              </div>
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
