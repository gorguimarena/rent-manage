"use client"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { usePermissions } from "../hooks/usePermissions"

function Layout({ children }) {
  const { user, logout } = useAuth()
  const { hasPermission } = usePermissions()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Gestion Locative</h1>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
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
              <div className="hidden md:block text-right mr-4">
                <div className="text-gray-700">Bonjour, {user?.email}</div>
                <div className="text-xs text-gray-500 capitalize">
                  {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : user?.role}
                </div>
              </div>
              <div className="md:hidden mr-2">
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

        {/* Mobile menu */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
            >
              <span>Menu</span>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {mobileMenuOpen && (
              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`${
                      location.pathname === item.href
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
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
