'use client'

import { useEffect, useState } from 'react'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  timestamp: Date
}

let notificationListeners: ((notification: Notification) => void)[] = []

export const notificationService = {
  subscribe(callback: (notification: Notification) => void) {
    notificationListeners.push(callback)
    return () => {
      notificationListeners = notificationListeners.filter((cb) => cb !== callback)
    }
  },

  notify(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', title = '') {
    const notification: Notification = {
      id: Math.random().toString(),
      title: title || message,
      message: title ? message : '',
      type,
      timestamp: new Date(),
    }
    notificationListeners.forEach((cb) => cb(notification))
  },

  success(message: string, title?: string) {
    this.notify(message, 'success', title)
  },

  error(message: string, title?: string) {
    this.notify(message, 'error', title)
  },

  info(message: string, title?: string) {
    this.notify(message, 'info', title)
  },
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications((prev) => [...prev, notification])
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
      }, 4000)
    })
    return unsubscribe
  }, [])

  const bgColor = (type: string) => {
    const colors: Record<string, string> = {
      success: 'bg-green-50 border-green-200 text-green-900',
      error: 'bg-red-50 border-red-200 text-red-900',
      info: 'bg-blue-50 border-blue-200 text-blue-900',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    }
    return colors[type] || colors.info
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`border rounded-lg p-4 shadow-lg max-w-sm pointer-events-auto animate-slide-in ${bgColor(
            notif.type
          )}`}
        >
          {notif.title && <p className="font-semibold">{notif.title}</p>}
          {notif.message && <p className="text-sm">{notif.message}</p>}
        </div>
      ))}
    </div>
  )
}
