// Hook pour gérer les permissions basées sur les rôles
export function usePermissions() {
  const getPermissions = (user) => {
    if (!user) return {}

    const role = user.role

    return {
      // Super Admin peut tout faire
      canManageHouses: role === 'super_admin',
      canViewHouses: role === 'super_admin',
      canManageTenants: true, // Les deux rôles peuvent gérer les locataires
      canManagePayments: true, // Les deux rôles peuvent gérer les paiements
      canManageExpenses: true, // Les deux rôles peuvent gérer les dépenses
      canViewReports: true, // Les deux rôles peuvent voir les rapports
      canManageUsers: role === 'super_admin', // Seulement super admin peut gérer les utilisateurs
    }
  }

  const hasPermission = (user, permission) => {
    const permissions = getPermissions(user)
    return permissions[permission] || false
  }

  return {
    getPermissions,
    hasPermission,
    isSuperAdmin: (user) => user?.role === 'super_admin',
    isAdmin: (user) => user?.role === 'admin',
  }
}