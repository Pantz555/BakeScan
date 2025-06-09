"use client"

import type React from "react"

import type { Metadata } from "next"
import "./globals.css"
import { useEffect } from "react"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  useEffect(() => {
    // Suppress ResizeObserver errors
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes("ResizeObserver loop completed with undelivered notifications")) {
        event.stopImmediatePropagation()
        event.preventDefault()
        return false
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes("ResizeObserver")) {
        event.preventDefault()
        return false
      }
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
