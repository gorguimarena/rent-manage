// Utilise la variable d'environnement URL_SERVER si elle existe, sinon localhost:3005
// Support pour Vite (VITE_URL_SERVER) et Create React App (REACT_APP_URL_SERVER)
const baseUrl = import.meta.env.VITE_URL_SERVER || "http://localhost:3005/"

export { baseUrl }

export const usersUrl = "users"

export const housesUrl = "houses"

export const tenantsUrl = "tenants"

export const paymentsUrl = "payments"

export const expensesUrl = "expenses"