"use client"

import { useState, useEffect, useCallback } from "react"

interface OfflineInvoice {
  id: string
  imageData: string
  extractedData: any
  timestamp: Date
  synced: boolean
}

// Hook for managing offline invoice storage
export const useOfflineInvoiceStorage = () => {
  const [offlineInvoices, setOfflineInvoices] = useState<OfflineInvoice[]>([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Load offline invoices from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("offline-invoices")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setOfflineInvoices(
          parsed.map((invoice: any) => ({
            ...invoice,
            timestamp: new Date(invoice.timestamp),
          })),
        )
      } catch (error) {
        console.error("Error loading offline invoices:", error)
      }
    }
  }, [])

  // Save to localStorage whenever offlineInvoices changes
  useEffect(() => {
    localStorage.setItem("offline-invoices", JSON.stringify(offlineInvoices))
  }, [offlineInvoices])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Add invoice to offline storage
  const addOfflineInvoice = useCallback((imageData: string, extractedData: any) => {
    const newInvoice: OfflineInvoice = {
      id: Date.now().toString(),
      imageData,
      extractedData,
      timestamp: new Date(),
      synced: false,
    }

    setOfflineInvoices((prev) => [...prev, newInvoice])
    return newInvoice.id
  }, [])

  // Mark invoice as synced
  const markAsSynced = useCallback((id: string) => {
    setOfflineInvoices((prev) => prev.map((invoice) => (invoice.id === id ? { ...invoice, synced: true } : invoice)))
  }, [])

  // Remove synced invoices
  const removeSyncedInvoices = useCallback(() => {
    setOfflineInvoices((prev) => prev.filter((invoice) => !invoice.synced))
  }, [])

  // Get unsynced invoices
  const getUnsyncedInvoices = useCallback(() => {
    return offlineInvoices.filter((invoice) => !invoice.synced)
  }, [offlineInvoices])

  // Sync all unsynced invoices
  const syncAllInvoices = useCallback(async () => {
    const unsynced = getUnsyncedInvoices()

    for (const invoice of unsynced) {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        console.log("Syncing invoice:", invoice.id)
        markAsSynced(invoice.id)
      } catch (error) {
        console.error("Error syncing invoice:", invoice.id, error)
      }
    }
  }, [getUnsyncedInvoices, markAsSynced])

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && getUnsyncedInvoices().length > 0) {
      syncAllInvoices()
    }
  }, [isOnline, syncAllInvoices, getUnsyncedInvoices])

  return {
    offlineInvoices,
    isOnline,
    addOfflineInvoice,
    markAsSynced,
    removeSyncedInvoices,
    getUnsyncedInvoices,
    syncAllInvoices,
    unsyncedCount: getUnsyncedInvoices().length,
  }
}

// Service Worker registration for offline functionality
export const registerServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration)
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError)
        })
    })
  }
}

// Push notification setup
export const setupPushNotifications = async () => {
  if ("Notification" in window) {
    const permission = await Notification.requestPermission()

    if (permission === "granted") {
      console.log("Notification permission granted")
      return true
    }
  }

  return false
}

// Show local notification
export const showNotification = (title: string, body: string, options?: NotificationOptions) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/icon-192x192.png",
      badge: "/icon-72x72.png",
      ...options,
    })
  }
}
