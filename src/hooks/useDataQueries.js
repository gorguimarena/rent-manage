import { useState, useEffect, useCallback, useRef } from 'react'
import { useApiCache, useOptimisticUpdate, useStaleWhileRevalidate } from './useApiCache'
import { baseUrl, housesUrl, tenantsUrl, paymentsUrl, expensesUrl } from '../config/url'

// Hook for houses data with caching and optimistic updates
export const useHouses = () => {
  const api = useApiCache(baseUrl)
  const optimistic = useOptimisticUpdate()

  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Fetch houses with caching
  const fetchHouses = useCallback(async (forceRefresh = false) => {
    if (loading && hasLoaded && !forceRefresh) return houses

    try {
      setLoading(true)
      setError(null)
      const data = await api.get(housesUrl, {}, { forceRefresh })
      setHouses(data)
      setHasLoaded(true)
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error fetching houses:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [api, loading, hasLoaded, houses])

  // Add house with optimistic update
  const addHouse = useCallback(async (houseData) => {
    const tempId = `temp_${Date.now()}`
    const optimisticHouse = { ...houseData, id: tempId }

    // Optimistic update
    optimistic.addOptimisticUpdate(`house_${tempId}`, optimisticHouse)
    setHouses(prev => [...prev, optimisticHouse])

    try {
      const result = await api.post(housesUrl, houseData, {
        invalidatePattern: housesUrl
      })

      // Replace optimistic update with real data
      setHouses(prev => prev.map(h => h.id === tempId ? result : h))
      optimistic.removeOptimisticUpdate(`house_${tempId}`)
      return result
    } catch (err) {
      // Revert optimistic update
      setHouses(prev => prev.filter(h => h.id !== tempId))
      optimistic.removeOptimisticUpdate(`house_${tempId}`)
      throw err
    }
  }, [api, optimistic])

  // Update house with optimistic update
  const updateHouse = useCallback(async (id, houseData) => {
    const originalHouse = houses.find(h => h.id === id)
    if (!originalHouse) return

    const optimisticHouse = { ...originalHouse, ...houseData }

    // Optimistic update
    optimistic.addOptimisticUpdate(`house_${id}`, optimisticHouse)
    setHouses(prev => prev.map(h => h.id === id ? optimisticHouse : h))

    try {
      const result = await api.put(`${housesUrl}/${id}`, houseData, {
        invalidatePattern: housesUrl
      })

      // Replace optimistic update with real data
      setHouses(prev => prev.map(h => h.id === id ? result : h))
      optimistic.removeOptimisticUpdate(`house_${id}`)
      return result
    } catch (err) {
      // Revert optimistic update
      setHouses(prev => prev.map(h => h.id === id ? originalHouse : h))
      optimistic.removeOptimisticUpdate(`house_${id}`)
      throw err
    }
  }, [api, optimistic, houses])

  // Delete house with optimistic update
  const deleteHouse = useCallback(async (id) => {
    const houseToDelete = houses.find(h => h.id === id)
    if (!houseToDelete) return

    // Optimistic update
    optimistic.addOptimisticUpdate(`house_delete_${id}`, null)
    setHouses(prev => prev.filter(h => h.id !== id))

    try {
      await api.delete(`${housesUrl}/${id}`, {
        invalidatePattern: housesUrl
      })
      optimistic.removeOptimisticUpdate(`house_delete_${id}`)
    } catch (err) {
      // Revert optimistic update
      setHouses(prev => [...prev, houseToDelete].sort((a, b) => a.id - b.id))
      optimistic.removeOptimisticUpdate(`house_delete_${id}`)
      throw err
    }
  }, [api, optimistic, houses])

  // Load houses on mount
  useEffect(() => {
    if (!hasLoaded) {
      fetchHouses()
    }
  }, [fetchHouses, hasLoaded])

  return {
    houses: optimistic.getOptimisticData('houses', houses),
    loading: loading && !hasLoaded,
    error,
    refetch: () => fetchHouses(true),
    addHouse,
    updateHouse,
    deleteHouse,
  }
}

// Hook for tenants data
export const useTenants = () => {
  const api = useApiCache(baseUrl)
  const optimistic = useOptimisticUpdate()

  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const fetchTenants = useCallback(async (forceRefresh = false) => {
    if (loading && hasLoaded && !forceRefresh) return tenants

    try {
      setLoading(true)
      setError(null)
      const data = await api.get(tenantsUrl, {}, { forceRefresh })
      setTenants(data)
      setHasLoaded(true)
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error fetching tenants:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [api, loading, hasLoaded, tenants])

  const addTenant = useCallback(async (tenantData) => {
    const tempId = `temp_${Date.now()}`
    const optimisticTenant = { ...tenantData, id: tempId }

    optimistic.addOptimisticUpdate(`tenant_${tempId}`, optimisticTenant)
    setTenants(prev => [...prev, optimisticTenant])

    try {
      const result = await api.post(tenantsUrl, tenantData, {
        invalidatePattern: tenantsUrl
      })

      setTenants(prev => prev.map(t => t.id === tempId ? result : t))
      optimistic.removeOptimisticUpdate(`tenant_${tempId}`)
      return result
    } catch (err) {
      setTenants(prev => prev.filter(t => t.id !== tempId))
      optimistic.removeOptimisticUpdate(`tenant_${tempId}`)
      throw err
    }
  }, [api, optimistic])

  const updateTenant = useCallback(async (id, tenantData) => {
    const originalTenant = tenants.find(t => t.id === id)
    if (!originalTenant) return

    const optimisticTenant = { ...originalTenant, ...tenantData }

    optimistic.addOptimisticUpdate(`tenant_${id}`, optimisticTenant)
    setTenants(prev => prev.map(t => t.id === id ? optimisticTenant : t))

    try {
      const result = await api.put(`${tenantsUrl}/${id}`, tenantData, {
        invalidatePattern: tenantsUrl
      })

      setTenants(prev => prev.map(t => t.id === id ? result : t))
      optimistic.removeOptimisticUpdate(`tenant_${id}`)
      return result
    } catch (err) {
      setTenants(prev => prev.map(t => t.id === id ? originalTenant : t))
      optimistic.removeOptimisticUpdate(`tenant_${id}`)
      throw err
    }
  }, [api, optimistic, tenants])

  const deleteTenant = useCallback(async (id) => {
    const tenantToDelete = tenants.find(t => t.id === id)
    if (!tenantToDelete) return

    optimistic.addOptimisticUpdate(`tenant_delete_${id}`, null)
    setTenants(prev => prev.filter(t => t.id !== id))

    try {
      await api.delete(`${tenantsUrl}/${id}`, {
        invalidatePattern: tenantsUrl
      })
      optimistic.removeOptimisticUpdate(`tenant_delete_${id}`)
    } catch (err) {
      setTenants(prev => [...prev, tenantToDelete].sort((a, b) => a.id - b.id))
      optimistic.removeOptimisticUpdate(`tenant_delete_${id}`)
      throw err
    }
  }, [api, optimistic, tenants])

  useEffect(() => {
    if (!hasLoaded) {
      fetchTenants()
    }
  }, [fetchTenants, hasLoaded])

  return {
    tenants: optimistic.getOptimisticData('tenants', tenants),
    loading: loading && !hasLoaded,
    error,
    refetch: () => fetchTenants(true),
    addTenant,
    updateTenant,
    deleteTenant,
  }
}

// Hook for payments data with month filtering
export const usePayments = (month = null) => {
  const api = useApiCache(baseUrl)
  const optimistic = useOptimisticUpdate()

  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(month)

  const fetchPayments = useCallback(async (selectedMonth = currentMonth, forceRefresh = false) => {
    if (loading && hasLoaded && !forceRefresh && selectedMonth === currentMonth) return payments

    try {
      setLoading(true)
      setError(null)
      const params = selectedMonth ? { month: selectedMonth } : {}
      const data = await api.get(paymentsUrl, params, { forceRefresh })
      setPayments(data)
      setCurrentMonth(selectedMonth)
      setHasLoaded(true)
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error fetching payments:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [api, loading, hasLoaded, payments, currentMonth])

  const addPayment = useCallback(async (paymentData) => {
    const tempId = `temp_${Date.now()}`
    const optimisticPayment = { ...paymentData, id: tempId }

    optimistic.addOptimisticUpdate(`payment_${tempId}`, optimisticPayment)
    setPayments(prev => [...prev, optimisticPayment])

    try {
      const result = await api.post(paymentsUrl, paymentData, {
        invalidatePattern: paymentsUrl
      })

      setPayments(prev => prev.map(p => p.id === tempId ? result : p))
      optimistic.removeOptimisticUpdate(`payment_${tempId}`)
      return result
    } catch (err) {
      setPayments(prev => prev.filter(p => p.id !== tempId))
      optimistic.removeOptimisticUpdate(`payment_${tempId}`)
      throw err
    }
  }, [api, optimistic])

  const updatePayment = useCallback(async (id, paymentData) => {
    const originalPayment = payments.find(p => p.id === id)
    if (!originalPayment) return

    const optimisticPayment = { ...originalPayment, ...paymentData }

    optimistic.addOptimisticUpdate(`payment_${id}`, optimisticPayment)
    setPayments(prev => prev.map(p => p.id === id ? optimisticPayment : p))

    try {
      const result = await api.put(`${paymentsUrl}/${id}`, paymentData, {
        invalidatePattern: paymentsUrl
      })

      setPayments(prev => prev.map(p => p.id === id ? result : p))
      optimistic.removeOptimisticUpdate(`payment_${id}`)
      return result
    } catch (err) {
      setPayments(prev => prev.map(p => p.id === id ? originalPayment : p))
      optimistic.removeOptimisticUpdate(`payment_${id}`)
      throw err
    }
  }, [api, optimistic, payments])

  const deletePayment = useCallback(async (id) => {
    const paymentToDelete = payments.find(p => p.id === id)
    if (!paymentToDelete) return

    optimistic.addOptimisticUpdate(`payment_delete_${id}`, null)
    setPayments(prev => prev.filter(p => p.id !== id))

    try {
      await api.delete(`${paymentsUrl}/${id}`, {
        invalidatePattern: paymentsUrl
      })
      optimistic.removeOptimisticUpdate(`payment_delete_${id}`)
    } catch (err) {
      setPayments(prev => [...prev, paymentToDelete].sort((a, b) => a.id - b.id))
      optimistic.removeOptimisticUpdate(`payment_delete_${id}`)
      throw err
    }
  }, [api, optimistic, payments])

  useEffect(() => {
    if (!hasLoaded || month !== currentMonth) {
      fetchPayments(month)
    }
  }, [fetchPayments, hasLoaded, month, currentMonth])

  return {
    payments: optimistic.getOptimisticData('payments', payments),
    loading: loading && !hasLoaded,
    error,
    refetch: (newMonth) => fetchPayments(newMonth, true),
    addPayment,
    updatePayment,
    deletePayment,
  }
}

// Hook for expenses data
export const useExpenses = (month = null) => {
  const api = useApiCache(baseUrl)
  const optimistic = useOptimisticUpdate()

  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(month)

  const fetchExpenses = useCallback(async (selectedMonth = currentMonth, forceRefresh = false) => {
    if (loading && hasLoaded && !forceRefresh && selectedMonth === currentMonth) return expenses

    try {
      setLoading(true)
      setError(null)
      const params = selectedMonth ? { month: selectedMonth } : {}
      const data = await api.get(expensesUrl, params, { forceRefresh })
      setExpenses(data)
      setCurrentMonth(selectedMonth)
      setHasLoaded(true)
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error fetching expenses:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [api, loading, hasLoaded, expenses, currentMonth])

  const addExpense = useCallback(async (expenseData) => {
    const tempId = `temp_${Date.now()}`
    const optimisticExpense = { ...expenseData, id: tempId }

    optimistic.addOptimisticUpdate(`expense_${tempId}`, optimisticExpense)
    setExpenses(prev => [...prev, optimisticExpense])

    try {
      const result = await api.post(expensesUrl, expenseData, {
        invalidatePattern: expensesUrl
      })

      setExpenses(prev => prev.map(e => e.id === tempId ? result : e))
      optimistic.removeOptimisticUpdate(`expense_${tempId}`)
      return result
    } catch (err) {
      setExpenses(prev => prev.filter(e => e.id !== tempId))
      optimistic.removeOptimisticUpdate(`expense_${tempId}`)
      throw err
    }
  }, [api, optimistic])

  const updateExpense = useCallback(async (id, expenseData) => {
    const originalExpense = expenses.find(e => e.id === id)
    if (!originalExpense) return

    const optimisticExpense = { ...originalExpense, ...expenseData }

    optimistic.addOptimisticUpdate(`expense_${id}`, optimisticExpense)
    setExpenses(prev => prev.map(e => e.id === id ? optimisticExpense : e))

    try {
      const result = await api.put(`${expensesUrl}/${id}`, expenseData, {
        invalidatePattern: expensesUrl
      })

      setExpenses(prev => prev.map(e => e.id === id ? result : e))
      optimistic.removeOptimisticUpdate(`expense_${id}`)
      return result
    } catch (err) {
      setExpenses(prev => prev.map(e => e.id === id ? originalExpense : e))
      optimistic.removeOptimisticUpdate(`expense_${id}`)
      throw err
    }
  }, [api, optimistic, expenses])

  const deleteExpense = useCallback(async (id) => {
    const expenseToDelete = expenses.find(e => e.id === id)
    if (!expenseToDelete) return

    optimistic.addOptimisticUpdate(`expense_delete_${id}`, null)
    setExpenses(prev => prev.filter(e => e.id !== id))

    try {
      await api.delete(`${expensesUrl}/${id}`, {
        invalidatePattern: expensesUrl
      })
      optimistic.removeOptimisticUpdate(`expense_delete_${id}`)
    } catch (err) {
      setExpenses(prev => [...prev, expenseToDelete].sort((a, b) => a.id - b.id))
      optimistic.removeOptimisticUpdate(`expense_delete_${id}`)
      throw err
    }
  }, [api, optimistic, expenses])

  useEffect(() => {
    if (!hasLoaded || month !== currentMonth) {
      fetchExpenses(month)
    }
  }, [fetchExpenses, hasLoaded, month, currentMonth])

  return {
    expenses: optimistic.getOptimisticData('expenses', expenses),
    loading: loading && !hasLoaded,
    error,
    refetch: (newMonth) => fetchExpenses(newMonth, true),
    addExpense,
    updateExpense,
    deleteExpense,
  }
}

// Combined hook for reports data with proper error handling
export const useReportsData = (month) => {
  const [data, setData] = useState({
    houses: [],
    tenants: [],
    payments: [],
    expenses: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isStale, setIsStale] = useState(false)

  const api = useApiCache(baseUrl)
  const currentMonthRef = useRef(month)
  const hasLoadedRef = useRef(false)

  const fetchReportsData = useCallback(async (selectedMonth, forceRefresh = false) => {
    try {
      setIsLoading(true)
      setError(null)

      const [housesData, tenantsData, paymentsData, expensesData] = await Promise.all([
        api.get(housesUrl, {}, { forceRefresh, cache: true }),
        api.get(tenantsUrl, {}, { forceRefresh, cache: true }),
        api.get(paymentsUrl, { month: selectedMonth }, { forceRefresh, cache: true }),
        api.get(expensesUrl, { month: selectedMonth }, { forceRefresh, cache: true })
      ])

      setData({
        houses: housesData,
        tenants: tenantsData,
        payments: paymentsData,
        expenses: expensesData
      })

      currentMonthRef.current = selectedMonth
      hasLoadedRef.current = true
      setIsStale(false)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching reports data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [api])

  // Load data on mount and when month changes
  useEffect(() => {
    if (!hasLoadedRef.current || month !== currentMonthRef.current) {
      fetchReportsData(month)
    }
  }, [month, fetchReportsData])

  // Mark as stale after some time to indicate data might be old
  useEffect(() => {
    if (!isLoading && !error && hasLoadedRef.current) {
      const timer = setTimeout(() => {
        setIsStale(true)
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearTimeout(timer)
    }
  }, [isLoading, error])

  return {
    data,
    isLoading: isLoading && !hasLoadedRef.current,
    error,
    isStale,
    refetch: () => fetchReportsData(currentMonthRef.current, true)
  }
}