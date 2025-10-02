import { useState, useEffect, useCallback } from 'react'

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const CACHE_PREFIX = 'rent_app_cache_'

// Cache utilities
const getCacheKey = (url, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key]
      return result
    }, {})
  return CACHE_PREFIX + btoa(url + JSON.stringify(sortedParams))
}

const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)
    const now = Date.now()

    // Check if cache is still valid
    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key)
      return null
    }

    return data
  } catch (error) {
    console.warn('Cache read error:', error)
    return null
  }
}

const setCachedData = (key, data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(key, JSON.stringify(cacheData))
  } catch (error) {
    console.warn('Cache write error:', error)
  }
}

const clearCache = (pattern = '') => {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX) && (!pattern || key.includes(pattern))) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('Cache clear error:', error)
  }
}

// Main hook for API calls with caching
export const useApiCache = (baseUrl) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // GET request with caching
  const get = useCallback(async (endpoint, params = {}, options = {}) => {
    const { forceRefresh = false, cache = true } = options
    const url = `${baseUrl}${endpoint}`
    const cacheKey = getCacheKey(url, params)

    // Check cache first (unless force refresh)
    if (!forceRefresh && cache) {
      const cachedData = getCachedData(cacheKey)
      if (cachedData) {
        return cachedData
      }
    }

    setLoading(true)
    setError(null)

    try {
      // Build query string
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value)
        }
      })

      const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url
      const response = await fetch(fullUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Cache the response
      if (cache) {
        setCachedData(cacheKey, data)
      }

      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [baseUrl])

  // POST request (invalidates related cache)
  const post = useCallback(async (endpoint, data, options = {}) => {
    const { invalidatePattern = '' } = options
    const url = `${baseUrl}${endpoint}`

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Invalidate related cache
      if (invalidatePattern) {
        clearCache(invalidatePattern)
      }

      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [baseUrl])

  // PUT request (invalidates related cache)
  const put = useCallback(async (endpoint, data, options = {}) => {
    const { invalidatePattern = '' } = options
    const url = `${baseUrl}${endpoint}`

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Invalidate related cache
      if (invalidatePattern) {
        clearCache(invalidatePattern)
      }

      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [baseUrl])

  // DELETE request (invalidates related cache)
  const deleteRequest = useCallback(async (endpoint, options = {}) => {
    const { invalidatePattern = '' } = options
    const url = `${baseUrl}${endpoint}`

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Invalidate related cache
      if (invalidatePattern) {
        clearCache(invalidatePattern)
      }

      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [baseUrl])

  // Clear all cache
  const clearAllCache = useCallback(() => {
    clearCache()
  }, [])

  // Clear cache by pattern
  const clearCacheByPattern = useCallback((pattern) => {
    clearCache(pattern)
  }, [])

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: deleteRequest,
    clearAllCache,
    clearCacheByPattern,
  }
}

// Hook for optimistic updates
export const useOptimisticUpdate = () => {
  const [optimisticUpdates, setOptimisticUpdates] = useState(new Map())

  const addOptimisticUpdate = useCallback((key, data) => {
    setOptimisticUpdates(prev => new Map(prev.set(key, data)))
  }, [])

  const removeOptimisticUpdate = useCallback((key) => {
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev)
      newMap.delete(key)
      return newMap
    })
  }, [])

  const getOptimisticData = useCallback((key, fallbackData) => {
    return optimisticUpdates.get(key) || fallbackData
  }, [optimisticUpdates])

  const clearOptimisticUpdates = useCallback(() => {
    setOptimisticUpdates(new Map())
  }, [])

  return {
    optimisticUpdates,
    addOptimisticUpdate,
    removeOptimisticUpdate,
    getOptimisticData,
    clearOptimisticUpdates,
  }
}

// Hook for stale-while-revalidate pattern
export const useStaleWhileRevalidate = (cacheKey, fetcher, options = {}) => {
  const { enabled = true, staleTime = CACHE_DURATION } = options
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isStale, setIsStale] = useState(false)

  const refetch = useCallback(async () => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const freshData = await fetcher()
      setData(freshData)
      setIsStale(false)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [enabled, fetcher])

  useEffect(() => {
    if (!enabled) return

    // Try to get cached data first
    const cachedData = getCachedData(cacheKey)
    if (cachedData) {
      setData(cachedData)
      setIsStale(true)
    }

    // Always fetch fresh data
    refetch()
  }, [cacheKey, enabled, refetch])

  // Auto-refresh when stale
  useEffect(() => {
    if (!isStale || !enabled) return

    const timer = setTimeout(() => {
      refetch()
    }, staleTime)

    return () => clearTimeout(timer)
  }, [isStale, enabled, staleTime, refetch])

  return {
    data,
    error,
    isLoading,
    isStale,
    refetch,
  }
}