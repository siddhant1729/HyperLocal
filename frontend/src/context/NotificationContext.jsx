import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getNotifications, markAllRead } from '../api/claims'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [toasts, setToasts] = useState([])

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await getNotifications()
      return res.data
    },
    enabled: !!user,
    refetchInterval: 15_000, // poll every 15 seconds
    staleTime: 10_000,
  })

  const notifications = data || []
  const unreadCount = notifications.filter((n) => !n.read).length

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, toasts, addToast, removeToast, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
