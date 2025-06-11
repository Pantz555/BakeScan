// Service Worker for offline functionality

const CACHE_NAME = "bakescan-v1"
const urlsToCache = [
  "/",
  "/mobile-capture",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/icon-192x192.png",
  "/icon-512x512.png",
]

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})

// Background sync for offline invoice uploads
self.addEventListener("sync", (event) => {
  if (event.tag === "invoice-sync") {
    event.waitUntil(syncInvoices())
  }
})

// Push notification handler
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "Invoice processing completed",
    icon: "/icon-192x192.png",
    badge: "/icon-72x72.png",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "view",
        title: "View Invoice",
        icon: "/icon-view.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icon-close.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("BakeScan AI", options))
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "view") {
    event.waitUntil(clients.openWindow("/mobile-capture"))
  }
})

// Sync invoices function
async function syncInvoices() {
  try {
    // Get unsynced invoices from IndexedDB or localStorage
    const invoices = await getUnsyncedInvoices()

    for (const invoice of invoices) {
      try {
        const response = await fetch("/api/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoice),
        })

        if (response.ok) {
          await markInvoiceAsSynced(invoice.id)
        }
      } catch (error) {
        console.error("Error syncing invoice:", error)
      }
    }
  } catch (error) {
    console.error("Error in syncInvoices:", error)
  }
}

// Helper functions for IndexedDB operations
async function getUnsyncedInvoices() {
  // Implementation would use IndexedDB to get unsynced invoices
  return []
}

async function markInvoiceAsSynced(invoiceId) {
  // Implementation would mark invoice as synced in IndexedDB
  console.log("Marked invoice as synced:", invoiceId)
}
