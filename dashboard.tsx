"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, FileText, ImageIcon, AlertCircle, CheckCircle, Clock, Search, Bell, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Invoice {
  id: string
  supplier: string
  date: string
  status: "processing" | "completed" | "discrepancies"
  thumbnail: string
  amount?: string
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    supplier: "Flour & Co. Suppliers",
    date: "2024-01-15",
    status: "completed",
    thumbnail: "/placeholder.svg?height=120&width=120",
    amount: "$1,245.50",
  },
  {
    id: "2",
    supplier: "Sweet Ingredients Ltd",
    date: "2024-01-14",
    status: "processing",
    thumbnail: "/placeholder.svg?height=120&width=120",
    amount: "$892.30",
  },
  {
    id: "3",
    supplier: "Bakery Equipment Pro",
    date: "2024-01-13",
    status: "discrepancies",
    thumbnail: "/placeholder.svg?height=120&width=120",
    amount: "$3,456.78",
  },
  {
    id: "4",
    supplier: "Organic Dairy Farms",
    date: "2024-01-12",
    status: "completed",
    thumbnail: "/placeholder.svg?height=120&width=120",
    amount: "$567.90",
  },
  {
    id: "5",
    supplier: "Premium Vanilla Co.",
    date: "2024-01-11",
    status: "completed",
    thumbnail: "/placeholder.svg?height=120&width=120",
    amount: "$234.15",
  },
  {
    id: "6",
    supplier: "Local Egg Suppliers",
    date: "2024-01-10",
    status: "processing",
    thumbnail: "/placeholder.svg?height=120&width=120",
    amount: "$445.67",
  },
]

export default function BakeScanDashboard() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    handleFileUpload(files)
  }, [])

  const handleFileUpload = (files: File[]) => {
    const validFiles = files.filter((file) => file.type.includes("image/") || file.type === "application/pdf")

    if (validFiles.length > 0) {
      setIsUploading(true)
      setUploadProgress(0)

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsUploading(false)
            // Add new invoice to the list
            const newInvoice: Invoice = {
              id: Date.now().toString(),
              supplier: "New Supplier",
              date: new Date().toISOString().split("T")[0],
              status: "processing",
              thumbnail: "/placeholder.svg?height=120&width=120",
            }
            setInvoices((prev) => [newInvoice, ...prev])
            return 0
          }
          return prev + 10
        })
      }, 200)
    }
  }

  const getStatusIcon = (status: Invoice["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "processing":
        return <Clock className="h-4 w-4" />
      case "discrepancies":
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "processing":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "discrepancies":
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  const getStatusText = (status: Invoice["status"]) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "processing":
        return "Processing"
      case "discrepancies":
        return "Discrepancies Found"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-amber-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-amber-900">BakeScan AI</h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-amber-900 hover:text-amber-700 font-medium">
                  Dashboard
                </a>
                <a href="#" className="text-amber-700 hover:text-amber-900">
                  Invoices
                </a>
                <a href="#" className="text-amber-700 hover:text-amber-900">
                  Reports
                </a>
                <a href="#" className="text-amber-700 hover:text-amber-900">
                  Settings
                </a>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-500" />
                <Input
                  placeholder="Search invoices..."
                  className="pl-10 w-64 border-amber-200 focus:border-amber-400"
                />
              </div>
              <Button variant="ghost" size="icon" className="text-amber-700 hover:text-amber-900">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-amber-700 hover:text-amber-900">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-amber-900 mb-6">Upload Invoice</h2>
          <Card className="border-2 border-dashed border-amber-300 bg-white/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? "border-amber-500 bg-amber-50"
                    : "border-amber-300 hover:border-amber-400 hover:bg-amber-25"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-amber-900 mb-2">Drop your invoice files here</h3>
                    <p className="text-amber-700 mb-4">or click to browse and select files</p>
                    <p className="text-sm text-amber-600">Supports JPG, PNG, and PDF files up to 10MB</p>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                    onClick={() => {
                      const input = document.createElement("input")
                      input.type = "file"
                      input.accept = ".jpg,.jpeg,.png,.pdf"
                      input.multiple = true
                      input.onchange = (e) => {
                        const files = Array.from((e.target as HTMLInputElement).files || [])
                        handleFileUpload(files)
                      }
                      input.click()
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>

              {isUploading && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-amber-900">Uploading...</span>
                    <span className="text-sm text-amber-700">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-amber-900">Recent Invoices</h2>
            <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.map((invoice) => (
              <Card
                key={invoice.id}
                className="bg-white/70 backdrop-blur-sm border-amber-200 hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-amber-900 line-clamp-1">
                          {invoice.supplier}
                        </CardTitle>
                        <p className="text-sm text-amber-600">{invoice.date}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(invoice.status)} flex items-center space-x-1`}
                    >
                      {getStatusIcon(invoice.status)}
                      <span className="text-xs font-medium">{getStatusText(invoice.status)}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="w-20 h-20 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-amber-500" />
                    </div>
                    <div className="text-right">
                      {invoice.amount && <p className="text-lg font-bold text-amber-900">{invoice.amount}</p>}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-amber-700 hover:text-amber-900 hover:bg-amber-50"
                        onClick={() => (window.location.href = "/invoice-analysis")}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
